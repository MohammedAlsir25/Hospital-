# OPHTHALMIC EHR & ERP BILLING SYSTEM
## Software Engineering Specification: SDLC, Workflows, Use Cases, and System Requirements

This document establishes the official System Architectural Design, Software Development Life Cycle (SDLC) blueprint, Unified Use Cases, and System Requirements for the Enterprise Ophthalmic EHR & ERP Billing System, particularly engineering the database and micro-architecture to scale seamlessly past **100,000 patient records** and active users.

---

## 1. Software Development Life Cycle (SDLC) Framework

The system utilizes an **Agile-DevOps Hybrid SDLC** paradigm to ensure high clinical fidelity, rapid feature iteration, and zero-downtime deployment.

```
       [1] Planning & Feasibility (SLA & Compliance Analysis)
                       │
                       ▼
       [2] Requirements Engineering (FRs, NFRs, & Scaling Parameters)
                       │
                       ▼
       [3] System & DB Architectural Design (60-30-10 Eye-Safe Warm Theme)
                       │
                       ▼
       [4] Implementation & Continuous Integration (Strict Lint/Compiler Gates)
                       │
                       ▼
       [5] Verification & Stress Testing (>100K Patient Simulation)
                       │
                       ▼
       [6] Continuous Deployment (Containerized Cloud Run Ingress)
```

### Phase-by-Phase Process Definitions:
1. **Planning & Feasibility**: Scope clinical queues (General Ophthalmology, Retina, Glaucoma, Orbit, Pediatrics) against regional regulatory constraints (such as DHA, HAAD, HIPAA compliance) and financial audit guidelines.
2. **Requirements Engineering**: Establish discrete traceability for all medical and billing activities, anchoring a strict NFR to execute sub-split millisecond indexing for over 100,000 patient demographics.
3. **Architecture & Design**: Layout components following the **Eye-Safe Alabaster Cream (#FBFBF9)** theme rules (60% background, 30% container structure, 10% tactile accent colors) to reduce clinician visual fatigue. Employs a dual-mode English (LTR) / Arabic (RTL) Cairo-font layout.
4. **Implementation**: Code split via React 18+ and Vite, ensuring zero infinite-loop triggers inside `useEffect` logic. Compiles via strict verification rules (`tsc --noEmit` and modern esbuild pipelines).
5. **Verification**: Execute simulated performance thresholds mirroring high-concurrency patient ingest stress points.
6. **Deployment & Operations**: Host on container instances with auto-scaling to zero to maximize cost efficiency, routed behind Nginx port-forwarding modules at port 3000.

---

## 2. Activity Workflow Diagrams

### 2.1 E2E Patient Lifecycle & Care Pathway
The following workflow illustrates the clinical trajectory of a patient from lobby intake to final fiscal clearance:

```
[Patient Intake]
       │
       ▼
 [Emirates ID Scan] ──► (Verify Demographic Token)
       │
       ▼
[Insurance Eligibility Check] ──► (Real-time Clearinghouse Query)
       │
       ├──► Approved (Apply Co-Pay Adjusted Rate)
       └──► Rejected (Flag Self-Pay Consultation Fee)
       │
       ▼
[Front Desk POS Cashier] ──► (Collect Consultation Co-Pay)
       │
       ├─────────────────────────────────────┐
       ▼ (Advance Queue)                     ▼ (STAT Override)
[Clinical Triage & Vitals]            [Emergency Route]
       │                                     │
       ▼                                     ▼
[Specialty Clinic Consultation] ◄───── [Orbit Traumatology]
   (General / Retina / Glaucoma / Orbit / Pediatrics)
       │
       ├─────────────────────────────────────┐
       ▼                                     ▼
[Diagnostic Lab / Pharmacy Rx]        [Surgical Path]
       │                                     │
       ▼                                     ▼
[Automated Dispatch Formulary]       [Surgical Escrow Deposit]
       │                                     │
       ├─────────────────────────────────────┘
       ▼
[Central Financial Accounting Journal] ──► (Double-entry Ledger Reconciled)
       │
       ▼
[Discharge & Patient PDF Report Issued]
```

---

## 3. Unified System Use Cases

### 3.1 Use Case 1: Biometric Patient Intake & Check-in
* **Actor**: Front Desk Receptionist / Patient (Kiosk)
* **Preconditions**: Patient presents an Emirates ID or passport; terminal scanner is plugged into the port.
* **Flow of Events**:
  1. Receptionist triggers the "Swipe ID" biometric query from the intake interface.
  2. The system initiates decryption on the reader port.
  3. Demographics (Full Name, Date of Birth, National ID number) are populated.
  4. The receptionist selects the target Specialty Clinic (e.g., Retina) and commits the file.
  5. The patient is securely added to the waitlist.
* **Postconditions**: Patient queue register is updated; SLA timer initializes relative to the selected Desk context (Main Lobby | VIP Lounge).

### 3.2 Use Case 2: Multi-Criteria Real-Time Insurance Clearing
* **Actor**: Receptionist / Billing Specialist
* **Preconditions**: Patient record contains valid policy details and selected Insurance Network tier.
* **Flow of Events**:
  1. Operator opens the Insurance Eligibility console inside the workspace.
  2. The system fetches the patient's unpaid billing items.
  3. Operator requests eligibility query clearance from the clearinghouse.
  4. The system simulates network authorization and applies direct co-pay rates.
  5. The system recalculates and updates the billing ledger automatically.
* **Postconditions**: Consultation co-pay rates drop to reflect the policy tier, and an direct-billing approval token is logged to active telemetry database.

### 3.3 Use Case 3: Front-Desk POS Direct Double-Entry Reconciliation
* **Actor**: Receptionist / Cashier / Central Accountant
* **Preconditions**: Patient has an unpaid billing row generated by admissions or the dispensary.
* **Flow of Events**:
  1. Cashier opens the Front-Desk POS panel.
  2. System filters outstanding co-pay parameters.
  3. Cashier executes 1-click clearance.
  4. Patient bill is set to "Paid".
  5. A real-time transaction record undergoes a credit-debit balance post into the central fiscal journal ledger.
* **Postconditions**: Cash drawer balance updates; patient record is safely unlocked and transferred to clinican review boards.

### 3.4 Use Case 4: Pediatric Triage & Strict Strabismus Audit
* **Actor**: Pediatric Ophthalmologist / Clinical Nurse
* **Preconditions**: Patient is registered under the Pediatrics queue.
* **Flow of Events**:
  1. Clinician registers Hirschberg ocular alignment metrics, Cover Test status, and binocular visual acuity values.
  2. Systems evaluate strabismus deviations.
  3. Clinician notes custom orthoptic patching regimes.
  4. System updates the patient's Clinical Log registry with timestamp, clinician signature, and strict diagnosis code audits.
* **Postconditions**: Pediatric consultation and orthoptic treatment records are permanently saved.

---

## 4. Functional Requirements (FR)

### 4.1 Intake and Front Desk Management
* **FR-1.1**: The system **MUST** support electronic scanning/biometric swiping simulator protocols to auto-populate the demographic fields from native identification.
* **FR-1.2**: The system **MUST** calculate average lobby wait-times dynamically based on patient transition timestamps.
* **FR-1.3**: The system **MUST** flash warning logs and highlight client rows whose intake delays exceed a specified 20-minute SLA index.
* **FR-1.4**: The system **MUST** feature a prominent **"Add Patient"** action item trigger on the upper right side to register new check-ins with immediate clinic queues and billing attributes.
* **FR-1.5**: The system **MUST** provide an emergency triage override (STAT Override) to bypass standard wait queues and route acute trauma injuries directly to specialized clinical tables.

### 4.2 Specialty Clinical Practice Modules
* **FR-2.1**: The system **MUST** provide isolated, customized workstations for:
  * *General Ophthalmology*: Acuity records, slit lamp evaluations, intraocular pressure (IOP) registers, and diagnostic prescriptions.
  * *Retinal Department*: Macular, diabetic retinopathy tracker, and vitrectomy scheduling.
  * *Glaucoma Clinic*: Pachymetry records, C/D ratios, and IOP trend analysis graphs.
  * *Orbit & Oculoplastics*: Eyelid trauma, reconstructive notes, and emergency burns.
  * *Pediatric Strabismus*: Hirschberg metrics, deviation prism diopters, and orthoptist recommendations.

### 4.3 Integrated Pharmacy & Dispensary Module
* **FR-3.1**: The system **MUST** integrate real-time digital prescription routing directly from Doctor Consultations to the Pharmacy formulations queue.
* **FR-3.2**: The system **MUST** feature automated safety checks (e.g., drug-allergy alerts) before compounding or compounding dispatches are resolved.
* **FR-3.3**: The system **MUST** adjust stock amounts instantly upon order fulfillment.

### 4.4 Central ERP Finance and HR Scheduling
* **FR-4.1**: All cash collections, surgical deposits, and compounding charges **MUST** trigger double-entry journal postings mapping debits/credits to respective operational accounts.
* **FR-4.2**: POS cashiers **MUST** be able to initiate, reconcile, and close cash shifts, automatically posting unified Z-Reports into the General Ledger.
* **FR-4.3**: The Appointment Scheduler **MUST** evaluate physician license expiration dates and leave statuses before confirming reservation records.

---

## 5. Non-Functional Requirements (NFR) & Architectural Scaling

### 5.1 Massive Scaling Target: Operational Capacity ＞ 100,000 Patient Profiles
To support transaction and diagnostic volume exceeding **100,000 active patient profiles**, the architecture incorporates the following mechanisms:

* **NFR-1.1 (Sub-100ms Search Latency)**: Patient queries **MUST** utilize composite indices on key identifiers (National ID, Date of Birth, Patient ID) to achieve a sub-100ms response time on datasets of 100,000+ rows.
* **NFR-1.2 (Paginated Data Ingest)**: Client/Server interfaces **MUST** implement cursor-based virtual scrolling windows to render patient registries, avoiding viewport crashes or UI layout lagging.
* **NFR-1.3 (Durable Replication)**: The underlying database strategy **MUST** utilize read-replicas for intensive query generation (e.g., analytics dashboards, batch PDF reviews) to keep the primary transactional write database free of resource contention.
* **NFR-1.4 (Archival Partitioning)**: Historical medical logs and clinical files completed in previous fiscal cycles **MUST** undergo automatic partitioning into cold-storage archives, leaving only active consult cases in warm cache registers.

### 5.2 Aesthetic Vision & Clinician Wellness Paradigm
* **NFR-2.1 (Warm Clinical Palette)**: To optimize ophthalmic work environments, the theme **MUST** default to eye-safe tones: a soft **Alabaster Cream background (#FBFBF9)**, minimizing the visual fatigue caused by harsh blue light backlights.
* **NFR-2.2 (High-Contrast Tactility)**: Interactive items **MUST** deploy clear outlines (`border-[#EAE6DF]`) and highly discernible active-state accents (`#4F46E5` Indigo).
* **NFR-2.3 (Bilingual Alignment)**: Layouts **MUST** dynamically toggle between Left-to-Right English and Right-to-Left Arabic (Cairo font) without breaking grid flow or text clipping boundaries.

### 5.3 Reliability, Scalability & Verification
* **NFR-3.1 (Zero Global States)**: Complex business logic must remain modularly isolated across component structures to prevent infinite rendering cycles.
* **NFR-3.2 (Verification Gates)**: Code updates **MUST** satisfy compiling checks (`tsc --noEmit`) and comprehensive code syntax audits (`npm run lint`) before publishing live.

---

## 6. Central IT Security & Workstation Command Center (module_security)

To preserve clinical fidelity and financial accountability across our Pharmacy, Accounting, and Front Desk departments, the IT workstation enforces strict, dynamic perimeter controls:

### 6.1 Role-Based Access Control (RBAC) Privilege Matrix
* **Functional Granular Toggles**: Capabilities are linked to functional action keys (such as `Access Pharmacy cost graphs`, `Authorize cash refunds`, `Close cashier shifts`) rather than open profile brackets.
* **Role Inheritance**: Tiers can inherit access vectors sequentially (e.g., `Chief of Accounting` inherits accounting ledgers + delete permissions).
* **Token Blacklisting & Session Revocation**: The IT operator can instantly revoke JWT tokens or deauthorize current active client station connections across clinical terminals, updating system claims in real-time.

### 6.2 Real-Time PIN Clearance & Supervisor Override Console
* **Dual-Control Principle**: Prompts on high-risk operations (e.g. ledger modifications, controlled substance orders, cash deviation releases) lock client workstation screens.
* **Biometric & PIN Terminal Sync**: Security administrators or clinical supervisors enter their 4 to 6 digit private keys which validate client tokens, record audit signatures, and grant temporary bypass keys.

### 6.3 Roster-Locked Access Guards
* **Time-Bound Security Fencing**: Station authentication checks Active HR Shift schedules. Employees are automatically locked out outside of scheduled shifts (extended by a 30-minute grace buffer).
* **Clinic Queue Isolation**: Clinicians assigned to a specific specialty clinic are isolated from loading case queues of secondary clinics unless granted an active IT override.
* **Station Whitelisting**: Subnets are restricted via whitelisted IP address patterns to prevent off-site access to patient records.

### 6.4 Cryptographic & Biometric Audit Trail
* **Tamper-Proof Audit Telemetry**: Logs record timestamps, terminals, actors, actions, and status outcomes (`SUCCESS` | `BLOCKED` | `BYPASSED`), creating historical records for HIPAA compliance reviews.
* **Intrusion Countermeasures**: Tracks consecutive failed access and unauthorized PIN attempts across terminals, flashing alarms to alert operators of active perimeter threats.
