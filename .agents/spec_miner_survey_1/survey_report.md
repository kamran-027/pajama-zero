# Authoritative Clinical Triage & Delegation Specification

**Project:** PajamaZero — Autonomous Clinical In-Basket Triage & Delegation Engine  
**Author:** Clinical Spec Investigator (Domain Expert)  
**Date:** 2026-09-24  
**Integrity Mode:** Development  

---

## 1. Executive Summary

Physician burnout driven by electronic health record (EHR) inbox overload—clinically termed **"Pajama Time"** (the 1.5 to 2 hours of uncompensated administrative messaging physicians perform late at night)—is an acute crisis in healthcare systems worldwide.

PajamaZero delivers an autonomous clinical triage and delegation engine powered by a dual-mode decision engine: **JEV (TypeSafe AI System One decision model)** with an offline-capable, zero-dependency **Deterministic Local Fallback Engine**. The engine evaluates incoming patient portal messages with high-resolution stopwatch telemetry in **sub-100ms** (local engine running in <1ms), routing them into 5 distinct clinical lanes, calculating a calibrated **Acuity Score (1–10)**, evaluating a strict **`requires_physician_license`** boolean flag, and achieving an inbox **deflection rate >= 70%** (specifically 80.0% across the 15 clinical presets).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Core Triage | 5-Lane Classification | Categorizes messages into 5 discrete clinical handling queues | `PatientMessage` (subject, body, history, meds) | `lane: ClinicalLane` enum (`01_EMERGENCY_DIVERT` to `05_AUTO_RESOLVE`) | Defaults to `04_PHYSICIAN_REVIEW` on ambiguous clinical ambiguity | `ORIGINAL_REQUEST.md`, `schemas.py` |
| 2 | Clinical Safety | Acuity Score Calibration | Calibrated integer scoring from 1 (lowest) to 10 (life-threatening) | Symptom severity, vital signs, red flags, acuity heuristics | `acuity_score: int` (1..10) | Constrained by Pydantic `ge=1, le=10` | `ORIGINAL_REQUEST.md`, `schemas.py` |
| 3 | Legal / Scope | `requires_physician_license` Flag | Strict boolean indicating if state medical license (MD/DO) is legally mandated | Clinical intervention level, prescriptive authority needed | `requires_physician_license: bool` | Fails safe to `true` if complex diagnostic interpretation needed | `ORIGINAL_REQUEST.md`, `schemas.py` |
| 4 | Operational | Deflection Rate Calculation | Computes percentage of inbox volume successfully diverted from physician queue | Set of triaged messages | `physician_deflection_rate: float` (0.0 to 1.0) | Returns 0.0 if empty list; target >= 0.70 | `ORIGINAL_REQUEST.md`, `schemas.py` |
| 5 | Performance | Sub-100ms Stopwatch Telemetry | Measures end-to-end classification latency with microsecond precision | Monotonic clock before & after triage execution | `latency_ms: float`, `average_latency_ms: float` | Fallback to wall-clock time if monotonic clock fails | `ORIGINAL_REQUEST.md`, `schemas.py` |
| 6 | Engine Resilience | Dual-Mode Hybrid Architecture | Remote TypeSafe AI / OpenRouter API with zero-dependency deterministic local fallback | API Key, `PatientMessage` | `JevTriageResult` | Failover to local deterministic rules on network timeout, 429, or missing key | `ORIGINAL_REQUEST.md` R1 |
| 7 | Clinical Testing | 15 Clinical Presets Registry | Standardized gold-standard clinical scenarios covering all 5 lanes | Preset ID or queue request | Array of 15 `PatientMessage` items with known targets | Hardcoded static fallback registry | `backend/app/presets.py` |
| 8 | Batch Processing | Queue Batch Ingestion | Ingests 15–50 patient messages simultaneously for morning inbox clearance | `List[PatientMessage]` | `BatchTriageResponse` with distributions and cost calculations | Partial failure isolation per message | `ORIGINAL_REQUEST.md` R2, `schemas.py` |
| 9 | Economic Telemetry | Cost & Time Savings Tracker | Computes token cost vs GPT-4 and minutes of pajama time saved | Message token length, deflection count | `token_cost_usd`, `estimated_gpt4_cost_usd`, `pajama_time_saved_minutes` | Defaults to zero if tokens unavailable | `schemas.py` |
| 10 | Action Delegation | Pre-Drafted Action & Delegated To | Generates role-based recipient and pre-drafted clinical order or response | Lane, clinical rationale, message content | `delegated_to: str`, `action_plan: str`, `pre_drafted_action: str` | Generates standard fallback template | `schemas.py` |
| 11 | UI Integration | Lane Badge & Visual Semantics | Visual styling metadata (colors, badges, icons) for 5-lane Kanban board | Selected `ClinicalLane` | `lane_badge_color: str`, `lane_title: str` | Defaults to neutral gray | `schemas.py` |
| 12 | Health & Telemetry | System Statistics Endpoint | Reports engine status, latency averages, and deflection capability | HTTP GET request | `SystemStatsResponse` | HTTP 500 with degraded health report | `schemas.py` |

---

## 3. Edge Cases & Boundary Handling

| # | Feature | Input Scenario | Observed & Required Behavior |
|---|---------|----------------|------------------------------|
| 1 | Emergency Divert | Patient reports chest tightness starting during yard work, radiating to jaw | Immediate divert to `01_EMERGENCY_DIVERT`, Acuity 10. `requires_physician_license=false` because immediate 911 dispatch takes precedence over asynchronous physician review. |
| 2 | Emergency Divert | Acute focal neurological signs (slurred speech, unilateral arm numbness) for 30 min | Immediate divert to `01_EMERGENCY_DIVERT`, Acuity 10. Brain ischemia window requires 911 stroke alert, not physician inbox queuing. |
| 3 | Auto-Resolve | Patient writes "Thank you! Drops worked", with no secondary complaints | Classified into `05_AUTO_RESOLVE`, Acuity 1, `requires_physician_license=false`. Automated acknowledgment and EMR archive. |
| 4 | Auto-Resolve Trap | Patient writes "Thank you for the refill, but my shortness of breath is worse" | Compound intent detected: "Thank you" overridden by respiratory symptom red flag. Escapes `05_AUTO_RESOLVE` and diverts to `01_EMERGENCY_DIVERT` or `04_PHYSICIAN_REVIEW`. |
| 5 | Staff Delegate | Patient submits routine weekly home blood pressure log (all normal 130s/80s) | Routed to `02_STAFF_DELEGATE`, Acuity 2, `requires_physician_license=false`. Vitals flow-sheet entry assigned to Medical Assistant. |
| 6 | Staff Delegate Trap | Patient submits home blood pressure log showing BP 220/125 with blurry vision | Hypertensive urgency/crisis detected: escalated immediately to `01_EMERGENCY_DIVERT` (Acuity 9) instead of staff delegation. |
| 7 | Convert to Visit | Patient requests new high-potency GLP-1 weight loss drug (Wegovy) without prior workup | Routed to `03_CONVERT_TO_VISIT`, Acuity 3, `requires_physician_license=false`. New systemic prescription cannot be initiated without baseline exam/labs. |
| 8 | Convert to Visit | Patient reports 4-day swollen knee after pickleball, asking for pain prescription | Routed to `03_CONVERT_TO_VISIT`, Acuity 4, `requires_physician_license=false`. Traumatic joint injury requires physical exam and imaging. |
| 9 | Physician Review | Biopsy report uploaded showing high-grade cervical dysplasia (CIN-3) with positive margins | Routed to `04_PHYSICIAN_REVIEW`, Acuity 7, `requires_physician_license=true`. Histopathology disclosure and surgical planning mandate licensed physician. |
| 10 | Physician Review | Lab result showing critical hyperkalemia (K 5.7) in heart failure patient on Lisinopril/Spironolactone | Routed to `04_PHYSICIAN_REVIEW`, Acuity 8, `requires_physician_license=true`. Lethal arrhythmia risk requires physician medication hold and stat repeat labs. |
| 11 | Physician Review | Post-op lap cholecystectomy day 4 with fever 101.3, purulent malodorous discharge | Routed to `04_PHYSICIAN_REVIEW`, Acuity 8, `requires_physician_license=true`. Surgical site infection requires surgical decision and prescription antibiotics. |
| 12 | Dual-Mode Fallback | Remote OpenRouter API responds with HTTP 429 (Rate Limit) or HTTP 504 (Timeout) | Seamless failover to deterministic local rule engine; returns complete `JevTriageResult` in <5ms without raising 500 error to user. |
| 13 | Deflection Calculation | Inbox queue contains zero messages | Deflection rate calculation returns `0.0` (zero division protection), total latency returns `0.0ms`. |
| 14 | License Flag Rigor | Staff administrative tasks (parking, work note, superbill) | `requires_physician_license` strictly evaluated as `false` across all clerical tasks. |

---

## 4. Deep Specification of the 5 Clinical Lanes

```
+----------------------------------------------------------------------------------------------------+
|                                      INCOMING PATIENT MESSAGE                                      |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
                     +----------------------------------------------------------+
                     | 1. Immediate Life Safety Threat / Red Flags Present?     |
                     +----------------------------------------------------------+
                                    /                            \
                                 YES                              NO
                                  v                                v
                +------------------------------+     +-----------------------------------+
                |     01_EMERGENCY_DIVERT      |     | 2. Non-Clinical Courtesy / Ack?   |
                |   Acuity 9-10 | License: False|     +-----------------------------------+
                +------------------------------+                    /           \
                                                                 YES             NO
                                                                  v               v
                                                +--------------------+     +----------------------------------+
                                                |  05_AUTO_RESOLVE   |     | 3. Mandatory MD/DO License       |
                                                | Acuity 1 | Lic: F  |     |    (Abnormal Path, Critical Labs,|
                                                +--------------------+     |    Post-Op SSI, Complex Med)?    |
                                                                           +----------------------------------+
                                                                                          /           \
                                                                                       YES             NO
                                                                                        v               v
                                                                      +--------------------+     +----------------------------------+
                                                                      | 04_PHYSICIAN_REVIEW|     | 4. New Symptom / Undiagnosed /   |
                                                                      | Acuity 7-8 | Lic: T|     |    New Prescription Request?     |
                                                                      +--------------------+     +----------------------------------+
                                                                                                                /           \
                                                                                                             YES             NO
                                                                                                              v               v
                                                                                            +--------------------+     +--------------------+
                                                                                            | 03_CONVERT_TO_VISIT|     | 02_STAFF_DELEGATE  |
                                                                                            | Acuity 3-4 | Lic: F|     | Acuity 1-2 | Lic: F|
                                                                                            +--------------------+     +--------------------+
```

### 4.1 Lane 01: EMERGENCY_DIVERT
- **Classification Criteria:**
  - Active chest pain, tightness, substernal pressure radiating to jaw, neck, arm, or back with diaphoresis, dyspnea, nausea.
  - Acute focal neurological deficit: sudden numbness/weakness of face/arm/leg (especially unilateral), acute dysarthria/aphasia, acute visual field loss, ataxia.
  - Severe respiratory distress, acute stridor, unable to complete sentences.
  - Anaphylaxis symptoms: respiratory involvement, tongue swelling, throat tightness with urticaria.
  - Acute suicidal or homicidal ideation with active intent or plan.
  - Acute massive hemorrhage or acute unstable trauma.
- **Acuity Range:** 9 to 10.
- **`requires_physician_license`:** `False` (diverting to 911 / emergency department is an emergency protocol; routing into a physician's asynchronous inbox introduces unacceptable delay).
- **Target Delegated Role:** `"Emergency Services / 911 Dispatch / Urgent ED Transfer Protocol"`
- **Badge Styling:** Red (`bg-red-600` / `#DC2626`, badge text: `Emergency Divert`).
- **Action Plan Template:** `"EMERGENCY PROTOCOL ACTIVATED: Immediately direct patient to dial 911 or report to nearest Emergency Department. Trigger high-priority automated SMS/call notification to patient. Lock in-basket thread for asynchronous reply."`

### 4.2 Lane 02: STAFF_DELEGATE
- **Classification Criteria:**
  - Routine maintenance medication refill requests for stable chronic conditions where standard monitoring labs are up to date within protocol (e.g. statins, thyroid, antihypertensives).
  - Administrative and clerical requests: work or school excuses for established illness, medical record copies, billing superbills, CPT/ICD-10 requests.
  - Facility logistics: ADA handicap parking, directions, office hours, registration assistance.
  - Protocolized data entry: home blood pressure or blood glucose logs with values within acceptable parameters.
- **Acuity Range:** 1 to 2.
- **`requires_physician_license`:** `False` (actionable by Medical Assistants, Registered Nurses, Clinic Schedulers, or Billing Coordinators under standard operating protocols).
- **Target Delegated Role:** `"Medical Assistant / Pharmacy Refill Coordinator / Administrative Pool"`
- **Badge Styling:** Blue (`bg-blue-600` / `#2563EB`, badge text: `Staff Delegate`).
- **Action Plan Template:** `"Staff delegation workflow activated. Route to clinical support staff to verify protocol criteria, queue prescription for physician co-signature or direct protocol release, and complete administrative fulfillment."`

### 4.3 Lane 03: CONVERT_TO_VISIT
- **Classification Criteria:**
  - New onset acute symptoms requiring physical palpation, auscultation, or orthopedic exam (e.g., knee trauma, acute abdominal pain, earache).
  - Persistent or worsening subacute symptoms (>2–3 weeks) that have failed conservative home therapy (e.g., persistent dry cough).
  - Patient request to initiate high-potency systemic prescription therapy requiring baseline lab workup, contraindication screening, and informed consent (e.g., GLP-1 weight loss drugs, stimulants, biologics).
  - Complex diagnostic ambiguity where patient is requesting antibiotic or steroid without clinical encounter.
- **Acuity Range:** 3 to 4.
- **`requires_physician_license`:** `False` (the triage action itself is conversion to an appointment queue, managed by clinic scheduling coordinators).
- **Target Delegated Role:** `"Outpatient Clinic Scheduling Coordinator / Telehealth Triage Desk"`
- **Badge Styling:** Amber / Orange (`bg-amber-600` / `#D97706`, badge text: `Convert to Visit`).
- **Action Plan Template:** `"Convert message to clinical appointment. Send automated scheduling link to patient for 30-minute in-person or telehealth visit. Prepare baseline clinical intake checklist and standard diagnostic pre-orders."`

### 4.4 Lane 04: PHYSICIAN_REVIEW
- **Classification Criteria:**
  - Critical or abnormal histopathology/biopsy reports (e.g., CIN-3, dysplasia, carcinoma, atypical hyperplasia).
  - Critical laboratory alarms requiring immediate medical judgment: hyperkalemia (K > 5.5 mEq/L), severe acute kidney injury, critical cardiac biomarkers.
  - Acute post-operative complications: surgical site infections (POD #4 fever > 101F, purulent drainage, escalating pain), wound breakdown.
  - Complex clinical titration or dangerous drug interactions in patients with brittle multi-organ disease (e.g., holding ACE-inhibitors and aldosterone antagonists in cardiorenal syndrome).
- **Acuity Range:** 7 to 8.
- **`requires_physician_license`:** `True` (state law and standard of care mandate a licensed MD/DO for diagnostic disclosures, surgical complication management, and critical lab response).
- **Target Delegated Role:** `"Attending Physician (MD/DO) / Primary Care Provider / Operating Surgeon"`
- **Badge Styling:** Purple / Violet (`bg-purple-700` / `#7C3AED`, badge text: `Physician Review`).
- **Action Plan Template:** `"DIRECT PHYSICIAN REVIEW REQUIRED: Escalated to attending physician inbox with priority tag. Formulate clinical management decision, initiate medication hold/adjustments, and coordinate urgent direct patient contact."`

### 4.5 Lane 05: AUTO_RESOLVE
- **Classification Criteria:**
  - Pure pleasantries, gratitude, and thank you notes ("Thank you Dr. Khan, the drops worked!").
  - Unconditional appointment confirmations and routine reminders acknowledgment.
  - Read receipts, generic automated portal confirmations, office holiday greetings.
  - Crucial condition: ZERO unaddressed clinical symptoms, zero refill requests, zero questions.
- **Acuity Range:** 1 (lowest).
- **`requires_physician_license`:** `False`.
- **Target Delegated Role:** `"Automated Patient Portal / EMR Communication Archive"`
- **Badge Styling:** Emerald / Slate (`bg-emerald-600` / `#059669` or `bg-slate-500` / `#64748B`, badge text: `Auto-Resolve`).
- **Action Plan Template:** `"Automated resolution: File message in EMR communication archive. Transmit pre-drafted polite acknowledgment to patient portal. No clinician or staff action required."`

---

## 5. Core Metric & Architectural Definitions

### 5.1 Acuity Score Calibration (1–10 Integer Scale)

The PajamaZero Acuity Score is a 10-point ordinal scale calibrated against the clinical Emergency Severity Index (ESI) adapted for outpatient EHR in-basket triage:

| Score | Clinical Urgency Tier | Clinical Characteristics | Primary Lane | Examples |
|---|---|---|---|---|
| **1** | Non-Clinical / Minimal | No clinical action needed; administrative inquiries or pure courtesy notes | 05_AUTO_RESOLVE, 02_STAFF_DELEGATE | Thank you notes, handicap parking, confirmed appointment reminders |
| **2** | Low / Protocolized | Established stable chronic maintenance or paperwork; zero acute risk | 02_STAFF_DELEGATE | 90-day statin refill with normal labs, work excuse for resolved migraine, stable BP log |
| **3** | Mild Clinical | Subacute complaint or medication inquiry requiring structured appointment | 03_CONVERT_TO_VISIT | Lingering dry cough (3 weeks), request to initiate GLP-1 weight loss therapy |
| **4** | Moderate Symptomatic | Subacute orthopedic trauma or new focal symptom without hemodynamic instability | 03_CONVERT_TO_VISIT | Swollen twisted knee after pickleball 4 days ago, worsening with weight bearing |
| **5** | Moderate / Borderline | Chronic disease non-critical lab trend or stable medication titration query | 02_STAFF_DELEGATE / 04_PHYSICIAN_REVIEW | Mildly elevated HbA1c (7.4), mild asymptomatic potassium 5.2 |
| **6** | Significant Clinical | Non-critical abnormal diagnostics requiring provider evaluation within 48h | 04_PHYSICIAN_REVIEW | Moderate iron deficiency anemia, borderline thyroid nodule growth on ultrasound |
| **7** | High Clinical Urgency | Premalignant or malignant pathology, high anxiety, complex diagnostic disclosure | 04_PHYSICIAN_REVIEW | Cervical punch biopsy showing CIN-3 with positive endocervical margins |
| **8** | Critical / Semi-Emergent | Potentially life-threatening lab abnormality or post-operative infection | 04_PHYSICIAN_REVIEW | Hyperkalemia 5.7 on Lisinopril/Spironolactone; Post-op day 4 purulent wound infection + fever 101.3 |
| **9** | Emergent / Immediate Red Flag | Threat to life or limb requiring immediate emergency medical evaluation | 01_EMERGENCY_DIVERT | Hypertensive crisis with visual loss, severe acute dyspnea, anaphylaxis signs |
| **10** | Catastrophic Life Safety | Active acute coronary syndrome or acute stroke symptoms within critical window | 01_EMERGENCY_DIVERT | Crushing substernal chest pressure with cold sweat; acute unilateral facial/arm numbness & slurred speech |

### 5.2 `requires_physician_license` Boolean Semantics
- **`True`**: Legally mandated for execution by an MD or DO holding an active, unrestricted medical license. Applied strictly when:
  1. Communicating histopathology, biopsy findings, or cancer diagnoses.
  2. Altering, discontinuing, or prescribing medications in patients with acute destabilization or critical lab alarms.
  3. Diagnosing and treating acute post-surgical complications.
- **`False`**: Applied when the action can be safely executed by non-physician staff (RN, MA, billing, scheduling, automated systems) OR when immediate diversion to 911/emergency services is required to preserve life.

### 5.3 Physician In-Basket Deflection Rate
- **Mathematical Definition:**
  $$\text{Deflection Rate} = \frac{\sum \text{Messages in Lanes }(01 + 02 + 03 + 05)}{\text{Total Ingested Messages}} \times 100\% = \left(1 - \frac{\text{Count}(\text{Lane 04})}{\text{Total Messages}}\right) \times 100\%$$
- **Target Threshold:** $\ge 70.0\%$
- **Benchmark Performance across 15 Presets:**
  - Lane 01 (Emergency Divert): 2 messages (13.3%)
  - Lane 02 (Staff Delegate): 5 messages (33.3%)
  - Lane 03 (Convert to Visit): 3 messages (20.0%)
  - Lane 04 (Physician Review): 3 messages (20.0%)
  - Lane 05 (Auto-Resolve): 2 messages (13.3%)
  - **Total Deflected Messages:** $2 + 5 + 3 + 2 = 12\text{ messages}$
  - **Deflection Rate:** $\frac{12}{15} = 80.0\%$ (exceeds $70.0\%$ requirement).

### 5.4 Sub-100ms Stopwatch Telemetry Specification
- **Clock Mechanism:** `time.perf_counter()` (Python) / `performance.now()` (TypeScript).
- **Latency Budget:**
  - Local Deterministic Fallback Engine: **< 1.0 ms** per message.
  - Batch of 15 messages (Local Engine): **< 15.0 ms** total.
  - End-to-end HTTP FastAPI endpoint overhead: **< 10.0 ms**.
  - System ceiling: strictly **< 100.0 ms** average latency per message.
- **Telemetry Schema Fields:**
  - Per message: `latency_ms` (float, rounded to 2 decimal places).
  - Batch response: `total_latency_ms`, `average_latency_ms`.

### 5.5 Dual-Mode Hybrid Engine Architecture
1. **Mode 1 — TypeSafe AI / OpenRouter API Model:**
   - Targets fast LLM endpoints (e.g. Anthropic Claude 3.5 Sonnet, GPT-4o-mini, or Mistral Large via OpenRouter).
   - Generates structured JSON adhering strictly to `JevTriageResult`.
   - Records token usage and computes equivalent token cost ($0.0001–$0.001) vs standard GPT-4 ($0.03–$0.06).
2. **Mode 2 — Zero-Dependency Deterministic Local Fallback Engine:**
   - Requires zero external packages, zero API keys, zero network connections.
   - Executes hierarchical rule-based clinical decision trees matching clinical keywords, negation patterns, vital thresholds, and medication combinations.
   - Instant failover: activated automatically if API key is omitted, invalid, or when network timeouts occur.
   - Guarantees 100% deterministic reproducibility across verification suites.

---

## 6. Master Registry of the 15 Clinical In-Basket Presets

The following table provides the exhaustive clinical specification for all 15 pre-loaded scenarios defined in `backend/app/presets.py`:

| ID | Patient Name | Age/Sex | Subject | Target Lane | Acuity | License Req | Delegated Recipient | Expected Action Summary |
|---|---|---|---|---|---|---|---|---|
| `msg_001` | Robert Chen | 62 M | Tight chest pressure and feeling dizzy | `01_EMERGENCY_DIVERT` | 10 | `False` | Emergency Services / 911 Dispatch | Immediate 911 divert for acute ACS/AMI symptoms with known CAD. |
| `msg_002` | Maria Rodriguez | 47 F | Medication Refill: Atorvastatin 20mg | `02_STAFF_DELEGATE` | 2 | `False` | Pharmacy Tech / MA Refill Pool | Protocol 90-day refill verification against recent normal lipid panel. |
| `msg_003` | David Miller | 54 M | Left knee is swollen and stiff after playing pickleball | `03_CONVERT_TO_VISIT` | 4 | `False` | Outpatient Sports Med / Primary Care Scheduling | Convert to clinic appointment within 24-48h for knee physical exam & x-ray. |
| `msg_004` | Elena Rostova | 38 F | Biopsy Results in portal: High Grade Lesion (CIN-3) | `04_PHYSICIAN_REVIEW` | 7 | `True` | Attending Physician (Dr. Khan / GYN) | Physician review of CIN-3 path report; direct patient call for surgical plan (LEEP). |
| `msg_005` | James Wilson | 71 M | Thank you! | `05_AUTO_RESOLVE` | 1 | `False` | Automated Portal / EMR Archive | Courtesy note confirming conjunctivitis resolution; archive with polite auto-reply. |
| `msg_006` | Sarah Jenkins | 29 F | Work Excuse Note for Monday & Tuesday | `02_STAFF_DELEGATE` | 2 | `False` | Medical Assistant / Admin Team | Generate standard medical work excuse letter for documented migraine episode. |
| `msg_007` | Arthur Pendelton | 68 M | Right arm feels numb and slurred speech | `01_EMERGENCY_DIVERT` | 10 | `False` | Emergency Services / 911 Stroke Protocol | Urgent 911 divert for acute stroke symptoms (FAST positive) within tPA window. |
| `msg_008` | Chloe Vance | 33 F | Request for Wegovy / Zepbound Prescription | `03_CONVERT_TO_VISIT` | 3 | `False` | Weight Management Scheduling Coordinator | Schedule 30-min consultation for baseline metabolic workup & GLP-1 counseling. |
| `msg_009` | Michael Chang | 59 M | Urgent: Routine lab shows high Potassium 5.7 | `04_PHYSICIAN_REVIEW` | 8 | `True` | Attending Cardiologist / PCP (Dr. Khan) | Urgent physician review for critical hyperkalemia (5.7) & AKI; hold Lisinopril/Spironolactone. |
| `msg_010` | Patricia Gomez | 81 F | Handicap parking for my appointment on Thursday | `02_STAFF_DELEGATE` | 1 | `False` | Patient Concierge / Front Desk Staff | Send ADA parking instructions and main entrance valet drop-off details. |
| `msg_011` | Brenda Foster | 44 F | Post-Op Day 4: Yellow oozing at incision and fever 101.3 | `04_PHYSICIAN_REVIEW` | 8 | `True` | Operating Surgeon / Surgical On-Call | Urgent surgical review for post-cholecystectomy SSI with systemic fever and purulence. |
| `msg_012` | Marcus Sterling | 26 M | Lingering dry cough for past 3 weeks | `03_CONVERT_TO_VISIT` | 3 | `False` | Primary Care Scheduling Desk | Schedule outpatient evaluation for subacute cough >3 weeks & chest auscultation. |
| `msg_013` | Harold Hughes | 76 M | Itemized Superbill for Supplemental Insurance | `02_STAFF_DELEGATE` | 1 | `False` | Medical Billing & Patient Accounts | Generate itemized CMS-1500 statement with CPT 93306 & ICD-10 codes. |
| `msg_014` | Lisa Morales | 35 F | Follow-up confirmed | `05_AUTO_RESOLVE` | 1 | `False` | Automated Scheduling / Archive | Acknowledge confirmation for 6-month thyroid US; auto-file without clinician review. |
| `msg_015` | Samuel Adams | 51 M | Weekly Home Blood Pressure Log Submission | `02_STAFF_DELEGATE` | 2 | `False` | Medical Assistant Vitals Intake Pool | Enter normal home BP readings (130-138/80-86) into EMR flow-sheet. |

---

## 7. Granular Presets Detailed Profiles

### Preset 1: Robert Chen (`msg_001`)
- **Patient Profile:** 62-year-old male, MRN-84920. Relevant History: CAD s/p stent (2021), Hypertension, Hyperlipidemia. Meds: Aspirin 81mg, Atorvastatin 40mg, Metoprolol 50mg.
- **Message Content:** "Dr. Khan, I was out mowing the lawn about 45 minutes ago and started getting this tight, heavy squeezing pressure in the center of my chest. It radiates a little into my left shoulder and jaw. Broke into a cold sweat. Sat down with some water but it isn't easing up. Should I wait till tomorrow or come by the clinic?"
- **Clinical Evaluation:** Classic presentation of Acute Coronary Syndrome (ACS) / Myocardial Infarction triggered by exertion in a high-risk patient with known stented coronary artery disease. Ongoing for 45 minutes with radiating pain and diaphoresis.
- **Lane Assignment:** `01_EMERGENCY_DIVERT`
- **Acuity Score:** `10`
- **`requires_physician_license`:** `False` (Emergency 911 dispatch takes precedence; portal reply delay could be fatal).
- **Delegated To:** `"Emergency Services / 911 Dispatch / Urgent ED Transfer"`
- **Action Plan:** Immediate 911 diversion. Advise patient not to drive. Activate emergency protocol banner.

### Preset 2: Maria Rodriguez (`msg_002`)
- **Patient Profile:** 47-year-old female, MRN-72314. Relevant History: Hyperlipidemia, Hypothyroidism. Meds: Atorvastatin 20mg, Levothyroxine 75mcg.
- **Message Content:** "Hello, I am down to my last 3 tablets of Atorvastatin 20mg. Can you please authorize a 90-day refill to my usual Walgreens on El Camino Real? My lipid panel was checked at my annual wellness exam last month and was normal. Thank you!"
- **Clinical Evaluation:** Uncomplicated routine maintenance medication renewal. Normal surveillance labs within 30 days. No adverse effects reported.
- **Lane Assignment:** `02_STAFF_DELEGATE`
- **Acuity Score:** `2`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Pharmacy Tech / MA Refill Pool"`
- **Action Plan:** Check recent lipid panel on chart, queue 90-day refill prescription for electronic transmission under clinic protocol.

### Preset 3: David Miller (`msg_003`)
- **Patient Profile:** 54-year-old male, MRN-65829. Relevant History: Mild Osteoarthritis. Meds: Naproxen 500mg PRN.
- **Message Content:** "Hi Doctor, 4 days ago I twisted my left knee during a pickleball match. It didn't pop, but by next morning it was visibly swollen, warm, and stiff when bearing weight. I've been doing RICE and taking Aleve, but walking down stairs is quite painful. Can you send in a strong anti-inflammatory or tell me what to do?"
- **Clinical Evaluation:** Subacute internal derangement of knee (possible meniscus or collateral ligament injury) with joint effusion and functional impairment. Prescribing stronger medications without exam or imaging is clinically contraindicated.
- **Lane Assignment:** `03_CONVERT_TO_VISIT`
- **Acuity Score:** `4`
- **`requires_physician_license`:** `False` (scheduling desk routes to in-person clinic slot).
- **Delegated To:** `"Orthopedic / Sports Medicine / Primary Care Scheduling Coordinator"`
- **Action Plan:** Schedule in-person orthopedic or primary care appointment within 48 hours; order pre-visit standing 3-view knee x-ray series.

### Preset 4: Elena Rostova (`msg_004`)
- **Patient Profile:** 38-year-old female, MRN-91204. Relevant History: HPV positive, Abnormal Pap (ASC-H). Meds: None.
- **Message Content:** "Dr. Khan, I just received an alert that my cervical punch biopsy pathology report was uploaded to MyChart. It says 'Cervical Intraepithelial Neoplasia Grade 3 (CIN-3) with positive endocervical margins'. I am extremely anxious and scared about whether this means cancer and what the next surgical steps are. Can you please call me or explain what this means?"
- **Clinical Evaluation:** High-grade premalignant dysplasia (CIN-3 / HSIL) with positive endocervical margins. Severe patient anxiety. High risk of progression to invasive cervical cancer without excisional intervention (LEEP vs Cold Knife Cone).
- **Lane Assignment:** `04_PHYSICIAN_REVIEW`
- **Acuity Score:** `7`
- **`requires_physician_license`:** `True` (only a licensed physician can interpret surgical margins and counsel on excisional procedures).
- **Delegated To:** `"Attending Physician (Dr. Khan / GYN specialist)"`
- **Action Plan:** Flag as high-priority physician review; physician calls patient today to explain CIN-3 pathology and discuss scheduling LEEP/cone biopsy.

### Preset 5: James Wilson (`msg_005`)
- **Patient Profile:** 71-year-old male, MRN-33418. Relevant History: Type 2 Diabetes, Glaucoma. Meds: Metformin 1000mg BID, Latanoprost ophthalmic.
- **Message Content:** "Just wanted to send a quick note of thanks to Dr. Khan and Nurse Sarah. The antibiotic eye drops cleared up that conjunctivitis within 48 hours. Eye feels completely back to normal. Have a wonderful weekend!"
- **Clinical Evaluation:** Pure non-clinical expression of gratitude. No lingering symptoms, no refills requested.
- **Lane Assignment:** `05_AUTO_RESOLVE`
- **Acuity Score:** `1`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Automated System Archive / EMR Communication Log"`
- **Action Plan:** Archive message in patient chart; transmit automated polite acknowledgment ("Thank you for the update! Glad to hear you're feeling better").

### Preset 6: Sarah Jenkins (`msg_006`)
- **Patient Profile:** 29-year-old female, MRN-44912. Relevant History: Chronic Migraine with Aura. Meds: Sumatriptan 50mg PRN, Propranolol 40mg.
- **Message Content:** "Hi clinic staff, I suffered a debilitating migraine attack on Monday that left me bedridden with light sensitivity and vomiting through Tuesday. My employer requires a signed doctor's note for unexcused medical absences exceeding 24 hours. Can the clinic provide a standard work release note for Oct 12-13? Thank you!"
- **Clinical Evaluation:** Routine administrative work excuse request for an established chronic condition managed in the practice.
- **Lane Assignment:** `02_STAFF_DELEGATE`
- **Acuity Score:** `2`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Medical Assistant / Clinic Administrative Team"`
- **Action Plan:** Generate standard work excuse letter confirming medical absence for Oct 12-13 based on charted history of migraine.

### Preset 7: Arthur Pendelton (`msg_007`)
- **Patient Profile:** 68-year-old male, MRN-18239. Relevant History: Atrial Fibrillation, Prior TIA (2019), Hypertension. Meds: Eliquis 5mg BID, Lisinopril 20mg.
- **Message Content:** "Hello Dr. Khan, my husband Arthur asked me to write this because his right hand feels suddenly heavy and numb, and when he tried to answer the phone earlier his speech sounded mumbled and thick. He says he feels fine otherwise and doesn't want to make a fuss, but it's been about 30 minutes now. Should we come into clinic tomorrow morning?"
- **Clinical Evaluation:** Acute onset unilateral focal neurological deficit (dysarthria + right arm weakness/numbness) in patient with atrial fibrillation on anticoagulation. High risk for acute ischemic stroke vs intracranial hemorrhage. Patient is within the hyperacute 4.5-hour thrombolysis/thrombectomy window.
- **Lane Assignment:** `01_EMERGENCY_DIVERT`
- **Acuity Score:** `10`
- **`requires_physician_license`:** `False` (immediate emergency diversion; asynchronous physician inbox review is dangerous).
- **Delegated To:** `"Emergency Services / 911 Stroke Protocol"`
- **Action Plan:** Immediate 911 stroke protocol divert. Advise family not to give food, drink, or aspirin. Instruct immediate ambulance dispatch to designated Stroke Center.

### Preset 8: Chloe Vance (`msg_008`)
- **Patient Profile:** 33-year-old female, MRN-55201. Relevant History: Obesity (BMI 31.2), Pre-diabetes. Meds: None.
- **Message Content:** "Hi Dr. Khan! A coworker of mine lost 35 pounds on Wegovy and I would really like to start on a GLP-1 weight loss injection. My BMI is currently 31. Can you please call in a prescription for the starter dose to my pharmacy so I can begin this week? Let me know if you need any info."
- **Clinical Evaluation:** Request to initiate high-potency GLP-1 receptor agonist without prior in-person clinical workup (baseline CMP, lipid panel, thyroid C-cell cancer history screening, pancreatitis risk assessment, lifestyle counseling). Cannot be initiated asynchronously.
- **Lane Assignment:** `03_CONVERT_TO_VISIT`
- **Acuity Score:** `3`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Endocrinology / Weight Management / Primary Care Scheduling Coordinator"`
- **Action Plan:** Convert to 30-minute Weight Management Consultation; send pre-visit GLP-1 educational brochure and baseline metabolic lab orders.

### Preset 9: Michael Chang (`msg_009`)
- **Patient Profile:** 59-year-old male, MRN-78190. Relevant History: HFrEF (EF 35%), Stage 3a CKD, Hypertension. Meds: Lisinopril 40mg, Spironolactone 25mg, Carvedilol 25mg BID, Furosemide 20mg.
- **Message Content:** "Dr. Khan, my routine lab results just came in on MyChart: Serum Potassium is 5.7 mmol/L (flagged critical high) and Creatinine jumped to 1.8. I take Lisinopril 40mg and Spironolactone 25mg daily for my blood pressure and heart failure. Should I hold these medications tonight or go to the ER?"
- **Clinical Evaluation:** Life-threatening hyperkalemia (5.7 mmol/L) accompanied by acute renal function decline (Cr 1.8) in a patient on dual potassium-sparing/RAAS blockade (Lisinopril + Spironolactone). High risk of fatal ventricular dysrhythmias or sudden cardiac death.
- **Lane Assignment:** `04_PHYSICIAN_REVIEW`
- **Acuity Score:** `8`
- **`requires_physician_license`:** `True` (only a licensed physician can direct holding essential heart failure medications or ordering urgent emergency evaluation).
- **Delegated To:** `"Attending Cardiologist / Primary Care Physician (Dr. Khan)"`
- **Action Plan:** Urgent physician review within 30 min. Direct patient to immediately hold Spironolactone and Lisinopril; order stat repeat BMP and 12-lead ECG; evaluate for emergency room admission if symptomatic.

### Preset 10: Patricia Gomez (`msg_010`)
- **Patient Profile:** 81-year-old female, MRN-10294. Relevant History: Severe Lumbar Spinal Stenosis, Osteoarthritis. Meds: Acetaminophen 650mg PRN.
- **Message Content:** "Good afternoon, my daughter is driving me to my cardiology follow-up this Thursday at 10 AM. I use a walker and have difficulty walking long distances. Is there handicap parking directly adjacent to the main building entrance, or do we use the West Garage?"
- **Clinical Evaluation:** Pure facility logistics and ADA parking inquiry. Zero medical complexity.
- **Lane Assignment:** `02_STAFF_DELEGATE`
- **Acuity Score:** `1`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Clinic Patient Concierge / Front Desk Administrative Staff"`
- **Action Plan:** Reply with campus parking map showing reserved ADA stalls directly in front of main clinic entrance and complimentary valet service.

### Preset 11: Brenda Foster (`msg_011`)
- **Patient Profile:** 44-year-old female, MRN-39482. Relevant History: s/p Lap Cholecystectomy (POD #4). Meds: Oxycodone 5mg PRN, Colace 100mg.
- **Message Content:** "Dr. Khan, I had laparoscopic cholecystectomy (gallbladder removal) 4 days ago. Today the umbilical incision site turned bright red, hot to the touch, and there is thick yellowish discharge seeping through the steristrips with an unpleasant odor. Took my temp and it's 101.3 F with chills. Pain is worsening."
- **Clinical Evaluation:** Acute post-operative surgical site infection (SSI) on post-op day 4, manifested by cardinal signs of inflammation (rubor, calor, dolor), purulent malodorous drainage, and systemic pyrexia (101.3 F with chills). Risk of necrotizing fasciitis, deep space abscess, or sepsis.
- **Lane Assignment:** `04_PHYSICIAN_REVIEW`
- **Acuity Score:** `8`
- **`requires_physician_license`:** `True` (surgical assessment, wound exploration decision, and antibiotic prescribing require a licensed surgeon/physician).
- **Delegated To:** `"Operating Surgeon / General Surgery On-Call"`
- **Action Plan:** Immediate physician/surgeon alert. Direct patient to same-day surgical clinic add-on slot or surgical triage for wound examination, culture, and systemic antibiotics.

### Preset 12: Marcus Sterling (`msg_012`)
- **Patient Profile:** 26-year-old male, MRN-60318. Relevant History: Seasonal Allergies, Mild Childhood Asthma. Meds: Zyrtec 10mg.
- **Message Content:** "Hi, I had a standard head cold about 3 weeks ago that cleared up, but I've been left with this persistent dry, tickly cough that wakes me up at night. No fever, no shortness of breath, no phlegm. Over-the-counter Robitussin isn't helping much. Wondering if I need an inhaler or antibiotic?"
- **Clinical Evaluation:** Subacute cough (>3 weeks) following viral upper respiratory tract infection. Differential diagnosis includes post-infectious bronchial hyperreactivity, cough-variant asthma, or upper airway cough syndrome. Requires pulmonary auscultation and clinical evaluation.
- **Lane Assignment:** `03_CONVERT_TO_VISIT`
- **Acuity Score:** `3`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Primary Care / Telehealth Scheduling Desk"`
- **Action Plan:** Schedule outpatient visit or telehealth evaluation within 3–5 business days for lung examination and trial bronchodilator/inhaled steroid evaluation.

### Preset 13: Harold Hughes (`msg_013`)
- **Patient Profile:** 76-year-old male, MRN-22194. Relevant History: Aortic Stenosis, Hypertension. Meds: Amlodipine 5mg.
- **Message Content:** "To the billing department: My Medicare supplemental insurance (Plan G) requires an itemized statement showing CPT procedure codes and diagnostic ICD-10 codes for my echocardiogram on Sept 8. Could you please email or mail this to my home address on file? Thank you, Harold."
- **Clinical Evaluation:** Standard billing documentation request for insurance reimbursement.
- **Lane Assignment:** `02_STAFF_DELEGATE`
- **Acuity Score:** `1`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Medical Billing & Patient Accounts Department"`
- **Action Plan:** Generate CMS-1500 superbill with CPT 93306 (Complete Echocardiogram) and I08.0/I35.0 ICD-10 codes; securely transmit to verified home address.

### Preset 14: Lisa Morales (`msg_014`)
- **Patient Profile:** 35-year-old female, MRN-88491. Relevant History: Benign Thyroid Nodule, Euthyroid. Meds: None.
- **Message Content:** "Hi team, confirming that I received the reminder for my routine 6-month thyroid ultrasound next month on Oct 24th at 9:00 AM. See you all then, thank you for being so accommodating!"
- **Clinical Evaluation:** Appointment reminder confirmation. Zero clinical questions or concerns.
- **Lane Assignment:** `05_AUTO_RESOLVE`
- **Acuity Score:** `1`
- **`requires_physician_license`:** `False`
- **Delegated To:** `"Automated Scheduling System / Archive"`
- **Action Plan:** Automatically verify appointment confirmation in scheduling system and file note in EMR communication log.

### Preset 15: Samuel Adams (`msg_015`)
- **Patient Profile:** 51-year-old male, MRN-47209. Relevant History: Primary Hypertension (well-controlled). Meds: Lisinopril 10mg daily.
- **Message Content:** "Dr. Khan, here is my weekly blood pressure log as instructed at our last visit:\nMon: 134/84 (HR 72)\nTue: 130/82 (HR 68)\nWed: 138/86 (HR 74)\nThu: 132/80 (HR 70)\nFri: 136/84 (HR 71)\nFeeling good, taking the Lisinopril every morning without side effects. Please add to my chart for our next 6-month checkup."
- **Clinical Evaluation:** Protocolized home blood pressure submission. All readings reflect well-controlled stage 1 baseline (systolics 130–138, diastolics 80–86), normal heart rates, no side effects, patient asymptomatic.
- **Lane Assignment:** `02_STAFF_DELEGATE`
- **Acuity Score:** `2`
- **`requires_physician_license`:** `False` (medical assistant enters vitals log into EMR flowsheet).
- **Delegated To:** `"Medical Assistant Vitals Intake Pool"`
- **Action Plan:** Extract BP/HR values into ambulatory vitals flowsheet; confirm adherence; send confirmation reply to patient noting values are within target range.

---

## 8. Implementation Specifications for Engineering Teams

### 8.1 Backend Implementation Requirements
1. **Pydantic Schemas:** Fully conform to `backend/app/schemas.py`.
2. **Deterministic Fallback Engine:**
   - Must be implemented in pure Python with zero external dependencies (no network calls, no model weights).
   - Must evaluate the 15 presets deterministically to the exact target lanes, acuity scores, and `requires_physician_license` values documented above.
   - Execution time must be <1.0ms per message.
3. **API Endpoints:**
   - `POST /api/triage`: Single message evaluation with microsecond latency measurement.
   - `POST /api/triage/batch`: Batch message evaluation returning full batch analytics, deflection rate, and latency breakdown.
   - `GET /api/presets`: Returns all 15 clinical presets for dashboard testing.
   - `GET /api/stats`: Returns system telemetry, engine health, and pajama time savings statistics.
4. **Automated Verification Suite:**
   - Script (e.g. `backend/verify.py` or `pytest`) that executes all 15 presets and verifies:
     - 100% emergency safety (01_EMERGENCY_DIVERT detected with Acuity >= 9, 0 false negatives).
     - Deflection rate >= 70% (exactly 80.0%).
     - Average latency < 100ms.
     - License flag matches ground truth for all 15 cases.

### 8.2 Frontend Implementation Requirements (Next.js 15 Dashboard)
1. **5-Lane Clinical Kanban Queue:**
   - Column 1: `01_EMERGENCY_DIVERT` (Red accent, glowing pulsing alert for immediate life safety).
   - Column 2: `02_STAFF_DELEGATE` (Blue accent, Medical Assistant badge).
   - Column 3: `03_CONVERT_TO_VISIT` (Amber accent, Calendar / Scheduling badge).
   - Column 4: `04_PHYSICIAN_REVIEW` (Purple accent, Stethoscope / MD license badge).
   - Column 5: `05_AUTO_RESOLVE` (Slate / Green accent, Checkmark badge).
2. **Clinical Command Center Metrics Header:**
   - Live Deflection Counter (`80.0% Deflected` vs `<20% Physician Queue`).
   - Latency Stopwatch Gauge (`< 10ms` vs `1,200ms GPT-4`).
   - Cost Differential Counter (`$0.000` vs `$0.45 GPT-4`).
   - Pajama Time Saved Counter (`~45 mins saved tonight`).
3. **Interactive Preset Ingestion:**
   - Dropdown or "Clear In-Basket" button to ingest all 15 presets in batch.
   - Interactive message tester to compose custom patient messages and observe live sub-100ms triage routing.

---

## 9. Conclusion

This authoritative specification provides the complete clinical, mathematical, and algorithmic foundation for PajamaZero. By strictly enforcing life safety divert protocols, calibrating acuity 1-10, restricting physician license requirements to complex medical decisions, and maintaining a sub-100ms deterministic fallback, PajamaZero effectively eliminates 80% of physician in-basket burden while safeguarding clinical outcomes.
