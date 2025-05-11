// File: src/main/java/com/attendanceiq/api/services/CourseService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.CourseDto;
import com.attendanceiq.api.dto.StudentDto;
import com.attendanceiq.api.models.Course;
import com.attendanceiq.api.models.Student;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.models.Role;
import com.attendanceiq.api.repositories.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);
    private final CourseRepository courseRepository;

    public List<CourseDto> getInstructorCourses(User instructor) {
        return courseRepository.findByInstructor(instructor).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<StudentDto> getCourseStudents(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        logger.info("Course {} has {} students", courseId, course.getStudents().size());
        for (Student s : course.getStudents()) {
            logger.info("Student in course: id={}, userId={}, rollNo={}", s.getId(), s.getUser() != null ? s.getUser().getId() : null, s.getRollNo());
        }

        return course.getStudents().stream()
                .filter(student -> student.getUser() != null) // Filter out students with null user
                .map(this::convertToStudentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<StudentDto> getCourseStudentsForInstructor(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        // Allow if user is instructor for the course OR is an admin
        if (user.getRole() != Role.ADMIN &&
            (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId()))) {
            throw new IllegalArgumentException("You are not the instructor for this course");
        }
        return course.getStudents().stream()
                .filter(student -> student.getUser() != null)
                .map(this::convertToStudentDto)
                .collect(Collectors.toList());
    }

    private CourseDto convertToDto(Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .semester(course.getSemester())
                .department(course.getDepartment())
                .instructorId(course.getInstructor() != null ? course.getInstructor().getId() : null)
                .build();
    }

    private StudentDto convertToStudentDto(Student student) {
        return StudentDto.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .rollNo(student.getRollNo())
                .firstName(student.getUser().getFirstName())
                .lastName(student.getUser().getLastName())
                .email(student.getUser().getEmail())
                .build();
    }
}
