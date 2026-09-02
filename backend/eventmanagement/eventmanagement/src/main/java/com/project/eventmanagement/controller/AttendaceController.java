package com.project.eventmanagement.controller;

import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")

public class AttendaceController {

    private final AttendanceService attendanceService;

    // Get list of registered users for an event to check attendance
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventRegistration>> getAttendeesForEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(attendanceService.getEventAttendees(eventId));
    }

    // Update attendance status for a specific user registration
    @PatchMapping("/{registrationId}")
    public ResponseEntity<EventRegistration> updateAttendance(
            @PathVariable String registrationId,
            @RequestParam Boolean attended) {
        return ResponseEntity.ok(attendanceService.toggleAttendance(registrationId, attended));
    }
}
