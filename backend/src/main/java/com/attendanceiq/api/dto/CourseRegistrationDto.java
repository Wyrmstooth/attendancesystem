package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseRegistrationDto {
    @NotBlank(message = "Course name is required")
    @Size(min = 3, max = 64, message = "Course name must be 3-64 characters")
    private String name;

    @NotBlank(message = "Course code is required")
    @Size(min = 2, max = 32, message = "Course code must be 2-32 characters")
    private String code;

    @NotBlank(message = "Semester is required")
    @Size(min = 1, max = 32, message = "Semester must be 1-32 characters")
    private String semester;

    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 64, message = "Department must be 2-64 characters")
    private String department;

    @NotNull(message = "Instructor ID is required")
    private Long instructorId;
}
