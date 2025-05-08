

// File: src/main/java/com/attendanceiq/api/dto/AttendanceSummaryDto.java
package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceSummaryDto {
    private Long courseId;
    private String courseName;
    private String courseCode;
    private int totalSessions;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int excusedCount;
    private double attendancePercentage;
}
