package com.project.eventmanagement.service;

import com.project.eventmanagement.dto.EventDTO;
import com.project.eventmanagement.model.Event;
import com.project.eventmanagement.repository.EventRepository;
import com.project.eventmanagement.repository.EventRegistrationRepository;
import com.project.eventmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventRegistrationRepository eventRegistrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EventService eventService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetEventById() {
        Event mockEvent = new Event();
        mockEvent.setId("123");
        mockEvent.setTitle("Tech Conference");
        mockEvent.setDescription("A technology meetup");
        mockEvent.setLocation("New Delhi");
        mockEvent.setCapacity(100);
        mockEvent.setEventDate(LocalDateTime.now().plusDays(5));

        when(eventRepository.findById("123")).thenReturn(Optional.of(mockEvent));

        EventDTO result = eventService.getEventById("123");

        assertNotNull(result);
        org.junit.jupiter.api.Assertions.assertEquals("Tech Conference", result.getTitle());
    }
}