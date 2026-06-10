package com.hospital.erp.pharmacy.service;

import com.hospital.erp.pharmacy.dto.CheckoutRequest;
import com.hospital.erp.pharmacy.dto.LedgerPostDto;
import com.hospital.erp.pharmacy.model.PharmacyMedicine;
import com.hospital.erp.pharmacy.model.PosTransaction;
import com.hospital.erp.pharmacy.model.PosTransactionItem;
import com.hospital.erp.pharmacy.repository.PharmacyMedicineRepository;
import com.hospital.erp.pharmacy.repository.PosTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service orchestrating Rx inventory CRUD, low stock diagnostics, and real-time Point of Sale payments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyService {

    private final PharmacyMedicineRepository medicineRepository;
    private final PosTransactionRepository transactionRepository;

    /**
     * Complete POS checkout cycle.
     * Guards stock quantity, decreases stock, drafts invoice, and issues an automated double-entry ledger commit.
     */
    @Transactional
    public PosTransaction processCheckout(CheckoutRequest request) {
        log.info("Initiating Pharmacy POS Checkout processing with pharmacist: {}", request.getLicensedPharmacist());

        // 1. Generate unique sequence receipt number
        String receiptNumber = "PX-" + ThreadLocalRandom.current().nextInt(100000, 999999);

        // 2. Draft transactional shell
        PosTransaction transaction = PosTransaction.builder()
                .receiptNumber(receiptNumber)
                .patientId(request.getPatientId())
                .licensedPharmacist(request.getLicensedPharmacist())
                .paymentMethod(request.getPaymentMethod())
                .insuranceCoverageRatio(request.getInsuranceCoverageRatio() != null ? request.getInsuranceCoverageRatio() : BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        // 3. Cycle items, verify stock availability, deduct count, compile transaction list
        for (CheckoutRequest.BasketItem basketItem : request.getBasketItems()) {
            PharmacyMedicine medicine = medicineRepository.findById(basketItem.getMedicineId())
                    .orElseThrow(() -> new IllegalArgumentException("Target medication not found in dispensary with ID: " + basketItem.getMedicineId()));

            if (medicine.getStockQty() < basketItem.getQuantity()) {
                throw new IllegalStateException("Critical shortage! Requested quantity (" + basketItem.getQuantity() 
                        + ") exceeds available dispensary shelves limit (" + medicine.getStockQty() + ") for " + medicine.getTradeNameEn());
            }

            // Deduct stock safely
            medicine.setStockQty(medicine.getStockQty() - basketItem.getQuantity());
            medicineRepository.save(medicine);

            // Create POS record detail
            BigDecimal itemTotal = medicine.getUnitPrice().multiply(BigDecimal.valueOf(basketItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            PosTransactionItem txItem = PosTransactionItem.builder()
                    .medicineId(medicine.getId())
                    .tradeName(medicine.getTradeNameEn())
                    .quantity(basketItem.getQuantity())
                    .unitPrice(medicine.getUnitPrice())
                    .lineTotal(itemTotal)
                    .build();

            transaction.addItem(txItem);
        }

        // 4. Calculate finance splitting
        BigDecimal taxRate = new BigDecimal("0.16"); // 16% sales/services tax standard
        BigDecimal taxAmount = subtotal.multiply(taxRate).setScale(3, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount).setScale(3, RoundingMode.HALF_UP);

        BigDecimal patientPay;
        BigDecimal insuranceCoverage = BigDecimal.ZERO;

        if ("INSURANCE_SPLIT".equalsIgnoreCase(request.getPaymentMethod()) && transaction.getInsuranceCoverageRatio().compareTo(BigDecimal.ZERO) > 0) {
            insuranceCoverage = totalAmount.multiply(transaction.getInsuranceCoverageRatio()).setScale(3, RoundingMode.HALF_UP);
            patientPay = totalAmount.subtract(insuranceCoverage).setScale(3, RoundingMode.HALF_UP);
        } else {
            patientPay = totalAmount;
        }

        transaction.setSubtotalAmount(subtotal);
        transaction.setTaxAmount(taxAmount);
        transaction.setTotalAmount(totalAmount);
        transaction.setInsuranceCoPay(insuranceCoverage);
        transaction.setPatientPay(patientPay);

        // 5. Persist sale history locally
        PosTransaction savedTx = transactionRepository.save(transaction);
        log.info("Dispensary Sale persistent logging complete. Saved invoice receipt: {}", receiptNumber);

        // 6. Trigger automated real-time Double-Entry Ledger Synchronicity commit
        dispatchAutomatedLedgerJournal(savedTx);

        return savedTx;
    }

    /**
     * Dispatch journal credits / debits mapping directly to the master ERP bookkeeping matrix.
     */
    private void dispatchAutomatedLedgerJournal(PosTransaction transaction) {
        String targetWallet = "CASH".equalsIgnoreCase(transaction.getPaymentMethod()) ? "Pharmacy Safe Box A" : "Standard Chartered Bank Acct";
        
        LedgerPostDto journalEntry = LedgerPostDto.builder()
                .division("RETAIL_PHARMACY")
                .transactionType("REVENUE_SALES_CREDIT")
                .description("Dispensed medication sale receipt: [" + transaction.getReceiptNumber() + "]")
                .debitAmount(transaction.getTotalAmount())
                .creditAmount(BigDecimal.ZERO)
                .targetWalletOrAccount(targetWallet)
                .postingClerk(transaction.getLicensedPharmacist())
                .timestamp(OffsetDateTime.now())
                .build();

        // Simulate master module enterprise broker syncing (could use REST Template or Kafka Broker)
        log.warn("==========================================================================");
        log.warn("💎 MASTER ERP FINANCIAL JOURNAL AUTOMATIC SYNC ENGAGED:");
        log.warn("DEBIT: {} -> Central Account Category: Ledger {}", journalEntry.getDebitAmount(), journalEntry.getTargetWalletOrAccount());
        log.warn("CREDIT: {} -> Central Account Category: Drug sales revenue accounts", transaction.getTotalAmount());
        log.warn("VERIFIED BY CLERK PRESET ID: {}", journalEntry.getPostingClerk());
        log.warn("==========================================================================");
    }
}
