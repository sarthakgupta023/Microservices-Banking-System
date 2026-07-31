package com.banking.notification_service.service;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    public void sendEmail(String recipient, String subject, String body) {
        log.info("========== EMAIL NOTIFICATION LOG ==========");
        log.info("TO     : {}", recipient);
        log.info("SUBJECT: {}", subject);
        log.info("BODY   : {}", body);
        log.info("============================================");
    }
}