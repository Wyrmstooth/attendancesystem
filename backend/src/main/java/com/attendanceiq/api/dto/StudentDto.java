
// File: src/main/java/com/attendanceiq/api/dto/StudentDto.java
package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentDto {
    private Long id;
    private Long userId;
    private String rollNo;
    private String firstName;
    private String lastName;
}