# Contract Analyser — System Prompt Architecture

This document walks through the Claude prompts that power Contract Analyser, with the reasoning behind how they're structured.

Contract Analyser uses **six narrow prompts** plus one conversational system prompt, rather than a single monolithic prompt. Each of the six corresponds to a user-facing module in the [PRD](../docs/PRD.md).

## Why multiple prompts instead of one

A few reasons I structured it this way from the start:

1. **Different modules have different output shapes.** Each has its own JSON schema, and keeping schemas small makes it easier to keep outputs valid across many contracts.
2. **Different modules benefit from different models.** Analysis modules (1–4, 6) use Opus where reasoning depth pays off. The follow-up chat (Module 7) uses Sonnet where latency and cost dominate the UX. This split is only possible when the prompts are separate calls.
3. **It's easier to iterate on one module at a time.** If the risk dashboard is off, I can fix Module 2 without regression-testing the whole pipeline.

The cost is that producing a full report involves several API calls, but the UI is designed to stream — the overview and dashboard render first while Module 3 and 4 are still in flight.

---

## Module 1 — Contract Overview

**What it does:** Extracts basic facts about the contract — type, parties, purpose, payment, duration, and the three things the user should pay attention to.

**Why it's just extraction:** This runs first, before any risk scoring. Keeping it a pure extraction task (no evaluation) makes it fast and cheap, and means the user sees something useful in the UI within a few seconds. Risk judgment is deferred to Modules 2 and 3.

**Why `top_concerns` is capped at 3:** A long list of concerns on first screen is overwhelming. Three feels like a short enough list that the user will actually read them.

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

**What it does:** Scores the contract across a fixed set of 8 risk dimensions.

**Why the 8 dimensions are fixed and always evaluated in the same order:** This is probably the most important design decision in the whole pipeline. If the model were free to "identify whatever risks it sees," the categories would be different for every contract, and the dashboard would be incoherent across sessions. Fixing the 8 dimensions makes the output comparable and gives the UI a stable structure to render against.

The 8 dimensions I picked are the ones that come up most often in vendor-side contract review: party identification, payment, breach & liability, IP, confidentiality/non-compete, termination, force majeure, dispute resolution.

**Why each risk must include a `quoted_clause`:** The schema forces the model to paste the verbatim clause it's basing the assessment on (or explicitly say "No relevant clause found"). This is a hallucination check — if the model claims payment terms are risky, I want to see the payment clause it's looking at. The UI also uses this quote to link the user back to the exact part of the contract.

**Why three levels (low/medium/high) instead of a numeric score:** A 10-point score looks precise but the model can't actually calibrate to that precision. Three levels are more honest and map cleanly onto what the user should do with the information: ignore (green), read (yellow), push back (red).

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

**What it does:** Picks out medium/high risk clauses and explains each one in plain English, with a suggested rewrite and a talking point for negotiation.

**Why the vendor perspective is baked into the prompt:** The prompt opens with "Analyze Party B's perspective throughout." A generic legal prompt produces balanced "risks to both sides" output, which isn't actually useful to the person I'm building this for — the user almost always *is* Party B and is usually the weaker negotiating side. Forcing the vendor frame at the prompt level is the main thing that separates this from a generic ChatGPT session.

**Why low-risk clauses are excluded:** The user is here to find out what to push back on, not to read commentary on every boilerplate clause. Including low-risk items would bury the ones that actually matter.

**Why each clause must include a `negotiation_talking_point`:** The whole point of the product is that the user walks into a meeting knowing what to say. Telling them "this clause is dangerous" without giving them actual words to use leaves the useful work undone.

**Why `must_change: true/false`:** This distinguishes red-line items (can't sign as written) from nice-to-haves (would prefer this but could live without it). The checklist in Module 6 uses this to build the 3-bucket action list.

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

**What it does:** Generates 4–6 realistic "what if this goes wrong" scenarios specific to this contract, with the user's exposure and recommended action for each.

**Why scenarios instead of more clause analysis:** The clause analysis in Module 3 is organized the way a lawyer thinks (clause-by-clause). The scenario playbook is organized the way a user thinks ("what if my client doesn't pay?"). I felt the product needed both — without the scenarios, the output feels too clinical; without the clause analysis, it feels too vague.

**Why the prompt forces scenarios to be "relevant to THIS contract":** Without this constraint, the model defaults to generic risk-management templates. The value is in scenarios anchored to the user's actual document.

**Why `protection_level` and `recommendation` are separate fields:** These answer two different questions — how well the current contract protects you here, versus what you should do about it. Combining them would produce either fatalism ("you're exposed, good luck") or false reassurance ("you're fine, no action"). Splitting them lets the model be precise on both.

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

**What it does:** Generates a prioritized checklist of things the user should verify or act on before signing.

**Why the checklist is its own prompt rather than assembled from earlier outputs:** In principle I could derive it from the previous modules, but giving the model the contract again alongside the risk summary lets it catch cross-cutting items that don't belong to any one clause — for example, "consider having a lawyer review this given the dollar value," which isn't a clause issue at all.

**Why three priority levels (critical / recommended / optional):** A flat list of 12 to-dos gets skimmed. Splitting into tiers makes the "critical" section feel like a genuine short list worth acting on.

**Why the `status` field exists:** It lets the UI render the output as an actual checkable list — items already satisfied by the contract show as done, items needing action show as open. This turns a block of text into something the user can work through.

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

## Module 7 — Follow-Up Conversation

**What it does:** Handles the multi-turn chat after the initial report. This is the only "true" system prompt in the project — all the others are one-shot structured extraction tasks.

**Why the prompt tells the model to reference specific contract language:** Without this instruction, the model drifts into generic legal advice ("typically in service contracts, you'd want…"). With it, every answer is anchored to the user's actual document. The useful product is the one that answers about *your* contract, not contracts in general.

**Why responses are capped at 2–4 paragraphs:** Users asking follow-ups are exploring, not reading a report. Long responses get skimmed or ignored.

**Why the disclaimer is only surfaced for high-stakes questions:** If every response ends with "this is not legal advice," users stop noticing it. Keeping it for the questions where it actually matters (big dollar amounts, termination fights, liability exposure) makes it more likely to land.

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

## What I took away from writing these

The structure of the output ended up mattering more than the wording of the instructions. Deciding to use three risk levels instead of a 10-point score, or forcing a quoted clause with every risk claim, or splitting "how protected are you" from "what should you do" — these are the choices that shape what the user ends up thinking when they read the report. I spent more time iterating on the JSON schemas than on the instruction text.

I also came away thinking that "prompt engineering" is mostly a misleading name for what's really happening here. Very little of this work was about clever instructions. Most of it was deciding what the output should look like, and then writing the minimum prompt that would produce that shape reliably.

---

*Source code: [`backend/services/prompts.py`](../backend/services/prompts.py)*
*Author: Ruiyi (Alan) Yang · April 2026*
