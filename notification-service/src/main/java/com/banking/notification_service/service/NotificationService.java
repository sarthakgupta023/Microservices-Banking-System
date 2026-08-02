package com.banking.notification_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.banking.notification_service.dto.TransactionEvent;
import com.banking.notification_service.entity.Notification;
import com.banking.notification_service.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void processTransactionEvent(TransactionEvent event) {
        log.info("Processing transaction event for notification: ref={}, userId={}", event.getReferenceId(), event.getUserId());

        if (event.getUserId() == null) {
            log.warn("Skipping notification because userId is null for ref: {}", event.getReferenceId());
            return;
        }

        String typeStr = event.getTransactionType() != null ? event.getTransactionType() : "TRANSACTION";
        String amtStr = event.getAmount() != null ? event.getAmount().toString() : "0.00";
        String currStr = event.getCurrency() != null ? event.getCurrency() : "INR";

        String message;
        if ("TRANSFER_DEBIT".equalsIgnoreCase(typeStr)) {
            message = String.format("Debited ₹%s from account %s to %s.", amtStr, event.getSenderAccountId(), event.getReceiverAccountId());
        } else if ("TRANSFER_CREDIT".equalsIgnoreCase(typeStr)) {
            message = String.format("Credited ₹%s to account %s from %s.", amtStr, event.getReceiverAccountId(), event.getSenderAccountId());
        } else if ("DEPOSIT".equalsIgnoreCase(typeStr)) {
            message = String.format("Deposited ₹%s into account %s successfully.", amtStr, event.getSenderAccountId());
        } else if ("WITHDRAWAL".equalsIgnoreCase(typeStr)) {
            message = String.format("Withdrew ₹%s from account %s successfully.", amtStr, event.getSenderAccountId());
        } else {
            message = String.format("Transaction %s of ₹%s (%s) status: %s", typeStr, amtStr, currStr, event.getStatus());
        }

        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .accountNumber(event.getReceiverAccountId() != null ? event.getReceiverAccountId() : event.getSenderAccountId())
                .referenceId(event.getReferenceId())
                .recipientEmail("user@example.com")
                .message(message)
                .notificationType("TRANSACTION_EVENT")
                .status("COMPLETED")
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification persisted successfully for referenceId: {}, userId: {}", event.getReferenceId(), event.getUserId());
    }

    public Notification createNotification(Notification notification) {
        if (notification.getStatus() == null) {
            notification.setStatus("SENT");
        }
        log.info("Saving notification for user: {}", notification.getUserId());
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}