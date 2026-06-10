package com.hospital.erp.clinic.controller;

import com.hospital.erp.clinic.dto.EntConsultationSubmissionDTO;
import com.hospital.erp.clinic.model.ClinicEnt;
import com.hospital.erp.clinic.repository.ClinicEntRepository;
import com.hospital.erp.clinic.service.EntConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller exposing REST endpoints for the Otorhinolaryngology (ENT) clinician workstation.
 */
@RestController
@RequestMapping("/api/clinics/ent/consultations")
@RequiredArgsConstructor
public class EntConsultationController {

    private final EntConsultationService consultationService;
    private final ClinicEntRepository clinicEntRepository;

    /**
     * Submit an ENT consultation dossier (exams, coding diagnoses, cross-clinic referrals, prescriptions).
     */
    @PostMapping
    public ResponseEntity<?> submitConsultation(@RequestBody EntConsultationSubmissionDTO requestDto) {
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
     * Retrieve complete ENT consultation details by internal ID.
     */
    @GetMapping("/{consultationId}")
    public ResponseEntity<?> getConsultationById(@PathVariable UUID consultationId) {
        return clinicEntRepository.findById(consultationId)
                .map(exam -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("consultationId", exam.getConsultationId());
                    response.put("patientId", exam.getPatientId());
                    response.put("visitId", exam.getVisitId());
                    response.put("createdAt", exam.getCreatedAt());
                    response.put("followUpIntervalDays", exam.getFollowUpIntervalDays());

                    // Map Ear Exam parameters
                    Map<String, Object> earExam = new HashMap<>();
                    earExam.put("otoscopyRightNormal", exam.getOtoscopyRightNormal());
                    earExam.put("otoscopyRightFindings", exam.getOtoscopyRightFindings());
                    earExam.put("otoscopyLeftNormal", exam.getOtoscopyLeftNormal());
                    earExam.put("otoscopyLeftFindings", exam.getOtoscopyLeftFindings());
                    earExam.put("tympanicMembrane", exam.getTympanicMembrane());
                    earExam.put("hearingTestType", exam.getHearingTestType());
                    earExam.put("airConductionRight", exam.getAirConductionRight());
                    earExam.put("airConductionLeft", exam.getAirConductionLeft());
                    earExam.put("boneConductionRight", exam.getBoneConductionRight());
                    earExam.put("boneConductionLeft", exam.getBoneConductionLeft());
                    earExam.put("tympanometryRight", exam.getTympanometryRight());
                    earExam.put("tympanometryLeft", exam.getTympanometryLeft());
                    earExam.put("hearingImpairmentType", exam.getHearingImpairmentType());
                    earExam.put("weberTest", exam.getWeberTest());
                    earExam.put("rinneTestRight", exam.getRinneTestRight());
                    earExam.put("rinneTestLeft", exam.getRinneTestLeft());
                    response.put("earExam", earExam);

                    // Map Nasal Exam parameters
                    Map<String, Object> nasalExam = new HashMap<>();
                    nasalExam.put("nasalSeptum", exam.getNasalSeptum());
                    nasalExam.put("turbinates", exam.getTurbinates());
                    nasalExam.put("nasalMucosa", exam.getNasalMucosa());
                    nasalExam.put("sinusTenderness", exam.getSinusTenderness());
                    response.put("nasalExam", nasalExam);

                    // Map Throat Exam parameters
                    Map<String, Object> throatExam = new HashMap<>();
                    throatExam.put("oropharynxExam", exam.getOropharynxExam());
                    throatExam.put("larynxExam", exam.getLarynxExam());
                    throatExam.put("voiceAssessment", exam.getVoiceAssessment());
                    throatExam.put("fistulaTest", exam.getFistulaTest());
                    response.put("throatExam", throatExam);

                    // Map ancillary lists
                    response.put("prescribedMedications", exam.getPrescribedMedications());
                    response.put("orderedLabs", exam.getOrderedLabs());
                    response.put("orderedImaging", exam.getOrderedImaging());

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
