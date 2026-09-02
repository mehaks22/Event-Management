package com.project.eventmanagement.controller;

import com.project.eventmanagement.dto.SpeakerRequest;
import com.project.eventmanagement.model.Speaker;
import com.project.eventmanagement.service.SpeakerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/speakers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SpeakerController {

    private final SpeakerService speakerService;

    // Public Endpoint - List all active speakers
    @GetMapping
    public ResponseEntity<List<Speaker>> getAllSpeakers() {
        return ResponseEntity.ok(speakerService.getAllActiveSpeakers());
    }

    // Public Endpoint - Get single speaker details
    @GetMapping("/{id}")
    public ResponseEntity<Speaker> getSpeakerById(@PathVariable String id) {
        return ResponseEntity.ok(speakerService.getSpeakerById(id));
    }

    // Admin Endpoint - Create Speaker
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Speaker> createSpeaker(@RequestBody SpeakerRequest request) {
        return ResponseEntity.ok(speakerService.createSpeaker(request));
    }

    // Admin Endpoint - Update Speaker
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Speaker> updateSpeaker(@PathVariable String id, @RequestBody SpeakerRequest request) {
        return ResponseEntity.ok(speakerService.updateSpeaker(id, request));
    }

    // Admin Endpoint - Delete/Deactivate Speaker
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteSpeaker(@PathVariable String id) {
        speakerService.deleteSpeaker(id);
        return ResponseEntity.ok("Speaker deleted successfully");
    }
}
