package com.project.eventmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private String userId;
    private String email;
    private String fullName;
    private String role;
    private Long expiresIn;
    private Boolean success;
    private String message;
}
