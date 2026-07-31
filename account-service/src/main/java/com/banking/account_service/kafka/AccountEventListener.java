package com.banking.account_service.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.banking.account_service.dto.TransactionEvent;
import com.banking.account_service.service.AccountService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountEventListener {

    private final AccountService accountService;

    @KafkaListener(topics = "transaction-events", groupId = "account-service-group")
    public void handleTransactionEvent(TransactionEvent event) {
        log.info("Received transaction event: {} for ref: {}", event.getEventType(), event.getReferenceId());
        try {
            if ("RESERVE_CREDIT".equalsIgnoreCase(event.getEventType())) {
                accountService.debit(event.getSenderAccountId(), event.getAmount());
            } else if ("COMPENSATE_CREDIT".equalsIgnoreCase(event.getEventType())) {
                accountService.refund(event.getSenderAccountId(), event.getAmount());
            } else if ("DEPOSIT_CREDIT".equalsIgnoreCase(event.getEventType())) {
                accountService.credit(event.getReceiverAccountId(), event.getAmount());
            }
        } catch (Exception e) {
            log.error("Failed to process event for ref {}: {}", event.getReferenceId(), e.getMessage());
        }
    }
}