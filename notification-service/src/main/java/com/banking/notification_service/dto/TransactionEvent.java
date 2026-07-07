package com.banking.notification_service.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class TransactionEvent {
    private String eventType;
    private String referenceId;
    private Long senderAccountId;
    private Long receiverAccountId;
    private String transactionType;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String failureReason;
    private String timestamp;
}