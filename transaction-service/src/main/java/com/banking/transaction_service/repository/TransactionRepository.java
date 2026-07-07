package com.banking.transaction_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banking.transaction_service.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find by referenceId (UUID) — for idempotency checks
    Optional<Transaction> findByReferenceId(String referenceId);

    // All transactions for a given account (sent or received)
    List<Transaction> findBySenderAccountIdOrderByCreatedAtDesc(String senderAccountId);

    List<Transaction> findByReceiverAccountIdOrderByCreatedAtDesc(String receiverAccountId);

    // All transactions involving an account (either side)
    List<Transaction> findBySenderAccountIdOrReceiverAccountIdOrderByCreatedAtDesc(
            String senderAccountId, String receiverAccountId);
}