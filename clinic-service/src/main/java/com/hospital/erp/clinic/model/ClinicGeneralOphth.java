package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import com.hospital.erp.clinic.converter.JsonConverter;

/**
 * JPA Entity mapping General Ophthalmology assessments.
 * Captures visual acuity measures (corrected, uncorrected, pinhole), anterior
 * segment evaluations, refraction recipes, and dilation outcomes.
 */
@Entity
@Table(name = "clinic_general_ophth")
@Getter
@Setter
public class ClinicGeneralOphth extends BaseClinicExam {

    @Column(name = "va_uncorrected_right", length = 20)
    private String vaUncorrectedRight;

    @Column(name = "va_uncorrected_left", length = 20)
    private String vaUncorrectedLeft;

    @Column(name = "va_corrected_right", length = 20)
    private String vaCorrectedRight;

    @Column(name = "va_corrected_left", length = 20)
    private String vaCorrectedLeft;

    @Column(name = "va_pinhole_right", length = 20)
    private String vaPinholeRight;

    @Column(name = "va_pinhole_left", length = 20)
    private String vaPinholeLeft;

    @Column(name = "va_method", length = 50)
    private String vaMethod;

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

    @Column(name = "add_power", precision = 4, scale = 2)
    private BigDecimal addPower;

    @Column(name = "lids_lashes_right", columnDefinition = "text")
    private String lidsLashesRight;

    @Column(name = "lids_lashes_left", columnDefinition = "text")
    private String lidsLashesLeft;

    @Column(name = "conjunctiva_sclera_right", columnDefinition = "text")
    private String conjunctivaScleraRight;

    @Column(name = "conjunctiva_sclera_left", columnDefinition = "text")
    private String conjunctivaScleraLeft;

    @Column(name = "cornea_right", columnDefinition = "text")
    private String corneaRight;

    @Column(name = "cornea_left", columnDefinition = "text")
    private String corneaLeft;

    @Column(name = "anterior_chamber_right", columnDefinition = "text")
    private String anteriorChamberRight;

    @Column(name = "anterior_chamber_left", columnDefinition = "text")
    private String anteriorChamberLeft;

    @Column(name = "iris_right", columnDefinition = "text")
    private String irisRight;

    @Column(name = "iris_left", columnDefinition = "text")
    private String irisLeft;

    @Column(name = "lens_right", columnDefinition = "text")
    private String lensRight;

    @Column(name = "lens_left", columnDefinition = "text")
    private String lensLeft;

    @Column(name = "iop_right_mmhg", precision = 4, scale = 2)
    private BigDecimal iopRightMmhg;

    @Column(name = "iop_left_mmhg", precision = 4, scale = 2)
    private BigDecimal iopLeftMmhg;

    @Column(name = "iop_method", length = 50)
    private String iopMethod;

    @Column(name = "dilation_performed")
    private Boolean dilationPerformed = false;

    @Column(name = "vitreous_right", columnDefinition = "text")
    private String vitreousRight;

    @Column(name = "vitreous_left", columnDefinition = "text")
    private String vitreousLeft;

    @Column(name = "optic_disc_right", columnDefinition = "text")
    private String opticDiscRight;

    @Column(name = "optic_disc_left", columnDefinition = "text")
    private String opticDiscLeft;

    @Column(name = "macula_right", columnDefinition = "text")
    private String maculaRight;

    @Column(name = "macula_left", columnDefinition = "text")
    private String maculaLeft;

    @Column(name = "vessels_right", columnDefinition = "text")
    private String vesselsRight;

    @Column(name = "vessels_left", columnDefinition = "text")
    private String vesselsLeft;

    @Column(name = "periphery_right", columnDefinition = "text")
    private String peripheryRight;

    @Column(name = "periphery_left", columnDefinition = "text")
    private String peripheryLeft;

    @Column(name = "working_diagnosis", columnDefinition = "text")
    private String workingDiagnosis;

    @Column(name = "differential_diagnosis", columnDefinition = "text")
    private String differentialDiagnosis;

    @Column(name = "management_plan", columnDefinition = "text")
    private String managementPlan;

    @Column(name = "glasses_prescribed")
    private Boolean glassesPrescribed = false;

    @Convert(converter = JsonConverter.class)
    @Column(name = "glasses_rx", columnDefinition = "jsonb")
    private Object glassesRx;

    @Column(name = "surgery_recommended")
    private Boolean surgeryRecommended = false;

    @Column(name = "surgery_type", length = 200)
    private String surgeryType;
}
