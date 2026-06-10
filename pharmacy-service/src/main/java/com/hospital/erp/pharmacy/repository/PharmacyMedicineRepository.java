package com.hospital.erp.pharmacy.repository;

import com.hospital.erp.pharmacy.model.PharmacyMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface PharmacyMedicineRepository extends JpaRepository<PharmacyMedicine, UUID> {
    Optional<PharmacyMedicine> findByBarcode(String barcode);
    List<PharmacyMedicine> findByStockQtyLessThan(Integer stockQty);
}
