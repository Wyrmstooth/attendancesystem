// File: src/main/java/com/attendanceiq/api/repositories/CourseRepository.java
package com.attendanceiq.api.repositories;

import com.attendanceiq.api.models.Course;
import com.attendanceiq.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructor(User instructor);
    boolean existsByCode(String code);
}
