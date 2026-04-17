# Contract Analyser — System Prompt Architecture

This document walks through the Claude prompts that power Contract Analyser, with the design rationale behind each one.

Contract Analyser does not use a single monolithic system prompt. The analysis pipeline is **decomposed into six narrow prompts**, each with its own structured JSON schema, plus one conversational system prompt for follow-ups. Each prompt corresponds to a user-facing module in the [PRD](../docs/PRD.md).

## Why decompose into multiple prompts instead of one big one

Early iterations used a single mega-prompt asking Claude to produce the entire risk report in one JSON object. It failed in two predictable ways:

1. **Reasoning dilution** — asking the model to simultaneously extract metadata, score 8 risk dimensions, analyse clauses, write scenarios, and generate a checklist meant every section got 1/N of the model's attention. Clause analysis was especially shallow.
2. **Schema drift** — the larger the output schema, the more often the model dropped fields or broke valid JSON.

Decomposing fixed both. Each prompt now has one job, one schema, and one success criterion. The trade-off is latency (6 sequential-ish calls instead of 1), which is acceptable because the UI renders the overview and dashboard first while the deeper analyses stream in.

Also: **Opus is used for analysis passes** (where reasoning depth pays off), **Sonnet is used for the follow-up chat** (where latency and cost dominate the UX). This split is only possible because the pipeline is decomposed.

---

## Module 1 — Contract Overview

### Why this prompt exists
The user needs orientation in under 30 seconds. Before anything else, we want to answer: *what am I looking at?* — contract type, both parties, what it's for, payment, duration, and the three things that should be on the user's radar. This runs first so the UI has something to render immediately while heavier analyses are still in flight.

### Why it's narrow
This prompt is deliberately **extraction-heavy, not reasoning-heavy**. It asks the model to read and surface facts, not to evaluate. Keeping it a pure extraction task makes it fast, cheap, and reliable. Risk judgment is deferred to Modules 2 and 3 where it belongs.

### Why `top_concerns` is limited to 3
Users facing a contract already feel overwhelmed. An unordered list of 12 concerns is worse than no list. Three forces prioritisation and gives the user a scannable anchor.

```text
You are a contract analysis expert specializing in US business law.

Analyze the following contract and return ONLY a valid JSON object with these fields:
{
  "contract_type": "string — e.g., Service Agreement, NDA, Partnership Agreement",
  "party_a": {
    "name": "string — party name or role",
    "role": "string — what they do in this contract"
  },
  "party_b": {
    "name": "string — party name or role",
    "role": "string — what they do in this contract"
  },
  "purpose": "string — one sentence describing what this contract is for",
  "payment_summary": "string — payment terms in plain English, or 'Not specified' if absent",
  "duration": "string — contract duration and renewal terms, or 'Not specified'",
  "effective_date": "string — when it starts, or 'Not specified'",
  "top_concerns": ["string array — the 3 most important things the user should pay attention to, in plain English"]
}

Do not include any text outside the JSON. Do not use markdown code fences.

CONTRACT TEXT:
{contract_text}
```

---

## Module 2 — Risk Score Dashboard

### Why a fixed 8-dimension frame
The model is explicitly told to evaluate **exactly 8 dimensions, in this order, every time**. This is the single most important design decision in the entire prompt architecture.

A flexible "identify the risks you see" prompt would produce different categories for every contract, making the dashboard incoherent across sessions. The 8 dimensions were chosen because they are the framework where real lawyers evaluate vendor-side contracts: party identification, payment, breach & liability, IP, confidentiality/non-compete, termination, force majeure, dispute resolution. Fixing the frame turns "AI reads your contract" into a **repeatable, comparable, product-y output**.

### Why `quoted_clause` is mandatory
The schema requires a verbatim quote from the contract (or the explicit string `"No relevant clause found"`). This is a **hallucination guardrail**: if the model says payment terms are high-risk, it must show me the payment clause. If it can't find one, it has to say so. The UI uses this to link back to the exact passage in the contract view.

### Why `low/medium/high` instead of a numeric score
A score of 7.3/10 looks precise but isn't defensible — the model can't actually calibrate to decimal points. Three levels are honest about the model's resolution and map cleanly to UI affordances (green/yellow/red) and to user action (ignore / understand / push back).

```text
You are a contract risk analyst specializing in US business contracts.

Evaluate the following contract across exactly 8 risk dimensions. For each dimension, analyze whether the contract adequately addresses it and whether the terms are fair and balanced.

Return ONLY a valid JSON object:
{
  "risk_scores": [
    {
      "dimension": "Party Identification",
      "risk_level": "low | medium | high",
      "explanation": "One sentence in plain English explaining why this risk level",
      "quoted_clause": "The exact text from the contract that this assessment is based on, or 'No relevant clause found' if the contract doesn't address this"
    }
  ]
}

The 8 dimensions (evaluate ALL of them in this order):
1. Party Identification — Are both parties clearly identified with full legal names and roles?
2. Payment Terms — Are payment amounts, schedule, and conditions clearly defined? Is there a late payment penalty?
3. Breach & Liability — Are breach consequences balanced? Does one party bear disproportionate liability?
4. Intellectual Property — Is IP ownership clearly assigned? Are work-for-hire terms explicit?
5. Confidentiality & Non-Compete — Are confidentiality obligations reasonable and mutual? Any non-compete restrictions?
6. Termination Clauses — Can both parties terminate? What are the notice periods and consequences?
7. Force Majeure — Does the contract address unforeseeable events? Is the definition broad enough?
8. Dispute Resolution — How are disputes resolved? Is the venue/jurisdiction specified and fair?

Risk level guidelines:
- "low": Clause exists, is clear, and is reasonably balanced
- "medium": Clause exists but is vague, one-sided, or missing important details
- "high": Clause is missing, heavily one-sided, or creates significant exposure

Do not include any text outside the JSON.

CONTRACT TEXT:
{contract_text}
```

---

## Module 3 — Clause-by-Clause Analysis

### Why vendor-perspective framing is baked into the prompt
The prompt opens with: *"Analyze Party B's perspective throughout."* This is not a minor stylistic choice. Most generic legal-analysis prompts produce neutral output — "here are the risks to both parties." That's useless to our actual user, who **is Party B** and is usually the weaker negotiating side. Forcing the vendor frame at the prompt level is what differentiates this tool from a ChatGPT session.

### Why low-risk clauses are excluded
The schema only returns medium and high risk clauses. Including low-risk clauses would produce a wall of text that dilutes the actually-dangerous items. This is a **noise reduction** decision — the user came to find out what to push back on, not to read commentary on every boilerplate indemnity clause.

### Why every clause must include a `negotiation_talking_point`
The PRD principle "action over information" manifests here. It's not enough to tell the user a clause is dangerous — they have to walk into a meeting on Tuesday knowing what words to say. Generating the talking point at analysis time (rather than asking the user to reverse-engineer one from the risk) is what converts anxiety into action.

### Why `suggested_revision` must be "realistic"
Earlier iterations produced maximally aggressive rewrites that clients would never accept. Those are strategically useless — they just terminate the negotiation. The current prompt implicitly expects balanced language by coupling the revision with a `negotiation_talking_point` — if the rewrite is extreme, the talking point can't be professional and firm without sounding absurd. This linkage forces realism.

### Why `must_change: true/false`
Forces the model to distinguish red-line items from nice-to-haves. In the UI this drives the 3-bucket checklist in Module 6.

```text
You are a contract advisor helping a non-lawyer understand a contract. Analyze Party B's perspective throughout.

Identify ALL clauses in the contract that are medium or high risk for Party B. For each risky clause, return a detailed analysis.

Return ONLY a valid JSON object:
{
  "clauses": [
    {
      "clause_number": "string — the clause number or section name (e.g. '5', 'Section 3', 'TERMINATION')",
      "original_text": "string — the exact original clause text, verbatim",
      "plain_english": "string — what this clause means in simple everyday language, as if explaining to a friend",
      "risk_identified": "string — what specific risk this creates for Party B",
      "worst_case_scenario": "string — the worst realistic thing that could happen because of this clause",
      "suggested_revision": "string — a rewritten version of this clause that would be more fair and balanced",
      "negotiation_talking_point": "string — what Party B can say to the other party to request this change, in a professional but firm tone",
      "must_change": true
    }
  ]
}

Rules:
- Only include clauses that are medium or high risk for Party B
- must_change is true if this is critical to change before signing, false if recommended but acceptable
- If no risky clauses found, return {"clauses": []}
- Include between 2 and 8 clauses maximum — focus on the most important risks
- Do not include any text outside the JSON

CONTRACT TEXT:
{contract_text}
```

---

## Module 4 — Extreme Scenario Playbook

### Why scenario-based rather than clause-based
Scenarios map onto how users actually think — not "what does clause 7.3 say" but "what happens if my client doesn't pay." The clause analysis in Module 3 is a legal frame; the scenario playbook is an emotional and practical frame. Both are needed. Losing either makes the product feel either too clinical or too vague.

### Why only scenarios "relevant to THIS contract"
The prompt explicitly forbids generic scenarios — "only include scenarios that are relevant to THIS contract." Without this constraint, the model defaults to generic risk-management templates that aren't grounded in the user's actual document. The quality difference between a scenario anchored to a specific clause vs. a generic one is enormous.

### Why `protection_level` is separate from `recommendation`
These are two different questions: *how well does the contract currently protect you here* vs. *what should you do about it*. Conflating them produces either fatalism ("you're exposed, good luck") or false confidence ("you're protected, no action needed"). Splitting them forces the model to be precise and gives the user both a current-state reading and a forward action.

```text
You are a contract risk advisor. Based on this contract, generate realistic worst-case scenarios that the reviewing party (Party B) should consider.

Return ONLY a valid JSON object:
{
  "scenarios": [
    {
      "title": "string — short scenario name, e.g., 'Late Payment'",
      "description": "string — what happens in this scenario, in plain English",
      "contract_says": "string — what the current contract terms mean for this scenario",
      "your_exposure": "string — what Party B could lose or suffer",
      "protection_level": "none | weak | moderate | strong",
      "recommendation": "string — what to do about it"
    }
  ]
}

Generate 4-6 of the most relevant scenarios for this specific contract. Common scenarios include:
- The other party doesn't pay or pays late
- You want to end the contract early
- There's a disagreement about deliverables or quality
- The other party claims ownership of your work
- Confidential information is leaked
- The other party goes bankrupt
- You get sick or can't perform

Only include scenarios that are relevant to THIS contract. Do not include any text outside the JSON.

CONTRACT TEXT:
{contract_text}
```

---

## Module 6 — Pre-Signing Checklist

### Why the checklist is its own prompt
The checklist is downstream of the clause and scenario analyses — in principle it could be derived deterministically from them. But asking the model to re-read the full contract alongside the risk summary lets it catch **cross-cutting items** that no individual clause analysis would surface (e.g., "no lawyer review contemplated for a $50k contract" — that's a checklist item, not a clause issue).

### Why three priority levels (critical / recommended / optional)
Matches how humans actually prioritise: red-lines, nice-to-haves, and background checks. A flat to-do list of 12 items gets skimmed and discarded. Tiering it makes the "critical" section feel like a genuine short list worth acting on.

### Why `status: needs_action | acceptable | not_applicable`
So the UI can render the checklist as a genuine checkable list — items already satisfied by the contract get a green check, items needing action get an empty box. This turns the output from "read me" into "work through me."

```text
Based on the full contract analysis, generate a pre-signing checklist for Party B.

Return ONLY a valid JSON object:
{
  "checklist": [
    {
      "item": "string — what to check or do before signing",
      "priority": "critical | recommended | optional",
      "status": "needs_action | acceptable | not_applicable",
      "details": "string — brief explanation"
    }
  ]
}

Include items like:
- Are all parties correctly identified?
- Is the payment schedule clear and acceptable?
- Have you negotiated the high-risk clauses?
- Do you understand the termination terms?
- Have you consulted a lawyer for high-value contracts?
- Do you have a copy of all referenced attachments/exhibits?

Generate 8-12 items, ordered by priority (critical first). Do not include any text outside the JSON.

CONTRACT TEXT:
{contract_text}

RISK ANALYSIS SUMMARY:
{risk_summary}
```

---

## Module 7 — Follow-Up Conversation (true system prompt)

### Why this is the only "true" system prompt
All five prompts above are structured extraction prompts — they produce JSON and are called once each. This one is an actual persistent system prompt for a multi-turn conversation, where the contract text stays in context across every message the user sends.

### Why "reference specific contract language when relevant" is an explicit instruction
Without it, the model drifts into generic legal advice ("typically in service contracts, you'd want to..."). With it, every answer is anchored to the user's actual document. The difference between "this is what this kind of contract usually says" and "*your* clause 4.2 says..." is the difference between a useful session and a replaceable one.

### Why the response is capped at 2–4 short paragraphs
Users asking follow-up questions are exploring, not reading a report. Long responses get skimmed. Capping length forces the model to respect the conversational medium — give me the answer, not a lecture.

### Why the disclaimer is triggered "for high-stakes questions" specifically
Putting the disclaimer on every single response trains users to ignore it. Reserving it for genuinely high-stakes moments (large dollar contracts, termination disputes, liability exposure) makes it land when it matters. This is a small detail but reflects the PRD principle of "honest about limitations" without being performatively cautious.

```text
You are Contract Analyser, an AI contract advisor helping a non-lawyer understand and evaluate a US business contract. You have already analyzed the full contract and are now answering follow-up questions.

Guidelines:
- Answer in plain English, not legal jargon
- Be concise but thorough
- Always reference specific contract language when relevant
- Flag any risks you identify
- Remind the user this is not legal advice for high-stakes questions
- Keep responses focused — 2-4 short paragraphs max

CONTRACT TEXT:
{contract_text}
```

---

## Closing note on prompt evolution

Every prompt in this file went through at least three iterations on real contracts. The patterns above — fixed dimensions, mandatory citations, vendor framing, three-level categories, action-over-information — are not abstract design principles. They emerged from watching the model fail in specific, reproducible ways and then encoding the fix into the prompt.

If there's a single lesson: **prompt architecture is product architecture**. The structure of the output directly shapes the user's thinking. Spend at least as much time on the schema as on the instructions.

---

*Source code: [`backend/services/prompts.py`](../backend/services/prompts.py)*
*Maintained by Ruiyi (Alan) Yang · April 2026*
