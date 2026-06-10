package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import com.hospital.erp.clinic.converter.JsonConverter;

/**
 * JPA Entity mapping Retina diagnostics, pupil dilation lock timestamps, and optical coherence tomography (OCT).
 */
@Entity
@Table(name = "clinic_retina")
@Getter
@Setter
public class ClinicRetina extends BaseClinicExam {

    @Column(name = "dilation_achieved")
    private Boolean dilationAchieved = false;

    @Column(name = "dilation_agent", length = 100)
    private String dilationAgent;

    @Column(name = "dilation_time")
    private OffsetDateTime dilationTime;

    @Column(name = "fundus_view_quality", length = 50)
    private String fundusViewQuality;

    @Column(name = "vitreous", columnDefinition = "text")
    private String vitreous;

    @Column(name = "optic_disc_right", columnDefinition = "text")
    private String opticDiscRight;

    @Column(name = "optic_disc_left", columnDefinition = "text")
    private String opticDiscLeft;

    @Column(name = "macula_right", columnDefinition = "text")
    private String maculaRight;

    @Column(name = "macula_left", columnDefinition = "text")
    private String maculaLeft;

    @Column(name = "retina_vessels_right", columnDefinition = "text")
    private String retinaVesselsRight;

    @Column(name = "retina_vessels_left", columnDefinition = "text")
    private String retinaVesselsLeft;

    @Column(name = "periphery_right", columnDefinition = "text")
    private String peripheryRight;

    @Column(name = "periphery_left", columnDefinition = "text")
    private String peripheryLeft;

    @Column(name = "oct_performed")
    private Boolean octPerformed = false;

    @Column(name = "oct_right_cst_microns")
    private Integer octRightCstMicrons;

    @Column(name = "oct_left_cst_microns")
    private Integer octLeftCstMicrons;

    @Column(name = "oct_right_findings", columnDefinition = "text")
    private String octRightFindings;

    @Column(name = "oct_left_findings", columnDefinition = "text")
    private String octLeftFindings;

    @Convert(converter = JsonConverter.class)
    @Column(name = "oct_image_urls", columnDefinition = "jsonb")
    private Object octImageUrls;

    @Convert(converter = JsonConverter.class)
    @Column(name = "fundus_photos", columnDefinition = "jsonb")
    private Object fundusPhotos;

    @Column(name = "angiography_performed")
    private Boolean angiographyPerformed = false;

    @Column(name = "angiography_findings", columnDefinition = "text")
    private String angiographyFindings;

    @Convert(converter = JsonConverter.class)
    @Column(name = "angiography_image_urls", columnDefinition = "jsonb")
    private Object angiographyImageUrls;

    @Column(name = "retinopathy_type", length = 100)
    private String retinopathyType;

    @Column(name = "macular_pathology", length = 100)
    private String macularPathology;

    @Column(name = "diabetic_retinopathy_stage", length = 100)
    private String diabeticRetinopathyStage;

    @Column(name = "amd_type", length = 100)
    private String amdType;

    @Column(name = "intravitreal_injection")
    private Boolean intravitrealInjection = false;

    @Column(name = "injection_agent", length = 100)
    private String injectionAgent;

    @Column(name = "laser_performed")
    private Boolean laserPerformed = false;

    @Column(name = "laser_type", length = 100)
    private String laserType;

    @Column(name = "surgery_recommended")
    private Boolean surgeryRecommended = false;

    @Column(name = "surgery_type", length = 200)
    private String surgeryType;
}
