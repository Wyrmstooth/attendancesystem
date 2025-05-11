
// File: src/main/java/com/attendanceiq/api/services/EmailService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.models.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {
    // In a real application, this would use JavaMailSender or a third-party API
    public void sendPasswordResetEmail(User user) {
        // This is a mock implementation
        log.info("Sending password reset email to: {}", user.getEmail());
        log.info("Subject: Password Reset Request");
        log.info("Content: Here is your link to reset your password (this is a simulation)");
    }
}