package com.project.eventmanagement.repository;

import com.project.eventmanagement.model.Speaker;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface SpeakerRepository extends MongoRepository<Speaker, String> {
    List<Speaker> findByIsActiveTrue();
}
