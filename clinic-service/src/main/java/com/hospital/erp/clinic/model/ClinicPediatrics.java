package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * JPA Entity mapping Pediatrics & Strabismus clinical data.
 * Captures neonate factors (birth weight/gestational age), eye routing logs,
 * cycloplegic refraction values, and patching regimens.
 */
@Entity
@Table(name = "clinic_pediatrics")
@Getter
@Setter
public class ClinicPediatrics extends BaseClinicExam {

    @Column(name = "gestational_age_weeks")
    private Integer gestationalAgeWeeks;

    @Column(name = "birth_weight_grams")
    private Integer birthWeightGrams;

    @Column(name = "developmental_milestones", columnDefinition = "text")
    private String developmentalMilestones;

    @Column(name = "va_method", length = 50)
    private String vaMethod;

    @Column(name = "va_right", length = 20)
    private String vaRight;

    @Column(name = "va_left", length = 20)
    private String vaLeft;

    @Column(name = "va_binocular", length = 20)
    private String vaBinocular;

    @Column(name = "cycloplegia_achieved")
    private Boolean cycloplegiaAchieved = false;

    @Column(name = "refraction_agent", length = 50)
    private String refractionAgent;

    @Column(name = "refraction_right_sph", precision = 5, scale = 2)
    private BigDecimal refractionRightSph;

    @Column(name = "refraction_right_cyl", precision = 5, scale = 2)
    private BigDecimal refractionRightCyl;

    @Column(name = "refraction_right_axis")
    private Integer refractionRightAxis;

    @Column(name = "refraction_left_sph", precision = 5, scale = 2)
    private BigDecimal refractionLeftSph;

    @Column(name = "refraction_left_cyl", precision = 5, scale = 2)
    private BigDecimal refractionLeftCyl;

    @Column(name = "refraction_left_axis")
    private Integer refractionLeftAxis;

    @Column(name = "deviation_type", length = 50)
    private String deviationType;

    @Column(name = "deviation_constant")
    private Boolean deviationConstant = false;

    @Column(name = "deviation_distance_near_pd", length = 50)
    private String deviationDistanceNearPd;

    @Column(name = "cover_test_distance", columnDefinition = "text")
    private String coverTestDistance;

    @Column(name = "cover_test_near", columnDefinition = "text")
    private String coverTestNear;

    @Column(name = "prism_cover_test", columnDefinition = "text")
    private String prismCoverTest;

    @Column(name = "ductions_right", columnDefinition = "text")
    private String ductionsRight;

    @Column(name = "ductions_left", columnDefinition = "text")
    private String ductionsLeft;

    @Column(name = "versions", columnDefinition = "text")
    private String versions;

    @Column(name = "head_posture", columnDefinition = "text")
    private String headPosture;

    @Column(name = "nystagmus", columnDefinition = "text")
    private String nystagmus;

    @Column(name = "worth_4_dot", columnDefinition = "text")
    private String worth4Dot;

    @Column(name = "stereoacuity_seconds")
    private Integer stereoacuitySeconds;

    @Column(name = "bagolini_glasses", columnDefinition = "text")
    private String bagoliniGlasses;

    @Column(name = "amsler_grid", columnDefinition = "text")
    private String amslerGrid;

    @Column(name = "slit_lamp_findings", columnDefinition = "text")
    private String slitLampFindings;

    @Column(name = "fundus_findings", columnDefinition = "text")
    private String fundusFindings;

    @Column(name = "rop_screening")
    private Boolean ropScreening = false;

    @Column(name = "rop_stage", length = 50)
    private String ropStage;

    @Column(name = "amblyopia_present")
    private Boolean amblyopiaPresent = false;

    @Column(name = "amblyopia_type", length = 50)
    private String amblyopiaType;

    @Column(name = "amblyopia_eye", length = 10)
    private String amblyopiaEye;

    @Column(name = "patching_hours_per_day")
    private Integer patchingHoursPerDay;

    @Column(name = "occlusion_therapy", columnDefinition = "text")
    private String occlusionTherapy;

    @Column(name = "atropine_penalization", columnDefinition = "text")
    private String atropinePenalization;

    @Column(name = "glasses_prescribed")
    private Boolean glassesPrescribed = false;

    @Column(name = "surgery_recommended")
    private Boolean surgeryRecommended = false;

    @Column(name = "surgery_type", length = 200)
    private String surgeryType;
}
