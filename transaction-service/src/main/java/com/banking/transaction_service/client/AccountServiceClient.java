package com.banking.transaction_service.client;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AccountServiceClient {

    private final WebClient webClient;

    public AccountServiceClient(
            @Value("${services.account-service.url}") String accountServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(accountServiceUrl)
                .build();
    }

    // 💸 DEBIT: /api/accounts/internal/withdraw ko PUT request marega
    public boolean debit(String accountId, BigDecimal amount, String referenceId) {
        try {
            webClient.put() // 🚀 Aligned to PUT
                    .uri("/api/accounts/internal/withdraw") // 🚀 Aligned to your internal controller path
                    .bodyValue(Map.of(
                            "accountNumber", accountId, // "BNK3126438102"
                            "amount", amount,
                            "referenceId", referenceId))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Debit successful: accountId={}, amount={}", accountId, amount);
            return true;
        } catch (WebClientResponseException e) {
            log.error("Debit failed: accountId={}, status={}, body={}", accountId, e.getStatusCode(),
                    e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Debit error: accountId={}, error={}", accountId, e.getMessage());
            return false;
        }
    }

    // 💰 CREDIT: /api/accounts/internal/deposit ko PUT request marega
    public boolean credit(String accountId, BigDecimal amount, String referenceId) {
        try {
            webClient.put() // 🚀 Aligned to PUT
                    .uri("/api/accounts/internal/deposit") // 🚀 Aligned to your internal controller path
                    .bodyValue(Map.of(
                            "accountNumber", accountId, // "BNK3126438102"
                            "amount", amount,
                            "referenceId", referenceId))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Credit successful: accountId={}, amount={}", accountId, amount);
            return true;
        } catch (WebClientResponseException e) {
            log.error("Credit failed: accountId={}, status={}, body={}", accountId, e.getStatusCode(),
                    e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Credit error: accountId={}, error={}", accountId, e.getMessage());
            return false;
        }
    }

    // 🔄 REFUND (SAGA Compensation)
    public boolean refund(String accountId, BigDecimal amount, String referenceId) {
        log.warn("SAGA COMPENSATION: Refunding accountId={}, amount={}", accountId, amount);
        return credit(accountId, amount, "REFUND-" + referenceId);
    }
}