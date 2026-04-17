from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.prompts import CHAT_SYSTEM_PROMPT
from services.claude_client import get_client
import os

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.contract_text.strip():
        raise HTTPException(status_code=400, detail="Contract text is required.")
    if not req.messages:
        raise HTTPException(status_code=400, detail="At least one message is required.")

    system = CHAT_SYSTEM_PROMPT.format(contract_text=req.contract_text)

    try:
        client = get_client()
        model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
        response = client.messages.create(
            model=model,
            max_tokens=1024,
            system=system,
            messages=[{"role": m.role, "content": m.content} for m in req.messages],
        )
        return ChatResponse(reply=response.content[0].text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chat failed: {e}")
