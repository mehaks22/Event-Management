package com.project.eventmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "speakers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Speaker {
    @Id
    private String id;

    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String company;
    private String designation;
    private String profileImageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}