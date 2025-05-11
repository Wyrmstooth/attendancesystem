package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.NotificationDto;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.UserRepository;
import com.attendanceiq.api.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    @Autowired
    private UserRepository userRepository;

    private User resolveUser(User user) {
        if (user == null) {
            // DEV ONLY: fallback to first user
            return userRepository.findAll().stream().findFirst().orElse(null);
        }
        return user;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@AuthenticationPrincipal User user) {
        user = resolveUser(user);
        if (user == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@AuthenticationPrincipal User user) {
        user = resolveUser(user);
        if (user == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal User user) {
        user = resolveUser(user);
        if (user == null) return ResponseEntity.ok(0L);
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        user = resolveUser(user);
        if (user == null) return ResponseEntity.badRequest().build();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }
}