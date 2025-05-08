
// File: src/main/java/com/attendanceiq/api/dto/NotificationDto.java
package com.attendanceiq.api.dto;

import com.attendanceiq.api.models.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {
    private Long id;
    private Long userId;
    private String message;
    private LocalDateTime timestamp;
    private boolean read;
    private NotificationType type;
}