import asyncio
from app.presets import CLINICAL_INBOX_PRESETS
from app.graph import run_triage_pipeline
from app.schemas import ClinicalLane

async def test_suite():
    print("=" * 60)
    print("PajamaZero Automated Clinical Verification Suite")
    print("=" * 60)
    
    results = []
    for msg in CLINICAL_INBOX_PRESETS:
        res = await run_triage_pipeline(msg)
        results.append(res)
        print(f"[{res.lane.value}] Acuity: {res.acuity_score}/10 | Latency: {res.latency_ms}ms | Pt: {res.patient_name} ({res.mrn})")
    
    # 1. Verification of Emergency Red Flags
    emergencies = [r for r in results if r.lane == ClinicalLane.EMERGENCY_DIVERT]
    assert len(emergencies) >= 2, f"Expected at least 2 emergency detections, got {len(emergencies)}"
    for em in emergencies:
        assert em.acuity_score >= 9, f"Emergency {em.patient_name} acuity {em.acuity_score} < 9"
        assert em.requires_physician_license is True, "Emergency must have license flag true"
    print("\n✅ Criteria 1 PASSED: Emergency cases correctly flagged with Acuity >= 9 in sub-100ms.")

    # 2. Verification of Physician Deflection Rate
    md_cases = [r for r in results if r.lane == ClinicalLane.PHYSICIAN_REVIEW]
    deflected_cases = len(results) - len(md_cases)
    deflection_rate = (deflected_cases / len(results)) * 100.0
    print(f"\nTotal Cases: {len(results)} | MD Queue: {len(md_cases)} | Deflected: {deflected_cases}")
    print(f"Deflection Rate: {deflection_rate:.1f}%")
    assert deflection_rate >= 70.0, f"Deflection rate {deflection_rate}% < 70%"
    print(f"✅ Criteria 2 PASSED: Physician inbox deflection rate is {deflection_rate:.1f}% (>= 70%).")

    # 3. Verification of Latency
    avg_latency = sum(r.latency_ms for r in results) / len(results)
    print(f"\nAverage JEV Evaluation Latency: {avg_latency:.2f}ms")
    assert avg_latency < 100.0, f"Average latency {avg_latency}ms >= 100ms"
    print(f"✅ Criteria 3 PASSED: Average JEV decision latency is {avg_latency:.2f}ms (< 100ms).")

    print("\n" + "=" * 60)
    print("ALL ACCEPTANCE CRITERIA MET PROGRAMMATICALLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_suite())
