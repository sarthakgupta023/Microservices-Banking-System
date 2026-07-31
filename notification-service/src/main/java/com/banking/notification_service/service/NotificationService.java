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
    log.info("Processing transaction event for notification: {}", event.getReferenceId());

    String message = String.format("Transaction %s of %s %s: Status - %s",
        event.getTransactionType() != null ? event.getTransactionType() : "TRANSFER",
        event.getAmount() != null ? event.getAmount() : "0.00",
        event.getCurrency() != null ? event.getCurrency() : "USD",
        event.getStatus() != null ? event.getStatus() : "COMPLETED");

    Notification notification = Notification.builder()
        .userId(event.getUserId())
        .accountNumber(event.getReceiverAccountId() != null ? event.getReceiverAccountId() : event.getSenderAccountId())
        .referenceId(event.getReferenceId())
        .recipientEmail("user@example.com")
        .message(message)
        .notificationType("TRANSACTION_EVENT")
        .status("SENT")
        .isRead(false)
        .build();

    notificationRepository.save(notification);
    log.info("Notification persisted successfully for referenceId: {}", event.getReferenceId());
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