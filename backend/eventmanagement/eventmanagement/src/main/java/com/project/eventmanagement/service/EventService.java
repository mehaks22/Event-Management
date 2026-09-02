package com.project.eventmanagement.service;

import com.project.eventmanagement.dto.EventDTO;
import com.project.eventmanagement.model.Event;
import com.project.eventmanagement.model.EventRegistration;
import com.project.eventmanagement.model.User;
import com.project.eventmanagement.repository.EventRegistrationRepository;
import com.project.eventmanagement.repository.EventRepository;
import com.project.eventmanagement.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private EmailService emailService;

    public EventDTO createEvent(EventDTO eventDTO, String organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found with ID: " + organizerId));

        Event event = Event.builder()
                .title(eventDTO.getTitle())
                .description(eventDTO.getDescription())
                .eventDate(eventDTO.getEventDate())
                .location(eventDTO.getLocation())
                .category(eventDTO.getCategory())
                .capacity(eventDTO.getCapacity())
                .attendeeCount(0)
                .organizer(organizer)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .speakers(eventDTO.getSpeakers())
                .build();

        Event savedEvent = eventRepository.save(event);
        log.info("Event created with ID: {} by organizer: {}", savedEvent.getId(), organizerId);
        return convertToDTO(savedEvent);
    }

    public List<EventDTO> getAllEvents() {
        return eventRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public EventDTO getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        return convertToDTO(event);
    }

    public EventDTO updateEvent(String id, EventDTO eventDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setEventDate(eventDTO.getEventDate());
        event.setLocation(eventDTO.getLocation());
        event.setCategory(eventDTO.getCategory());
        event.setCapacity(eventDTO.getCapacity());
        event.setUpdatedAt(LocalDateTime.now());
        event.setSpeakers(eventDTO.getSpeakers());

        Event updated = eventRepository.save(event);
        log.info("Event updated: {}", id);
        return convertToDTO(updated);
    }

    // Fixed: Performs Hard Delete in MongoDB and cleans up associated registrations
    @Transactional
    public void deleteEvent(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

        // 1. Clean up associated registrations to prevent orphaned records
        eventRegistrationRepository.deleteById(id);

        // 2. Hard delete event permanently from database
        eventRepository.deleteById(id);
        log.info("Event hard deleted successfully: {}", id);
    }

    public List<EventDTO> searchEvents(String query) {
        return eventRepository.findByTitleContainingIgnoreCase(query)
                .stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByCategory(String category) {
        return eventRepository.findByCategory(category)
                .stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getUserEvents(String organizerId) {
        return eventRepository.findByOrganizerId(organizerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getTotalEventsCount() {
        return eventRepository.count();
    }

    // ----- Registration -----

    public EventDTO registerForEvent(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        if (!Boolean.TRUE.equals(event.getIsActive())) {
            throw new RuntimeException("Event is not active");
        }

        if (event.getAttendeeCount() != null && event.getCapacity() != null
                && event.getAttendeeCount() >= event.getCapacity()) {
            throw new RuntimeException("Event is full");
        }

        EventRegistration existing = eventRegistrationRepository
                .findByUser_IdAndEvent_Id(userId, eventId)
                .orElse(null);

        if (existing != null && existing.getStatus() == EventRegistration.RegistrationStatus.REGISTERED) {
            throw new RuntimeException("Already registered for this event");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (existing != null) {
            existing.setStatus(EventRegistration.RegistrationStatus.REGISTERED);
            existing.setRegisteredAt(LocalDateTime.now());
            eventRegistrationRepository.save(existing);
        } else {
            EventRegistration registration = EventRegistration.builder()
                    .user(user)
                    .event(event)
                    .status(EventRegistration.RegistrationStatus.REGISTERED)
                    .registeredAt(LocalDateTime.now())
                    .build();
            eventRegistrationRepository.save(registration);
        }

        int currentAttendees = event.getAttendeeCount() != null ? event.getAttendeeCount() : 0;
        event.setAttendeeCount(currentAttendees + 1);
        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        // Send email notification safely
        try {
            emailService.sendEventRegistrationEmail(user.getEmail(), user.getFullName(), event.getTitle());
        } catch (Exception e) {
            log.error("Failed to send registration email: {}", e.getMessage());
        }

        log.info("User {} registered for event {}", userId, eventId);
        return convertToDTO(saved);
    }

    // Fixed: Handles cases gracefully if registration record is missing/cancelled without throwing 400 errors
    public EventDTO unregisterFromEvent(String eventId, String userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        EventRegistration existing = eventRegistrationRepository
                .findByUser_IdAndEvent_Id(userId, eventId)
                .orElse(null);

        // If user was never registered or is already cancelled, safely return current event status
        if (existing == null || existing.getStatus() != EventRegistration.RegistrationStatus.REGISTERED) {
            log.warn("User {} was not actively registered for event {}", userId, eventId);
            return convertToDTO(event);
        }

        existing.setStatus(EventRegistration.RegistrationStatus.CANCELLED);
        eventRegistrationRepository.save(existing);

        if (event.getAttendeeCount() != null && event.getAttendeeCount() > 0) {
            event.setAttendeeCount(event.getAttendeeCount() - 1);
        }
        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            try {
                emailService.sendRegistrationCancellationEmail(user.getEmail(), user.getFullName(), event.getTitle());
            } catch (Exception e) {
                log.error("Failed to send cancellation email: {}", e.getMessage());
            }
        }
        log.info("User {} unregistered from event {}", userId, eventId);
        return convertToDTO(saved);
    }

    public boolean isUserRegistered(String eventId, String userId) {
        return eventRegistrationRepository.findByUser_IdAndEvent_Id(userId, eventId)
                .map(r -> r.getStatus() == EventRegistration.RegistrationStatus.REGISTERED)
                .orElse(false);
    }

    private EventDTO convertToDTO(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .category(event.getCategory())
                .capacity(event.getCapacity())
                .attendeeCount(event.getAttendeeCount() != null ? event.getAttendeeCount() : 0)
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .isActive(event.getIsActive())
                .createdAt(event.getCreatedAt())
                .speakers(event.getSpeakers())
                .build();
    }
}