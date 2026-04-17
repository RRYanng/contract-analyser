# ContractGuard — AI Contract Risk Analyzer

## What this project is
A web app that analyzes US business contracts for risks. Users upload a contract (PDF, DOCX, or text), and the system returns a full risk analysis report with plain English explanations and revision suggestions.

## Tech stack
- Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Python FastAPI
- LLM: Anthropic Claude API (claude-sonnet-4-20250514)
- Doc parsing: pymupdf, python-docx

## Key rules
- All LLM calls go through the backend, never from the frontend directly
- Every risk judgment MUST include a quoted clause from the original contract
- Output must be in plain English, not legal jargon
- Always include the legal disclaimer on every page
- Risk scores use 3 levels: Low / Medium / High
- All analysis is for US law context only

## How to run
- Frontend: cd frontend && npm run dev (port 3000)
- Backend: cd backend && uvicorn main:app --reload (port 8000)
