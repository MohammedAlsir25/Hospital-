package com.hospital.erp.pharmacy.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * JPA Entity capturing itemized detail entries for medications checked out in POS transaction baskets.
 */
@Entity
@Table(name = "pharmacy_pos_transaction_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosTransactionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private PosTransaction transaction;

    @Column(name = "medicine_id", nullable = false)
    private UUID medicineId;

    @Column(name = "trade_name", nullable = false, length = 200)
    private String tradeName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 3)
    private BigDecimal lineTotal;
}
