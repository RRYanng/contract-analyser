# Product Requirements Document
## Contract Analyser — AI-Powered Contract Risk Analysis Tool

**Version:** 1.0
**Date:** April 2026
**Author:** Ruiyi (Alan) Yang
**Status:** In Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Competitive Landscape](#25-competitive-landscape)
4. [Goals & Success Metrics](#3-goals--success-metrics)
5. [Target Users](#4-target-users)
6. [User Journey](#5-user-journey)
7. [Feature Requirements](#6-feature-requirements)
8. [Out of Scope](#7-out-of-scope)
9. [Technical Requirements](#8-technical-requirements)
10. [Design & UX Principles](#9-design--ux-principles)
11. [Risks & Mitigations](#10-risks--mitigations)
12. [Open Questions](#11-open-questions)

---

## 1. Overview

Contract Analyser is a web-based AI agent that helps freelancers and small business owners identify risks in contracts before signing. It reads a contract, produces a structured risk report in plain language, and supports multi-turn conversation so users can ask follow-up questions without re-uploading.

The product is designed specifically for the **vendor (乙方) perspective** — the party that typically has less negotiating power and least access to legal expertise.

---

## 2. Problem Statement

### Background

Contracts are written by and for lawyers. For the millions of freelancers, independent contractors, and small business owners who sign them every day, the experience is:

- Read it and feel confused
- Sign it anyway because the deal needs to close
- Find out later that a clause they didn't understand is now being used against them

Hiring a lawyer to review every contract is expensive and impractical for individuals. Existing tools either produce overly technical output, or summarise without flagging what actually matters.

### Core User Pain Points

| Pain Point | Description |
|---|---|
| Comprehension gap | Legal language is inaccessible to non-lawyers |
| Risk blindness | Users don't know which clauses are standard vs. dangerous |
| No actionable next step | Even when risks are flagged, users don't know what to do |
| Scenario uncertainty | Users can't reason about what happens if things go wrong |
| Cost barrier | Professional legal review is unaffordable for small contracts |

### The Opportunity

An AI tool that translates legal language into plain speech, prioritises risks by severity, and provides ready-to-use negotiation language can close this gap — not by replacing lawyers, but by making users informed enough to protect themselves on everyday contracts.

---

## 2.5 Competitive Landscape

| Product | What they do well | Gap we're addressing |
|---|---|---|
| Ironclad / DocuSign CLM | Enterprise contract lifecycle management | Priced for enterprises; individual freelancers can't access |
| LegalZoom / Rocket Lawyer | Template generation + document review at lower cost | Focused on creating documents, not analyzing unfair terms the user is about to sign |
| ChatGPT / Claude (general purpose) | Flexible legal Q&A, widely accessible | No structured output; no vendor-perspective framing; no persistent analysis context across follow-ups |
| Spellbook | AI copilot for contract drafting | Built for lawyers drafting contracts, not for vendors reviewing them |
| Harvey AI | High-end legal AI for law firms | Enterprise/law-firm pricing and positioning; not serving the individual vendor |

**Where we win:** Contract Analyser is the only tool purpose-built for the *vendor side* of a contract negotiation, with structured risk output designed for non-lawyer comprehension and action.

**Where we're honestly weak:** General-purpose LLMs like ChatGPT can do perhaps 60% of what we do with zero onboarding — the user just pastes the contract and asks "what should I worry about?" Our defensible edge is *not* model capability; it's the **prompt architecture, structured risk framework, and vendor-specific framing** that produce consistent, actionable output. If those are easy to replicate, we don't have a moat. That's why Module 3's scored dashboard and Module 4's scenario playbook structure are the real product, not "AI reads your contract."

---

## 3. Goals & Success Metrics

### Product Goals

1. Help users identify the most dangerous clauses in a contract before signing
2. Give users a concrete action plan for negotiation
3. Prepare users for worst-case scenarios specific to their contract

### Success Metrics

| Metric | Target |
|---|---|
| Task completion rate | User reaches action checklist in >80% of sessions |
| Comprehension score | User can correctly answer "what's the biggest risk in this contract" after using the tool |
| Follow-up question rate | >50% of users ask at least one follow-up question (signals engagement with the analysis) |
| Return usage | User uploads more than one contract within 30 days |

### What Success Looks Like for the User

After using Contract Analyser, the user can confidently answer:
1. What is the single biggest risk in this contract?
2. If things go wrong, what are my options?
3. Which specific clauses do I need to push back on?

---

## 4. Target Users

### Primary User

**The Vendor-Side Individual**

- Freelancers (designers, developers, writers, consultants)
- Independent contractors
- Small business owners (1–10 person operations)
- First-time employees reviewing an employment contract

**Characteristics:**
- Non-legal background
- Signing contracts regularly but infrequently enough that each one feels unfamiliar
- Limited budget for professional legal review
- Time-pressured (deal needs to close, limited time to review)
- Higher stakes than they realise

### Secondary User

**The Cautious Professional**

- Mid-level employees reviewing NDAs or service agreements
- Startup founders reviewing vendor contracts
- Anyone who wants a second opinion before signing

### User Persona

> *The following is a hypothetical persona representing our primary target user — not a real customer. It's used throughout this PRD to ground feature decisions in a concrete user scenario.*

> **Name:** Maya, 29, freelance UX designer (based in Los Angeles, CA)
>
> **Situation:** She's just received a 12-page service contract from a new SaaS startup client based in San Francisco. The deal is worth $12,000 USD. She has 48 hours to sign.
>
> **Feeling:** Excited about the work, anxious about the paperwork. She's read it twice and doesn't understand three clauses. She doesn't want to look unsophisticated by asking too many questions. She definitely can't afford a lawyer for this.
>
> **What she needs:** Someone to tell her, clearly and quickly: is this contract fair? What should she push back on? What happens if they don't pay?

---

## 5. User Journey

### End-to-End Flow

```
[Entry] User arrives at the web app
    ↓
[Input] Upload PDF/Word file — OR — paste contract text directly
    ↓
[Processing] System extracts and analyses contract content
    ↓
[Output] Structured risk report is generated (6 modules, see Section 6)
    ↓
[Exploration] User reads report, clicks into specific risk areas
    ↓
[Conversation] User asks follow-up questions in multi-turn chat
    ↓
[Action] User downloads action checklist + suggested clause rewrites
    ↓
[Exit] User goes to negotiation prepared
```

### Key Moments

| Moment | Design Requirement |
|---|---|
| First 10 seconds after upload | Show a loading state that signals the system is working hard, not just waiting |
| Risk dashboard lands | User should immediately see the overall risk level — don't bury it |
| Reading a specific clause analysis | Plain language must come before the legal quote, not after |
| Asking a follow-up question | Response must reference the specific contract, not give generic advice |
| Downloading the checklist | Output should be formatted to bring to a meeting, not just read on screen |

---

## 6. Feature Requirements

### Module 1 — Contract Quick Summary

**Purpose:** Orient the user in under 30 seconds.

**Output:**
- What type of contract this is
- What the vendor (user) is required to do
- Key figures: contract value, duration, payment schedule
- One-line overall risk assessment

**Requirements:**
- Maximum 5 sentences
- Must identify contract type automatically (service, employment, lease, purchase)
- Must surface the single most important number (payment amount or penalty cap)

---

### Module 2 — Risk Score Dashboard

**Purpose:** Give users an at-a-glance view of where the risks are concentrated.

**Dimensions scored:**

| Dimension | What it measures |
|---|---|
| Clarity of vendor obligations | Are deliverables and acceptance criteria clearly defined? |
| Payment terms | Is the payment trigger fair? Are delays penalised? |
| Liability symmetry | Are penalties equal for both parties, or stacked against the vendor? |
| IP ownership | Who owns the work product? Are there carve-outs for pre-existing IP? |
| Confidentiality & non-compete | Is the scope reasonable and time-limited? |
| Termination conditions | Can the client terminate without cause? What compensation applies? |
| Force majeure | Is the definition broad enough to be abused? |
| Dispute resolution | Is the venue and mechanism fair to the vendor? |

**Risk levels:**
- 🟢 **Low** — Standard clause, no action needed
- 🟡 **Medium** — Worth understanding, may want to negotiate
- 🔴 **High** — Actively unfair or dangerous, should push back

**Requirements:**
- All 8 dimensions must be scored for every contract
- Each dimension must include a one-line plain-language explanation of the score
- Dashboard must load before the full analysis (users need orientation first)

---

### Module 3 — Clause-by-Clause Risk Analysis

**Purpose:** Explain each medium and high risk clause in detail, with context and action.

**Output structure per clause:**

```
Original text (quoted)
↓
Plain language explanation (what this actually means, max 3 sentences)
↓
Potential harm (what could happen if this clause is triggered, with a concrete example)
↓
Worst-case scenario (if everything goes wrong, what does this clause mean for you specifically)
↓
Suggested revision (alternative clause language the vendor can propose)
```

**Requirements:**
- Low-risk clauses are acknowledged but not expanded (reduces noise)
- Concrete examples must be specific to the contract type (not generic)
- Suggested revisions must be in legally usable language, with a plain-language note explaining what protection the revision adds
- Clauses must be presented in priority order (highest risk first)

---

### Module 4 — Extreme Scenario Playbook

**Purpose:** Help users reason about what happens when things go wrong — before they go wrong.

**Four scenarios covered for every contract:**

**Scenario A: Client withholds payment or refuses to accept deliverables**
- What clause(s) govern this situation in this specific contract
- What actions the vendor can take (in order of escalation)
- What the worst realistic outcome is, and how to limit it

**Scenario B: Client terminates the contract unilaterally**
- What compensation (if any) is owed under the current contract
- What a fair termination clause would look like
- What to do if there is no termination compensation clause

**Scenario C: Force majeure event (pandemic, regulatory change, natural disaster)**
- How liability is divided under the current contract
- How to invoke force majeure protection
- What the vendor should document if this happens

**Scenario D: Client becomes insolvent or disappears**
- How to make a creditor claim
- Whether any payment has already been received (and is therefore safe)
- What contract language would have helped in this situation

**Requirements:**
- Each scenario must reference specific clauses from the uploaded contract, not generic advice
- Responses must be actionable, not just explanatory
- Tone should be calm and practical — not alarmist

---

### Module 5 — Auto-Generated Clause Revisions

**Purpose:** Give users ready-to-use language they can bring to negotiation.

**Output per high-risk clause:**
- Revised clause in formal legal language
- Plain-language explanation: "This revision protects you by..."
- Negotiation framing: "You can present this as..."

**Requirements:**
- Revisions must be jurisdiction-aware — v1 targets general US common law contracts; Canada and China jurisdiction support deferred to v2
- Must not be presented as legal advice — framed as "suggested language for discussion"
- Revisions should be realistic — not maximally aggressive language the client will never accept

---

### Module 6 — Pre-Signing Action Checklist

**Purpose:** Give users a concrete to-do list they can act on immediately.

**Three-part checklist:**

**Must change before signing:**
List of clauses that are actively unfair and should not be accepted as written. Ordered by severity.

**Recommend adding:**
Protections that are missing from the contract entirely (e.g., payment milestone structure, IP carve-out, capped liability).

**Confirm with the client before signing:**
Questions the user should ask the client directly to clarify ambiguous terms.

**Requirements:**
- Checklist must be exportable / printable as a standalone document
- Each item must link back to the relevant clause analysis
- Maximum 10 items per category (prioritise, don't overwhelm)

---

### Module 7 — Multi-Turn Conversation

**Purpose:** Allow users to explore the analysis interactively without re-uploading.

**Capabilities:**
- Ask about specific clauses ("What does clause 4.2 actually mean?")
- Run hypotheticals ("What if I deliver two weeks late?")
- Request deeper analysis ("Can you explain the IP clause in more detail?")
- Ask for negotiation coaching ("How should I respond if they won't change the payment terms?")

**Requirements:**
- Full contract content must be retained in context for the entire session
- All previous analysis must be available as context (user shouldn't have to re-explain)
- Responses must reference the specific contract, never give generic answers
- Session ends when user closes the browser — no persistent storage of contract content

---

## 7. Out of Scope

The following are explicitly not part of this product:

| Out of Scope | Reason |
|---|---|
| Drafting contracts from scratch | Different use case; requires legal expertise this tool doesn't claim |
| Providing formal legal opinions | Tool is an AI assistant, not a lawyer; legal liability concern |
| Storing user contract data beyond the session | Privacy; users are sharing sensitive commercial information |
| Supporting both parties simultaneously | Tool is designed for the vendor perspective; neutrality would weaken it |
| Multi-language contracts | Out of scope for v1; adds significant complexity |
| Jurisdiction-specific legal advice | Too complex for v1; tool operates at a general level |

---

## 8. Technical Requirements

### Input
- Accepted file formats: PDF, DOCX, DOC
- Maximum file size: 10MB
- Alternative input: direct text paste (no file size limit)
- Contract language: English (primary, v1); Chinese (secondary, planned for v2)

### AI Layer
- Model: Claude API
  - Analysis (complex reasoning): `claude-opus-4-7` or `claude-sonnet-4-6`
  - Follow-up conversation (lower complexity): `claude-sonnet-4-6`
  - Rationale: Opus used for initial structured risk analysis where reasoning depth matters most; Sonnet used for multi-turn Q&A where latency and cost dominate the user experience
- Context window: Full contract must fit in a single context window
- Conversation memory: Full session history retained within session, cleared on close
- Response format: Structured JSON output parsed into UI components

### Backend
- Language: Python
- Framework: FastAPI
- Document parsing: PyMuPDF (PDF), python-docx (Word)
- Session management: Server-side session with TTL

### Frontend
- Framework: Next.js
- Styling: Tailwind CSS
- Risk dashboard: Chart.js or Recharts
- Export: Client-side PDF generation for checklist

### Infrastructure
- Frontend hosting: Vercel
- Backend hosting: Railway
- No database required for v1 (stateless sessions)

### Performance Requirements
- Contract upload to first output: < 30 seconds for contracts up to 20 pages
- Follow-up question response: < 10 seconds

---

## 9. Design & UX Principles

**1. Plain language before legal language**
Every section leads with the plain-language explanation. The original legal text is shown below, not above. Users came here because they don't understand the legalese — don't make them read it first.

**2. Risk severity must be immediately visible**
A user who only spends 2 minutes on the report should still leave knowing whether this contract is broadly safe or broadly dangerous. The dashboard is the first thing they see.

**3. Action over information**
Every section ends with something the user can do. Risk analysis without action is anxiety-inducing, not helpful.

**4. Honest about limitations**
The disclaimer is not fine print — it's part of the UX. "This is not legal advice" should feel like a trustworthy friend being honest, not legal cover.

**5. Calm, not alarming**
The tone should feel like a knowledgeable friend walking you through something, not a warning system going off. Users are already anxious. The product should reduce that, not amplify it.

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI produces inaccurate legal analysis | Medium | High | Prominent disclaimer; encourage professional review for high-value contracts |
| Users treat output as legal advice | Medium | High | UX copy designed to position tool as preparation aid, not authority |
| Contract too long for context window | Low | Medium | Implement chunking strategy; prioritise key clauses if contract exceeds limit |
| Users share sensitive commercial information | High | Medium | No persistent storage; clear privacy communication at upload step |
| Output quality varies by contract type | Medium | Medium | Test across all 4 supported contract types during development; tune prompts per type |

---

## 11. Open Questions

| Question | Owner | Priority |
|---|---|---|
| Should the tool support English-language contracts in v1? | Product | Medium |
| What is the right session timeout? (1 hour? Browser close only?) | Engineering | Low |
| Should users be able to save/export the full report, or just the checklist? | Product | High |
| Is there a B2B use case (platforms embedding this for their users)? | Product | Low — post v1 |
| How do we handle contracts that reference external documents? | Engineering | Medium |

---

*Document version 1.0 — Contract Analyser — April 2026*
*Author: Ruiyi (Alan) Yang*
