package com.hospital.erp.clinic.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object for Dental and Periodontal consultation submission.
 * Enforces structured multi-surface odontogram and pocket depth metric arrays.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DentalConsultationSubmissionDTO {

    private UUID visitId;
    private UUID patientId;
    private UUID consultationId;
    
    private List<OdontogramRecord> odontogramRecords;
    private PeriodontalExam periodontalExam;
    
    private List<DiagnosisSelection> diagnoses;
    private List<ReferralSelection> referrals;
    private List<PrescriptionSelection> prescriptions;
    private Integer followUpIntervalDays;

    private String xrayType;
    private String xrayFindings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OdontogramRecord {
        private Integer toothNumber;
        private List<String> surfaces; // e.g. ["OCCLUSAL", "DISTAL", "MESIAL", "BUCCAL", "LINGUAL"]
        private String condition; // CARIES, MISSING, FRACTURED, RETROFITTED, HEALTHY
        private String existingRestoration; // NONE, AMALGAM, COMPOSITE, CROWN, ROOT_CANAL, IMPLANT
        private String proposedTreatmentCode; // e.g., D2392
        private String status; // PLANNED, COMPLETED
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PeriodontalExam {
        private Boolean gingivitis;
        private Boolean periodontitis;
        private Integer pocketDepthMaxMm;
        private Boolean bleedingOnProbing;
        private String mobilityGrade; // NONE, CLASS_I, CLASS_II, CLASS_III
        private String oralLesions;
        private String mucosalExam;
        private String tongueExam;
        private String salivaryGlands;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiagnosisSelection {
        private String icd10Code;
        private String diagnosisType; // e.g., PRIMARY, SECONDARY
        private String clinicalStatus; // e.g., WORKING, CONFIRMED
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
