package com.banking.notification_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor

@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${notification.email.from}")
    private String fromEmail;

    @Value("${notification.email.enabled}")
    private boolean emailEnabled;

    public void sendEmail(String toEmail, String subject, String htmlBody) {
        if (!emailEnabled) {
            log.info("Email disabled. Would have sent to={}, subject={}", toEmail, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();

            // true = multipart (needed for HTML), true = UTF-8
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml

            mailSender.send(message);
            log.info("Email sent successfully to={}, subject={}", toEmail, subject);

        } catch (MessagingException e) {
            // Log but don't throw — a failed email should NOT crash the Kafka consumer
            // or cause Kafka to retry (which would just fail email again)
            log.error("Failed to send email to={}, subject={}, error={}",
                    toEmail, subject, e.getMessage());
        }
    }
}
