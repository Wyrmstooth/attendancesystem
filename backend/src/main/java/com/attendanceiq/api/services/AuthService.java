// File: src/main/java/com/attendanceiq/api/services/AuthService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.AdminRegistrationDto;
import com.attendanceiq.api.dto.AuthRequest;
import com.attendanceiq.api.dto.AuthResponse;
import com.attendanceiq.api.models.Role;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.UserRepository;
import com.attendanceiq.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${admin.registration.code}")
    private String adminRegistrationCode;

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        
        String jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .user(userService.convertToDto(user))
                .build();
    }

    public AuthResponse authenticateInstructor(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getRole() != Role.INSTRUCTOR) {
            throw new IllegalArgumentException("Only instructors can log in here");
        }

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userService.convertToDto(user))
                .build();
    }

    @Transactional
    public AuthResponse registerAdmin(AdminRegistrationDto request) {
        logger.info("Registering admin: {}", request.getEmail());
        try {
            // Require registration code "ADMIN"
            if (request.getRegistrationCode() == null || !request.getRegistrationCode().equals("ADMIN")) {
                throw new IllegalArgumentException("Invalid registration code for admin registration");
            }
            if (userRepository.existsByUsername(request.getUsername())) {
                logger.warn("Username already taken: {}", request.getUsername());
                throw new IllegalArgumentException("Username already taken");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                logger.warn("Email already in use: {}", request.getEmail());
                throw new IllegalArgumentException("Email already in use");
            }
            User admin = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .role(Role.ADMIN)
                    .build();
            User savedAdmin = userRepository.save(admin);
            logger.info("Admin saved with id: {}", savedAdmin.getId());
            String jwtToken = jwtService.generateToken(savedAdmin);
            return AuthResponse.builder()
                    .token(jwtToken)
                    .user(userService.convertToDto(savedAdmin))
                    .build();
        } catch (Exception ex) {
            logger.error("Error during admin registration: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // In a real application, generate a token and send a reset link
        // For this demo, we'll just simulate sending an email
        emailService.sendPasswordResetEmail(user);
    }
}