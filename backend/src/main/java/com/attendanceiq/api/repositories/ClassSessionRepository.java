// File: src/main/java/com/attendanceiq/api/repositories/ClassSessionRepository.java
package com.attendanceiq.api.repositories;

import com.attendanceiq.api.models.ClassSession;
import com.attendanceiq.api.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByCourse(Course course);
}