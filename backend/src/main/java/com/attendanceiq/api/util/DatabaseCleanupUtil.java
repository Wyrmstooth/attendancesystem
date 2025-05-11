package com.attendanceiq.api.util;

import com.attendanceiq.api.models.Course;
import com.attendanceiq.api.models.Student;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.repositories.CourseRepository;
import com.attendanceiq.api.repositories.StudentRepository;
import com.attendanceiq.api.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import java.util.Iterator;
import java.util.List;

@Configuration
public class DatabaseCleanupUtil {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseCleanupUtil.class);

    @Bean
    @Profile("dev")
    public CommandLineRunner cleanupOrphans(
            CourseRepository courseRepository,
            StudentRepository studentRepository,
            UserRepository userRepository
    ) {
        return args -> {
            logger.info("Cleaning up orphaned students and courses...");
            cleanupOrphanedStudents(studentRepository, userRepository);
            cleanupOrphanedCourses(courseRepository, userRepository);
        };
    }

    @Transactional
    public void cleanupOrphanedStudents(StudentRepository studentRepository, UserRepository userRepository) {
        List<Student> students = studentRepository.findAll();
        int deleted = 0;
        Iterator<Student> iterator = students.iterator();
        while (iterator.hasNext()) {
            Student student = iterator.next();
            if (student.getUser() == null || !userRepository.existsById(student.getUser().getId())) {
                logger.warn("Deleting orphaned student with id {}", student.getId());
                studentRepository.delete(student);
                deleted++;
            }
        }
        logger.info("Deleted {} orphaned students", deleted);
    }

    @Transactional
    public void cleanupOrphanedCourses(CourseRepository courseRepository, UserRepository userRepository) {
        List<Course> courses = courseRepository.findAll();
        int fixed = 0;
        for (Course course : courses) {
            if (course.getInstructor() == null || !userRepository.existsById(course.getInstructor().getId())) {
                logger.warn("Course {} has null or invalid instructor reference, setting to null", course.getId());
                course.setInstructor(null);
                courseRepository.save(course);
                fixed++;
            }
        }
        logger.info("Fixed {} courses with invalid instructor references", fixed);
    }
}
