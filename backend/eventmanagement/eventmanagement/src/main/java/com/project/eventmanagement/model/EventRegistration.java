package com.project.eventmanagement.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "event_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {
    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Event event;

    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime attendedAt;

    public enum RegistrationStatus {
        REGISTERED, ATTENDED, CANCELLED
    }

    // Helper method to integrate smoothly with attendance toggles
    public Boolean getAttended() {
        return this.status == RegistrationStatus.ATTENDED;
    }

    public void setAttended(Boolean attended) {
        if (Boolean.TRUE.equals(attended)) {
            this.status = RegistrationStatus.ATTENDED;
            this.attendedAt = LocalDateTime.now();
        } else {
            this.status = RegistrationStatus.REGISTERED;
            this.attendedAt = null;
        }
    }
}