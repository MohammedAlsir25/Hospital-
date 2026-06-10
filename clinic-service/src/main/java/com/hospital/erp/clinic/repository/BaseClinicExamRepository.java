package com.hospital.erp.clinic.repository;

import com.hospital.erp.clinic.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import java.util.UUID;
import java.util.Optional;

/**
 * Base Spring Data repository interface for clinical examination lookups.
 */
@NoRepositoryBean
public interface BaseClinicExamRepository<T extends BaseClinicExam> extends JpaRepository<T, UUID> {
    Optional<T> findByConsultationId(UUID consultationId);
    Optional<T> findByPatientId(UUID patientId);
    Optional<T> findByVisitId(UUID visitId);
}
