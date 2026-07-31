package com.banking.account_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private String eventType;
    private Long transactionId;
    private String referenceId;
    private String senderAccountId;
    private String receiverAccountId;
    private BigDecimal amount;
    private String currency;
    private String transactionType;
    private String status;
    private String description;
    private String failureReason;
    private LocalDateTime timestamp;
    private Long userId;
}