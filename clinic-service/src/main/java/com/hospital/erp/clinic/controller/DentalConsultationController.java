package com.hospital.erp.clinic.controller;

import com.hospital.erp.clinic.dto.DentalConsultationSubmissionDTO;
import com.hospital.erp.clinic.model.ClinicDental;
import com.hospital.erp.clinic.repository.ClinicDentalRepository;
import com.hospital.erp.clinic.service.DentalConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller exposing Dental clinical workstation inputs, odontograms, periodontal grids,
 * and dispatching inter-clinic transfers or e-prescribing regimens.
 */
@RestController
@RequestMapping("/api/clinics/dental/consultations")
@RequiredArgsConstructor
public class DentalConsultationController {

    private final DentalConsultationService consultationService;
    private final ClinicDentalRepository clinicDentalRepository;

    /**
     * Submit Dental consultation records, diagnostic odontograms and periodontal matrices.
     */
    @PostMapping
    public ResponseEntity<?> submitConsultation(@RequestBody DentalConsultationSubmissionDTO requestDto) {
        try {
            Map<String, Object> result = consultationService.processConsultation(requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bad Request", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Retrieve a historic dental examination dossier.
     */
    @GetMapping("/{consultationId}")
    public ResponseEntity<?> getConsultationById(@PathVariable UUID consultationId) {
        return clinicDentalRepository.findById(consultationId)
                .map(exam -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("consultationId", exam.getConsultationId());
                    response.put("patientId", exam.getPatientId());
                    response.put("visitId", exam.getVisitId());
                    response.put("createdAt", exam.getCreatedAt());
                    response.put("followUpIntervalDays", exam.getFollowUpIntervalDays());

                    // Map Dental Exam Metrics
                    response.put("odontogram", exam.getOdontogram());
                    response.put("gingivitis", exam.getGingivitis());
                    response.put("periodontitis", exam.getPeriodontitis());
                    response.put("pocketDepthMaxMm", exam.getPocketDepthMaxMm());
                    response.put("bleedingOnProbing", exam.getBleedingOnProbing());
                    response.put("mobilityGrade", exam.getMobilityGrade());
                    response.put("oralLesions", exam.getOralLesions());
                    response.put("mucosalExam", exam.getMucosalExam());
                    response.put("tongueExam", exam.getTongueExam());
                    response.put("salivaryGlands", exam.getSalivaryGlands());
                    response.put("xrayType", exam.getXrayType());
                    response.put("xrayFindings", exam.getXrayFindings());
                    response.put("impactedTeeth", exam.getImpactedTeeth());
                    
                    response.put("diagnosis", exam.getDiagnosis());
                    response.put("treatmentPlan", exam.getTreatmentPlan());
                    response.put("procedureCode", exam.getProcedureCode());
                    response.put("procedureDescription", exam.getProcedureDescription());

                    response.put("prescribedMedications", exam.getPrescribedMedications());
                    response.put("orderedLabs", exam.getOrderedLabs());
                    response.put("orderedImaging", exam.getOrderedImaging());

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
