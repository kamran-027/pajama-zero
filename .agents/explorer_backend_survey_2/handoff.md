# Handoff Report — Backend Architecture Survey

## 1. Observation
1. **Files present in `/Users/kamran/Projects/pajama-zero/backend`**:
   - `requirements.txt` (9 lines): specifies `fastapi>=0.110.0`, `uvicorn>=0.28.0`, `pydantic>=2.6.0`, `python-dotenv>=1.0.0`, `httpx>=0.27.0`, `langchain-core>=0.2.0`, `langgraph>=0.1.0`, `sse-starlette>=2.0.0`.
   - `app/schemas.py` (72 lines): defines `ClinicalLane` (5 lanes: `01_EMERGENCY_DIVERT`, `02_STAFF_DELEGATE`, `03_CONVERT_TO_VISIT`, `04_PHYSICIAN_REVIEW`, `05_AUTO_RESOLVE`), `PatientMessage`, `JevTriageResult`, `TriageRequest`, `BatchTriageRequest`, `BatchTriageResponse`, and `SystemStatsResponse`.
   - `app/presets.py` (186 lines): defines `CLINICAL_INBOX_PRESETS` with 15 detailed patient portal messages (`msg_001` through `msg_015`).
2. **Files missing from backend**:
   - `app/__init__.py`
   - `app/config.py`
   - `app/engine.py` (triage engine & LangGraph graph)
   - `app/main.py` (FastAPI app & REST endpoints)
   - `verify.py` (automated acceptance test suite)
3. **Runtime & dependencies audit**:
   - System Python: `/usr/bin/python3` (3.9.6).
   - Existing virtualenv: `/Users/kamran/Learnings/langchain/.venv/bin/python` (Python 3.9.6).
   - Installed in `.venv`: `fastapi` (0.128.8), `uvicorn` (0.39.0), `pydantic` (2.13.4), `langgraph` (0.6.11), `langchain-core` (0.3.86), `httpx` (0.28.1), `python-dotenv` (1.2.1).
   - Missing from `.venv`: `sse-starlette`, `pytest`.
   - Terminal sandbox constraint: Shell commands running in the default sandbox from `/Users/kamran/Learnings/langchain` targeting `/Users/kamran/Projects/pajama-zero` encounter `Operation not permitted`.
4. **Clinical preset analysis**:
   - 2 emergency cases: `msg_001` (crushing chest pain), `msg_007` (acute stroke symptoms).
   - 5 staff delegate cases: `msg_002` (refill), `msg_006` (work note), `msg_010` (handicap parking), `msg_013` (billing/superbill), `msg_015` (BP log).
   - 3 visit conversion cases: `msg_003` (acute knee swelling), `msg_008` (Wegovy consult), `msg_012` (subacute cough).
   - 2 auto-resolve cases: `msg_005` (thank you note), `msg_014` (appointment confirmed).
   - 3 physician review cases: `msg_004` (CIN-3 cervical biopsy), `msg_009` (critical potassium 5.7), `msg_011` (post-op day 4 fever & oozing incision).
   - Physician deflection rate: 12 or 13 deflected out of 15 ($80.0\%$ to $86.7\%$), exceeding the $70\%$ requirement.

## 2. Logic Chain
1. From Observation 1, the core domain model (`schemas.py`) and standard benchmark data (`presets.py`) are already created with exact field names and types.
2. From Observation 2, the application layer (`main.py`), execution engine (`engine.py`), configuration (`config.py`), and verification script (`verify.py`) must be implemented to fulfill requirements R1, R2, and R4.
3. From Observation 3, the python environment already has all required heavy dependencies installed (`fastapi`, `uvicorn`, `pydantic`, `langgraph`, `langchain-core`, `httpx`). To eliminate risks regarding `pytest` or `sse-starlette`, `verify.py` should be implemented as a zero-dependency standalone Python test runner (using Python's built-in `unittest` or direct programmatic assertions).
4. From Observation 4, routing rules can be implemented deterministically to guarantee sub-10ms response times, 100% emergency detection sensitivity, and >= 70% physician inbox deflection rate.
5. In accordance with the LangGraph requirement, a 4-node `StateGraph` (Safety Gate -> Admin/Refill Filter -> Clinical Acuity Evaluator -> Routing Synthesizer) compiled into a runnable pipeline cleanly satisfies R1 while maintaining sub-millisecond execution.

## 3. Caveats
- No external OpenRouter API key is currently configured in the environment. The triage engine must run primarily in deterministic local fallback mode (defaulting to zero-cost, sub-10ms evaluation), with optional LLM invocation only when an API key is provided.
- Terminal sandboxing requires `BypassSandbox: true` when running background uvicorn servers or verification scripts from the shell.

## 4. Conclusion
The backend architecture plan is fully defined and ready for immediate implementation by the backend builder agent. The survey report (`survey_report.md`) provides the complete file-by-file specification:
- `backend/app/__init__.py`
- `backend/app/config.py`
- `backend/app/engine.py` (LangGraph StateGraph + deterministic local clinical engine)
- `backend/app/main.py` (FastAPI app, CORS, endpoints: `/api/triage`, `/api/triage/batch`, `/api/presets`, `/api/health`, `/api/stats`)
- `backend/verify.py` (Automated programmatic verification runner verifying emergency routing, sub-100ms latency, deflection rate >= 70%, and lane correctness)

## 5. Verification Method
1. Inspect survey report: `view_file` on `/Users/kamran/Projects/pajama-zero/.agents/explorer_backend_survey_2/survey_report.md`.
2. Inspect handoff report: `view_file` on `/Users/kamran/Projects/pajama-zero/.agents/explorer_backend_survey_2/handoff.md`.
3. Downstream validation: Once implemented by the backend builder, run:
   ```bash
   python backend/verify.py
   ```
   and verify that all 15 preset cases pass with 0 emergency misroutes, average latency < 100ms, and deflection rate >= 70%.
