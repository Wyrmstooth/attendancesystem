
// File: src/main/java/com/attendanceiq/api/services/NotificationService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.NotificationDto;
import com.attendanceiq.api.models.ClassSession;
import com.attendanceiq.api.models.Notification;
import com.attendanceiq.api.models.NotificationType;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<NotificationDto> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByTimestampDesc(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndReadOrderByTimestampDesc(user, false).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countByUserAndRead(user, false);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Notification does not belong to user");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void createAttendanceNotification(User user, ClassSession session) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        String formattedDate = session.getDate().format(dateFormatter);
        
        String message = String.format(
                "You were marked absent for %s class on %s.",
                session.getCourse().getName(),
                formattedDate
        );
        
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .timestamp(LocalDateTime.now())
                .read(false)
                .type(NotificationType.ATTENDANCE)
                .build();
        
        notificationRepository.save(notification);
    }

    private NotificationDto convertToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .message(notification.getMessage())
                .timestamp(notification.getTimestamp())
                .read(notification.isRead())
                .type(notification.getType())
                .build();
    }
}
