package com.banking.transaction_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banking.transaction_service.dto.TransactionRequest;
import com.banking.transaction_service.dto.TransactionResponse;
import com.banking.transaction_service.service.TransactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // POST /api/transactions/transfer — initiate a new transaction (Async Saga
    // Entry Point)
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> initiateTransaction(
            @Valid @RequestBody TransactionRequest request) {

        // Triggers the Saga: saves initial record with status 'PENDING' & emits first
        // Kafka event
        TransactionResponse response = transactionService.initiateTransaction(request);

        // 202 ACCEPTED signals to the caller that the request is received & processing
        // asynchronously
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    // GET /api/transactions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransaction(id));
    }

    // GET /api/transactions/reference/{referenceId}
    @GetMapping("/reference/{referenceId}")
    public ResponseEntity<TransactionResponse> getByReference(
            @PathVariable String referenceId) {
        return ResponseEntity.ok(transactionService.getTransactionByReference(referenceId));
    }

    // GET /api/transactions/account/{accountId} — transaction history
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getAccountTransactions(
            @PathVariable String accountId) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(accountId));
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "transaction-service",
                "port", "8083"));
    }
}