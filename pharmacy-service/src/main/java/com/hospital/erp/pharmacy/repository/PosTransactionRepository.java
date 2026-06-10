package com.hospital.erp.pharmacy.repository;

import com.hospital.erp.pharmacy.model.PosTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PosTransactionRepository extends JpaRepository<PosTransaction, UUID> {
    Optional<PosTransaction> findByReceiptNumber(String receiptNumber);
}
