package com.hospital.erp.clinic.controller;

import com.hospital.erp.clinic.dto.RetinaConsultationSubmissionDTO;
import com.hospital.erp.clinic.model.ClinicRetina;
import com.hospital.erp.clinic.repository.ClinicRetinaRepository;
import com.hospital.erp.clinic.service.RetinaConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller exposing Macula and Retina Pathology clinical workstation inputs,
 * high-precision multimodal OCT values, serial intravitreal injections, retinal lasers,
 * and dispatching inter-clinic transfers or specialized electronic prescriptions.
 */
@RestController
@RequestMapping("/api/clinics/retina/consultations")
@RequiredArgsConstructor
public class RetinaConsultationController {

    private final RetinaConsultationService consultationService;
    private final ClinicRetinaRepository clinicRetinaRepository;

    /**
     * Submit Retina consultation records, dilation trackers, unilateral/bilateral OCTs,
     * immediate injections or lasers, and staging parameters.
     */
    @PostMapping
    public ResponseEntity<?> submitConsultation(@RequestBody RetinaConsultationSubmissionDTO requestDto) {
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
     * Retrieve a detailed, historic retina-workstation diagnostic examination dossier.
     */
    @GetMapping("/{consultationId}")
    public ResponseEntity<?> getConsultationById(@PathVariable UUID consultationId) {
        return clinicRetinaRepository.findById(consultationId)
                .map(exam -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("consultationId", exam.getConsultationId());
                    response.put("patientId", exam.getPatientId());
                    response.put("visitId", exam.getVisitId());
                    response.put("createdAt", exam.getCreatedAt());
                    response.put("followUpIntervalDays", exam.getFollowUpIntervalDays());

                    // Map dilation parameters
                    response.put("dilationAchieved", exam.getDilationAchieved());
                    response.put("dilationAgent", exam.getDilationAgent());
                    response.put("dilationTime", exam.getDilationTime());
                    response.put("fundusViewQuality", exam.getFundusViewQuality());

                    // Map bilateral fundus details
                    response.put("vitreous", exam.getVitreous());
                    response.put("opticDiscRight", exam.getOpticDiscRight());
                    response.put("opticDiscLeft", exam.getOpticDiscLeft());
                    response.put("maculaRight", exam.getMaculaRight());
                    response.put("maculaLeft", exam.getMaculaLeft());
                    response.put("retinaVesselsRight", exam.getRetinaVesselsRight());
                    response.put("retinaVesselsLeft", exam.getRetinaVesselsLeft());
                    response.put("peripheryRight", exam.getPeripheryRight());
                    response.put("peripheryLeft", exam.getPeripheryLeft());

                    // Map multimodal imaging fields
                    response.put("octPerformed", exam.getOctPerformed());
                    response.put("octRightCstMicrons", exam.getOctRightCstMicrons());
                    response.put("octLeftCstMicrons", exam.getOctLeftCstMicrons());
                    response.put("octRightFindings", exam.getOctRightFindings());
                    response.put("octLeftFindings", exam.getOctLeftFindings());
                    response.put("octImageUrls", exam.getOctImageUrls());
                    response.put("fundusPhotos", exam.getFundusPhotos());
                    response.put("angiographyPerformed", exam.getAngiographyPerformed());
                    response.put("angiographyFindings", exam.getAngiographyFindings());
                    response.put("angiographyImageUrls", exam.getAngiographyImageUrls());

                    // Map in-office operations
                    response.put("intravitrealInjection", exam.getIntravitrealInjection());
                    response.put("injectionAgent", exam.getInjectionAgent());
                    response.put("laserPerformed", exam.getLaserPerformed());
                    response.put("laserType", exam.getLaserType());

                    // Staging and diagnosis
                    response.put("retinopathyType", exam.getRetinopathyType());
                    response.put("macularPathology", exam.getMacularPathology());
                    response.put("diabeticRetinopathyStage", exam.getDiabeticRetinopathyStage());
                    response.put("amdType", exam.getAmdType());
                    response.put("diagnosis", exam.getDiagnosis());

                    // Recommendation and Prescription
                    response.put("surgeryRecommended", exam.getSurgeryRecommended());
                    response.put("surgeryType", exam.getSurgeryType());
                    response.put("prescribedMedications", exam.getPrescribedMedications());
                    response.put("orderedLabs", exam.getOrderedLabs());
                    response.put("orderedImaging", exam.getOrderedImaging());

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
