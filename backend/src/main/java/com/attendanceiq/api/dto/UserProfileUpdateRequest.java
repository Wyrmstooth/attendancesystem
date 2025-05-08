
// File: src/main/java/com/attendanceiq/api/dto/UserProfileUpdateRequest.java
package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
}