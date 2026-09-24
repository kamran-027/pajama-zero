# Original User Request

## Initial Request — 2026-09-24T18:24:00Z

<USER_REQUEST>
Build PajamaZero, an autonomous clinical in-basket triage and delegation engine powered by JEV (TypeSafe AI System One decision model) and LangGraph that classifies, scores, and routes patient portal messages in sub-100ms to eliminate physician "Pajama Time".

Working directory: /Users/kamran/Projects/pajama-zero
Integrity mode: development

## Requirements

### R1. Deterministic Clinical Triage Engine (JEV & LangGraph)
Ingest patient portal messages and classify them into 5 distinct clinical lanes (01_EMERGENCY_DIVERT, 02_STAFF_DELEGATE, 03_CONVERT_TO_VISIT, 04_PHYSICIAN_REVIEW, 05_AUTO_RESOLVE) with a calibrated clinical acuity score (1–10) and a strict requires_physician_license boolean flag. Must support TypeSafe AI / OpenRouter API calls with a zero-dependency deterministic local fallback engine.

### R2. High-Performance API & Batch Ingestion
Deliver a FastAPI backend providing endpoints for single-message real-time evaluation with sub-millisecond stopwatch telemetry, batch triage of daily patient inbox queues (15–50 messages), and pre-loaded clinical cases reflecting realistic physician in-basket complaints.

### R3. Clinical Command Center Dashboard
Deliver a responsive, high-contrast Next.js 15 / React clinical web dashboard displaying a 5-lane Kanban queue, live latency & cost counters vs. GPT-4, pre-loaded realistic clinical scenarios, and an interactive message runner.

### R4. Automated Verification Suite
Provide an automated programmatic verification test script that evaluates triage accuracy, measures millisecond latency across all test cases, and verifies that zero emergency cases are misrouted.

## Acceptance Criteria

### Clinical Safety & Classification
- [ ] Emergency scenarios (e.g., crushing chest pain, acute stroke symptoms) are classified into 01_EMERGENCY_DIVERT with Acuity >= 9 in under 100ms.
- [ ] Routine admin requests (parking, work notes, simple refills) are routed to 02_STAFF_DELEGATE with requires_physician_license = false.
- [ ] Non-clinical messages ("Thank you!") are routed to 05_AUTO_RESOLVE.
- [ ] High-acuity clinical decisions (abnormal biopsy, critical hyperkalemia) are routed to 04_PHYSICIAN_REVIEW with requires_physician_license = true.

### Performance & Deflection
- [ ] Average evaluation latency is logged and verified at under 100ms per message.
- [ ] Batch processing of 15 clinical presets demonstrates a physician inbox deflection rate of >= 70%.

### End-to-End System Integration
- [ ] Backend runs on port 8000 and passes automated test verification.
- [ ] Frontend runs on port 3000, connects to backend, renders all 5 lanes, and allows real-time interactive message testing.

</USER_REQUEST>
