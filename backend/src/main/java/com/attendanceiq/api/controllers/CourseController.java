// File: src/main/java/com/attendanceiq/api/controllers/CourseController.java
package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.CourseDto;
import com.attendanceiq.api.dto.StudentDto;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;

    @GetMapping("/instructor")
    public ResponseEntity<List<CourseDto>> getInstructorCourses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.getInstructorCourses(user));
    }

    @GetMapping("/{courseId}/students")
    public ResponseEntity<List<StudentDto>> getCourseStudents(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user
    ) {
        // Only the instructor of the course can view students
        List<StudentDto> students = courseService.getCourseStudentsForInstructor(courseId, user);
        return ResponseEntity.ok(students);
    }
}
