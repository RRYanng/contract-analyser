import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, analyze, chat

app = FastAPI(title="ContractGuard API", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])
app.include_router(chat.router, prefix="/api", tags=["chat"])


@app.get("/health")
def health():
    return {"status": "ok"}
