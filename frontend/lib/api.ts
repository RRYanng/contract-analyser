const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UploadResponse {
  text: string;
  filename: string | null;
  file_type: string | null;
  char_count: number;
}

export async function uploadContract(
  file: File | null,
  pastedText: string | null
): Promise<UploadResponse> {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  } else if (pastedText) {
    formData.append("text", pastedText);
  } else {
    throw new Error("Provide a file or text.");
  }

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed." }));
    throw new Error(err.detail || "Upload failed.");
  }

  return res.json();
}

// ── Phase 2: Overview ─────────────────────────────────────────────────────────

export interface Party {
  name: string;
  role: string;
}

export interface ContractOverview {
  contract_type: string;
  party_a: Party;
  party_b: Party;
  purpose: string;
  payment_summary: string;
  duration: string;
  effective_date: string;
  top_concerns: string[];
}

// ── Phase 3: Risk Scores ──────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export interface RiskScore {
  dimension: string;
  risk_level: RiskLevel;
  explanation: string;
  quoted_clause: string;
}

export interface RiskScoresResponse {
  risk_scores: RiskScore[];
}

export async function analyzeRiskScores(text: string): Promise<RiskScoresResponse> {
  const res = await fetch(`${API_BASE}/api/analyze/risk-scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }

  return res.json();
}

// ── Phase 6: Checklist ────────────────────────────────────────────────────────

export type ChecklistPriority = "critical" | "recommended" | "optional";
export type ChecklistStatus = "needs_action" | "acceptable" | "not_applicable";

export interface ChecklistItem {
  item: string;
  priority: ChecklistPriority;
  status: ChecklistStatus;
  details: string;
}

export interface ChecklistResponse {
  checklist: ChecklistItem[];
}

export async function analyzeChecklist(text: string, riskSummary = ""): Promise<ChecklistResponse> {
  const res = await fetch(`${API_BASE}/api/analyze/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, risk_summary: riskSummary }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }

  return res.json();
}

// ── Phase 5: Scenarios ────────────────────────────────────────────────────────

export type ProtectionLevel = "none" | "weak" | "moderate" | "strong";

export interface Scenario {
  title: string;
  description: string;
  contract_says: string;
  your_exposure: string;
  protection_level: ProtectionLevel;
  recommendation: string;
}

export interface ScenariosResponse {
  scenarios: Scenario[];
}

export async function analyzeScenarios(text: string): Promise<ScenariosResponse> {
  const res = await fetch(`${API_BASE}/api/analyze/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }

  return res.json();
}

// ── Phase 4: Clause Analysis ──────────────────────────────────────────────────

export interface ClauseAnalysis {
  clause_number: string;
  original_text: string;
  plain_english: string;
  risk_identified: string;
  worst_case_scenario: string;
  suggested_revision: string;
  negotiation_talking_point: string;
  must_change: boolean;
}

export interface ClausesResponse {
  clauses: ClauseAnalysis[];
}

export async function analyzeClauses(text: string): Promise<ClausesResponse> {
  const res = await fetch(`${API_BASE}/api/analyze/clauses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }

  return res.json();
}

// ── Phase 7: Chat ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export async function sendChatMessage(
  contractText: string,
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contract_text: contractText, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Chat failed." }));
    throw new Error(err.detail || "Chat failed.");
  }

  return res.json();
}

export async function analyzeOverview(text: string): Promise<ContractOverview> {
  const res = await fetch(`${API_BASE}/api/analyze/overview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }

  return res.json();
}
