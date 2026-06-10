package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import com.hospital.erp.clinic.converter.JsonConverter;

/**
 * JPA Entity mapping Glaucoma diagnostic parameters, including Goldmann IOP, pachymetry, and visual fields (VF).
 */
@Entity
@Table(name = "clinic_glaucoma")
@Getter
@Setter
public class ClinicGlaucoma extends BaseClinicExam {

    @Column(name = "iop_right_mmhg", precision = 4, scale = 2)
    private BigDecimal iopRightMmhg;

    @Column(name = "iop_left_mmhg", precision = 4, scale = 2)
    private BigDecimal iopLeftMmhg;

    @Column(name = "iop_measurement_time")
    private OffsetDateTime iopMeasurementTime;

    @Column(name = "iop_method", length = 50)
    private String iopMethod;

    @Column(name = "pachymetry_right_microns")
    private Integer pachymetryRightMicrons;

    @Column(name = "pachymetry_left_microns")
    private Integer pachymetryLeftMicrons;

    @Column(name = "pachymetry_adjusted_iop_right", precision = 4, scale = 2)
    private BigDecimal pachymetryAdjustedIopRight;

    @Column(name = "pachymetry_adjusted_iop_left", precision = 4, scale = 2)
    private BigDecimal pachymetryAdjustedIopLeft;

    @Column(name = "gonioscopy_right", columnDefinition = "text")
    private String gonioscopyRight;

    @Column(name = "gonioscopy_left", columnDefinition = "text")
    private String gonioscopyLeft;

    @Column(name = "angle_recession_right", columnDefinition = "text")
    private String angleRecessionRight;

    @Column(name = "angle_recession_left", columnDefinition = "text")
    private String angleRecessionLeft;

    @Column(name = "neovascularization_right")
    private Boolean neovascularizationRight = false;

    @Column(name = "neovascularization_left")
    private Boolean neovascularizationLeft = false;

    @Column(name = "cd_ratio_right", precision = 3, scale = 2)
    private BigDecimal cdRatioRight;

    @Column(name = "cd_ratio_left", precision = 3, scale = 2)
    private BigDecimal cdRatioLeft;

    @Column(name = "neuroretinal_rim_right", columnDefinition = "text")
    private String neuroretinalRimRight;

    @Column(name = "neuroretinal_rim_left", columnDefinition = "text")
    private String neuroretinalRimLeft;

    @Column(name = "disc_hemorrhage_right")
    private Boolean discHemorrhageRight = false;

    @Column(name = "disc_hemorrhage_left")
    private Boolean discHemorrhageLeft = false;

    @Column(name = "nerve_fiber_layer_defect_right")
    private Boolean nerveFiberLayerDefectRight = false;

    @Column(name = "nerve_fiber_layer_defect_left")
    private Boolean nerveFiberLayerDefectLeft = false;

    @Column(name = "vf_performed")
    private Boolean vfPerformed = false;

    @Column(name = "vf_right_md", precision = 5, scale = 2)
    private BigDecimal vfRightMd;

    @Column(name = "vf_left_md", precision = 5, scale = 2)
    private BigDecimal vfLeftMd;

    @Column(name = "vf_right_psd", precision = 5, scale = 2)
    private BigDecimal vfRightPsd;

    @Column(name = "vf_left_psd", precision = 5, scale = 2)
    private BigDecimal vfLeftPsd;

    @Column(name = "vf_right_pattern", columnDefinition = "text")
    private String vfRightPattern;

    @Column(name = "vf_left_pattern", columnDefinition = "text")
    private String vfLeftPattern;

    @Column(name = "vf_reliability_right", length = 50)
    private String vfReliabilityRight;

    @Column(name = "vf_reliability_left", length = 50)
    private String vfReliabilityLeft;

    @Column(name = "oct_rnfl_performed")
    private Boolean octRnflPerformed = false;

    @Column(name = "oct_rnfl_right_avg_microns")
    private Integer octRnflRightAvgMicrons;

    @Column(name = "oct_rnfl_left_avg_microns")
    private Integer octRnflLeftAvgMicrons;

    @Convert(converter = JsonConverter.class)
    @Column(name = "oct_rnfl_image_urls", columnDefinition = "jsonb")
    private Object octRnflImageUrls;

    @Column(name = "glaucoma_type", length = 100)
    private String glaucomaType;

    @Column(name = "staging", length = 50)
    private String staging;

    @Column(name = "target_iop_right")
    private Integer targetIopRight;

    @Column(name = "target_iop_left")
    private Integer targetIopLeft;

    @Convert(converter = JsonConverter.class)
    @Column(name = "current_drops", columnDefinition = "jsonb")
    private Object currentDrops;

    @Column(name = "laser_performed")
    private Boolean laserPerformed = false;

    @Column(name = "laser_type", length = 100)
    private String laserType;

    @Column(name = "surgery_recommended")
    private Boolean surgeryRecommended = false;

    @Column(name = "surgery_type", length = 200)
    private String surgeryType;
}
