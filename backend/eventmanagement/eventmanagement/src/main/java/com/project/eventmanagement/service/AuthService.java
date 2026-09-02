package com.project.eventmanagement.service;

import com.project.eventmanagement.dto.AuthResponse;
import com.project.eventmanagement.dto.LoginRequest;
import com.project.eventmanagement.dto.UserDTO;
import com.project.eventmanagement.model.User;
import com.project.eventmanagement.repository.UserRepository;
import com.project.eventmanagement.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Get user from database
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token
            String token = tokenProvider.generateToken(user.getId(), user.getEmail(),user.getRole().name());
            long expiresIn = 86400000; // 24 hours

            log.info("User logged in successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .success(true)
                    .message("Login successful")
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().toString())
                    .expiresIn(expiresIn)
                    .build();

        } catch (AuthenticationException e) {
            log.error("Authentication failed: {}", e.getMessage());
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return AuthResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
        }
    }

    public AuthResponse register(UserDTO userDTO) {
        try {
            // Register user
            UserDTO registeredUser = userService.registerUser(userDTO);

            // Get full user data
            User user = userRepository.findByEmail(registeredUser.getEmail())
                    .orElseThrow(() -> new RuntimeException("User registration failed"));

            // Generate token
            String token = tokenProvider.generateToken(user.getId(), user.getEmail(),user.getRole().name());
            long expiresIn = 86400000;

            log.info("User registered successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .success(true)
                    .message("Registration successful")
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().toString())
                    .expiresIn(expiresIn)
                    .build();

        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return AuthResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
        }
    }

    public AuthResponse refreshToken(String token) {
        try {
            if (!tokenProvider.validateToken(token)) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid token")
                        .build();
            }

            String userId = tokenProvider.extractUserId(token);
            String email = tokenProvider.extractEmail(token);
            String role = tokenProvider.extractRole(token);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newToken = tokenProvider.generateToken(userId, email,role);
            long expiresIn = 86400000;

            return AuthResponse.builder()
                    .success(true)
                    .message("Token refreshed successfully")
                    .token(newToken)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().toString())
                    .expiresIn(expiresIn)
                    .build();

        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage());
            return AuthResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
        }
    }
}
