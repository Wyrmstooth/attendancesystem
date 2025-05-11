// File: src/main/java/com/attendanceiq/api/services/StudentAttendanceService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.AttendanceSummaryDto;
import com.attendanceiq.api.models.*;
import com.attendanceiq.api.repositories.AttendanceRecordRepository;
import com.attendanceiq.api.repositories.CourseRepository;
import com.attendanceiq.api.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentAttendanceService {
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final AttendanceRecordRepository attendanceRepository;

    @Transactional
    public List<AttendanceSummaryDto> getStudentAttendanceSummary(User user) {
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Get all courses the student is enrolled in
        List<Course> courses = courseRepository.findAll().stream()
                .filter(course -> course.getStudents().contains(student))
                .collect(Collectors.toList());

        return courses.stream()
                .map(course -> generateSummary(student, course))
                .collect(Collectors.toList());
    }

    private AttendanceSummaryDto generateSummary(Student student, Course course) {
        // Get all sessions for the course
        List<ClassSession> sessions = course.getClassSessions() != null
                ? course.getClassSessions()
                : List.of();
        int totalSessions = sessions.size();

        // Get all attendance records for this student in this course
        List<AttendanceRecord> records = attendanceRepository.findByStudentAndCourseId(student, course.getId());

        // Map sessionId -> AttendanceRecord for this student
        Map<Long, AttendanceRecord> sessionAttendanceMap = records.stream()
                .collect(Collectors.toMap(
                        r -> r.getSession().getId(),
                        r -> r,
                        (a, b) -> a // in case of duplicates, keep first
                ));

        int presentCount = 0;
        int absentCount = 0;
        int lateCount = 0;
        int excusedCount = 0;

        // For each session, check if attendance exists, and count status
        for (ClassSession session : sessions) {
            AttendanceRecord record = sessionAttendanceMap.get(session.getId());
            if (record != null) {
                if (record.getStatus() == AttendanceStatus.PRESENT) presentCount++;
                else if (record.getStatus() == AttendanceStatus.ABSENT) absentCount++;
                else if (record.getStatus() == AttendanceStatus.LATE) lateCount++;
                else if (record.getStatus() == AttendanceStatus.EXCUSED) excusedCount++;
            } else {
                // If no record, count as absent
                absentCount++;
            }
        }

        // Calculate attendance percentage (present + late) / totalSessions
        double attendancePercentage = totalSessions > 0
                ? ((double) (presentCount + lateCount) / totalSessions) * 100
                : 0.0;

        return AttendanceSummaryDto.builder()
                .courseId(course.getId())
                .courseName(course.getName())
                .courseCode(course.getCode())
                .totalSessions(totalSessions)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .excusedCount(excusedCount)
                .attendancePercentage(attendancePercentage)
                .build();
    }
}
