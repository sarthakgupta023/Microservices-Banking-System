package com.banking.account_service.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.account_service.dto.AccountResponse;
import com.banking.account_service.dto.CreateAccountRequest;
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

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        String generatedAccountNumber = "ACC" + System.currentTimeMillis();

        // Safe Enum conversion from incoming String to Account.AccountType
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
    public void debit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumberWithLock(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance in account: " + accountNumber);
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
        log.info("Saga Debit: Subtracted {} from account {}", amount, accountNumber);
    }

    @Transactional
    public void credit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumberWithLock(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        log.info("Saga Credit: Added {} to account {}", amount, accountNumber);
    }

    @Transactional
    public void refund(String accountNumber, BigDecimal amount) {
        credit(accountNumber, amount);
        log.info("Saga Compensation: Refunded {} back to account {}", amount, accountNumber);
    }

    // --- REST CONTROLLER WRAPPERS ---

    @Transactional
    public AccountResponse deposit(TransactionRequest request) {
        credit(request.getAccountNumber(), request.getAmount());
        return getByAccountNumber(request.getAccountNumber());
    }

    @Transactional
    public AccountResponse withdraw(TransactionRequest request) {
        debit(request.getAccountNumber(), request.getAmount());
        return getByAccountNumber(request.getAccountNumber());
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