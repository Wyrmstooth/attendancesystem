// File: src/main/java/com/attendanceiq/api/config/DataInitializer.java
package com.attendanceiq.api.config;

import com.attendanceiq.api.models.*;
import com.attendanceiq.api.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ClassSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("dev")
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already initialized. Skipping initialization.");
                return;
            }

            log.info("Initializing database with sample data...");

            // Create users
            User admin = createUser("admin", "admin@attendance.com", "Admin", "User", Role.ADMIN);
            User instructor1 = createUser("instructor1", "instructor1@attendance.com", "John", "Smith", Role.INSTRUCTOR);
            User instructor2 = createUser("instructor2", "instructor2@attendance.com", "Jane", "Doe", Role.INSTRUCTOR);
            User student1 = createUser("student1", "student1@attendance.com", "Alice", "Johnson", Role.STUDENT);
            User student2 = createUser("student2", "student2@attendance.com", "Bob", "Williams", Role.STUDENT);
            User student3 = createUser("student3", "student3@attendance.com", "Charlie", "Brown", Role.STUDENT);
            User student4 = createUser("student4", "student4@attendance.com", "Diana", "Miller", Role.STUDENT);
            User parent1 = createUser("parent1", "parent1@attendance.com", "Michael", "Johnson", Role.PARENT);
            User parent2 = createUser("parent2", "parent2@attendance.com", "Emily", "Williams", Role.PARENT);

            // Create students
            Student studentEntity1 = Student.builder()
                    .user(student1)
                    .rollNo("21-001")
                    .build();

            Student studentEntity2 = Student.builder()
                    .user(student2)
                    .rollNo("21-002")
                    .build();

            Student studentEntity3 = Student.builder()
                    .user(student3)
                    .rollNo("21-003")
                    .build();

            Student studentEntity4 = Student.builder()
                    .user(student4)
                    .rollNo("21-004")
                    .build();

            studentRepository.saveAll(Arrays.asList(studentEntity1, studentEntity2, studentEntity3, studentEntity4));

            // Create courses
            Set<Student> softwareEngineeringStudents = new HashSet<>(Arrays.asList(studentEntity1, studentEntity2, studentEntity3));
            Set<Student> databaseStudents = new HashSet<>(Arrays.asList(studentEntity1, studentEntity3, studentEntity4));

            Course softwareEngineering = Course.builder()
                    .name("Software Engineering")
                    .code("CS3009")
                    .semester("Spring 2025")
                    .department("Computer Science")
                    .instructor(instructor1)
                    .students(softwareEngineeringStudents)
                    .build();

            Course database = Course.builder()
                    .name("Database Systems")
                    .code("CS4005")
                    .semester("Spring 2025")
                    .department("Computer Science")
                    .instructor(instructor2)
                    .students(databaseStudents)
                    .build();

            courseRepository.saveAll(Arrays.asList(softwareEngineering, database));

            // Create class sessions
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate lastWeek = today.minusWeeks(1);
            
            ClassSession se1 = ClassSession.builder()
                    .course(softwareEngineering)
                    .date(yesterday)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(10, 30))
                    .location("Room 101")
                    .build();

            ClassSession se2 = ClassSession.builder()
                    .course(softwareEngineering)
                    .date(lastWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(10, 30))
                    .location("Room 101")
                    .build();
            
            ClassSession se3 = ClassSession.builder()
                    .course(softwareEngineering)
                    .date(today)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(10, 30))
                    .location("Room 101")
                    .build();

            ClassSession db1 = ClassSession.builder()
                    .course(database)
                    .date(yesterday)
                    .startTime(LocalTime.of(11, 0))
                    .endTime(LocalTime.of(12, 30))
                    .location("Room 202")
                    .build();

            ClassSession db2 = ClassSession.builder()
                    .course(database)
                    .date(lastWeek)
                    .startTime(LocalTime.of(11, 0))
                    .endTime(LocalTime.of(12, 30))
                    .location("Room 202")
                    .build();

            List<ClassSession> sessions = sessionRepository.saveAll(Arrays.asList(se1, se2, se3, db1, db2));

            // Create attendance records for past sessions
            createAttendanceRecord(se1, studentEntity1, AttendanceStatus.PRESENT, instructor1);
            createAttendanceRecord(se1, studentEntity2, AttendanceStatus.ABSENT, instructor1);
            createAttendanceRecord(se1, studentEntity3, AttendanceStatus.LATE, instructor1);
            
            createAttendanceRecord(se2, studentEntity1, AttendanceStatus.PRESENT, instructor1);
            createAttendanceRecord(se2, studentEntity2, AttendanceStatus.PRESENT, instructor1);
            createAttendanceRecord(se2, studentEntity3, AttendanceStatus.PRESENT, instructor1);
            
            createAttendanceRecord(db1, studentEntity1, AttendanceStatus.PRESENT, instructor2);
            createAttendanceRecord(db1, studentEntity3, AttendanceStatus.ABSENT, instructor2);
            createAttendanceRecord(db1, studentEntity4, AttendanceStatus.PRESENT, instructor2);
            
            createAttendanceRecord(db2, studentEntity1, AttendanceStatus.LATE, instructor2);
            createAttendanceRecord(db2, studentEntity3, AttendanceStatus.PRESENT, instructor2);
            createAttendanceRecord(db2, studentEntity4, AttendanceStatus.EXCUSED, instructor2);

            // Create notifications for students with absences
            Notification notification1 = Notification.builder()
                    .user(student2)
                    .message("You were marked absent for Software Engineering class on " + yesterday.toString())
                    .timestamp(LocalDateTime.now().minusHours(5))
                    .read(false)
                    .type(NotificationType.ATTENDANCE)
                    .build();

            Notification notification2 = Notification.builder()
                    .user(student3)
                    .message("You were marked absent for Database Systems class on " + yesterday.toString())
                    .timestamp(LocalDateTime.now().minusHours(4))
                    .read(false)
                    .type(NotificationType.ATTENDANCE)
                    .build();

            Notification notification3 = Notification.builder()
                    .user(student2)
                    .message("Your attendance in Software Engineering has fallen below 75%")
                    .timestamp(LocalDateTime.now().minusHours(3))
                    .read(false)
                    .type(NotificationType.ALERT)
                    .build();

            notificationRepository.saveAll(Arrays.asList(notification1, notification2, notification3));

            log.info("Sample data initialization completed successfully");
        };
    }

    private User createUser(String username, String email, String firstName, String lastName, Role role) {
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode("password"))  // Default password for all users
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .build();
        return userRepository.save(user);
    }

    private void createAttendanceRecord(ClassSession session, Student student, AttendanceStatus status, User markedBy) {
        AttendanceRecord record = AttendanceRecord.builder()
                .session(session)
                .student(student)
                .status(status)
                .timestamp(LocalDateTime.now().minusDays(1))
                .markedBy(markedBy)
                .build();
        attendanceRepository.save(record);
    }
}