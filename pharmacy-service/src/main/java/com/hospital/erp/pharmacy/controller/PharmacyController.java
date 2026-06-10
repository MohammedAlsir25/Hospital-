package com.hospital.erp.pharmacy.controller;

import com.hospital.erp.pharmacy.dto.CheckoutRequest;
import com.hospital.erp.pharmacy.model.PharmacyMedicine;
import com.hospital.erp.pharmacy.model.PosTransaction;
import com.hospital.erp.pharmacy.repository.PharmacyMedicineRepository;
import com.hospital.erp.pharmacy.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Endpoint handling Dispensary Stock CRUD controls, low count alerts, and cash register POS checkout logs.
 */
@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyMedicineRepository medicineRepository;
    private final PharmacyService pharmacyService;

    /**
     * Fetch list of all inventory drugs on shelves.
     */
    @GetMapping("/stock")
    public ResponseEntity<List<PharmacyMedicine>> getDrugsStockList() {
        return ResponseEntity.ok(medicineRepository.findAll());
    }

    /**
     * Find single medication info by system UUID.
     */
    @GetMapping("/stock/{id}")
    public ResponseEntity<PharmacyMedicine> getDrugById(@PathVariable UUID id) {
        return medicineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Probe single item by scanning Barcode.
     */
    @GetMapping("/stock/barcode/{barcode}")
    public ResponseEntity<PharmacyMedicine> getDrugByBarcode(@PathVariable String barcode) {
        return medicineRepository.findByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Check alert triggers for low shelf availability (Stock count under user reorder thresholds).
     */
    @GetMapping("/stock/low-warnings")
    public ResponseEntity<List<PharmacyMedicine>> checkLowStockWarnings(@RequestParam(defaultValue = "50") Integer thresholdCount) {
        return ResponseEntity.ok(medicineRepository.findByStockQtyLessThan(thresholdCount));
    }

    /**
     * Add new batch of medications to inventory.
     */
    @PostMapping("/stock")
    public ResponseEntity<PharmacyMedicine> addDrugToStock(@RequestBody PharmacyMedicine drug) {
        try {
            PharmacyMedicine saved = medicineRepository.save(drug);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update medicine batch info or adjust remaining stock quantity.
     */
    @PutMapping("/stock/{id}")
    public ResponseEntity<PharmacyMedicine> updateDrugDetails(@PathVariable UUID id, @RequestBody PharmacyMedicine updatedDetails) {
        return medicineRepository.findById(id)
                .map(existing -> {
                    existing.setTradeNameEn(updatedDetails.getTradeNameEn());
                    existing.setTradeNameAr(updatedDetails.getTradeNameAr());
                    existing.setGenericNameEn(updatedDetails.getGenericNameEn());
                    existing.setGenericNameAr(updatedDetails.getGenericNameAr());
                    existing.setDosageStrength(updatedDetails.getDosageStrength());
                    existing.setPackageType(updatedDetails.getPackageType());
                    existing.setBatchNumber(updatedDetails.getBatchNumber());
                    existing.setExpiryDate(updatedDetails.getExpiryDate());
                    existing.setUnitPrice(updatedDetails.getUnitPrice());
                    existing.setStockQty(updatedDetails.getStockQty());
                    existing.setReorderLevel(updatedDetails.getReorderLevel());
                    existing.setRequiresPrescription(updatedDetails.getRequiresPrescription());
                    existing.setTherapyClass(updatedDetails.getTherapyClass());
                    existing.setRackLocation(updatedDetails.getRackLocation());
                    return ResponseEntity.ok(medicineRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Purge medication entries from active stock database.
     */
    @DeleteMapping("/stock/{id}")
    public ResponseEntity<?> deleteDrugFromDispensary(@PathVariable UUID id) {
        if (medicineRepository.existsById(id)) {
            medicineRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("status", "SUCCESS", "message", "Stock item deleted."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    /**
     * POS CHECKOUT: Place customer orders, calculate fees, adjust items stock, and book entries to general ledger accounts.
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutRxBasket(@RequestBody CheckoutRequest checkoutRequest) {
        try {
            PosTransaction completeTransaction = pharmacyService.processCheckout(checkoutRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(completeTransaction);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "POS transaction halt", "message", e.getMessage()));
        }
    }
}
