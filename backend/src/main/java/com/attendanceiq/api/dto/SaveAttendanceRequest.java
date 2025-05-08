

// File: src/main/java/com/attendanceiq/api/dto/SaveAttendanceRequest.java
package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SaveAttendanceRequest {
    private List<AttendanceRecordDto> records;
}
