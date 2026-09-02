package com.project.eventmanagement.service;

import com.project.eventmanagement.dto.UserDTO;
import com.project.eventmanagement.model.User;
import com.project.eventmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id("usr100")
                .fullName("Alex Smith")
                .email("alex@example.com")
                .role(User.Role.USER) // Using enum value instead of String
                .build();
    }

    @Test
    @DisplayName("Should return user DTO when valid ID is provided")
    void getUserById_Success() {
        when(userRepository.findById("usr100")).thenReturn(Optional.of(sampleUser));

        UserDTO result = userService.getUserById("usr100");

        assertNotNull(result);
        assertEquals("Alex Smith", result.getFullName());
        verify(userRepository, times(1)).findById("usr100");
    }

    @Test
    @DisplayName("Should throw exception when user ID is not found")
    void getUserById_NotFound() {
        when(userRepository.findById("invalid_id")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById("invalid_id"));
        verify(userRepository, times(1)).findById("invalid_id");
    }
}