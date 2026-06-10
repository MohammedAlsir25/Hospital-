package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.hospital.erp.clinic.converter.JsonConverter;

/**
 * JPA Entity mapping Dental exam files, including the full odontogram and impacted teeth mapping.
 */
@Entity
@Table(name = "clinic_dental")
@Getter
@Setter
public class ClinicDental extends BaseClinicExam {

    @Convert(converter = JsonConverter.class)
    @Column(name = "odontogram", columnDefinition = "jsonb")
    private Object odontogram;

    @Column(name = "gingivitis")
    private Boolean gingivitis = false;

    @Column(name = "periodontitis")
    private Boolean periodontitis = false;

    @Column(name = "pocket_depth_max_mm")
    private Integer pocketDepthMaxMm;

    @Column(name = "bleeding_on_probing")
    private Boolean bleedingOnProbing = false;

    @Column(name = "mobility_grade", length = 20)
    private String mobilityGrade;

    @Column(name = "oral_lesions", columnDefinition = "text")
    private String oralLesions;

    @Column(name = "mucosal_exam", columnDefinition = "text")
    private String mucosalExam;

    @Column(name = "tongue_exam", columnDefinition = "text")
    private String tongueExam;

    @Column(name = "salivary_glands", columnDefinition = "text")
    private String salivaryGlands;

    @Column(name = "xray_type", length = 100)
    private String xrayType;

    @Column(name = "xray_findings", columnDefinition = "text")
    private String xrayFindings;

    @Convert(converter = JsonConverter.class)
    @Column(name = "impacted_teeth", columnDefinition = "jsonb")
    private Object impactedTeeth;

    @Column(name = "diagnosis", columnDefinition = "text")
    private String diagnosis;

    @Column(name = "treatment_plan", columnDefinition = "text")
    private String treatmentPlan;

    @Column(name = "procedure_code", length = 50)
    private String procedureCode;

    @Column(name = "procedure_description", columnDefinition = "text")
    private String procedureDescription;
}
