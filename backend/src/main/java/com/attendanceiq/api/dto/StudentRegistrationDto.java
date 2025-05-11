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
public class StudentRegistrationDto {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 32, message = "Username must be 3-32 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 64, message = "Password must be 6-64 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 32, message = "First name must be at most 32 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 32, message = "Last name must be at most 32 characters")
    private String lastName;

    @NotBlank(message = "Roll number is required")
    @Size(max = 32, message = "Roll number must be at most 32 characters")
    private String rollNo;
}
