package com.project.eventmanagement.dto;

import lombok.Data;

@Data
public class SpeakerRequest {
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String company;
    private String designation;
    private String profileImageUrl;
    private Boolean isActive = true;
}
