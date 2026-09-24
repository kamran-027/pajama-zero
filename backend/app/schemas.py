from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ClinicalLane(str, Enum):
    EMERGENCY_DIVERT = "01_EMERGENCY_DIVERT"
    STAFF_DELEGATE = "02_STAFF_DELEGATE"
    CONVERT_TO_VISIT = "03_CONVERT_TO_VISIT"
    PHYSICIAN_REVIEW = "04_PHYSICIAN_REVIEW"
    AUTO_RESOLVE = "05_AUTO_RESOLVE"

class PatientMessage(BaseModel):
    id: str = Field(..., description="Unique message ID")
    patient_name: str
    patient_age: int
    patient_gender: str
    mrn: str = Field(..., description="Medical Record Number")
    subject: str
    body: str
    timestamp: str
    relevant_history: Optional[str] = None
    active_medications: List[str] = Field(default_factory=list)

class JevTriageResult(BaseModel):
    message_id: str
    patient_name: str
    mrn: str
    subject: str
    snippet: str
    lane: ClinicalLane
    lane_title: str
    lane_badge_color: str
    acuity_score: int = Field(..., ge=1, le=10, description="Clinical acuity 1-10")
    requires_physician_license: bool
    clinical_rationale: str
    delegated_to: str
    action_plan: str
    pre_drafted_action: str
    latency_ms: float
    token_cost_usd: float
    evaluated_by: str = "JEV System One (TypeSafe AI)"
    timestamp: str

class TriageRequest(BaseModel):
    message: PatientMessage
    api_key: Optional[str] = None

class BatchTriageRequest(BaseModel):
    messages: List[PatientMessage]
    api_key: Optional[str] = None

class BatchTriageResponse(BaseModel):
    results: List[JevTriageResult]
    total_messages: int
    physician_queue_count: int
    deflected_count: int
    physician_deflection_rate: float
    total_latency_ms: float
    average_latency_ms: float
    total_cost_usd: float
    estimated_gpt4_cost_usd: float
    pajama_time_saved_minutes: float
    lane_distribution: Dict[str, int]

class SystemStatsResponse(BaseModel):
    status: str
    engine: str
    pajama_time_reduction_percent: float
    average_jev_latency_ms: float
    cost_reduction_vs_gpt4_percent: float
    supported_lanes: List[str]
