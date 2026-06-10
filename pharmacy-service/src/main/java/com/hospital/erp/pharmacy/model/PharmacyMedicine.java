package com.hospital.erp.pharmacy.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * JPA Entity representing dynamic pharmacy medicine stock metadata in the central ERP database.
 */
@Entity
@Table(name = "pharmacy_medicines", indexes = {
    @Index(name = "idx_medicine_barcode", columnList = "barcode", unique = true),
    @Index(name = "idx_medicine_generic_name", columnList = "generic_name_en")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String barcode;

    @Column(name = "trade_name_en", nullable = false, length = 200)
    private String tradeNameEn;

    @Column(name = "trade_name_ar", length = 200)
    private String tradeNameAr;

    @Column(name = "generic_name_en", nullable = false, length = 200)
    private String genericNameEn;

    @Column(name = "generic_name_ar", length = 200)
    private String genericNameAr;

    @Column(nullable = false, length = 100)
    private String dosageStrength; // e.g., "500mg"

    @Column(nullable = false, length = 100)
    private String packageType; // e.g., "Box of 30 tabs"

    @Column(name = "batch_number", nullable = false, length = 100)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal unitPrice;

    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 50;

    @Column(name = "requires_prescription", nullable = false)
    private Boolean requiresPrescription = true;

    @Column(name = "therapy_class", length = 150)
    private String therapyClass; // e.g., "Antipyretic", "Antibiotic"

    @Column(name = "rack_location", length = 50)
    private String rackLocation; // e.g., "Shelf-A-Row-2"

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
        if (this.stockQty == null) this.stockQty = 0;
        if (this.requiresPrescription == null) this.requiresPrescription = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
