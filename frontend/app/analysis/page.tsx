"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeOverview, analyzeRiskScores, analyzeClauses, analyzeScenarios, analyzeChecklist,
  type ContractOverview, type RiskScoresResponse, type ClausesResponse,
  type ScenariosResponse, type ChecklistResponse,
} from "@/lib/api";
import ContractOverviewCard from "@/components/ContractOverview";
import RiskDashboard from "@/components/RiskDashboard";
import ClauseAnalysisSection from "@/components/ClauseAnalysis";
import ScenarioExplorer from "@/components/ScenarioExplorer";
import PreSignChecklist from "@/components/PreSignChecklist";
import ChatPanel from "@/components/ChatPanel";
import Link from "next/link";

type SectionStatus = "loading" | "done" | "error";

const TOC_SECTIONS = [
  { id: "overview",  label: "Contract Overview",     icon: "📄" },
  { id: "risk",      label: "Risk Dashboard",         icon: "⚠️" },
  { id: "clauses",   label: "Clause Analysis",        icon: "📋" },
  { id: "scenarios", label: "Worst-Case Scenarios",   icon: "🔮" },
  { id: "checklist", label: "Pre-Signing Checklist",  icon: "✅" },
  { id: "chat",      label: "Ask the AI",             icon: "💬" },
];

export default function AnalysisPage() {
  const router = useRouter();
  const [contractText, setContractText] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  const [overview,  setOverview]  = useState<ContractOverview | null>(null);
  const [riskScores, setRiskScores] = useState<RiskScoresResponse | null>(null);
  const [clauses,   setClauses]   = useState<ClausesResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenariosResponse | null>(null);
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);

  const [overviewStatus,  setOverviewStatus]  = useState<SectionStatus>("loading");
  const [riskStatus,      setRiskStatus]      = useState<SectionStatus>("loading");
  const [clausesStatus,   setClausesStatus]   = useState<SectionStatus>("loading");
  const [scenariosStatus, setScenariosStatus] = useState<SectionStatus>("loading");
  const [checklistStatus, setChecklistStatus] = useState<SectionStatus>("loading");

  const [overviewError,  setOverviewError]  = useState<string | null>(null);
  const [riskError,      setRiskError]      = useState<string | null>(null);
  const [clausesError,   setClausesError]   = useState<string | null>(null);
  const [scenariosError, setScenariosError] = useState<string | null>(null);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem("contractText");
    if (!stored) { router.replace("/"); return; }
    setContractText(stored);

    // All 5 analyses fire in parallel
    analyzeOverview(stored)
      .then((d) => { setOverview(d); setOverviewStatus("done"); })
      .catch((e: unknown) => { setOverviewError(msg(e)); setOverviewStatus("error"); });

    analyzeRiskScores(stored)
      .then((d) => { setRiskScores(d); setRiskStatus("done"); })
      .catch((e: unknown) => { setRiskError(msg(e)); setRiskStatus("error"); });

    analyzeClauses(stored)
      .then((d) => { setClauses(d); setClausesStatus("done"); })
      .catch((e: unknown) => { setClausesError(msg(e)); setClausesStatus("error"); });

    analyzeScenarios(stored)
      .then((d) => { setScenarios(d); setScenariosStatus("done"); })
      .catch((e: unknown) => { setScenariosError(msg(e)); setScenariosStatus("error"); });

    analyzeChecklist(stored)
      .then((d) => { setChecklist(d); setChecklistStatus("done"); })
      .catch((e: unknown) => { setChecklistError(msg(e)); setChecklistStatus("error"); });
  }, [router]);

  // Intersection observer to highlight active TOC item
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    for (const ref of Object.values(sectionRefs.current)) {
      if (ref) observer.observe(ref);
    }
    return () => observer.disconnect();
  }, [overviewStatus, riskStatus, clausesStatus, scenariosStatus, checklistStatus]);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allDone = [overviewStatus, riskStatus, clausesStatus, scenariosStatus, checklistStatus]
    .every((s) => s !== "loading");

  // Chat section is always "done" (it's interactive)
  const chatSectionReady = contractText !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-slate-950/95 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">ContractGuard</span>
        </Link>
        <div className="flex items-center gap-4">
          {!allDone && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              Analyzing…
            </div>
          )}
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            New contract
          </Link>
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl w-full mx-auto px-4 py-8 gap-8">
        {/* ── Sticky TOC sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contract Analysis</p>
              {contractText && (
                <p className="text-xs text-slate-600">{contractText.length.toLocaleString()} characters</p>
              )}
            </div>
            {TOC_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-600/15 text-blue-300 border border-blue-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span className="text-base leading-none">{section.icon}</span>
                <span className="leading-tight">{section.label}</span>
              </button>
            ))}

            {/* Disclaimer */}
            <div className="pt-4 mt-2 border-t border-slate-800">
              <p className="text-xs text-slate-600 leading-relaxed">
                Not legal advice. Consult a licensed attorney for formal opinions.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 space-y-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Contract Analysis Report</h1>
            <p className="text-sm text-slate-400 mt-1">
              {contractText ? `${contractText.length.toLocaleString()} characters · 6 sections` : "Loading…"}
            </p>
          </div>

          {/* Section 1: Overview */}
          <section id="overview" ref={(el) => { sectionRefs.current.overview = el; }}>
            <SectionHeader number={1} title="Contract Overview" />
            {overviewStatus === "loading" && <SectionSkeleton label="Reading contract overview…" />}
            {overviewStatus === "error"   && <SectionError msg={overviewError!} />}
            {overviewStatus === "done" && overview && <ContractOverviewCard data={overview} />}
          </section>

          {/* Section 2: Risk Dashboard */}
          <section id="risk" ref={(el) => { sectionRefs.current.risk = el; }}>
            <SectionHeader number={2} title="Risk Dashboard" />
            {riskStatus === "loading" && <SectionSkeleton label="Scoring 8 risk dimensions…" />}
            {riskStatus === "error"   && <SectionError msg={riskError!} />}
            {riskStatus === "done" && riskScores && <RiskDashboard riskScores={riskScores.risk_scores} />}
          </section>

          {/* Section 3: Clause Analysis */}
          <section id="clauses" ref={(el) => { sectionRefs.current.clauses = el; }}>
            <SectionHeader number={3} title="Clause Analysis" />
            {clausesStatus === "loading" && <SectionSkeleton label="Analyzing risky clauses…" />}
            {clausesStatus === "error"   && <SectionError msg={clausesError!} />}
            {clausesStatus === "done" && clauses && <ClauseAnalysisSection clauses={clauses.clauses} />}
          </section>

          {/* Section 4: Scenarios */}
          <section id="scenarios" ref={(el) => { sectionRefs.current.scenarios = el; }}>
            <SectionHeader number={4} title="Worst-Case Scenarios" />
            {scenariosStatus === "loading" && <SectionSkeleton label="Generating worst-case scenarios…" />}
            {scenariosStatus === "error"   && <SectionError msg={scenariosError!} />}
            {scenariosStatus === "done" && scenarios && <ScenarioExplorer scenarios={scenarios.scenarios} />}
          </section>

          {/* Section 5: Pre-Signing Checklist */}
          <section id="checklist" ref={(el) => { sectionRefs.current.checklist = el; }}>
            <SectionHeader number={5} title="Pre-Signing Checklist" />
            {checklistStatus === "loading" && <SectionSkeleton label="Building pre-signing checklist…" />}
            {checklistStatus === "error"   && <SectionError msg={checklistError!} />}
            {checklistStatus === "done" && checklist && <PreSignChecklist checklist={checklist.checklist} />}
          </section>

          {/* Section 6: Chat */}
          <section id="chat" ref={(el) => { sectionRefs.current.chat = el; }}>
            <SectionHeader number={6} title="Ask the AI" />
            {chatSectionReady && contractText && <ChatPanel contractText={contractText} />}
          </section>

          {/* Footer disclaimer */}
          <div className="border-t border-slate-800 pt-6 pb-2">
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="text-slate-500 font-medium">Legal disclaimer:</span> This tool provides risk identification and decision support only. It is not legal advice. For formal legal opinions, please consult a licensed attorney.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function msg(e: unknown) {
  return e instanceof Error ? e.message : "Analysis failed.";
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center gap-4">
      <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function SectionError({ msg }: { msg: string }) {
  return (
    <div className="bg-red-950/20 border border-red-900/50 rounded-2xl px-5 py-4 flex items-center gap-3">
      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-300">{msg}</p>
    </div>
  );
}
