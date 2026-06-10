package com.hospital.erp.clinic.controller;

import com.hospital.erp.clinic.dto.GeneralMedicineSubmissionDTO;
import com.hospital.erp.clinic.model.ClinicMedicine;
import com.hospital.erp.clinic.repository.ClinicMedicineRepository;
import com.hospital.erp.clinic.service.GeneralMedicineConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller exposing General Medicine workstation submit & record endpoints.
 */
@RestController
@RequestMapping("/api/clinics/medicine/consultations")
@RequiredArgsConstructor
public class GeneralMedicineConsultationController {

    private final GeneralMedicineConsultationService consultationService;
    private final ClinicMedicineRepository clinicMedicineRepository;

    /**
     * Submit General Medicine clinical examination logs, referrals, and prescriptions.
     */
    @PostMapping
    public ResponseEntity<?> submitConsultation(@RequestBody GeneralMedicineSubmissionDTO requestDto) {
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
     * Retrieve complete consultation dossier including vitals, ROS, exam logs, and routing references.
     */
    @GetMapping("/{consultationId}")
    public ResponseEntity<?> getConsultationById(@PathVariable UUID consultationId) {
        return clinicMedicineRepository.findById(consultationId)
                .map(exam -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("consultationId", exam.getConsultationId());
                    response.put("patientId", exam.getPatientId());
                    response.put("visitId", exam.getVisitId());
                    response.put("createdAt", exam.getCreatedAt());
                    response.put("followUpIntervalDays", exam.getFollowUpIntervalDays());

                    // Map Vitals
                    Map<String, Object> vitals = new HashMap<>();
                    vitals.put("systolicBp", exam.getSystolicBp());
                    vitals.put("diastolicBp", exam.getDiastolicBp());
                    vitals.put("heartRate", exam.getHeartRate());
                    vitals.put("respiratoryRate", exam.getRespiratoryRate());
                    vitals.put("temperatureCelsius", exam.getTemperatureCelsius());
                    vitals.put("oxygenSaturation", exam.getOxygenSaturation());
                    vitals.put("bloodGlucoseFasting", exam.getBloodGlucoseFasting());
                    vitals.put("bloodGlucoseRandom", exam.getBloodGlucoseRandom());
                    response.put("vitals", vitals);

                    // Map ROS
                    Map<String, Object> ros = new HashMap<>();
                    ros.put("rosConstitutional", exam.getRosConstitutional());
                    ros.put("rosCardiovascular", exam.getRosCardiovascular());
                    ros.put("rosRespiratory", exam.getRosRespiratory());
                    ros.put("rosGastrointestinal", exam.getRosGastrointestinal());
                    ros.put("rosNeurological", exam.getRosNeurological());
                    response.put("reviewOfSystems", ros);

                    // Map PE
                    Map<String, Object> pe = new HashMap<>();
                    pe.put("peGeneral", exam.getPeGeneral());
                    pe.put("peCardiovascular", exam.getPeCardiovascular());
                    pe.put("peRespiratory", exam.getPeRespiratory());
                    pe.put("peAbdominal", exam.getPeAbdominal());
                    pe.put("peNeurological", exam.getPeNeurological());
                    response.put("physicalExamination", pe);

                    // Map serialized prescriptions and logs
                    response.put("prescribedMedications", exam.getPrescribedMedications());
                    response.put("orderedLabs", exam.getOrderedLabs());
                    response.put("orderedImaging", exam.getOrderedImaging());

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
