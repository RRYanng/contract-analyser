import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from models.schemas import UploadResponse
from services.parser import extract_text

router = APIRouter()

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024  # bytes


@router.post("/upload", response_model=UploadResponse)
async def upload_contract(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
):
    if file is not None:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 10MB limit.")

        filename = file.filename or "upload"
        lower = filename.lower()
        if not any(lower.endswith(ext) for ext in (".pdf", ".docx", ".txt")):
            raise HTTPException(
                status_code=415,
                detail="Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
            )

        try:
            extracted = extract_text(content, filename)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not parse file: {str(e)}")

        if not extracted.strip():
            raise HTTPException(status_code=422, detail="No text could be extracted from the file.")

        ext = lower.rsplit(".", 1)[-1]
        return UploadResponse(
            text=extracted,
            filename=filename,
            file_type=ext,
            char_count=len(extracted),
        )

    elif text and text.strip():
        cleaned = text.strip()
        return UploadResponse(
            text=cleaned,
            filename=None,
            file_type="text",
            char_count=len(cleaned),
        )

    else:
        raise HTTPException(status_code=400, detail="Provide either a file or pasted text.")
