from pydantic import BaseModel
from typing import Optional


class UploadResponse(BaseModel):
    text: str
    filename: Optional[str] = None
    file_type: Optional[str] = None
    char_count: int


class TextInput(BaseModel):
    text: str


# ── Phase 2: Overview ─────────────────────────────────────────────────────────

class Party(BaseModel):
    name: str
    role: str


class ContractOverview(BaseModel):
    contract_type: str
    party_a: Party
    party_b: Party
    purpose: str
    payment_summary: str
    duration: str
    effective_date: str
    top_concerns: list[str]


class OverviewRequest(BaseModel):
    text: str


# ── Phase 3: Risk Scores ──────────────────────────────────────────────────────

from typing import Literal

RiskLevel = Literal["low", "medium", "high"]


class RiskScore(BaseModel):
    dimension: str
    risk_level: RiskLevel
    explanation: str
    quoted_clause: str


class RiskScoresResponse(BaseModel):
    risk_scores: list[RiskScore]


class RiskScoresRequest(BaseModel):
    text: str


# ── Phase 4: Clause Analysis ──────────────────────────────────────────────────

class ClauseAnalysis(BaseModel):
    clause_number: str
    original_text: str
    plain_english: str
    risk_identified: str
    worst_case_scenario: str
    suggested_revision: str
    negotiation_talking_point: str
    must_change: bool


class ClausesResponse(BaseModel):
    clauses: list[ClauseAnalysis]


class ClausesRequest(BaseModel):
    text: str


# ── Phase 5: Scenarios ────────────────────────────────────────────────────────

ProtectionLevel = Literal["none", "weak", "moderate", "strong"]


class Scenario(BaseModel):
    title: str
    description: str
    contract_says: str
    your_exposure: str
    protection_level: ProtectionLevel
    recommendation: str


class ScenariosResponse(BaseModel):
    scenarios: list[Scenario]


class ScenariosRequest(BaseModel):
    text: str


# ── Phase 6: Checklist ────────────────────────────────────────────────────────

ChecklistPriority = Literal["critical", "recommended", "optional"]
ChecklistStatus = Literal["needs_action", "acceptable", "not_applicable"]


class ChecklistItem(BaseModel):
    item: str
    priority: ChecklistPriority
    status: ChecklistStatus
    details: str


class ChecklistResponse(BaseModel):
    checklist: list[ChecklistItem]


class ChecklistRequest(BaseModel):
    text: str
    risk_summary: str = ""


# ── Phase 7: Chat ─────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    contract_text: str
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
