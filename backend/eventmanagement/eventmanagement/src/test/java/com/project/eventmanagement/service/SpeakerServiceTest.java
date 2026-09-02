package com.project.eventmanagement.service;

import com.project.eventmanagement.dto.SpeakerRequest;
import com.project.eventmanagement.model.Speaker;
import com.project.eventmanagement.repository.SpeakerRepository;
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
public class SpeakerServiceTest {

    @Mock
    private SpeakerRepository speakerRepository;

    @InjectMocks
    private SpeakerService speakerService;

    private Speaker sampleSpeaker;

    @BeforeEach
    void setUp() {
        sampleSpeaker = Speaker.builder()
                .id("spk123")
                .name("Jane Doe")
                .email("jane@example.com")
                .designation("Tech Lead")
                .company("TechCorp")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should return all active speakers")
    void getAllActiveSpeakers_Success() {
        when(speakerRepository.findByIsActiveTrue()).thenReturn(List.of(sampleSpeaker));

        List<Speaker> result = speakerService.getAllActiveSpeakers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Jane Doe", result.get(0).getName());
        verify(speakerRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    @DisplayName("Should return speaker by ID when exists")
    void getSpeakerById_Success() {
        when(speakerRepository.findById("spk123")).thenReturn(Optional.of(sampleSpeaker));

        Speaker result = speakerService.getSpeakerById("spk123");

        assertNotNull(result);
        assertEquals("Jane Doe", result.getName());
        verify(speakerRepository, times(1)).findById("spk123");
    }

    @Test
    @DisplayName("Should throw exception when speaker ID is not found")
    void getSpeakerById_NotFound() {
        when(speakerRepository.findById("invalid_id")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> speakerService.getSpeakerById("invalid_id"));
        verify(speakerRepository, times(1)).findById("invalid_id");
    }

    @Test
    @DisplayName("Should save and return new speaker")
    void createSpeaker_Success() {
        SpeakerRequest request = new SpeakerRequest();
        request.setName("Jane Doe");
        request.setEmail("jane@example.com");

        when(speakerRepository.save(any(Speaker.class))).thenReturn(sampleSpeaker);

        Speaker result = speakerService.createSpeaker(request);

        assertNotNull(result);
        assertEquals("Jane Doe", result.getName());
        verify(speakerRepository, times(1)).save(any(Speaker.class));
    }
}
