package com.project.eventmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class AuthRequest {
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
}
