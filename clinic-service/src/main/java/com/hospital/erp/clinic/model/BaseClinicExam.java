package com.hospital.erp.clinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Base mapped superclass representing the shared schema layout for all specialty clinics.
 * Eliminates redundant boilerplate across the 8 specialized medical diagnostics modules.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseClinicExam {

    @Id
    @Column(name = "consultation_id", nullable = false, updatable = false)
    private UUID consultationId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "visit_id", nullable = false)
    private UUID visitId;

    @Column(name = "follow_up_interval_days")
    private Integer followUpIntervalDays;

    @Column(name = "ordered_labs", columnDefinition = "jsonb")
    private String orderedLabs = "[]";

    @Column(name = "ordered_imaging", columnDefinition = "jsonb")
    private String orderedImaging = "[]";

    @Column(name = "prescribed_medications", columnDefinition = "jsonb")
    private String prescribedMedications = "[]";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }
}
