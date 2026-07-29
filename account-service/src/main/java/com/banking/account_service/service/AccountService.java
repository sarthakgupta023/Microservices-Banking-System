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

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    // ── CREATE ACCOUNT ────────────────────────────────────
    public AccountResponse createAccount(CreateAccountRequest request) {
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .userId(request.getUserId())
                .accountHolderName(request.getAccountHolderName())
                .email(request.getEmail())
                .accountType(request.getAccountType())
                .balance(BigDecimal.ZERO) // Initial balance 0
                .status(Account.AccountStatus.ACTIVE)
                .build();

        return AccountResponse.from(accountRepository.save(account));
    }

    // ── GET BY ID ─────────────────────────────────────────
    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found: " + id));
        return AccountResponse.from(account);
    }

    // ── GET BY ACCOUNT NUMBER ─────────────────────────────
    public AccountResponse getByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        return AccountResponse.from(account);
    }

    // ── GET ALL BY USER ID ────────────────────────────────
    public List<AccountResponse> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId)
                .stream()
                .map(AccountResponse::from)
                .collect(Collectors.toList());
    }

    // ── DEPOSIT ───────────────────────────────────────────
    @Transactional
    public AccountResponse deposit(TransactionRequest request) {
        Account account = accountRepository.findByAccountNumberForUpdate(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }

        account.setBalance(account.getBalance().add(request.getAmount()));
        return AccountResponse.from(accountRepository.save(account));
    }

    // ── WITHDRAW ──────────────────────────────────────────
    @Transactional
    public AccountResponse withdraw(TransactionRequest request) {
        Account account = accountRepository.findByAccountNumberForUpdate(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }

        // Balance check — insufficient funds
        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance. Current: "
                    + account.getBalance());
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        return AccountResponse.from(accountRepository.save(account));
    }

    // ── BALANCE CHECK ─────────────────────────────────────
    public BigDecimal getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return account.getBalance();
    }

    // ── GENERATE ACCOUNT NUMBER ───────────────────────────
    // Format: BNK + 10 random digits = "BNK1234567890"
    private String generateAccountNumber() {
        Long accountNumberseq = accountRepository.getNextAccountNumberSequence()
        String accountNumber = "BNK" + accountNumberseq;
        return accountNumber;
    }
}