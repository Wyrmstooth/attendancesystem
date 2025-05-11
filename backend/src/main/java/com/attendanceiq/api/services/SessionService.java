// File: src/main/java/com/attendanceiq/api/services/SessionService.java
package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.AttendanceRecordDto;
import com.attendanceiq.api.dto.ClassSessionDto;
import com.attendanceiq.api.dto.SaveAttendanceRequest;
import com.attendanceiq.api.models.*;
import com.attendanceiq.api.repositories.AttendanceRecordRepository;
import com.attendanceiq.api.repositories.ClassSessionRepository;
import com.attendanceiq.api.repositories.CourseRepository;
import com.attendanceiq.api.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final ClassSessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final NotificationService notificationService;
    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    public List<ClassSessionDto> getCourseSession(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        return sessionRepository.findByCourse(course).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ClassSessionDto> getCourseSessionForInstructor(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        // Allow access if user is instructor for the course OR is an admin
        if (user.getRole() != Role.ADMIN &&
            (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId()))) {
            throw new IllegalArgumentException("You are not the instructor for this course");
        }
        return sessionRepository.findByCourse(course).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ClassSessionDto getSessionById(Long sessionId) {
        return convertToDto(sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found")));
    }

    public List<AttendanceRecordDto> getSessionAttendance(Long sessionId) {
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        
        return attendanceRepository.findBySession(session).stream()
                .map(this::convertToAttendanceDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveAttendance(Long sessionId, SaveAttendanceRequest request, User user) {
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        Course course = session.getCourse();

        // Allow if user is admin or instructor for the course
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isInstructor = course.getInstructor() != null && course.getInstructor().getId().equals(user.getId());
        if (!isAdmin && !isInstructor) {
            throw new IllegalArgumentException("You are not allowed to mark attendance for this course");
        }

        // Remove existing records
        List<AttendanceRecord> existingRecords = attendanceRepository.findBySession(session);
        attendanceRepository.deleteAll(existingRecords);

        // Map studentId -> status from request
        Map<Long, AttendanceStatus> statusMap = new java.util.HashMap<>();
        if (request.getRecords() != null) {
            for (AttendanceRecordDto recordDto : request.getRecords()) {
                if (recordDto.getStudentId() != null && recordDto.getStatus() != null) {
                    statusMap.put(recordDto.getStudentId(), recordDto.getStatus());
                }
            }
        }

        // Always create a record for every enrolled student
        List<AttendanceRecord> newRecords = new ArrayList<>();
        for (Student student : course.getStudents()) {
            AttendanceStatus status = statusMap.getOrDefault(student.getId(), AttendanceStatus.ABSENT);

            AttendanceRecord record = AttendanceRecord.builder()
                    .session(session)
                    .student(student)
                    .status(status)
                    .timestamp(LocalDateTime.now())
                    .markedBy(user)
                    .build();

            newRecords.add(record);

            // Send notification for absent students
            if (status == AttendanceStatus.ABSENT) {
                notificationService.createAttendanceNotification(student.getUser(), session);
            }
        }

        attendanceRepository.saveAll(newRecords);
    }

    private ClassSessionDto convertToDto(ClassSession session) {
        return ClassSessionDto.builder()
                .id(session.getId())
                .courseId(session.getCourse().getId())
                .courseName(session.getCourse().getName())
                .date(session.getDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .location(session.getLocation())
                .build();
    }

    private AttendanceRecordDto convertToAttendanceDto(AttendanceRecord record) {
        return AttendanceRecordDto.builder()
                .id(record.getId())
                .sessionId(record.getSession().getId())
                .studentId(record.getStudent().getId())
                .status(record.getStatus())
                .timestamp(record.getTimestamp())
                .markedById(record.getMarkedBy().getId())
                .build();
    }
}