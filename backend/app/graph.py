from typing import TypedDict, Optional, Dict, Any, List
from langgraph.graph import StateGraph, END
from .schemas import PatientMessage, JevTriageResult, ClinicalLane
from .jev_engine import jev_engine

class TriageGraphState(TypedDict):
    message: PatientMessage
    api_key: Optional[str]
    triage_result: Optional[JevTriageResult]
    audit_trail: List[str]

async def evaluate_node(state: TriageGraphState) -> Dict[str, Any]:
    """Node 1: Evaluates patient message with JEV System One model."""
    msg = state["message"]
    api_key = state.get("api_key")
    
    triage_result = await jev_engine.evaluate_message(msg, custom_api_key=api_key)
    audit = state.get("audit_trail", []) + [
        f"JEV System One evaluated '{msg.id}' ({msg.patient_name}) in {triage_result.latency_ms}ms.",
        f"Lane Assigned: {triage_result.lane} | Acuity: {triage_result.acuity_score}/10 | License Required: {triage_result.requires_physician_license}"
    ]
    return {
        "triage_result": triage_result,
        "audit_trail": audit
    }

async def route_node(state: TriageGraphState) -> Dict[str, Any]:
    """Node 2: LangGraph clinical safety routing and escalation checks."""
    result = state["triage_result"]
    audit = state.get("audit_trail", [])
    
    if result.lane == ClinicalLane.EMERGENCY_DIVERT:
        audit.append("🚨 Clinical Safeguard Activated: Immediate emergency priority override triggered.")
    elif result.lane == ClinicalLane.STAFF_DELEGATE:
        audit.append("📋 Staff Deflection Confirmed: Message safely removed from physician queue.")
    elif result.lane == ClinicalLane.CONVERT_TO_VISIT:
        audit.append("📅 Revenue Conversion Triggered: Redirecting new clinical complaint to appointment booking.")
    elif result.lane == ClinicalLane.PHYSICIAN_REVIEW:
        audit.append("🩺 Physician Escalation: Added to high-acuity MD inbox queue.")
    elif result.lane == ClinicalLane.AUTO_RESOLVE:
        audit.append("📦 Zero-Touch Archive: Routine non-clinical message logged and closed.")

    return {
        "audit_trail": audit
    }

def build_triage_graph():
    """Compiles the LangGraph clinical triage pipeline."""
    workflow = StateGraph(TriageGraphState)
    
    workflow.add_node("evaluate", evaluate_node)
    workflow.add_node("route", route_node)
    
    workflow.set_entry_point("evaluate")
    workflow.add_edge("evaluate", "route")
    workflow.add_edge("route", END)
    
    return workflow.compile()

# Global compiled graph
clinical_triage_graph = build_triage_graph()

async def run_triage_pipeline(message: PatientMessage, api_key: Optional[str] = None) -> JevTriageResult:
    """Executes the complete LangGraph clinical triage workflow."""
    initial_state: TriageGraphState = {
        "message": message,
        "api_key": api_key,
        "triage_result": None,
        "audit_trail": ["Ingested patient portal message into LangGraph engine."]
    }
    final_state = await clinical_triage_graph.ainvoke(initial_state)
    return final_state["triage_result"]
