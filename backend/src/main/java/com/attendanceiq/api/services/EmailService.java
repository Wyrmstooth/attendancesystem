// File: src/main/java/com/attendanceiq/api/services/EmailService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendPasswordResetEmail(User user) {
        // In a real implementation, this would send an actual email
        // For now, we'll just log it
        logger.info("Password reset email would be sent to: {} ({})", 
                user.getEmail(), user.getFirstName() + " " + user.getLastName());
    }
}