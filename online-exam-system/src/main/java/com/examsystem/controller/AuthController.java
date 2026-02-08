// src/main/java/com/examsystem/controller/AuthController.java
package com.examsystem.controller;

import com.examsystem.dto.LoginRequest;
import com.examsystem.dto.RegisterRequest;
import com.examsystem.dto.AuthResponse;
import com.examsystem.model.Role;
import com.examsystem.model.User;
import com.examsystem.repository.UserRepository;
import com.examsystem.service.JwtService;
import com.examsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    @Operation(summary = "User login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("=== LOGIN REQUEST ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Password: " + request.getPassword());

        try {
            // Debug: Check if user exists
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                System.out.println("ERROR: User not found in database");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }

            User user = userOpt.get();
            System.out.println("User found: " + user.getUsername());
            System.out.println("User role: " + user.getRole());
            System.out.println("User enabled: " + user.isEnabled());

            // Manual password check
            boolean passwordMatches = passwordEncoder.matches(
                    request.getPassword(),
                    user.getPassword()
            );
            System.out.println("Manual password check: " + passwordMatches);

            if (!passwordMatches) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid password"));
            }

            // Spring Security authentication
            System.out.println("Attempting Spring Security authentication...");
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            System.out.println("Authentication successful!");
            User authenticatedUser = (User) authentication.getPrincipal();
            String token = jwtService.generateToken(authenticatedUser);
            System.out.println("JWT generated, length: " + token.length());

            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .username(authenticatedUser.getUsername())
                    .email(authenticatedUser.getEmail())
                    .role(authenticatedUser.getRole())
                    .fullName(authenticatedUser.getFullName())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Login failed: " + e.getClass().getName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    @Operation(summary = "User registration")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        System.out.println("=== REGISTER ENDPOINT HIT ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Email: " + request.getEmail());
        System.out.println("Role: " + request.getRole());

        try {
            // Use UserService to register user
            User user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(request.getPassword()) // Will be encoded in service
                    .fullName(request.getFullName())
                    .role(request.getRole())
                    .enabled(true)
                    .build();

            System.out.println("Creating user: " + user.getUsername());

            User savedUser = userService.registerUser(user);
            System.out.println("User saved with ID: " + savedUser.getId());

            String token = jwtService.generateToken(savedUser);
            System.out.println("JWT token generated");

            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .username(savedUser.getUsername())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRole())
                    .fullName(savedUser.getFullName())
                    .message("Registration successful")
                    .build();

            System.out.println("Returning response for: " + savedUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            System.out.println("Registration failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/check-username/{username}")
    @Operation(summary = "Check if username exists")
    public ResponseEntity<Boolean> checkUsername(@PathVariable String username) {
        boolean exists = userService.userExists(username);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/check-email/{email}")
    @Operation(summary = "Check if email exists")
    public ResponseEntity<Boolean> checkEmail(@PathVariable String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated"));
            }

            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            AuthResponse response = AuthResponse.builder()
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .fullName(user.getFullName())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get user info: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-admin")
    public ResponseEntity<?> resetAdmin() {
        try {
            // Delete if exists
            userRepository.findByUsername("admin").ifPresent(user -> {
                userRepository.delete(user);
                System.out.println("Deleted existing admin user");
            });

            // Create new admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@examsystem.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            User savedAdmin = userRepository.save(admin);

            String token = jwtService.generateToken(savedAdmin);

            return ResponseEntity.ok(Map.of(
                    "message", "Admin user created successfully",
                    "username", savedAdmin.getUsername(),
                    "password", "Admin@123",
                    "token", token,
                    "sql_debug", "Password hash: " + savedAdmin.getPassword()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to reset admin: " + e.getMessage()));
        }
    }
}