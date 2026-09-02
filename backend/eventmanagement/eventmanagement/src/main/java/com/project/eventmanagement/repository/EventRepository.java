package com.project.eventmanagement.repository;

import com.project.eventmanagement.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByCategory(String category);
    List<Event> findByEventDateBetween(LocalDateTime start, LocalDateTime end);
    List<Event> findByOrganizerId(String organizerId);
    List<Event> findByTitleContainingIgnoreCase(String title);
    List<Event> findByIsActiveTrue();
}