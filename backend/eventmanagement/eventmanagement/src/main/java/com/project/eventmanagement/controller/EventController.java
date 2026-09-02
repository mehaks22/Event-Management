package com.project.eventmanagement.controller;

import com.project.eventmanagement.dto.EventDTO;
import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.repository.EventRegistrationRepository;
import com.project.eventmanagement.security.JwtTokenProvider;
import com.project.eventmanagement.service.EventService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventDTO eventDTO, HttpServletRequest request) {
        try {
            // 1. Authenticate user from token
            String organizerId = eventDTO.getOrganizerId();
            if (organizerId == null || organizerId.trim().isEmpty()) {
                organizerId = getCurrentUserId(request);
            }

            if (organizerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("User authentication required"));
            }

            // 2. Strict Role-Based Check: Ensure the user is an ADMIN
            boolean isAdmin = checkIsUserAdmin(request);
            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied: Only administrators can create events"));
            }

            // 3. Proceed with event creation
            EventDTO created = eventService.createEvent(eventDTO, organizerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Event creation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        try {
            List<EventDTO> events = eventService.getAllEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        try {
            EventDTO event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody EventDTO eventDTO, HttpServletRequest request) {
        if (!checkIsUserAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Access denied: Only administrators can update events"));
        }
        try {
            EventDTO updated = eventService.updateEvent(id, eventDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id, HttpServletRequest request) {
        if (!checkIsUserAdmin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Access denied: Only administrators can delete events"));
        }
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok(new SuccessResponse("Event deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchEvents(@RequestParam String query) {
        try {
            List<EventDTO> events = eventService.searchEvents(query);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getEventsByCategory(@PathVariable String category) {
        try {
            List<EventDTO> events = eventService.getEventsByCategory(category);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // ----- Registration -----

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable String id, HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Not authenticated"));
        }
        try {
            EventDTO event = eventService.registerForEvent(id, userId);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        }
    }

    // Support both /register (DELETE) and /unregister (DELETE) for maximum compatibility
    @DeleteMapping(value = {"/{id}/register", "/{id}/unregister"})
    public ResponseEntity<?> unregisterFromEvent(@PathVariable String id, HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Not authenticated"));
        }
        try {
            EventDTO event = eventService.unregisterFromEvent(id, userId);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            log.error("Unregister error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/registration-status")
    public ResponseEntity<?> getRegistrationStatus(@PathVariable String id, HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        if (userId == null) {
            return ResponseEntity.ok(new RegistrationStatusResponse(false));
        }
        try {
            boolean registered = eventService.isUserRegistered(id, userId);
            return ResponseEntity.ok(new RegistrationStatusResponse(registered));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }
    @GetMapping("/user/registrations")
    public ResponseEntity<?> getUserRegistrations(HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Not authenticated"));
        }
        try {
            // Only fetch active 'REGISTERED' statuses, ignoring cancelled ones
            var registrations = eventRegistrationRepository.findByUser_IdAndStatus(
                    userId,
                    EventRegistration.RegistrationStatus.REGISTERED
            );
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper methods
    private String getCurrentUserId(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return jwtTokenProvider.extractUserId(bearerToken.substring(7));
        }
        return null;
    }

    private boolean checkIsUserAdmin(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            String role = jwtTokenProvider.extractRole(token);
            return "ADMIN".equalsIgnoreCase(role);
        }
        return false;
    }

    public static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) {
            this.message = message;
        }
    }

    public static class SuccessResponse {
        public String message;
        public SuccessResponse(String message) {
            this.message = message;
        }
    }

    public static class RegistrationStatusResponse {
        public boolean registered;
        public RegistrationStatusResponse(boolean registered) {
            this.registered = registered;
        }
    }
}