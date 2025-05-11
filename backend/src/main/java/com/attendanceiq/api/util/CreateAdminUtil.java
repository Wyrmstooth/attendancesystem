package com.attendanceiq.api.util;

import com.attendanceiq.api.models.Role;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class CreateAdminUtil {
    private static final Logger logger = LoggerFactory.getLogger(CreateAdminUtil.class);

    @Bean
    @Profile("dev")
    public CommandLineRunner initializeAdmin(
            @Autowired UserRepository userRepository,
            @Autowired PasswordEncoder passwordEncoder
    ) {
        return args -> {
            logger.info("Checking if default admin exists...");
            boolean emailExists = userRepository.findByEmail("admin@example.com").isPresent();
            boolean usernameExists = userRepository.findByUsername("admin").isPresent();
            if (emailExists || usernameExists) {
                logger.info("Admin user already exists (username or email) - skipping creation");
            } else {
                logger.info("Creating default admin user...");
                User admin = User.builder()
                        .username("admin")
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("Admin123!"))
                        .firstName("Admin")
                        .lastName("User")
                        .role(Role.ADMIN)
                        .build();
                User savedAdmin = userRepository.save(admin);
                logger.info("Default admin user created successfully with ID: {}", savedAdmin.getId());
                logger.info("Email: admin@example.com");
                logger.info("Password: Admin123!");
            }
        };
    }
}
