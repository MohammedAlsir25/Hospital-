package com.hospital.erp.clinic.controller;

import com.hospital.erp.clinic.model.BaseClinicExam;
import com.hospital.erp.clinic.repository.BaseClinicExamRepository;
import com.hospital.erp.clinic.service.PatientPdfReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Unified boilerplate-free REST Controller binding all 8 specialized medical clinic datasets.
 * Dynamically dispatches operations using generic repositories mapped on demand.
 */
@RestController
@RequestMapping("/api/clinics")
public class GenericClinicController {

    private final ApplicationContext context;
    private final Map<String, BaseClinicExamRepository<?>> repositoryRoutingMap = new HashMap<>();
    private final PatientPdfReportService pdfReportService;

    @Autowired
    public GenericClinicController(ApplicationContext context, PatientPdfReportService pdfReportService) {
        this.context = context;
        this.pdfReportService = pdfReportService;
        initializeRepositoryRoutingMap();
    }

    /**
     * Map specialty endpoints directly to their corresponding Spring Data JPA repositories.
     */
    private void initializeRepositoryRoutingMap() {
        repositoryRoutingMap.put("medicine", context.getBean("clinicMedicineRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("ent", context.getBean("clinicEntRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("dental", context.getBean("clinicDentalRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("retina", context.getBean("clinicRetinaRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("glaucoma", context.getBean("clinicGlaucomaRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("orbit", context.getBean("clinicOrbitRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("pediatrics", context.getBean("clinicPediatricsRepository", BaseClinicExamRepository.class));
        repositoryRoutingMap.put("general", context.getBean("clinicGeneralOphthRepository", BaseClinicExamRepository.class));
    }

    private BaseClinicExamRepository<?> resolveRepository(String specialty) {
        BaseClinicExamRepository<?> repo = repositoryRoutingMap.get(specialty.toLowerCase());
        if (repo == null) {
            throw new IllegalArgumentException("Unsupported specialty clinical module: [" + specialty + "]");
        }
        return repo;
    }

    /**
     * Retrieve clinical records by consultation UUID.
     */
    @GetMapping("/{specialty}/consultation/{id}")
    public ResponseEntity<?> getExamByConsultation(@PathVariable String specialty, @PathVariable UUID id) {
        try {
            BaseClinicExamRepository<?> repo = resolveRepository(specialty);
            return repo.findByConsultationId(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Retrieve clinical records by patient ID.
     */
    @GetMapping("/{specialty}/patient/{id}")
    public ResponseEntity<?> getExamByPatient(@PathVariable String specialty, @PathVariable UUID id) {
        try {
            BaseClinicExamRepository<?> repo = resolveRepository(specialty);
            return repo.findByPatientId(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unified UPSERT (save or update) endpoint for any specialty clinic clinical documents.
     */
    @PostMapping("/{specialty}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> upsertExam(@PathVariable String specialty, @RequestBody BaseClinicExam examPayload) {
        try {
            BaseClinicExamRepository<BaseClinicExam> repo = (BaseClinicExamRepository<BaseClinicExam>) resolveRepository(specialty);
            BaseClinicExam savedExam = repo.save(examPayload);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedExam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to persist clinical records on database storage", "message", e.getMessage()));
        }
    }

    /**
     * Purge specific records by core consultation ID lock.
     */
    @DeleteMapping("/{specialty}/consultation/{id}")
    public ResponseEntity<?> deleteExamByConsultation(@PathVariable String specialty, @PathVariable UUID id) {
        try {
            BaseClinicExamRepository<?> repo = resolveRepository(specialty);
            if (repo.existsById(id)) {
                repo.deleteById(id);
                return ResponseEntity.ok().body(Map.of("status", "SUCCESS", "message", "Clinical record purged."));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Compile and download a comprehensive clinical PDF record for a patient.
     */
    @GetMapping("/patient/{patientId}/report/pdf")
    public ResponseEntity<byte[]> downloadPdfReport(@PathVariable UUID patientId) {
        try {
            byte[] pdfBytes = pdfReportService.generatePatientPdfReport(patientId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "patient-report-" + patientId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
