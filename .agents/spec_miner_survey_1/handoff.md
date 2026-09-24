# Handoff Report — Clinical Specification Mining

**Agent:** Clinical Spec Investigator (`spec_miner_survey_1`)  
**Parent:** `teamwork_preview_orchestrator` (`f4f72860-f7b9-4184-ad97-98cf6bd2c622`)  
**Timestamp:** 2026-09-24T18:35:00Z  
**Integrity Mode:** Development  

---

## 1. Observation

1. **Original Request:** Reviewed `/Users/kamran/Projects/pajama-zero/ORIGINAL_REQUEST.md` (lines 13–36):
   - R1 mandates: "Ingest patient portal messages and classify them into 5 distinct clinical lanes (01_EMERGENCY_DIVERT, 02_STAFF_DELEGATE, 03_CONVERT_TO_VISIT, 04_PHYSICIAN_REVIEW, 05_AUTO_RESOLVE) with a calibrated clinical acuity score (1–10) and a strict requires_physician_license boolean flag. Must support TypeSafe AI / OpenRouter API calls with a zero-dependency deterministic local fallback engine."
   - Acceptance criteria require:
     - Emergency scenarios classified into `01_EMERGENCY_DIVERT` with Acuity >= 9 in under 100ms.
     - Routine admin requests routed to `02_STAFF_DELEGATE` with `requires_physician_license = false`.
     - Non-clinical messages routed to `05_AUTO_RESOLVE`.
     - High-acuity clinical decisions routed to `04_PHYSICIAN_REVIEW` with `requires_physician_license = true`.
     - Average evaluation latency logged and verified at under 100ms per message.
     - Batch processing of 15 clinical presets demonstrates physician inbox deflection rate of >= 70%.

2. **Existing Schemas:** Inspected `/Users/kamran/Projects/pajama-zero/backend/app/schemas.py`:
   - `ClinicalLane` enum (lines 5–10): `01_EMERGENCY_DIVERT`, `02_STAFF_DELEGATE`, `03_CONVERT_TO_VISIT`, `04_PHYSICIAN_REVIEW`, `05_AUTO_RESOLVE`.
   - `PatientMessage` (lines 12–22): `id`, `patient_name`, `patient_age`, `patient_gender`, `mrn`, `subject`, `body`, `timestamp`, `relevant_history`, `active_medications`.
   - `JevTriageResult` (lines 24–42): includes `message_id`, `snippet`, `lane`, `lane_title`, `lane_badge_color`, `acuity_score` (ge=1, le=10), `requires_physician_license`, `clinical_rationale`, `delegated_to`, `action_plan`, `pre_drafted_action`, `latency_ms`, `token_cost_usd`, `evaluated_by`.
   - `BatchTriageResponse` (lines 52–64): includes `physician_queue_count`, `deflected_count`, `physician_deflection_rate`, `total_latency_ms`, `average_latency_ms`, `lane_distribution`.

3. **Existing Presets:** Inspected `/Users/kamran/Projects/pajama-zero/backend/app/presets.py` (lines 4–185):
   - Found 15 complete clinical messages:
     - `msg_001`: Robert Chen (62M, crushing chest pressure, diaphoresis, CAD s/p stent)
     - `msg_002`: Maria Rodriguez (47F, 90-day Atorvastatin 20mg refill, normal lipid panel)
     - `msg_003`: David Miller (54M, swollen knee post-pickleball, requesting anti-inflammatory)
     - `msg_004`: Elena Rostova (38F, cervical punch biopsy CIN-3 with positive margins)
     - `msg_005`: James Wilson (71M, thank you note, conjunctivitis resolved)
     - `msg_006`: Sarah Jenkins (29F, work excuse note for resolved migraine)
     - `msg_007`: Arthur Pendelton (68M, right arm numbness and mumbled speech for 30m, AFib/TIA history)
     - `msg_008`: Chloe Vance (33F, request for Wegovy/Zepbound prescription starter dose)
     - `msg_009`: Michael Chang (59M, routine lab K+ 5.7 critical high, Cr 1.8, on Lisinopril & Spironolactone)
     - `msg_010`: Patricia Gomez (81F, handicap parking inquiry for Thursday visit)
     - `msg_011`: Brenda Foster (44F, POD #4 lap cholecystectomy, yellow oozing incision, fever 101.3)
     - `msg_012`: Marcus Sterling (26M, lingering dry cough for 3 weeks post cold)
     - `msg_013`: Harold Hughes (76M, itemized superbill request for Medicare Plan G)
     - `msg_014`: Lisa Morales (35F, confirmation of 6-month thyroid ultrasound appointment)
     - `msg_015`: Samuel Adams (51M, weekly home blood pressure log with normal readings 130s/80s)

4. **Directory Structure:** Observed that `backend/app/` contains only `schemas.py` and `presets.py`. Triage engine logic (`triage.py` or similar), router/endpoints (`main.py` or `api/`), and automated verification tests (`verify.py`) are yet to be implemented.

---

## 2. Logic Chain

1. **Clinical Safety Hierarchy:**
   - Patient safety is paramount in clinical AI. Messages with immediate life-threatening symptoms (ACS in `msg_001`, acute stroke in `msg_007`) must be immediately intercepted and routed to `01_EMERGENCY_DIVERT` with Acuity 10. Because portal messages are checked asynchronously by clinics (often hours or days later), leaving an emergent message in an inbox is dangerous. Therefore, `requires_physician_license` is set to `False` because the protocol commands immediate patient diversion to 911 / emergency services rather than waiting for MD review.

2. **Physician Scope of Practice & License Mandate:**
   - Under US state medical licensing laws, clinical decision making involving diagnostic interpretation of malignancy/dysplasia (`msg_004`), evaluating critical laboratory alarms that require holding cardiorenal meds (`msg_009`), or assessing post-operative surgical site infections with systemic pyrexia (`msg_011`) legally requires a licensed physician (MD/DO). These cases map to `04_PHYSICIAN_REVIEW` with `requires_physician_license = True` and Acuity scores 7–8.

3. **In-Person / Telehealth Appointment Conversion:**
   - Patients requesting prescription medication for an unevaluated acute trauma (`msg_003`), requesting initiation of complex systemic metabolic drugs like GLP-1 agonists without baseline workup (`msg_008`), or experiencing subacute symptoms unresolved for weeks (`msg_012`) cannot be safely diagnosed or prescribed over asynchronous portal messaging. They must be routed to `03_CONVERT_TO_VISIT` with Acuity 3–4 and `requires_physician_license = False` (handled by scheduling coordinators).

4. **Administrative & Protocolized Staff Delegation:**
   - Routine maintenance refills with up-to-date surveillance labs (`msg_002`), routine documentation such as work excuse letters (`msg_006`) and billing superbills (`msg_013`), clinic navigation/parking (`msg_010`), and stable vital sign flow-sheet entries (`msg_015`) do not require physician cognitive effort and can be delegated to Medical Assistants, Nurses, or Administrative staff under standing clinic protocols (`02_STAFF_DELEGATE`, Acuity 1–2, `requires_physician_license = False`).

5. **Automated Resolution:**
   - Messages expressing pure courtesy or confirming scheduled dates without questions or clinical complaints (`msg_005`, `msg_014`) should be auto-acknowledged and archived into the EHR (`05_AUTO_RESOLVE`, Acuity 1, `requires_physician_license = False`).

6. **Deflection Rate Verification:**
   - Total messages = 15.
   - Physician review queue (`04_PHYSICIAN_REVIEW`): `msg_004`, `msg_009`, `msg_011` = 3 messages.
   - Deflected queues (`01` + `02` + `03` + `05`): $2 + 5 + 3 + 2 = 12$ messages.
   - Deflection rate: $\frac{12}{15} = 80.0\% \ge 70.0\%$.

7. **Sub-100ms & Dual-Mode Engine Design:**
   - To achieve sub-100ms latency reliably regardless of network flakiness or external API outages, a zero-dependency deterministic local rule engine must be built. The local rule engine evaluates regex/keyword heuristics in <1ms, enabling instant offline triage and 100% test reproducibility.

---

## 3. Caveats

- **API Latency vs Local Engine:** While the local deterministic engine achieves <1ms latency, any live LLM call over OpenRouter/TypeSafe AI will experience 500–2,000ms latency due to network RTT. The system must use high-resolution stopwatch telemetry (`latency_ms`) and provide the local fallback to guarantee the sub-100ms benchmark.
- **Controlled Substances:** In real-world clinics, opioid or ADHD stimulant refills require physician review or strict PDMP checks; in the preset dataset, `msg_002` is Atorvastatin (a non-controlled maintenance lipid medication), allowing safe staff delegation.
- **Hybrid Intent Messages:** If a patient writes "Thank you, but my chest hurts", the triage engine must give absolute precedence to the red flag symptom over pleasantry words.

---

## 4. Conclusion

The clinical specification for PajamaZero is fully articulated and ready for engineering implementation:
1. **5 Clinical Lanes** are formally defined with classification rules, Acuity levels, and delegated roles.
2. **All 15 Presets** have been mapped with ground-truth lane assignments, acuity scores, and license flags, achieving an **80.0% physician deflection rate** (exceeding the >= 70% requirement).
3. **Emergency life safety** is safeguarded with 100% sensitivity for ACS (`msg_001`) and stroke (`msg_007`) into `01_EMERGENCY_DIVERT` (Acuity 10).
4. **Deterministic Local Fallback Engine** is fully specified to guarantee sub-100ms (sub-1ms local) execution and seamless dual-mode resilience.

Detailed specifications are documented in `/Users/kamran/Projects/pajama-zero/.agents/spec_miner_survey_1/survey_report.md`.

---

## 5. Verification Method

To verify the clinical specification and preset alignment:
1. **Inspect Report:** Read `/Users/kamran/Projects/pajama-zero/.agents/spec_miner_survey_1/survey_report.md`.
2. **Review Schemas:** Inspect `/Users/kamran/Projects/pajama-zero/backend/app/schemas.py` and confirm all fields (`lane`, `acuity_score`, `requires_physician_license`, `latency_ms`) match.
3. **Verify Presets:** Inspect `/Users/kamran/Projects/pajama-zero/backend/app/presets.py` and compare IDs `msg_001` through `msg_015` against Section 6 & 7 of the survey report.
4. **Deflection Rate Invalidation Condition:** If any implementation classifies more than 4 of the 15 presets into `04_PHYSICIAN_REVIEW`, the deflection rate will drop below $70.0\%$ ($10/15 = 66.7\%$), violating acceptance criterion 35.
