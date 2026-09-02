package com.project.eventmanagement.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Value("${resend.api.key:YOUR_RESEND_API_KEY}")
    private String resendApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String RESEND_URL = "https://api.resend.com/emails";

    // Resend's default free testing domain (you can change this to your custom domain later)
    private final String SENDER_EMAIL = "Event Management <onboarding@resend.dev>";

    // Helper method to build standard headers
    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);
        return headers;
    }

    // Helper method to send email via HTTP POST
    private void executeSendEmail(String toEmail, String subject, String contentText) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("from", SENDER_EMAIL);
            body.put("to", new String[]{toEmail});
            body.put("subject", subject);
            body.put("text", contentText);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, getHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent successfully via HTTP API to: {}", toEmail);
            } else {
                log.warn("Resend API returned non-200 status for {}: {}", toEmail, response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error sending email via HTTP API to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendRegistrationEmail(String toEmail, String fullName, String role) {
        String subject;
        String text;

        if ("ADMIN".equalsIgnoreCase(role)) {
            subject = "Admin Account Created - Event Management System";
            text = "Dear " + fullName + ",\n\n" +
                    "Your Administrator account has been successfully created.\n" +
                    "You now have full privileges to create, update, and manage events across the system.\n\n" +
                    "Best regards,\nEvent Management Team";
        } else {
            subject = "Welcome to Event Management System!";
            text = "Dear " + fullName + ",\n\n" +
                    "Welcome to our Event Management System!\n" +
                    "Your user account has been successfully created.\n\n" +
                    "You can now browse events, register, and track your bookings.\n\n" +
                    "Best regards,\nEvent Management Team";
        }

        executeSendEmail(toEmail, subject, text);
    }

    @Async
    public void sendEventRegistrationEmail(String toEmail, String fullName, String eventTitle) {
        String subject = "Event Registration Confirmation - " + eventTitle;
        String text = "Dear " + fullName + ",\n\n" +
                "Thank you for registering for: " + eventTitle + "\n\n" +
                "Your registration is confirmed.\n" +
                "We will send you more details soon.\n\n" +
                "Best regards,\nEvent Management Team";

        executeSendEmail(toEmail, subject, text);
    }

    @Async
    public void sendEventReminderEmail(String toEmail, String fullName, String eventTitle, String eventDate) {
        String subject = "Event Reminder - " + eventTitle;
        String text = "Dear " + fullName + ",\n\n" +
                "Reminder: Your registered event is coming up!\n\n" +
                "Event: " + eventTitle + "\n" +
                "Date: " + eventDate + "\n\n" +
                "Don't forget to attend!\n\n" +
                "Best regards,\nEvent Management Team";

        executeSendEmail(toEmail, subject, text);
    }

    @Async
    public void sendCancellationEmail(String toEmail, String fullName, String eventTitle) {
        String subject = "Event Cancellation - " + eventTitle;
        String text = "Dear " + fullName + ",\n\n" +
                "We regret to inform you that the event has been cancelled:\n\n" +
                "Event: " + eventTitle + "\n\n" +
                "We apologize for any inconvenience caused.\n\n" +
                "Best regards,\nEvent Management Team";

        executeSendEmail(toEmail, subject, text);
    }

    @Async
    public void sendRegistrationCancellationEmail(String toEmail, String fullName, String eventTitle) {
        String subject = "Registration Cancelled - " + eventTitle;
        String text = "Dear " + fullName + ",\n\n" +
                "Your registration for the following event has been successfully cancelled:\n\n" +
                "Event: " + eventTitle + "\n\n" +
                "If you change your mind, you can re-register anytime before capacity fills up.\n\n" +
                "Best regards,\nEvent Management Team";

        executeSendEmail(toEmail, subject, text);
    }
}