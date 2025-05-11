package com.attendanceiq.api.services;

import com.attendanceiq.api.dto.*;
import com.attendanceiq.api.models.*;
import com.attendanceiq.api.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final ClassSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AttendanceRecordRepository attendanceRecordRepository;

    @Transactional
    public UserDto registerStudent(StudentRegistrationDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (studentRepository.existsByRollNo(request.getRollNo())) {
            throw new IllegalArgumentException("Roll number already in use");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.STUDENT)
                .build();
        User savedUser = userRepository.save(user);
        if (savedUser == null) throw new IllegalStateException("Failed to save user for student");
        Student student = Student.builder()
                .user(savedUser)
                .rollNo(request.getRollNo())
                .build();
        studentRepository.save(student);
        createWelcomeNotification(savedUser);
        return userService.convertToDto(savedUser);
    }

    @Transactional
    public UserDto registerInstructor(InstructorRegistrationDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.INSTRUCTOR)
                .build();
        User savedUser = userRepository.save(user);
        if (savedUser == null) throw new IllegalStateException("Failed to save user for instructor");
        logger.info("Registered instructor: {} with role {}", savedUser.getEmail(), savedUser.getRole());
        createWelcomeNotification(savedUser);
        return userService.convertToDto(savedUser);
    }

    @Transactional
    public CourseDto createCourse(CourseRegistrationDto request) {
        if (request.getName() == null || request.getName().trim().length() < 3)
            throw new IllegalArgumentException("Course name must be at least 3 characters");
        if (request.getCode() == null || request.getCode().trim().length() < 2)
            throw new IllegalArgumentException("Course code must be at least 2 characters");
        if (courseRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Course code already exists");
        }
        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new IllegalArgumentException("Selected user is not an instructor");
        }
        Course course = Course.builder()
                .name(request.getName())
                .code(request.getCode())
                .semester(request.getSemester())
                .department(request.getDepartment())
                .instructor(instructor)
                .build();
        Course savedCourse = courseRepository.save(course);
        return convertToCourseDto(savedCourse);
    }

    @Transactional
    public void enrollStudentsInCourse(EnrollmentRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        boolean changed = false;
        for (Long studentId : request.getStudentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
            if (!course.getStudents().contains(student)) {
                course.getStudents().add(student);
                changed = true;
                String message = String.format("You have been enrolled in %s (%s)", course.getName(), course.getCode());
                Notification notification = Notification.builder()
                        .user(student.getUser())
                        .message(message)
                        .timestamp(LocalDateTime.now())
                        .read(false)
                        .type(NotificationType.SYSTEM)
                        .build();
                notificationService.saveNotification(notification);
            }
        }
        if (changed) {
            courseRepository.save(course);
        }
    }

    @Transactional
    public void unenrollStudentsFromCourse(EnrollmentRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        boolean changed = false;
        for (Long studentId : request.getStudentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
            if (course.getStudents().contains(student)) {
                course.getStudents().remove(student);
                changed = true;
                String message = String.format("You have been unenrolled from %s (%s)", course.getName(), course.getCode());
                Notification notification = Notification.builder()
                        .user(student.getUser())
                        .message(message)
                        .timestamp(LocalDateTime.now())
                        .read(false)
                        .type(NotificationType.SYSTEM)
                        .build();
                notificationService.saveNotification(notification);
            }
        }
        if (changed) {
            courseRepository.save(course);
        }
    }

    @Transactional
    public ClassSessionDto createClassSession(Long courseId, ClassSessionDto sessionDto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        ClassSession session = ClassSession.builder()
                .course(course)
                .date(sessionDto.getDate())
                .startTime(sessionDto.getStartTime())
                .endTime(sessionDto.getEndTime())
                .location(sessionDto.getLocation())
                .build();
        ClassSession savedSession = sessionRepository.save(session);
        return convertToSessionDto(savedSession);
    }

    public List<StudentDto> getAllStudents() {
        logger.info("Fetching all students...");
        List<StudentDto> students = studentRepository.findAll().stream()
                .filter(student -> student.getUser() != null)
                .map(this::convertToStudentDto)
                .collect(Collectors.toList());
        logger.info("Found {} students", students.size());
        return students;
    }

    public List<UserDto> getAllInstructors() {
        try {
            logger.info("Fetching all instructors...");
            List<UserDto> instructors = userRepository.findByRole(Role.INSTRUCTOR).stream()
                    .filter(user -> user != null)
                    .map(userService::convertToDto)
                    .collect(Collectors.toList());
            logger.info("Found {} instructors", instructors.size());
            return instructors;
        } catch (Exception e) {
            logger.error("Error fetching instructors", e);
            throw e;
        }
    }

    public List<CourseDto> getAllCourses() {
        logger.info("Fetching all courses...");
        List<CourseDto> courses = courseRepository.findAll().stream()
                .map(this::convertToCourseDto)
                .collect(Collectors.toList());
        logger.info("Found {} courses", courses.size());
        return courses;
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        for (Course course : courseRepository.findAll()) {
            course.getStudents().remove(student);
        }
        attendanceRecordRepository.deleteAll(attendanceRecordRepository.findByStudent(student));
        studentRepository.delete(student);
        if (student.getUser() != null) {
            userRepository.delete(student.getUser());
        }
    }

    @Transactional
    public void deleteInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new IllegalArgumentException("User is not an instructor");
        }
        for (Course course : courseRepository.findByInstructor(instructor)) {
            course.setInstructor(null);
        }
        attendanceRecordRepository.deleteAll(
            attendanceRecordRepository.findAll().stream()
                .filter(ar -> ar.getMarkedBy().getId().equals(instructorId))
                .collect(Collectors.toList())
        );
        userRepository.delete(instructor);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        // Remove all students from the course
        course.getStudents().clear();
        // Remove all sessions (cascade should handle this, but be explicit)
        if (course.getClassSessions() != null) {
            course.getClassSessions().clear();
        }
        courseRepository.delete(course);
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        sessionRepository.delete(session);
    }

    private CourseDto convertToCourseDto(Course course) {
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
        User user = student.getUser();
        return StudentDto.builder()
                .id(student.getId())
                .userId(user.getId())
                .rollNo(student.getRollNo())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }

    private ClassSessionDto convertToSessionDto(ClassSession session) {
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

    private void createWelcomeNotification(User user) {
        String roleDisplay = user.getRole().toString().toLowerCase();
        String message = String.format("Welcome to AttendanceIQ! Your account has been created with %s privileges.", roleDisplay);
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .timestamp(LocalDateTime.now())
                .read(false)
                .type(NotificationType.SYSTEM)
                .build();
        notificationService.saveNotification(notification);
    }
}
