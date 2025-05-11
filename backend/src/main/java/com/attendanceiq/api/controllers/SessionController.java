// File: src/main/java/com/attendanceiq/api/controllers/SessionController.java
package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.AttendanceRecordDto;
import com.attendanceiq.api.dto.ClassSessionDto;
import com.attendanceiq.api.dto.SaveAttendanceRequest;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.services.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;

    @GetMapping("/courses/{courseId}/sessions")
    public ResponseEntity<List<ClassSessionDto>> getCourseSession(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        // Allow both instructor and admin to view sessions
        return ResponseEntity.ok(sessionService.getCourseSessionForInstructor(courseId, user));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ClassSessionDto> getSessionById(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionById(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/attendance")
    public ResponseEntity<List<AttendanceRecordDto>> getSessionAttendance(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionAttendance(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/attendance")
    public ResponseEntity<?> saveAttendance(
            @PathVariable Long sessionId,
            @RequestBody SaveAttendanceRequest request,
            @AuthenticationPrincipal User user
    ) {
        // Allow both instructors (for their courses) and admins (for any course)
        sessionService.saveAttendance(sessionId, request, user);
        return ResponseEntity.ok().build();
    }
}