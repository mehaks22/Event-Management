package com.project.eventmanagement.service;


import com.project.eventmanagement.dto.SpeakerRequest;
import com.project.eventmanagement.model.Speaker;
import com.project.eventmanagement.repository.SpeakerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpeakerService {

    private final SpeakerRepository speakerRepository;

    public List<Speaker> getAllActiveSpeakers() {
        return speakerRepository.findByIsActiveTrue();
    }

    public List<Speaker> getAllSpeakers() {
        return speakerRepository.findAll();
    }

    public Speaker getSpeakerById(String id) {
        return speakerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Speaker not found with id: " + id));
    }

    public Speaker createSpeaker(SpeakerRequest request) {
        Speaker speaker = Speaker.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                .company(request.getCompany())
                .designation(request.getDesignation())
                .profileImageUrl(request.getProfileImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return speakerRepository.save(speaker);
    }

    public Speaker updateSpeaker(String id, SpeakerRequest request) {
        Speaker existingSpeaker = getSpeakerById(id);

        existingSpeaker.setName(request.getName());
        existingSpeaker.setEmail(request.getEmail());
        existingSpeaker.setPhoneNumber(request.getPhoneNumber());
        existingSpeaker.setBio(request.getBio());
        existingSpeaker.setCompany(request.getCompany());
        existingSpeaker.setDesignation(request.getDesignation());
        existingSpeaker.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getIsActive() != null) {
            existingSpeaker.setIsActive(request.getIsActive());
        }
        existingSpeaker.setUpdatedAt(LocalDateTime.now());

        return speakerRepository.save(existingSpeaker);
    }

    public void deleteSpeaker(String id) {
        Speaker speaker = getSpeakerById(id);
        speaker.setIsActive(false); // Soft delete
        speaker.setUpdatedAt(LocalDateTime.now());
        speakerRepository.save(speaker);
    }
}
