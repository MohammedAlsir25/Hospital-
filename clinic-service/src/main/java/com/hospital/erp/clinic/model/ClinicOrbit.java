package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * JPA Entity mapping Orbit / Oculoplastics exam variables including ptosis indices,
 * tearing assessments, and thyroid eye disease (TED) classifications.
 */
@Entity
@Table(name = "clinic_orbit")
@Getter
@Setter
public class ClinicOrbit extends BaseClinicExam {

    @Column(name = "mrd1_right_mm", precision = 4, scale = 2)
    private BigDecimal mrd1RightMm;

    @Column(name = "mrd1_left_mm", precision = 4, scale = 2)
    private BigDecimal mrd1LeftMm;

    @Column(name = "mrd2_right_mm", precision = 4, scale = 2)
    private BigDecimal mrd2RightMm;

    @Column(name = "mrd2_left_mm", precision = 4, scale = 2)
    private BigDecimal mrd2LeftMm;

    @Column(name = "lf_width_right_mm", precision = 4, scale = 2)
    private BigDecimal lfWidthRightMm;

    @Column(name = "lf_width_left_mm", precision = 4, scale = 2)
    private BigDecimal lfWidthLeftMm;

    @Column(name = "ptosis_right")
    private Boolean ptosisRight = false;

    @Column(name = "ptosis_left")
    private Boolean ptosisLeft = false;

    @Column(name = "levator_function_right", columnDefinition = "text")
    private String levatorFunctionRight;

    @Column(name = "levator_function_left", columnDefinition = "text")
    private String levatorFunctionLeft;

    @Column(name = "bells_phenomenon", length = 50)
    private String bellsPhenomenon;

    @Column(name = "lid_margin_right", columnDefinition = "text")
    private String lidMarginRight;

    @Column(name = "lid_margin_left", columnDefinition = "text")
    private String lidMarginLeft;

    @Column(name = "entropion_ectropion_trichiasis_right", columnDefinition = "text")
    private String entropionEctropionTrichiasisRight;

    @Column(name = "entropion_ectropion_trichiasis_left", columnDefinition = "text")
    private String entropionEctropionTrichiasisLeft;

    @Column(name = "lid_mass_right", columnDefinition = "text")
    private String lidMassRight;

    @Column(name = "lid_mass_left", columnDefinition = "text")
    private String lidMassLeft;

    @Column(name = "blepharospasm")
    private Boolean blepharospasm = false;

    @Column(name = "tear_meniscus_height", precision = 4, scale = 2)
    private BigDecimal tearMeniscusHeight;

    @Column(name = "nlf_dt", columnDefinition = "text")
    private String nlfDt;

    @Column(name = "dacryocystitis")
    private Boolean dacryocystitis = false;

    @Column(name = "lacrimal_irrigation", columnDefinition = "text")
    private String lacrimalIrrigation;

    @Column(name = "schirmer_right_mm")
    private Integer schirmerRightMm;

    @Column(name = "schirmer_left_mm")
    private Integer schirmerLeftMm;

    @Column(name = "proptosis_right_mm", precision = 4, scale = 2)
    private BigDecimal proptosisRightMm;

    @Column(name = "proptosis_left_mm", precision = 4, scale = 2)
    private BigDecimal proptosisLeftMm;

    @Column(name = "hertel_base_mm", precision = 4, scale = 2)
    private BigDecimal hertelBaseMm;

    @Column(name = "enophthalmos_right_mm", precision = 4, scale = 2)
    private BigDecimal enophthalmosRightMm;

    @Column(name = "enophthalmos_left_mm", precision = 4, scale = 2)
    private BigDecimal enophthalmosLeftMm;

    @Column(name = "orbital_mass")
    private Boolean orbitalMass = false;

    @Column(name = "orbital_mass_location", columnDefinition = "text")
    private String orbitalMassLocation;

    @Column(name = "extraocular_movements", columnDefinition = "text")
    private String extraocularMovements;

    @Column(name = "ted_active")
    private Boolean tedActive = false;

    @Column(name = "ted_cas_score")
    private Integer tedCasScore;

    @Column(name = "ted_eugogo_class", length = 50)
    private String tedEugogoClass;

    @Column(name = "surgery_recommended")
    private Boolean surgeryRecommended = false;

    @Column(name = "surgery_type", length = 200)
    private String surgeryType;
}
