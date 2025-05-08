
// File: src/main/java/com/attendanceiq/api/services/CourseService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.CourseDto;
import com.attendanceiq.api.dto.StudentDto;
import com.attendanceiq.api.models.Course;
import com.attendanceiq.api.models.Student;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;

    public List<CourseDto> getInstructorCourses(User instructor) {
        return courseRepository.findByInstructor(instructor).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<StudentDto> getCourseStudents(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        return course.getStudents().stream()
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
                .instructorId(course.getInstructor().getId())
                .build();
    }

    private StudentDto convertToStudentDto(Student student) {
        return StudentDto.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .rollNo(student.getRollNo())
                .firstName(student.getUser().getFirstName())
                .lastName(student.getUser().getLastName())
                .build();
    }
}
