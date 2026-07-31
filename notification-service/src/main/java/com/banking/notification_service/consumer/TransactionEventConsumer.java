package com.banking.notification_service.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.banking.notification_service.dto.TransactionEvent;
import com.banking.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "transaction-notifications", groupId = "notification-service-group")
    public void consumeTransactionNotification(TransactionEvent event) {
        log.info("Received transaction notification event for Ref: {}", event.getReferenceId());
        notificationService.processTransactionEvent(event);
    }
}