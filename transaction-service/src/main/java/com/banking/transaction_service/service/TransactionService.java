package com.banking.transaction_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.transaction_service.dto.TransactionEvent;
import com.banking.transaction_service.dto.TransactionRequest;
import com.banking.transaction_service.dto.TransactionResponse;
import com.banking.transaction_service.entity.Transaction;
import com.banking.transaction_service.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Transactional
    public TransactionResponse initiateTransaction(TransactionRequest request) {
        String referenceId = "REF-" + UUID.randomUUID().toString().substring(0, 8);

        Transaction transaction = Transaction.builder()
                .referenceId(referenceId)
                .senderAccountId(request.getSenderAccountId())
                .receiverAccountId(request.getReceiverAccountId())
                .amount(request.getAmount())
                .status("PENDING")
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        TransactionEvent event = TransactionEvent.builder()
                .eventType("TRANSACTION_INITIATED")
                .transactionId(savedTransaction.getId())
                .referenceId(referenceId)
                .senderAccountId(request.getSenderAccountId())
                .receiverAccountId(request.getReceiverAccountId())
                .amount(request.getAmount())
                .status("INITIATE_DEBIT")
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send("transaction-events", referenceId, event);
        log.info("Saga Initiated: Ref {}", referenceId);

        return mapToResponse(savedTransaction);
    }

    public TransactionResponse getTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + id));
        return mapToResponse(transaction);
    }

    public TransactionResponse getTransactionByReference(String referenceId) {
        Transaction transaction = transactionRepository.findByReferenceId(referenceId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with Reference: " + referenceId));
        return mapToResponse(transaction);
    }

    public List<TransactionResponse> getAccountTransactions(String accountId) {
        return transactionRepository.findBySenderAccountIdOrReceiverAccountId(accountId, accountId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .referenceId(transaction.getReferenceId())
                .senderAccountId(transaction.getSenderAccountId())
                .receiverAccountId(transaction.getReceiverAccountId())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .failureReason(transaction.getFailureReason())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}