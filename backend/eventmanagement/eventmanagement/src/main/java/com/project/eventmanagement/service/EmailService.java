package com.project.eventmanagement.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRegistrationEmail(String toEmail, String fullName, String role) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setFrom("noreply@eventmanagement.com");

            if ("ADMIN".equalsIgnoreCase(role)) {
                message.setSubject("Admin Account Created - Event Management System");
                message.setText("Dear " + fullName + ",\n\n" +
                        "Your Administrator account has been successfully created.\n" +
                        "You now have full privileges to create, update, and manage events across the system.\n\n" +
                        "Best regards,\n" +
                        "Event Management Team");
            } else {
                message.setSubject("Welcome to Event Management System!");
                message.setText("Dear " + fullName + ",\n\n" +
                        "Welcome to our Event Management System!\n" +
                        "Your user account has been successfully created.\n\n" +
                        "You can now browse events, register, and track your bookings.\n\n" +
                        "Best regards,\n" +
                        "Event Management Team");
            }

            mailSender.send(message);
            log.info("Registration email sent to: {} with role: {}", toEmail, role);
        } catch (Exception e) {
            log.error("Error sending registration email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEventRegistrationEmail(String toEmail, String fullName, String eventTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Event Registration Confirmation - " + eventTitle);
            message.setText("Dear " + fullName + ",\n\n" +
                    "Thank you for registering for: " + eventTitle + "\n\n" +
                    "Your registration is confirmed.\n" +
                    "We will send you more details soon.\n\n" +
                    "Best regards,\n" +
                    "Event Management Team");
            message.setFrom("noreply@eventmanagement.com");

            mailSender.send(message);
            log.info("Event registration email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending event registration email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEventReminderEmail(String toEmail, String fullName, String eventTitle, String eventDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Event Reminder - " + eventTitle);
            message.setText("Dear " + fullName + ",\n\n" +
                    "Reminder: Your registered event is coming up!\n\n" +
                    "Event: " + eventTitle + "\n" +
                    "Date: " + eventDate + "\n\n" +
                    "Don't forget to attend!\n\n" +
                    "Best regards,\n" +
                    "Event Management Team");
            message.setFrom("noreply@eventmanagement.com");

            mailSender.send(message);
            log.info("Event reminder email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending event reminder email to {}: {}", toEmail, e.getMessage());
        }
    }

    // Used when an ADMIN cancels the entire event
    public void sendCancellationEmail(String toEmail, String fullName, String eventTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Event Cancellation - " + eventTitle);
            message.setText("Dear " + fullName + ",\n\n" +
                    "We regret to inform you that the event has been cancelled:\n\n" +
                    "Event: " + eventTitle + "\n\n" +
                    "We apologize for any inconvenience caused.\n\n" +
                    "Best regards,\n" +
                    "Event Management Team");
            message.setFrom("noreply@eventmanagement.com");

            mailSender.send(message);
            log.info("Cancellation email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending cancellation email to {}: {}", toEmail, e.getMessage());
        }
    }

    // NEW: Used when a USER cancels their own registration
    public void sendRegistrationCancellationEmail(String toEmail, String fullName, String eventTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Registration Cancelled - " + eventTitle);
            message.setText("Dear " + fullName + ",\n\n" +
                    "Your registration for the following event has been successfully cancelled:\n\n" +
                    "Event: " + eventTitle + "\n\n" +
                    "If you change your mind, you can re-register anytime before capacity fills up.\n\n" +
                    "Best regards,\n" +
                    "Event Management Team");
            message.setFrom("noreply@eventmanagement.com");

            mailSender.send(message);
            log.info("Registration cancellation email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending registration cancellation email to {}: {}", toEmail, e.getMessage());
        }
    }
}