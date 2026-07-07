package com.banking.transaction_service.dto;

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
public class TransactionResponse {
    private Long id;
    private String referenceId;
    private String senderAccountId;
    private String receiverAccountId;
    private BigDecimal amount;
    private String currency;
    private String type;
    private String status;
    private String description;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}