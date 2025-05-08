

// File: src/main/java/com/attendanceiq/api/services/AuthService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.AuthRequest;
import com.attendanceiq.api.dto.AuthResponse;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.UserRepository;
import com.attendanceiq.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;

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

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // In a real application, generate a token and send a reset link
        // For this demo, we'll just simulate sending an email
        emailService.sendPasswordResetEmail(user);
    }
}