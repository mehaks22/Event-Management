package com.project.eventmanagement.service;


import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.repository.EventRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final EventRegistrationRepository registrationRepository;

    // Get all registered users for an event
    public List<EventRegistration> getEventAttendees(String eventId) {
        return registrationRepository.findByEvent_Id(eventId);
    }

    // Toggle attendance status (Check-in / Un-check)
    public EventRegistration toggleAttendance(String registrationId, Boolean attended) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        if (Boolean.TRUE.equals(attended)) {
            registration.setStatus(EventRegistration.RegistrationStatus.ATTENDED);
            registration.setAttendedAt(LocalDateTime.now());
        } else {
            registration.setStatus(EventRegistration.RegistrationStatus.REGISTERED);
            registration.setAttendedAt(null);
        }

        return registrationRepository.save(registration);
    }
}
