package com.banking.account_service.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banking.account_service.dto.AccountResponse;
import com.banking.account_service.dto.CreateAccountRequest;
import com.banking.account_service.dto.TransactionRequest;
import com.banking.account_service.service.AccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    // POST /api/accounts — naya account banao
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(accountService.createAccount(request));
    }

    // GET /api/accounts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    // GET /api/accounts/number/{accountNumber}
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getByNumber(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getByAccountNumber(accountNumber));
    }

    // GET /api/accounts/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountResponse>> getByUserId(
            @PathVariable Long userId) {
        List<AccountResponse> accounts = accountService.getAccountsByUserId(userId);
        System.out.println(accounts.size());
        return ResponseEntity.ok(accounts);
    }

    // PUT /api/accounts/deposit
    @PutMapping("/deposit")
    public ResponseEntity<AccountResponse> deposit(
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.deposit(request));
    }

    // PUT /api/accounts/withdraw
    @PutMapping("/withdraw")
    public ResponseEntity<AccountResponse> withdraw(
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.withdraw(request));
    }

    // GET /api/accounts/balance/{accountNumber}
    @GetMapping("/balance/{accountNumber}")
    public ResponseEntity<Map<String, Object>> getBalance(
            @PathVariable String accountNumber) {
        BigDecimal balance = accountService.getBalance(accountNumber);
        return ResponseEntity.ok(Map.of(
                "accountNumber", accountNumber,
                "balance", balance));
    }

    // Transaction service internal use — JWT nahi chahiye
    @GetMapping("/internal/{accountNumber}")
    public ResponseEntity<AccountResponse> getInternal(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getByAccountNumber(accountNumber));
    }

    @PutMapping("/internal/deposit")
    public ResponseEntity<AccountResponse> internalDeposit(
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.deposit(request));
    }

    @PutMapping("/internal/withdraw")
    public ResponseEntity<AccountResponse> internalWithdraw(
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.withdraw(request));
    }
}