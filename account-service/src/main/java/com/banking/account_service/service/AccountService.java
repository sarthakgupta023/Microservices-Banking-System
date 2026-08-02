package com.banking.account_service.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.account_service.dto.AccountResponse;
import com.banking.account_service.dto.CreateAccountRequest;
import com.banking.account_service.dto.TransactionEvent;
import com.banking.account_service.dto.TransactionRequest;
import com.banking.account_service.entity.Account;
import com.banking.account_service.repository.AccountRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        String generatedAccountNumber = "ACC" + System.currentTimeMillis();

        Account.AccountType type = Account.AccountType.SAVINGS;
        if (request.getAccountType() != null) {
            try {
                type = Account.AccountType.valueOf(request.getAccountType().toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid account type '{}', defaulting to SAVINGS", request.getAccountType());
                type = Account.AccountType.SAVINGS;
            }
        }

        Account account = Account.builder()
                .userId(request.getUserId())
                .accountNumber(generatedAccountNumber)
                .accountType(type)
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .status(Account.AccountStatus.ACTIVE)
                .build();

        Account savedAccount = accountRepository.save(account);
        log.info("Created account: {} for userId: {}", savedAccount.getAccountNumber(), savedAccount.getUserId());
        return mapToResponse(savedAccount);
    }

    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with ID: " + id));
        return mapToResponse(account);
    }

    public AccountResponse getByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        return mapToResponse(account);
    }

    public List<AccountResponse> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- SAGA EVENT CONSUMER METHODS ---

    @Transactional
    public Account debit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumberWithLock(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance in account: " + accountNumber);
        }

        account.setBalance(account.getBalance().subtract(amount));
        Account saved = accountRepository.save(account);
        log.info("Saga Debit: Subtracted {} from account {}", amount, accountNumber);
        return saved;
    }

    @Transactional
    public Account credit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumberWithLock(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));

        account.setBalance(account.getBalance().add(amount));
        Account saved = accountRepository.save(account);
        log.info("Saga Credit: Added {} to account {}", amount, accountNumber);
        return saved;
    }

    @Transactional
    public Account refund(String accountNumber, BigDecimal amount) {
        Account saved = credit(accountNumber, amount);
        log.info("Saga Compensation: Refunded {} back to account {}", amount, accountNumber);
        return saved;
    }

    // --- REST CONTROLLER WRAPPERS ---

    @Transactional
    public AccountResponse deposit(TransactionRequest request) {
        Account account = credit(request.getAccountNumber(), request.getAmount());

        // Send Notification Event
        TransactionEvent event = TransactionEvent.builder()
                .eventType("DEPOSIT")
                .referenceId("DEP-" + UUID.randomUUID().toString().substring(0, 8))
                .senderAccountId(request.getAccountNumber())
                .receiverAccountId(request.getAccountNumber())
                .amount(request.getAmount())
                .currency("INR")
                .transactionType("DEPOSIT")
                .status("COMPLETED")
                .description("Account Deposit")
                .timestamp(LocalDateTime.now())
                .userId(account.getUserId())
                .build();
        try {
            kafkaTemplate.send("transaction-notifications", event.getReferenceId(), event);
        } catch (Exception e) {
            log.error("Failed to send deposit notification: {}", e.getMessage());
        }

        return mapToResponse(account);
    }

    @Transactional
    public AccountResponse withdraw(TransactionRequest request) {
        Account account = debit(request.getAccountNumber(), request.getAmount());

        // Send Notification Event
        TransactionEvent event = TransactionEvent.builder()
                .eventType("WITHDRAWAL")
                .referenceId("WTH-" + UUID.randomUUID().toString().substring(0, 8))
                .senderAccountId(request.getAccountNumber())
                .receiverAccountId(request.getAccountNumber())
                .amount(request.getAmount())
                .currency("INR")
                .transactionType("WITHDRAWAL")
                .status("COMPLETED")
                .description("Account Withdrawal")
                .timestamp(LocalDateTime.now())
                .userId(account.getUserId())
                .build();
        try {
            kafkaTemplate.send("transaction-notifications", event.getReferenceId(), event);
        } catch (Exception e) {
            log.error("Failed to send withdrawal notification: {}", e.getMessage());
        }

        return mapToResponse(account);
    }

    public BigDecimal getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        return account.getBalance();
    }

    private AccountResponse mapToResponse(Account account) {
        String typeStr = account.getAccountType() != null ? account.getAccountType().name() : "SAVINGS";
        String statusStr = account.getStatus() != null ? account.getStatus().name() : "ACTIVE";

        return AccountResponse.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .accountNumber(account.getAccountNumber())
                .accountType(typeStr)
                .balance(account.getBalance())
                .status(statusStr)
                .createdAt(account.getCreatedAt())
                .build();
    }
}