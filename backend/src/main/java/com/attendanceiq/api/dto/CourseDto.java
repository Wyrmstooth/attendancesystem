

// File: src/main/java/com/attendanceiq/api/dto/CourseDto.java
package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDto {
    private Long id;
    private String name;
    private String code;
    private String semester;
    private String department;
    private Long instructorId;
}
