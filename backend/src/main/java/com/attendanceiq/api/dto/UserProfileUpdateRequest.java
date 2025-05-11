// File: src/main/java/com/attendanceiq/api/dto/UserProfileUpdateRequest.java
package com.attendanceiq.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileUpdateRequest {
    @NotBlank(message = "First name is required")
    @Size(max = 32, message = "First name must be at most 32 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 32, message = "Last name must be at most 32 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}