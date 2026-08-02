package com.banking.account_service.kafka;

import java.time.LocalDateTime;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.banking.account_service.dto.TransactionEvent;
import com.banking.account_service.entity.Account;
import com.banking.account_service.service.AccountService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountEventListener {

    private final AccountService accountService;
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @KafkaListener(topics = "transaction-events", groupId = "account-service-group")
    public void handleTransactionEvent(TransactionEvent event) {
        log.info("Received transaction event: status={} for ref: {}", event.getStatus(), event.getReferenceId());
        try {
            switch (event.getStatus()) {
                case "INITIATE_DEBIT" -> {
                    Account senderAcc = accountService.debit(event.getSenderAccountId(), event.getAmount());
                    log.info("Saga: Debit successful for ref {}", event.getReferenceId());
                    
                    event.setUserId(senderAcc.getUserId());
                    event.setStatus("DEBIT_SUCCESS");
                    event.setTimestamp(LocalDateTime.now());
                    kafkaTemplate.send("account-events", event.getReferenceId(), event);

                    // Send notification to Sender User
                    TransactionEvent senderNotif = TransactionEvent.builder()
                            .eventType("DEBIT")
                            .referenceId(event.getReferenceId())
                            .senderAccountId(event.getSenderAccountId())
                            .receiverAccountId(event.getReceiverAccountId())
                            .amount(event.getAmount())
                            .currency(event.getCurrency() != null ? event.getCurrency() : "INR")
                            .transactionType("TRANSFER_DEBIT")
                            .status("COMPLETED")
                            .description(event.getDescription() != null ? event.getDescription() : "Transfer sent")
                            .timestamp(LocalDateTime.now())
                            .userId(senderAcc.getUserId())
                            .build();
                    kafkaTemplate.send("transaction-notifications", event.getReferenceId(), senderNotif);
                }
                case "INITIATE_CREDIT" -> {
                    Account receiverAcc = accountService.credit(event.getReceiverAccountId(), event.getAmount());
                    log.info("Saga: Credit successful for ref {}", event.getReferenceId());
                    
                    event.setUserId(receiverAcc.getUserId());
                    event.setStatus("CREDIT_SUCCESS");
                    event.setTimestamp(LocalDateTime.now());
                    kafkaTemplate.send("account-events", event.getReferenceId(), event);

                    // Send notification to Receiver User
                    TransactionEvent receiverNotif = TransactionEvent.builder()
                            .eventType("CREDIT")
                            .referenceId(event.getReferenceId())
                            .senderAccountId(event.getSenderAccountId())
                            .receiverAccountId(event.getReceiverAccountId())
                            .amount(event.getAmount())
                            .currency(event.getCurrency() != null ? event.getCurrency() : "INR")
                            .transactionType("TRANSFER_CREDIT")
                            .status("COMPLETED")
                            .description(event.getDescription() != null ? event.getDescription() : "Transfer received")
                            .timestamp(LocalDateTime.now())
                            .userId(receiverAcc.getUserId())
                            .build();
                    kafkaTemplate.send("transaction-notifications", event.getReferenceId(), receiverNotif);
                }
                case "INITIATE_REFUND" -> {
                    Account refundAcc = accountService.refund(event.getSenderAccountId(), event.getAmount());
                    log.info("Saga: Refund successful for ref {}", event.getReferenceId());
                    
                    event.setUserId(refundAcc.getUserId());
                    event.setStatus("REFUNDED");
                    event.setTimestamp(LocalDateTime.now());
                    kafkaTemplate.send("account-events", event.getReferenceId(), event);
                }
                default -> log.warn("Unhandled transaction event status: {}", event.getStatus());
            }
        } catch (Exception e) {
            log.error("Failed to process event for ref {}: {}", event.getReferenceId(), e.getMessage());
            String failedStatus = "INITIATE_DEBIT".equals(event.getStatus()) ? "DEBIT_FAILED" : "CREDIT_FAILED";
            event.setStatus(failedStatus);
            event.setFailureReason(e.getMessage());
            event.setTimestamp(LocalDateTime.now());
            kafkaTemplate.send("account-events", event.getReferenceId(), event);
        }
    }
}