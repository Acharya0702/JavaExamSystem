package com.examsystem.controller;

import com.examsystem.model.User;
import com.examsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for user management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<Optional<User>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system statistics (Admin only)")
    public ResponseEntity<?> getStats() {
        long studentCount = userService.countStudents();
        long teacherCount = userService.countTeachers();

        return ResponseEntity.ok()
                .body("{\"students\": " + studentCount + ", \"teachers\": " + teacherCount + "}");
    }
}