package com.project.eventmanagement.service;

import com.project.eventmanagement.dto.UserDTO;
import com.project.eventmanagement.model.User;
import com.project.eventmanagement.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public UserDTO registerUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            log.error("Email already registered: {}", userDTO.getEmail());
            throw new RuntimeException("Email already registered");
        }

        // Parse role safely from DTO or default to USER
        User.Role assignedRole = User.Role.USER;
        if (userDTO.getRole() != null && !userDTO.getRole().isEmpty()) {
            try {
                assignedRole = User.Role.valueOf(userDTO.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                assignedRole = User.Role.USER;
            }
        }

        User user = User.builder()
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .fullName(userDTO.getFullName())
                .phoneNumber(userDTO.getPhoneNumber())
                .role(assignedRole)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with role {}: {}", savedUser.getRole(), savedUser.getEmail());

        emailService.sendRegistrationEmail(savedUser.getEmail(), savedUser.getFullName(),savedUser.getRole().toString());

        return convertToDTO(savedUser);
    }




    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDTO(user);
    }

    public UserDTO updateUser(String id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setFullName(userDTO.getFullName());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setUpdatedAt(LocalDateTime.now());

        User updated = userRepository.save(user);
        log.info("User updated: {}", id);
        return convertToDTO(updated);
    }

    public long getTotalUsersCount() {
        return userRepository.count();
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
        log.info("User deleted: {}", id);
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole().toString(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}