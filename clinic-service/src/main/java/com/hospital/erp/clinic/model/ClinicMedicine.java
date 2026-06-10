package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * JPA Entity mapping internal medicine diagnostics.
 */
@Entity
@Table(name = "clinic_medicine")
@Getter
@Setter
public class ClinicMedicine extends BaseClinicExam {

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "temperature_celsius", precision = 4, scale = 2)
    private BigDecimal temperatureCelsius;

    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;

    @Column(name = "blood_glucose_fasting", precision = 5, scale = 2)
    private BigDecimal bloodGlucoseFasting;

    @Column(name = "blood_glucose_random", precision = 5, scale = 2)
    private BigDecimal bloodGlucoseRandom;

    @Column(name = "ros_constitutional")
    private Boolean rosConstitutional = false;

    @Column(name = "ros_ent")
    private Boolean rosEnt = false;

    @Column(name = "ros_cardiovascular")
    private Boolean rosCardiovascular = false;

    @Column(name = "ros_respiratory")
    private Boolean rosRespiratory = false;

    @Column(name = "ros_gastrointestinal")
    private Boolean rosGastrointestinal = false;

    @Column(name = "ros_musculoskeletal")
    private Boolean rosMusculoskeletal = false;

    @Column(name = "ros_neurological")
    private Boolean rosNeurological = false;

    @Column(name = "pe_general", columnDefinition = "text")
    private String peGeneral;

    @Column(name = "pe_cardiovascular", columnDefinition = "text")
    private String peCardiovascular;

    @Column(name = "pe_respiratory", columnDefinition = "text")
    private String peRespiratory;

    @Column(name = "pe_abdominal", columnDefinition = "text")
    private String peAbdominal;

    @Column(name = "pe_neurological", columnDefinition = "text")
    private String peNeurological;

    @Column(name = "pre_op_clearance")
    private Boolean preOpClearance = false;

    @Column(name = "clearance_notes", columnDefinition = "text")
    private String clearanceNotes;

    @Column(name = "ecg_findings", columnDefinition = "text")
    private String ecgFindings;

    @Column(name = "chest_xray_findings", columnDefinition = "text")
    private String chestXrayFindings;
}
