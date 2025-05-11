package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.*;
import com.attendanceiq.api.services.AdminService;
import com.attendanceiq.api.models.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/students")
    public ResponseEntity<UserDto> registerStudent(@Valid @RequestBody StudentRegistrationDto request) {
        return ResponseEntity.ok(adminService.registerStudent(request));
    }

    @PostMapping("/instructors")
    public ResponseEntity<UserDto> registerInstructor(@Valid @RequestBody InstructorRegistrationDto request) {
        return ResponseEntity.ok(adminService.registerInstructor(request));
    }

    @PostMapping("/courses")
    public ResponseEntity<CourseDto> createCourse(@Valid @RequestBody CourseRegistrationDto request) {
        return ResponseEntity.ok(adminService.createCourse(request));
    }

    @PostMapping("/courses/{courseId}/sessions")
    public ResponseEntity<ClassSessionDto> createClassSession(
            @PathVariable Long courseId,
            @Valid @RequestBody ClassSessionDto sessionDto) {
        return ResponseEntity.ok(adminService.createClassSession(courseId, sessionDto));
    }

    @PostMapping("/enrollment")
    public ResponseEntity<?> enrollStudents(@Valid @RequestBody EnrollmentRequest request) {
        adminService.enrollStudentsInCourse(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unenrollment")
    public ResponseEntity<?> unenrollStudents(@Valid @RequestBody EnrollmentRequest request) {
        adminService.unenrollStudentsFromCourse(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/instructors")
    public ResponseEntity<List<UserDto>> getAllInstructors() {
        return ResponseEntity.ok(adminService.getAllInstructors());
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        return ResponseEntity.ok(adminService.getAllCourses());
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null || user.getRole() != com.attendanceiq.api.models.Role.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: Only admins can delete students");
        }
        adminService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/instructors/{id}")
    public ResponseEntity<?> deleteInstructor(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null || user.getRole() != com.attendanceiq.api.models.Role.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: Only admins can delete instructors");
        }
        adminService.deleteInstructor(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null || user.getRole() != com.attendanceiq.api.models.Role.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: Only admins can delete courses");
        }
        adminService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null || user.getRole() != com.attendanceiq.api.models.Role.ADMIN) {
            return ResponseEntity.status(403).body("Forbidden: Only admins can delete sessions");
        }
        adminService.deleteSession(id);
        return ResponseEntity.ok().build();
    }
}
