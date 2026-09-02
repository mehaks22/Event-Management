package com.project.eventmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {
    private String id;
    private String title;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventDate;

    private String location;
    private String category;
    private Integer capacity;
    private Integer attendeeCount;
    private String organizerId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<String> speakers;
}