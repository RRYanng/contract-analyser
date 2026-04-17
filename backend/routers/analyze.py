from fastapi import APIRouter, HTTPException
from models.schemas import (
    OverviewRequest, ContractOverview,
    RiskScoresRequest, RiskScoresResponse,
    ClausesRequest, ClausesResponse,
    ScenariosRequest, ScenariosResponse,
    ChecklistRequest, ChecklistResponse,
)
from services.claude_client import ask_claude_json
from services.prompts import OVERVIEW_PROMPT, RISK_SCORES_PROMPT, CLAUSES_PROMPT, SCENARIOS_PROMPT, CHECKLIST_PROMPT
import json

router = APIRouter()


@router.post("/overview", response_model=ContractOverview)
async def analyze_overview(req: OverviewRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Contract text is required.")

    prompt = OVERVIEW_PROMPT.format(contract_text=req.text)
    try:
        data = ask_claude_json(prompt, max_tokens=1024)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")

    try:
        return ContractOverview(**data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected response shape: {e}")


@router.post("/risk-scores", response_model=RiskScoresResponse)
async def analyze_risk_scores(req: RiskScoresRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Contract text is required.")

    prompt = RISK_SCORES_PROMPT.format(contract_text=req.text)
    try:
        data = ask_claude_json(prompt, max_tokens=2048)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")

    try:
        return RiskScoresResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected response shape: {e}")


@router.post("/clauses", response_model=ClausesResponse)
async def analyze_clauses(req: ClausesRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Contract text is required.")

    prompt = CLAUSES_PROMPT.format(contract_text=req.text)
    try:
        data = ask_claude_json(prompt, max_tokens=4096)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")

    try:
        return ClausesResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected response shape: {e}")


@router.post("/scenarios", response_model=ScenariosResponse)
async def analyze_scenarios(req: ScenariosRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Contract text is required.")

    prompt = SCENARIOS_PROMPT.format(contract_text=req.text)
    try:
        data = ask_claude_json(prompt, max_tokens=2048)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")

    try:
        return ScenariosResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected response shape: {e}")


@router.post("/checklist", response_model=ChecklistResponse)
async def analyze_checklist(req: ChecklistRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Contract text is required.")

    prompt = CHECKLIST_PROMPT.format(contract_text=req.text, risk_summary=req.risk_summary)
    try:
        data = ask_claude_json(prompt, max_tokens=2048)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")

    try:
        return ChecklistResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected response shape: {e}")
