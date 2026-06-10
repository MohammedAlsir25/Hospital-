package com.hospital.erp.pharmacy.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA Entity mapping retail Point-of-Sale checkouts in the Pharmacy system.
 */
@Entity
@Table(name = "pharmacy_pos_transactions", indexes = {
    @Index(name = "idx_pos_tx_date", columnList = "transaction_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 100)
    private String receiptNumber;

    @Column(name = "patient_id")
    private UUID patientId; // nullable if walk-in customer

    @Column(name = "licensed_pharmacist", nullable = false, length = 150)
    private String licensedPharmacist; // ID or name of practitioner checking out

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // CASH, CARD, INSURANCE_SPLIT

    @Column(name = "subtotal_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal subtotalAmount;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal taxAmount;

    @Column(name = "insurance_coverage_ratio", precision = 5, scale = 2)
    private BigDecimal insuranceCoverageRatio; // e.g. 0.85 (85% insurance coverage)

    @Column(name = "insurance_co_pay", precision = 12, scale = 3)
    private BigDecimal insuranceCoPay; // Amount covered by insurance company

    @Column(name = "patient_pay", nullable = false, precision = 12, scale = 3)
    private BigDecimal patientPay; // Amount out of pocket paid by client

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PosTransactionItem> items = new ArrayList<>();

    @Column(name = "transaction_time", nullable = false)
    private OffsetDateTime transactionTime;

    @PrePersist
    protected void onCreate() {
        this.transactionTime = OffsetDateTime.now();
    }

    public void addItem(PosTransactionItem item) {
        items.add(item);
        item.setTransaction(this);
    }
}
