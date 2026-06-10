package com.hospital.erp.clinic.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object for Otorhinolaryngology (ENT) consultation submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntConsultationSubmissionDTO {

    private UUID visitId;
    private UUID patientId;
    private UUID consultationId;
    private EarExam earExam;
    private NasalExam nasalExam;
    private ThroatExam throatExam;
    private List<DiagnosisSelection> diagnoses;
    private List<ReferralSelection> referrals;
    private List<PrescriptionSelection> prescriptions;
    private Integer followUpIntervalDays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EarExam {
        private Boolean otoscopyRightNormal;
        private String otoscopyRightFindings;
        private Boolean otoscopyLeftNormal;
        private String otoscopyLeftFindings;
        private String tympanicMembrane;
        private String hearingTestType;
        private String airConductionRight;
        private String airConductionLeft;
        private String boneConductionRight;
        private String boneConductionLeft;
        private String tympanometryRight;
        private String tympanometryLeft;
        private String hearingImpairmentType;
        private String weberTest;
        private String rinneTestRight;
        private String rinneTestLeft;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NasalExam {
        private String nasalSeptum;
        private String turbinates;
        private String nasalMucosa;
        private String sinusTenderness;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThroatExam {
        private String oropharynxExam;
        private String larynxExam;
        private String voiceAssessment;
        private String fistulaTest;
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
