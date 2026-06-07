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
