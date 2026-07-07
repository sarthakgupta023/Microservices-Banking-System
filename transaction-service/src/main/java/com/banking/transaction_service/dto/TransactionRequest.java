package com.banking.transaction_service.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionRequest {

    @NotNull(message = "Sender account ID is required")
    private String senderAccountId;

    private String receiverAccountId;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Digits(integer = 15, fraction = 4)
    private BigDecimal amount;

    @NotBlank
    private String currency;

    @NotNull
    private String type;

    private String description;
}