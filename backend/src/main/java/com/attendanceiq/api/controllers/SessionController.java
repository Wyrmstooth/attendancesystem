

// File: src/main/java/com/attendanceiq/api/controllers/SessionController.java
package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.AttendanceRecordDto;
import com.attendanceiq.api.dto.ClassSessionDto;
import com.attendanceiq.api.dto.SaveAttendanceRequest;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.services.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;

    @GetMapping("/courses/{courseId}/sessions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ClassSessionDto>> getCourseSession(@PathVariable Long courseId) {
        return ResponseEntity.ok(sessionService.getCourseSession(courseId));
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ClassSessionDto> getSessionById(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionById(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/attendance")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<AttendanceRecordDto>> getSessionAttendance(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionAttendance(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/attendance")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> saveAttendance(
            @PathVariable Long sessionId,
            @RequestBody SaveAttendanceRequest request,
            @AuthenticationPrincipal User user
    ) {
        sessionService.saveAttendance(sessionId, request, user);
        return ResponseEntity.ok().build();
    }
}