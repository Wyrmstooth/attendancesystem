package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.AttendanceSummaryDto;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.services.StudentAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final StudentAttendanceService studentAttendanceService;

    @GetMapping("/student/summary")
    public ResponseEntity<List<AttendanceSummaryDto>> getStudentAttendanceSummary(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(studentAttendanceService.getStudentAttendanceSummary(user));
    }
}
