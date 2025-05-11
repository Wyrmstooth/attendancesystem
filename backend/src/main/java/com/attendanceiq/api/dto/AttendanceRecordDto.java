// File: src/main/java/com/attendanceiq/api/dto/AttendanceRecordDto.java
package com.attendanceiq.api.dto;

import com.attendanceiq.api.models.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRecordDto {
    private Long id;
    private Long sessionId;
    private Long studentId;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private AttendanceStatus status;
    private LocalDateTime timestamp;
    private Long markedById;
}