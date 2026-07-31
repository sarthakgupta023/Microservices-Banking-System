package com.banking.transaction_service.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.transaction_service.dto.TransactionEvent;
import com.banking.transaction_service.entity.Transaction;
import com.banking.transaction_service.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SagaOrchestrator {

    private final TransactionRepository transactionRepository;
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @KafkaListener(topics = "account-events", groupId = "transaction-service-group")
    @Transactional
    public void handleAccountEvents(TransactionEvent event) {
        log.info("Saga Orchestrator received event: {} for Ref: {}", event.getStatus(), event.getReferenceId());

        Transaction transaction = transactionRepository.findByReferenceId(event.getReferenceId())
                .orElseThrow(
                        () -> new RuntimeException("Transaction record not found for ref: " + event.getReferenceId()));

        switch (event.getStatus()) {
            case "DEBIT_SUCCESS" -> handleDebitSuccess(transaction, event);
            case "DEBIT_FAILED" -> handleDebitFailed(transaction, event);
            case "CREDIT_SUCCESS" -> handleCreditSuccess(transaction, event);
            case "CREDIT_FAILED" -> handleCreditFailed(transaction, event);
            case "REFUNDED" -> handleRefundComplete(transaction, event);
            default -> log.warn("Unhandled status received: {}", event.getStatus());
        }
    }

    private void handleDebitSuccess(Transaction transaction, TransactionEvent event) {
        transaction.setStatus("DEBITED");
        transactionRepository.save(transaction);

        // Step 2 Trigger: Request credit from target account
        event.setStatus("INITIATE_CREDIT");
        kafkaTemplate.send("transaction-events", event.getReferenceId(), event);
    }

    private void handleDebitFailed(Transaction transaction, TransactionEvent event) {
        transaction.setStatus("FAILED");
        transaction.setFailureReason(event.getFailureReason());
        transactionRepository.save(transaction);
    }

    private void handleCreditSuccess(Transaction transaction, TransactionEvent event) {
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        // Step 3 Trigger: Publish completed event for Notification Service
        event.setStatus("COMPLETED");
        kafkaTemplate.send("transaction-notifications", event.getReferenceId(), event);
    }

    private void handleCreditFailed(Transaction transaction, TransactionEvent event) {
        transaction.setStatus("COMPENSATING_REFUND");
        transaction.setFailureReason(event.getFailureReason());
        transactionRepository.save(transaction);

        // Compensation Trigger: Refund source account
        event.setStatus("INITIATE_REFUND");
        kafkaTemplate.send("transaction-events", event.getReferenceId(), event);
    }

    private void handleRefundComplete(Transaction transaction, TransactionEvent event) {
        transaction.setStatus("FAILED_AND_REFUNDED");
        transactionRepository.save(transaction);

        // Publish refund completed event for Notification Service
        event.setStatus("FAILED_AND_REFUNDED");
        kafkaTemplate.send("transaction-notifications", event.getReferenceId(), event);
    }
}