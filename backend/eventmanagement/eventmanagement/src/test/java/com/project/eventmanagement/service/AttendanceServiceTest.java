package com.project.eventmanagement.service;

import com.project.eventmanagement.model.Event;
import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.model.User;
import com.project.eventmanagement.repository.EventRegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private EventRegistrationRepository registrationRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private EventRegistration sampleRegistration;

    @BeforeEach
    void setUp() {
        // Create mock User and Event objects to match @DBRef model fields
        User sampleUser = User.builder()
                .id("usr001")
                .fullName("John Smith")
                .email("john@example.com")
                .build();

        Event sampleEvent = Event.builder()
                .id("evt001")
                .title("Tech Conference")
                .build();

        sampleRegistration = EventRegistration.builder()
                .id("reg123")
                .event(sampleEvent)
                .user(sampleUser)
                .status(EventRegistration.RegistrationStatus.REGISTERED)
                .build();
    }

    @Test
    @DisplayName("Should return attendees list for given event ID")
    void getEventAttendees_Success() {
        when(registrationRepository.findByEvent_Id("evt001")).thenReturn(List.of(sampleRegistration));

        List<EventRegistration> result = attendanceService.getEventAttendees("evt001");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Smith", result.get(0).getUser().getFullName());
        verify(registrationRepository, times(1)).findByEvent_Id("evt001");
    }

    @Test
    @DisplayName("Should toggle attendance status to true and save")
    void toggleAttendance_True_Success() {
        when(registrationRepository.findById("reg123")).thenReturn(Optional.of(sampleRegistration));
        when(registrationRepository.save(any(EventRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventRegistration updated = attendanceService.toggleAttendance("reg123", true);

        assertNotNull(updated);
        assertEquals(EventRegistration.RegistrationStatus.ATTENDED, updated.getStatus());
        assertNotNull(updated.getAttendedAt());
        verify(registrationRepository, times(1)).save(sampleRegistration);
    }
}