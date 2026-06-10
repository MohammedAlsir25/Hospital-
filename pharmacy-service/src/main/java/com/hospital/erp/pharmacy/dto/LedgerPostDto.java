package com.hospital.erp.pharmacy.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Outbound Ledger Post DTO dispatched to centralized accounting engine to record sales credits & assets.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerPostDto {

    private String division; // e.g., "Pharmacy Point of Sale"
    private String transactionType; // e.g., "CREDIT_INVOICE"
    private String description; // e.g., "Rx checkout sale - Receipt #PX-10492"
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private String targetWalletOrAccount; // e.g., "Cash Register 01", "Standard Chartered Bank"
    private String postingClerk; // Pharmacist or Cashier
    private OffsetDateTime timestamp;
}
