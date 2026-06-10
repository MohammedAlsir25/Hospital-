package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * JPA Entity mapping Ear, Nose & Throat clinical examination parameters.
 */
@Entity
@Table(name = "clinic_ent")
@Getter
@Setter
public class ClinicEnt extends BaseClinicExam {

    @Column(name = "otoscopy_right_normal")
    private Boolean otoscopyRightNormal = true;

    @Column(name = "otoscopy_right_findings", columnDefinition = "text")
    private String otoscopyRightFindings;

    @Column(name = "otoscopy_left_normal")
    private Boolean otoscopyLeftNormal = true;

    @Column(name = "otoscopy_left_findings", columnDefinition = "text")
    private String otoscopyLeftFindings;

    @Column(name = "tympanic_membrane", columnDefinition = "text")
    private String tympanicMembrane;

    @Column(name = "hearing_test_type", length = 100)
    private String hearingTestType;

    @Column(name = "air_conduction_right", columnDefinition = "text")
    private String airConductionRight;

    @Column(name = "air_conduction_left", columnDefinition = "text")
    private String airConductionLeft;

    @Column(name = "bone_conduction_right", columnDefinition = "text")
    private String boneConductionRight;

    @Column(name = "bone_conduction_left", columnDefinition = "text")
    private String boneConductionLeft;

    @Column(name = "tympanometry_right", columnDefinition = "text")
    private String tympanometryRight;

    @Column(name = "tympanometry_left", columnDefinition = "text")
    private String tympanometryLeft;

    @Column(name = "hearing_impairment_type", length = 100)
    private String hearingImpairmentType;

    @Column(name = "nasal_septum", columnDefinition = "text")
    private String nasalSeptum;

    @Column(name = "turbinates", columnDefinition = "text")
    private String turbinates;

    @Column(name = "nasal_mucosa", columnDefinition = "text")
    private String nasalMucosa;

    @Column(name = "sinus_tenderness", columnDefinition = "text")
    private String sinusTenderness;

    @Column(name = "oropharynx_exam", columnDefinition = "text")
    private String oropharynxExam;

    @Column(name = "larynx_exam", columnDefinition = "text")
    private String larynxExam;

    @Column(name = "voice_assessment", columnDefinition = "text")
    private String voiceAssessment;

    @Column(name = "fistula_test", columnDefinition = "text")
    private String fistulaTest;

    @Column(name = "weber_test", columnDefinition = "text")
    private String weberTest;

    @Column(name = "rinne_test_right", columnDefinition = "text")
    private String rinneTestRight;

    @Column(name = "rinne_test_left", columnDefinition = "text")
    private String rinneTestLeft;
}
