// File: src/main/java/com/attendanceiq/api/controllers/UserController.java
package com.attendanceiq.api.controllers;

import com.attendanceiq.api.dto.UserDto;
import com.attendanceiq.api.dto.UserProfileUpdateRequest;
import com.attendanceiq.api.models.User;
import com.attendanceiq.api.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.convertToDto(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }
}
