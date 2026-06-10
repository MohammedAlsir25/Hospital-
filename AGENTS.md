# Ophthalmic EHR & ERP Billing System - Agent Directives (AGENTS.md)

This file contains persistent project rules, aesthetic guidelines, and architecture constraints for Google AI Studio coding agents. All future edits to this codebase **MUST** align with and respect these specifications.

---

## 🎨 Creative Theme Paradigm: Selected Premium wellness clinical (Option 2 Redefined)
We have custom-designed a high-end, premium look that swaps harsh blue light for warm, soft milk and golden-hour tones to shape the main brand identity. All components must adhere strictly to these color tokens:

### 1. Color Palette Tokens (Defined in `src/index.css`)
- **Light Mode (Eye-safe Warm Milk & Alabaster Cream)**:
  - Canvas background (60%): `#FBFBF9` (Alabaster Cream) - softens the entire screen's backlight emission, drastically reducing optic fatigue.
  - Card Structures (30%): `#FFFFFF` (Pure White) outlined with an ultra-fine, warm-tinted border (`#EAE6DF`).
  - Tactile Accents (10%): `#4F46E5` (Vibrant Indigo-Violet) to make clickable items immediately obvious, paired with deep slate and charcoal for text (`#0F172A`).
  - Warm golden hour highlights: `#F59E0B` (Amber gold accents).
- **Dark Mode (Deep Luxury Clinical Navy & Charcoal)**:
  - Canvas background: `#0B0E14` (Comprises 60% of layout).
  - Cards background: `#121520` (Comprises 30%).
  - Sidebar background: `#0E1019` (Deeper luxury navy contrast).
  - Custom accents: Electric core blue `#2BBFFF` & `#0066FF`.

### 2. Micro-Animations & Tactility Specs
- **Hover Glow Effects**: Grid cards must implement a subtle 300ms transition with selective outer glow box-shadowing on hover to convey high-fidelity premium engineering:
  - `hover:shadow-[0_0_30px_rgba(79,70,229,0.1)]`
  - `hover:border-[#4F46E5]/30`
- **Active Click Press**: All clickable action buttons should scale slightly down (`active:scale-[0.98]`) utilizing ease-out cubic-bezier curves matching Apple HIG guidelines.

---

## 🚀 Structural Layout & Scope Policies

### 1. Strictly Anti-Telemetry & Anti-Slop (No Larping)
- **Do NOT** clutter the interface margins with unrequested status bars, simulated container port lines (e.g., `PORT: 3000`), or terminal logs (`SYSTEM_ONLINE`, `CORE_NODE`).
- Use humble, polite, and literal labels (e.g., "Dental Clinics", "Billing System") rather than dramatic names.

### 2. Multi-Language & RTL Adaptations
- Our application supports unified English (LTR) and Arabic (RTL) localization.
- When generating headers, tables, or item rows, NEVER hardcode layout directions. Respect the active language state and use conditional styles (e.g. `flex-row-reverse`, `text-right` matching context) where applicable.

### 3. Typography Guidelines
- **Sans-serif (Western)**: Pair `"Outfit"` for display elements with `"Inter"` for descriptive UI data.
- **Arabic UI**: Maintain `"Cairo"` to render beautifully balanced typographic leading.
- **Data Displays**: Standardize numerical lists or audit timestamps with `"JetBrains Mono"` to ensure numeric tabular alignment.

---

## 🛠️ Verification & Quality Gates
Before notifying the user that a milestone has been completed, you must:
1. Run `npm run lint` (`lint_applet` tool) to verify strict TypeScript compilation.
2. Run `npm run build` (`compile_applet` tool) to guarantee zero runtime failures or module resolve anomalies.
