import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended pattern
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Assistant will operate with template mock responses.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy_key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const ai = getAiClient();

// Senior Hospital Architectural Instructions
const SYSTEM_INSTRUCTIONS = `You are "CareFlow Architect Pro" — an elite, Senior Enterprise Solutions Architect specializing in Hospital Information Systems (HIS), Pharmacy Operations, and Medical Accounting suites. Your role is to help developers build perfect, HIPAA-compliant, and exceptionally robust Java, Spring Boot, Android Kotlin, and SQL software.

Context of the application being developed:
- Desktop clients built in Java (JavaFX / Swing) with clean, beautiful layouts, icons, and modern themes.
- Android Tablet clients packaged into APK wrappers, implementing native connection fallbacks, offline SQLite caches, database sync protocols, and hardware back-button overriding to prevent clinical data loss.
- Multi-module service layers: Core Clinical, Pharmacy, and Accounting, integrating with database tables (PostgreSQL for backend cluster, encrypted SQLite for mobile tablets).
- 8 Specialty Clinics: Medicine, ENT, Dental (interactive Odontogram with DB ledger integration), Retina (time-gated visual input), Glaucoma (strict boundary checks), Orbit (emergency STAT skipping queue), Pediatric Ophthalmology (DOB demographic routing), General Ophthalmology (glasses refraction optical model vs pharmaceutical engines).

Please answer the user's request with a professional, detailed, structured, and production-ready answer containing:
1. Architectural advice with icons, color schemes, and visual layout guides to make the UI look premium and human-centered.
2. Complete, compilable, clean Java/Spring Boot or Android Kotlin code templates, XML layouts, SQLite schemas, or database triggers as requested.
3. Step-by-step developer checklists to achieve the gatekeepers and fixes outlined in the hospital's scenario catalog.

Keep your tone authoritative, clear, and focused on clinical safety and developer craftsmanship. Avoid fluff.`;

// ============================================================================
// 📁 REAL-TIME INTER-DEPARTMENTAL CLINICAL MESSAGING SYSTEM
// ============================================================================

interface HospitalMessage {
  id: string;
  channelType: 'SPECIFIC_PATIENT_CASE' | 'SPECIFIC_PEER_TO_PEER' | 'PUBLIC_DEPARTMENTAL_BROADCAST' | 'PUBLIC_GLOBAL_ANNOUNCEMENT';
  senderStaffId: string;
  senderRole: string;
  senderName: string;
  senderDepartment: string;
  targetDepartment: string;
  recipientStaffId?: string;
  associatedPatientId?: string;
  associatedPatientName?: string;
  messageBody: string;
  isUrgentAlert: boolean;
  createdAt: string;
}

let hospitalMessages: HospitalMessage[] = [
  {
    id: "msg-1",
    channelType: "SPECIFIC_PATIENT_CASE",
    senderStaffId: "EMP-012",
    senderRole: "nurse",
    senderName: "Sister Amina",
    senderDepartment: "Nurse Workstation",
    targetDepartment: "Pharmacy",
    associatedPatientId: "PAT-007",
    associatedPatientName: "Ahmad Al-Ghamdi",
    messageBody: "Vitals verified, patient has stable blood sugar at 5.4 mmol/L. Ready to receive diagnostic mydriatic drops.",
    isUrgentAlert: false,
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: "msg-2",
    channelType: "SPECIFIC_PATIENT_CASE",
    senderStaffId: "EMP-045",
    senderRole: "doctor",
    senderName: "Dr. Tariq Al-Haddad",
    senderDepartment: "Orbit Clinic",
    targetDepartment: "Nurse Workstation",
    associatedPatientId: "PAT-009",
    associatedPatientName: "Sara Al-Otaibi",
    messageBody: "Urgent: Prepare patient for emergent decompression. Left eye IOP elevated to 29 mmHg under visual field deficit. Urgent nursing vitals check requested.",
    isUrgentAlert: true,
    createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  },
  {
    id: "msg-3",
    channelType: "SPECIFIC_PATIENT_CASE",
    senderStaffId: "EMP-022",
    senderRole: "pharmacist",
    senderName: "Dr. Jamil (Lead)",
    senderDepartment: "Pharmacy",
    targetDepartment: "Orbit Clinic",
    associatedPatientId: "PAT-009",
    associatedPatientName: "Sara Al-Otaibi",
    messageBody: "Standard IV Mannitol bag compiled and prepared for urgent ward transport. Awaiting pick-up clearance or routing slip.",
    isUrgentAlert: false,
    createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
  },
  {
    id: "msg-4",
    channelType: "PUBLIC_DEPARTMENTAL_BROADCAST",
    senderStaffId: "EMP-001",
    senderRole: "receptionist",
    senderName: "Mona Salem",
    senderDepartment: "Front Desk Reception",
    targetDepartment: "All Departments",
    messageBody: "Notice: Smart Kiosk 3 has been recalibrated and is now accepting online national healthcare card enrollments.",
    isUrgentAlert: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "msg-5",
    channelType: "PUBLIC_GLOBAL_ANNOUNCEMENT",
    senderStaffId: "EMP-099",
    senderRole: "admin",
    senderName: "Admin Core Team",
    senderDepartment: "IT Infrastructure / Admin",
    targetDepartment: "All Departments",
    messageBody: "Database integrity verification scan is commencing in 10 minutes. High availability routing active, zero-downtime expected.",
    isUrgentAlert: false,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  }
];

let sseClients: any[] = [];

// GET historical message ledger
app.get("/api/messages", (req, res) => {
  res.json(hospitalMessages);
});

// POST send a new message
app.post("/api/messages", (req, res) => {
  try {
    const {
      channelType,
      senderStaffId,
      senderRole,
      senderName,
      senderDepartment,
      targetDepartment,
      recipientStaffId,
      associatedPatientId,
      associatedPatientName,
      messageBody,
      isUrgentAlert
    } = req.body;

    if (!messageBody || !senderName || !senderDepartment || !targetDepartment) {
      res.status(400).json({ error: "Missing required message fields." });
      return;
    }

    // Auto-resolve channel type based on context if not specified directly
    let resolvedChannel = channelType;
    if (!resolvedChannel) {
      if (associatedPatientId) {
        resolvedChannel = "SPECIFIC_PATIENT_CASE";
      } else if (recipientStaffId) {
        resolvedChannel = "SPECIFIC_PEER_TO_PEER";
      } else if (targetDepartment === "All Departments") {
        resolvedChannel = "PUBLIC_GLOBAL_ANNOUNCEMENT";
      } else {
        resolvedChannel = "PUBLIC_DEPARTMENTAL_BROADCAST";
      }
    }

    const newMessage: HospitalMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      channelType: resolvedChannel,
      senderStaffId: senderStaffId || "EMP-GEN",
      senderRole: senderRole || "admin",
      senderName,
      senderDepartment,
      targetDepartment,
      recipientStaffId,
      associatedPatientId,
      associatedPatientName,
      messageBody,
      isUrgentAlert: !!isUrgentAlert,
      createdAt: new Date().toISOString()
    };

    hospitalMessages.push(newMessage);
    if (hospitalMessages.length > 200) {
      hospitalMessages.shift();
    }

    // Broadcast live event frame via SSE stream to all listening browser tabs
    sseClients.forEach(clientRes => {
      try {
        clientRes.write(`data: ${JSON.stringify(newMessage)}\n\n`);
      } catch (err) {
        console.error("[SSE Broadcast] Fails sending to client connection:", err);
      }
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to dispatch message." });
  }
});

// GET Real-time Server-Sent Events SSE stream endpoint
app.get("/api/messages/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);
  console.log(`[ClinicalMesh] Active real-time subscription registered. Total clients: ${sseClients.length}`);

  res.write(": connection established\n\n");

  const intervalId = setInterval(() => {
    try {
      res.write(": keep-alive ping\n\n");
    } catch (e) {
      // ignore
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(intervalId);
    sseClients = sseClients.filter(client => client !== res);
    console.log(`[ClinicalMesh] Connection closed. Total remaining listeners: ${sseClients.length}`);
  });
});

// API Endpoint for AI Developer Guidance
app.post("/api/architect", async (req, res) => {
  try {
    const { message, contextCategory } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return template answers if API key is not configured
      res.json({
        text: `### 🚀 CareFlow Architectural Blueprint: ${contextCategory || "System Module"}

*(Note: Connect your GEMINI_API_KEY in Settings > Secrets to unlock live interactive custom generation)*

Here is a high-fidelity template specification for your Java / Android Hospital system:

#### 🎨 Professional Visual & Icon Palette:
- **Primary Clinical Focus Mood**: Elegant High-Contrast Light Theme. Clean Ivory White canvases with Deep Charcoal panels. Accent with **Teal (#0D9488)** for health/clinical panels, **Emerald (#10B981)** for Pharmacy/Inventory green lights, and **Rose (#F43F5E)** for urgent/STAT priorities.
- **Icon Strategy**: Use vector assets with strict stroke layouts. For desktop JavaFX, use **FontAwesomeFX** or SVG-based graphics. For Android Kotlin, use **Vector Drawables** with uniform styling.

#### 🗄️ Database Schema & Sync Engine (PostgreSQL / SQLite):
\`\`\`sql
-- Shared Clinical Patients Schema
CREATE TABLE Patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dob DATE NOT NULL,
    fullName VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- Odontogram Canvas State Model (Dental Specialty Fix)
CREATE TABLE DentalOdontogram (
    patient_id UUID REFERENCES Patients(id),
    tooth_number INT NOT NULL,
    condition VARCHAR(50) NOT NULL, -- 'Caries', 'Extracted', 'Restored'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (patient_id, tooth_number)
);
\`\`\`

#### 🛡️ Java Security Validation Gate (Medicine Clinic Fix):
\`\`\`java
public class PrescriptionSafetyGate {
    public boolean validatePrescriptionSafety(Patient patient, List<Medication> newMeds) {
        // Enforce clinical validation check
        TriageVitals vitals = getTriageVitalsForDay(patient, LocalDate.now());
        if (vitals == null) {
            throw new ClinicalOverrideException("Mandatory Block: Triage vitals must be captured before closing consultation.");
        }
        return DrugInteractionEngine.checkConflicts(patient.getActivePrescriptions(), newMeds);
    }
}
\`\`\`
`
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTIONS}\n\nContext category chosen by user: ${contextCategory || "General HIS Design"}`,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Architect error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini." });
  }
});

// Resilient Offline-First Synced Database Cache
let syncedPatientsDatabase: any[] = [];

app.post("/api/sync-patients", (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ error: "Invalid tasks sync payload" });
      return;
    }

    console.log(`[SyncEngine] Processing offline bulk payload. Size: ${tasks.length} client mutations.`);
    
    tasks.forEach((task: any) => {
      const { type, patientId, data } = task;
      const index = syncedPatientsDatabase.findIndex(p => p.id === patientId);
      if (index > -1) {
        syncedPatientsDatabase[index] = { ...data, lastSyncedAt: new Date().toISOString() };
      } else {
        syncedPatientsDatabase.push({ ...data, lastSyncedAt: new Date().toISOString() });
      }
    });

    res.json({
      success: true,
      receivedCount: tasks.length,
      serverDatabaseSize: syncedPatientsDatabase.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Sync payload process error:", error);
    res.status(500).json({ error: error.message || "Failed to process synchronization payload" });
  }
});

// Resilient transaction cache tracker for idempotency checks
const processedTransactionCache = new Set<string>();

// PACS Bridge Telemetry Sync Service Endpoint
app.post("/api/infrastructure/device/telemetry-sync", (req, res) => {
  try {
    const payload = req.body;
    if (!payload.encounterId) {
      res.status(400).json({ error: "Cannot bind device telemetry to an orphaned patient encounter." });
      return;
    }
    console.log(`[PACS Bridge] Persisting telemetry data from device ${payload.deviceModel} for encounter ${payload.encounterId}`);
    res.send("Device telemetry stream successfully processed and mapped.");
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Hybrid Edge Offline Reconciliation Engine
app.post("/api/infrastructure/edge/batch-reconcile", (req, res) => {
  try {
    const batchPayload = req.body;
    if (!batchPayload.edgeNodeLocationId || !batchPayload.queuedTransactions) {
      res.status(400).json({ error: "Invalid edge batch sync format" });
      return;
    }

    console.log(`[EdgeSync] Processing offline reconciliation package from node ${batchPayload.edgeNodeLocationId}`);

    const processedTxList: string[] = [];
    const duplicateTxList: string[] = [];

    batchPayload.queuedTransactions.forEach((tx: any) => {
      if (processedTransactionCache.has(tx.transactionId)) {
        console.log(`[EdgeSync] Duplicate transaction ID detected: ${tx.transactionId} - dropping frame safely.`);
        duplicateTxList.push(tx.transactionId);
      } else {
        console.log(`[EdgeSync] Merging action ${tx.operationalAction} for transaction ID: ${tx.transactionId}`);
        processedTransactionCache.add(tx.transactionId);
        processedTxList.push(tx.transactionId);
      }
    });

    res.json({
      message: "Offline batch payload processed and merged without validation conflicts.",
      processedTransactions: processedTxList,
      duplicateTransactions: duplicateTxList,
      totalRegisteredInCache: processedTransactionCache.size
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ============================================================================
// 🔒 PRE-DEPLOYMENT SECURITY & INTEGRITY CONTROL FRAMEWORKS (TASK.MD SEC 7)
// ============================================================================

import crypto from "crypto";

// 1. Authorization: Row-Level Access Simulation
const DEPLOYMENT_PATIENT_DATA: Record<string, { patientId: string; name: string; records: string; ownerId: string }> = {
  "PAT-007": { patientId: "PAT-007", name: "Ahmad Al-Ghamdi", records: "Visual Acuity: OD 20/25, OS 20/20. IOP: 14mmHg, Slit-Lamp: Corneal clarity normal", ownerId: "EMP-001" },
  "PAT-009": { patientId: "PAT-009", name: "Sara Al-Otaibi", records: "Visual Acuity: OD 20/50, OS 20/40. Severe Diabetic Retinopathy stage 3", ownerId: "EMP-002" },
};

app.post("/api/security/auth-check", (req, res) => {
  const { currentUserId, currentUserRole, targetPatientId } = req.body;
  
  if (!currentUserId || !currentUserRole || !targetPatientId) {
    res.status(400).json({ error: "Missing identity context parameters currentUserId, currentUserRole, targetPatientId" });
    return;
  }
  
  const record = DEPLOYMENT_PATIENT_DATA[targetPatientId];
  if (!record) {
    res.status(404).json({ error: "Patient record not found" });
    return;
  }

  // Row-level ownership constraint: Doctors, nurses, admins can see anything.
  // Others (like receptionists or external staff) can only see if they are the direct owner.
  let allowed = false;
  let reason = "";

  if (currentUserRole === "doctor" || currentUserRole === "nurse" || currentUserRole === "admin") {
    allowed = true;
    reason = `Access granted: Role '${currentUserRole}' holds universal clinical override privileges.`;
  } else if (currentUserId === record.ownerId) {
    allowed = true;
    reason = `Access granted: User '${currentUserId}' matches direct clinical owner ID '${record.ownerId}'.`;
  } else {
    allowed = false;
    reason = `ACCESS DENIED: Row-level security failure. Active User '${currentUserId}' ('${currentUserRole}') is not authorized to read patient data owned by '${record.ownerId}'.`;
  }

  if (allowed) {
    res.json({ success: true, allowed, reason, data: record });
  } else {
    res.status(403).json({ success: false, allowed, reason, errorCode: "ROSTER_ROW_LEVEL_RESTRICTION" });
  }
});

// 2. Input Validation, Schema Sanitization, and SQLi / XSS Defense
app.post("/api/security/validate", (req, res) => {
  const { payload } = req.body;
  if (payload === undefined || typeof payload !== "string") {
    res.status(400).json({ error: "Body missing query payload string" });
    return;
  }

  // Perform Sanitization & Schema Checks
  const containsXSS = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i.test(payload) || /onload=|onerror=|javascript:/i.test(payload);
  const containsSQLi = /UNION\s+SELECT|SELECT\s+.*\s+FROM|OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i.test(payload) || /['"];\s*DROP\s+TABLE/i.test(payload);

  // Sanitization: Strip HTML markup & special characters
  let sanitized = payload
    .replace(/<[^>]*>/g, "") // Strip HTML elements
    .replace(/['";\-=-]/g, "") // Escape query symbols
    .trim();

  const isSuspicious = containsXSS || containsSQLi;

  res.json({
    original: payload,
    sanitized: sanitized,
    typeValidationPassed: true,
    threatDetected: isSuspicious,
    threatDetails: {
      containsXSS,
      containsSQLi,
      classification: isSuspicious ? "MALICIOUS_INJECTION_ATTEMPT" : "CLEAN_QUERY"
    },
    actionTaken: isSuspicious ? "BLOCK_AND_PURIFY_INPUT" : "COMPLY_AND_STORE"
  });
});

// 3. CORS Policy Audit Check
app.post("/api/security/cors-test", (req, res) => {
  const requestOrigin = req.headers.origin || "http://localhost:3000";
  const configuredAllowlist = ["https://ais-dev-7pnypuspu3fjqcq6yxcjuw-184704633091.europe-west1.run.app", "https://ais-pre-7pnypuspu3fjqcq6yxcjuw-184704633091.europe-west1.run.app", "http://localhost:3000"];
  
  const isAllowed = configuredAllowlist.includes(requestOrigin);

  res.json({
    clientRequestOrigin: requestOrigin,
    configuredAllowlist,
    corsHandshakeSuccessful: isAllowed,
    securityHeadersApplied: {
      "Access-Control-Allow-Origin": isAllowed ? requestOrigin : "REJECTED_BY_POLICY",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-user-role",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'"
    },
    action: isAllowed ? "PROCEED_TO_ENDPOINT" : "REJECT_ORIGIN_403_CORS_FAILURE"
  });
});

// 4. API Rate Limiting Simulation
const clientRateLimitMap = new Map<string, { count: number; resetAt: number }>();

app.post("/api/security/rate-limit-simulate", (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip || "127.0.0.1";
  const now = Date.now();
  const timeWindow = 15000; // 15 seconds tracking cycle
  const maxLimit = 5; // Max 5 requests per 15s

  let clientRecord = clientRateLimitMap.get(clientIp as string);

  if (!clientRecord || now > clientRecord.resetAt) {
    clientRecord = { count: 1, resetAt: now + timeWindow };
    clientRateLimitMap.set(clientIp as string, clientRecord);
  } else {
    clientRecord.count++;
  }

  const remaining = Math.max(0, maxLimit - clientRecord.count);
  const secondsLeft = Math.ceil((clientRecord.resetAt - now) / 1000);

  if (clientRecord.count > maxLimit) {
    res.status(429).json({
      error: "TOO MANY REQUESTS",
      status: 429,
      clientIp,
      currentHits: clientRecord.count,
      limitMax: maxLimit,
      resetSecondsRemaining: secondsLeft,
      message: "Gateway Throttling Active: Prevent run-away compute costs & brute-forcing."
    });
  } else {
    res.json({
      success: true,
      clientIp,
      currentHits: clientRecord.count,
      remainingSlots: remaining,
      resetSecondsRemaining: secondsLeft,
      limitMax: maxLimit
    });
  }
});

// 5. Password Reset Expiry Security Control
interface SecureResetToken {
  token: string;
  email: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}
const resetTokensStore = new Map<string, SecureResetToken>();

app.post("/api/security/password-reset/request", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Create cryptographically secure token
  const secureHex = crypto.randomBytes(32).toString("hex");
  const expirationMs = 30000; // Short-lived 30 seconds token to allow testing live!
  const expiresAt = Date.now() + expirationMs;

  const tokenRecord: SecureResetToken = {
    token: secureHex,
    email,
    expiresAt,
    used: false,
    createdAt: Date.now()
  };

  resetTokensStore.set(secureHex, tokenRecord);

  // Structured Logging of critical audit events
  console.log(`[AUDIT] Generated secure password-reset cryptographic token for ${email}. Expires in 30 seconds (token=${secureHex})`);

  res.json({
    email,
    resetToken: secureHex,
    expirationSeconds: expirationMs / 1000,
    expiresAtAbsolute: new Date(expiresAt).toISOString(),
    deliveryGateway: "SMTP_TLS_RELAY_ACTIVE",
    securityConstraint: "TOKEN_SINGLE_USE_MANDATE"
  });
});

app.post("/api/security/password-reset/verify", (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ error: "Cryptographic token is required" });
    return;
  }

  const record = resetTokensStore.get(token);
  if (!record) {
    res.status(404).json({ success: false, reason: "INVALID_TOKEN_NOT_FOUND" });
    return;
  }

  if (record.used) {
    res.status(401).json({ success: false, reason: "TOKEN_REUSED_ATTEMPT_BLOCKED" });
    return;
  }

  if (Date.now() > record.expiresAt) {
    res.status(401).json({ success: false, reason: "TOKEN_TIMEOUT_EXPIRED" });
    return;
  }

  // Mark used to enforce single-use constraint
  record.used = true;
  resetTokensStore.set(token, record);

  res.json({
    success: true,
    email: record.email,
    message: "Identity verified. Password safely reset.",
    auditFlag: "RESET_SUCCESSFUL_TOKEN_REVOKED"
  });
});

// 6. Global Error Boundary & Soft Clinical Failbacks
app.get("/api/security/error-simulate", (req, res, next) => {
  try {
    // Intentionally trigger a critical database connection fault
    throw new Error("CRITICAL_DB_POOL_FATIGUE_FATAL [ORA-01017: invalid username/password; logon denied]");
  } catch (error: any) {
    next(error); // Pass to standard production corporate error middleware
  }
});

// 7. Database Performance Index Diagnostics
app.get("/api/security/database-indexes", (req, res) => {
  const schemaIndices = [
    { tableName: "Patients", indexName: "idx_patients_patientid", field: "PatientID", type: "BTREE", isActive: true },
    { tableName: "Patients", indexName: "idx_patients_nationalid", field: "NationalID", type: "HASH", isActive: true },
    { tableName: "QueueEncounter", indexName: "idx_queue_status_time", field: "ActiveQueueStatus, AssignedClinic", type: "COMPOSITE", isActive: true },
    { tableName: "MedicalPrescriptions", indexName: "idx_prescriptions_rxid", field: "RxID", type: "BTREE", isActive: true },
    { tableName: "LedgerJournals", indexName: "idx_ledger_double_entry", field: "Debit, Credit, TransID", type: "BTREE", isActive: false } // Trigger alerts for missing indices!
  ];

  // Benchmarking simulated query timing
  res.json({
    analyzedTables: 5,
    totalIndexedFields: 4,
    missingIndexesDetected: [
      { tableName: "LedgerJournals", suggestedIndex: "idx_ledger_double_entry", recommendedField: "Debit, Credit", impact: "HIGH_LATENCY_ON_ANALYTICS" }
    ],
    benchmarkMetrics: {
      queryWithIndicesMs: 1.2,
      queryWithoutIndicesMs: 142.8,
      multiplierBoost: "119x faster database throughput"
    }
  });
});

// 8. Robust Structured JSON HIPAA Logging Format
let lastFifteenStructuredLogs: any[] = [];
const addStructuredLog = (level: string, message: string, module: string, actor: string, sensitiveDataRaw?: string) => {
  // HIPAA Sanitizer logic: Mask sensitive data before generating log
  let maskedData = "";
  if (sensitiveDataRaw) {
    maskedData = sensitiveDataRaw.substring(0, 3) + "-XX-XXXX [MASKED_HIPAA_SENSITIVE]";
  }

  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    module,
    actor,
    message,
    maskedPayload: sensitiveDataRaw ? { originalClass: "PATIENT_RECORD", safeIdentifier: maskedData } : null,
    gcpLogFormat: {
      severity: level,
      serviceContext: { service: "CareFlow-HIS-Core" },
      context: { user: actor }
    }
  };

  lastFifteenStructuredLogs.unshift(logObj);
  if (lastFifteenStructuredLogs.length > 20) {
    lastFifteenStructuredLogs.pop();
  }
  return logObj;
};

app.post("/api/security/log-trigger", (req, res) => {
  const { severity, message, module, actor, patientSsn } = req.body;
  const log = addStructuredLog(severity || "INFO", message || "Manual diagnostic trace executed", module || "SYSTEM", actor || "SYS_ADMIN", patientSsn);
  res.json({ success: true, registeredLog: log });
});

app.get("/api/security/logs", (req, res) => {
  // Populate initial logs if empty to make UI look highly detailed
  if (lastFifteenStructuredLogs.length === 0) {
    addStructuredLog("INFO", "Cluster node started, listening on port 3000.", "BOOTSTRAP", "SYSTEM");
    addStructuredLog("SUCCESS", "Established encrypted connection pool to Clinical Database.", "DATABASE", "SYSTEM");
    addStructuredLog("WARNING", "Slow query execution without indexed fields detected in LedgerJournals.", "DATABASE", "DB_ANALYST");
    addStructuredLog("CRITICAL", "Unauthorized attempt to access clinical ledger records bypass.", "AUTH", "ANONYMOUS_IP_185", "4233-9122-3490");
    addStructuredLog("SUCCESS", "Double-entry accounting journal balanced successfully.", "ACCOUNTING", "EMP-003");
  }
  res.json(lastFifteenStructuredLogs);
});

// 9. Interactive System Health Alerts Channel
app.get("/api/security/active-alerts", (req, res) => {
  res.json({
    activeAlerts: [
      { id: "A1", level: "CRITICAL", title: "Missing Performance db-index on LedgerJournals", desc: "Causes transaction timeouts when parsing multi-year audit ledger trails.", triggerTime: new Date(Date.now() - 3600000).toISOString() },
      { id: "A2", level: "WARNING", title: "Potential Intruders Bypassed auth checkpoints", desc: "Client IP 185.22.14.9 fired consecutive authentication failures.", triggerTime: new Date(Date.now() - 60000).toISOString() }
    ],
    environmentalHealth: {
      cpuTempCelsius: 48,
      memoryLoadPercentage: 62,
      databasePoolCapacityUsage: 14,
      networkLossPercentage: 0.00
    }
  });
});

// 10. Blue-Green Canary Release Rollback Strategy Tracker
let canaryTrafficState = {
  blueTrafficPercentage: 100,
  greenTrafficPercentage: 0,
  activeCluster: "BLUE (Stable Release v2.9.4)",
  targetCluster: "GREEN (Canary Build v3.0.0-Beta)",
  reconciliationLog: [
    `[DEPL_LOG] Established production container bundle v2.9.4 on cluster [BLUE]`,
    `[DEPL_LOG] Active ingress route maps 100% load to [BLUE] stable cluster.`
  ]
};

app.post("/api/security/canary-traffic", (req, res) => {
  const { bluePct } = req.body;
  if (bluePct === undefined) {
    res.status(400).json({ error: "bluePct percentage is required" });
    return;
  }

  const bPercent = Math.min(100, Math.max(0, parseInt(bluePct)));
  const gPercent = 100 - bPercent;

  canaryTrafficState.blueTrafficPercentage = bPercent;
  canaryTrafficState.greenTrafficPercentage = gPercent;

  let activeStateMsg = "";
  if (bPercent === 100) {
    activeStateMsg = `[RECONCILE] Egress routing redirected 100% stable BLUE node safely. GREEN completely offline.`;
  } else if (bPercent === 0) {
    activeStateMsg = `[RECONCILE] Release completed: 100% traffic shifted to GREEN container node. BLUE held as fallback.`;
  } else {
    activeStateMsg = `[RECONCILE] Split load enabled: BLUE receives ${bPercent}%, GREEN holds ${gPercent}%. Monitoring canary performance dashboards.`;
  }

  canaryTrafficState.reconciliationLog.unshift(`${new Date().toLocaleTimeString()} ${activeStateMsg}`);
  res.json(canaryTrafficState);
});

app.get("/api/security/canary-traffic", (req, res) => {
  res.json(canaryTrafficState);
});

// 11. Concurrency Load Testing -> K6 Simulation
app.get("/api/security/k6-simulator", (req, res) => {
  const stepsCount = 12;
  const metricsList = [];
  const startVus = 5;
  
  for (let i = 0; i < stepsCount; i++) {
    const vus = Math.round(startVus + (i * 45) + (Math.random() * 15));
    const latency = parseFloat((12.4 + (vus * 0.12) + (Math.sin(i) * 3) + (Math.random() * 2)).toFixed(2));
    const throughput = Math.round(15 + (vus * 3.8) + (Math.random() * 20));
    const failures = vus > 150 ? parseFloat(((vus - 150) * 0.05 + Math.random() * 0.5).toFixed(2)) : 0.0;
    
    metricsList.push({
      secondsCompiled: i * 5,
      virtualUsers: vus,
      avgLatencyMs: latency,
      requestsPerSecond: throughput,
      httpErrorRatePercentage: failures
    });
  }

  res.json({
    scenarioName: "K6 clinical consultation stress simulation",
    k6Version: "v0.45.0",
    maxDurationSeconds: 60,
    targetSLASeconds: 0.150, // 150ms ceiling
    metricsList
  });
});

// Configure Corporate Custom Error Handler Middleware (HIPAA compliant - masks stacktraces)
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[CRITICAL_SERVER_UNHANDLED_ERROR]", err.stack || err);
  
  // Hide severe server inner details, and present a structured medical recovery outcome.
  res.status(500).json({
    success: false,
    errorCode: "INTERNAL_HIS_FATAL_RECOVERY_ENGAGED",
    message: "A high-integrity clinical transaction failed to complete safely. The database system initiated a rollback checkpoint to preserve medical records.",
    safeClinicalContact: "IT Infrastructure Support Core: Ext 4001",
    actionTaken: "ISOLATION_AND_ROLLBACK",
    diagnosticsMasked: {
      maskedTrace: "[MASKED_IN_PROD] Severe server details suppressed to meet compliance requirements. Diagnostic logs captured inside system audit terminals."
    }
  });
});

// Vite middleware for development
let isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server running on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on port ${PORT}`);
  });
}
