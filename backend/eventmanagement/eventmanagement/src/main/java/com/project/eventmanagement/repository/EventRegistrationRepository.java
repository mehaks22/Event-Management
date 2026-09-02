package com.project.eventmanagement.repository;

import com.project.eventmanagement.model.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {

    // Matches the @DBRef fields: user.id and event.id
    Optional<EventRegistration> findByUser_IdAndEvent_Id(String userId, String eventId);

    List<EventRegistration> findByUser_Id(String userId);

    // ADD THIS LINE: Automatically filters user registrations by their status (e.g., REGISTERED)
    List<EventRegistration> findByUser_IdAndStatus(String userId, EventRegistration.RegistrationStatus status);

    List<EventRegistration> findByEvent_Id(String eventId);
    boolean existsByEvent_IdAndUser_Id(String eventId, String userId);
    void deleteByEvent_Id(String eventId);
}