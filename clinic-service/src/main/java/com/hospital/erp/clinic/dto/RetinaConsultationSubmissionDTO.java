package com.hospital.erp.clinic.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object for Macula and Retina Pathology clinic consultation submission.
 * Enforces structured dilation trackers, bilateral fundus mappings, advanced high-precision OCT metrics,
 * in-office injection/laser logging, cross-clinic routing referral dispatches, and ophthalmic e-prescribing orders.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetinaConsultationSubmissionDTO {

    private UUID visitId;
    private UUID patientId;
    private UUID consultationId;

    private DilationTracker dilationTracker;
    private BilateralFundusExam bilateralFundusExam;
    private AdvancedImagingMetrics advancedImagingMetrics;
    private InOfficeProcedures inOfficeProcedures;

    private List<DiagnosisSelection> diagnoses;
    private List<ReferralSelection> referrals;
    private List<PrescriptionSelection> prescriptions;

    private Boolean surgeryRecommended;
    private String surgeryType;
    private Integer followUpIntervalDays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DilationTracker {
        private Boolean dilationAchieved;
        private String dilationAgent;
        private OffsetDateTime dilationTime;
        private String fundusViewQuality; // EXCELLENT, HAZY, POOR
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BilateralFundusExam {
        private String vitreous;
        private String opticDiscRight;
        private String opticDiscLeft;
        private String maculaRight;
        private String maculaLeft;
        private String retinaVesselsRight;
        private String retinaVesselsLeft;
        private String peripheryRight;
        private String peripheryLeft;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdvancedImagingMetrics {
        private Boolean octPerformed;
        private Integer octRightCstMicrons;
        private Integer octLeftCstMicrons;
        private String octRightFindings;
        private String octLeftFindings;
        private List<String> octImageUrls;
        private List<String> fundusPhotos;
        private Boolean angiographyPerformed;
        private String angiographyFindings;
        private List<String> angiographyImageUrls;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InOfficeProcedures {
        private Boolean intravitrealInjection;
        private String injectionAgent;
        private String injectionEye; // RIGHT_EYE, LEFT_EYE, BILATERAL
        private String injectionLotNumber;
        private Boolean laserPerformed;
        private String laserType; // NONE, PRP_ARGON, FOCAL_DIODE, BARRIER
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiagnosisSelection {
        private String icd10Code;
        private String diagnosisType; // e.g. PRIMARY, SECONDARY
        private String clinicalStatus; // e.g. CONFIRMED, WORKING
        private String retinopathyType; // e.g. PROLIFERATIVE_DIABETIC, NON_PROLIFERATIVE_DIABETIC, NONE
        private String macularPathology; // e.g. DIABETIC_MACULAR_EDEMA, DRY_AMD, WET_AMD, NONE
        private String diabeticRetinopathyStage; // e.g. NPDR_MILD, NPDR_MODERATE, NPDR_SEVERE, PDR_ACTIVE, PDR_QUIESCENT, NONE
        private String amdType; // e.g. DRY_GEOGRAPHIC, WET_CNV_ACTIVE, NONE
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReferralSelection {
        private String targetClinicCode; // e.g. GLAUCOMA, ENDOCRINOLOGY, SURGICAL_OR
        private String urgency; // e.g. ROUTINE, URGENT, STAT
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
