package com.hospital.erp.pharmacy.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Inbound Request DTO encapsulating drug selections and financial modes for retail terminal checkouts.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    private UUID patientId;
    
    @NonNull
    private String licensedPharmacist;
    
    @NonNull
    private String paymentMethod; // CASH, CARD, INSURANCE_SPLIT
    
    private BigDecimal insuranceCoverageRatio; // e.g. 0.80

    @NonNull
    private List<BasketItem> basketItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BasketItem {
        private UUID medicineId;
        private Integer quantity;
    }
}
