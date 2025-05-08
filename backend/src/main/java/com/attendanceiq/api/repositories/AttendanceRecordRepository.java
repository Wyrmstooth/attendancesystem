// File: src/main/java/com/attendanceiq/api/repositories/AttendanceRecordRepository.java
package com.attendanceiq.api.repositories;

import com.attendanceiq.api.models.AttendanceRecord;
import com.attendanceiq.api.models.ClassSession;
import com.attendanceiq.api.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySession(ClassSession session);
    List<AttendanceRecord> findByStudent(Student student);
    
    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.student = :student AND ar.session.course.id = :courseId")
    List<AttendanceRecord> findByStudentAndCourseId(Student student, Long courseId);
}
