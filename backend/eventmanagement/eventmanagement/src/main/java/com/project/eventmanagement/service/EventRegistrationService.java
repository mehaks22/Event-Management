package com.project.eventmanagement.service;

import com.project.eventmanagement.model.Event;
import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.model.User;
import com.project.eventmanagement.repository.EventRegistrationRepository;
import com.project.eventmanagement.repository.EventRepository;
import com.project.eventmanagement.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class EventRegistrationService {

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EmailService emailService;

    public EventRegistration registerForEvent(String userId, String eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if already registered
        var existing = registrationRepository.findByUser_IdAndEvent_Id(userId, eventId);
        if (existing.isPresent()) {
            throw new RuntimeException("Already registered for this event");
        }

        EventRegistration registration = EventRegistration.builder()
                .user(user)
                .event(event)
                .status(EventRegistration.RegistrationStatus.REGISTERED)
                .registeredAt(LocalDateTime.now())
                .build();

        EventRegistration saved = registrationRepository.save(registration);
        log.info("User {} registered for event {}", userId, eventId);

        // Send confirmation email
        emailService.sendEventRegistrationEmail(
                user.getEmail(),
                user.getFullName(),
                event.getTitle()
        );

        return saved;
    }

    public List<EventRegistration> getUserRegistrations(String userId) {
        return registrationRepository.findByUser_Id(userId);
    }

    public List<EventRegistration> getEventRegistrations(String eventId) {
        return registrationRepository.findByEvent_Id(eventId);
    }

    public void markAttendance(String registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        registration.setStatus(EventRegistration.RegistrationStatus.ATTENDED);
        registration.setAttendedAt(LocalDateTime.now());
        registrationRepository.save(registration);
        log.info("Attendance marked for registration {}", registrationId);
    }
}