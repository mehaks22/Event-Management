package com.project.eventmanagement.controller;

import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.service.EventRegistrationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class EventRegistrationController {


        @Autowired
        private EventRegistrationService registrationService;

        @PostMapping
        public ResponseEntity<?> registerForEvent(@RequestParam String userId, @RequestParam String eventId) {
            try {
                EventRegistration registration = registrationService.registerForEvent(userId, eventId);
                return ResponseEntity.status(HttpStatus.CREATED).body(registration);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            }
        }

        @PutMapping("/{registrationId}/mark-attended")
        public ResponseEntity<?> markAttendance(@PathVariable String registrationId) {
            try {
                registrationService.markAttendance(registrationId);
                return ResponseEntity.ok("Attendance marked successfully");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<?> getUserRegistrations(@PathVariable String userId) {
            try {
                List<EventRegistration> registrations = registrationService.getUserRegistrations(userId);
                return ResponseEntity.ok(registrations);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
        }

    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<?> getEventRegistrations(@PathVariable String eventId, @RequestHeader("Authorization") String token) {
        // Optional: Add logic to verify if the requesting user is an ADMIN
        List<EventRegistration> registrations = registrationService.getEventRegistrations(eventId);
        return ResponseEntity.ok(registrations);
    }
}
