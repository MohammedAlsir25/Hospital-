package com.hospital.erp.clinic.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object for General Medicine consultation submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneralMedicineSubmissionDTO {

    private UUID visitId;
    private UUID patientId;
    private UUID consultationId;
    private Vitals vitals;
    private ReviewOfSystems reviewOfSystems;
    private PhysicalExamination physicalExamination;
    private List<DiagnosisSelection> diagnoses;
    private List<ReferralSelection> referrals;
    private List<PrescriptionSelection> prescriptions;
    private Integer followUpIntervalDays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Vitals {
        private Integer systolicBp;
        private Integer diastolicBp;
        private Integer heartRate;
        private Integer respiratoryRate;
        private BigDecimal temperatureCelsius;
        private Integer oxygenSaturation;
        private BigDecimal bloodGlucoseFasting;
        private BigDecimal bloodGlucoseRandom;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewOfSystems {
        private Boolean rosConstitutional;
        private Boolean rosCardiovascular;
        private Boolean rosRespiratory;
        private Boolean rosGastrointestinal;
        private Boolean rosNeurological;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhysicalExamination {
        private String peGeneral;
        private String peCardiovascular;
        private String peRespiratory;
        private String peAbdominal;
        private String peNeurological;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiagnosisSelection {
        private String icd10Code;
        private String diagnosisType; // e.g., PRIMARY, SECONDARY
        private String clinicalStatus; // e.g., WORKING, CONFIRMED, RULED_OUT
        private String chronicity; // e.g., ACUTE, CHRONIC
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReferralSelection {
        private String targetClinicCode;
        private String urgency; // e.g., ROUTINE, URGENT, STAT
        private String reasonForReferral;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionSelection {
        private UUID drugFormularyId;
        private String dosage;
        private String frequency;
        private Integer durationDays;
        private String administrationRoute;
        private String specialInstructions;
    }
}
