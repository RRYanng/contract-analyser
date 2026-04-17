"use client";

import { useState } from "react";
import type { RiskScore, RiskLevel } from "@/lib/api";

interface Props {
  riskScores: RiskScore[];
}

const LEVEL_CONFIG: Record<RiskLevel, { label: string; bg: string; border: string; badge: string; dot: string }> = {
  low:    { label: "Low",    bg: "bg-emerald-950/30", border: "border-emerald-800/50", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  medium: { label: "Medium", bg: "bg-amber-950/20",   border: "border-amber-800/40",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",       dot: "bg-amber-400"   },
  high:   { label: "High",   bg: "bg-red-950/25",     border: "border-red-800/50",     badge: "bg-red-500/15 text-red-300 border-red-500/30",             dot: "bg-red-400"     },
};

const ICONS: Record<string, string> = {
  "Party Identification":       "👤",
  "Payment Terms":              "💰",
  "Breach & Liability":         "⚖️",
  "Intellectual Property":      "🧠",
  "Confidentiality & Non-Compete": "🔒",
  "Termination Clauses":        "🚪",
  "Force Majeure":              "🌪️",
  "Dispute Resolution":         "🏛️",
};

function RiskCard({ score }: { score: RiskScore }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = LEVEL_CONFIG[score.risk_level];
  const icon = ICONS[score.dimension] ?? "📄";

  return (
    <div
      className={`rounded-xl border ${cfg.bg} ${cfg.border} transition-all duration-200 cursor-pointer`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start gap-3 p-4">
        <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-100">{score.dimension}</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge} flex-shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{score.explanation}</p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Relevant clause</p>
          <blockquote className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/60 rounded-lg px-3 py-2.5 border border-slate-700/50 italic">
            "{score.quoted_clause}"
          </blockquote>
        </div>
      )}
    </div>
  );
}

export default function RiskDashboard({ riskScores }: Props) {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const s of riskScores) counts[s.risk_level]++;

  const overallLevel: RiskLevel =
    counts.high > 0 ? "high" : counts.medium > 1 ? "medium" : "low";
  const overallCfg = LEVEL_CONFIG[overallLevel];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Risk Dashboard</p>
            <h2 className="text-base font-semibold text-white leading-tight">8 Risk Dimensions</h2>
          </div>
        </div>

        {/* Overall risk badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${overallCfg.badge}`}>
          <span className={`w-2 h-2 rounded-full ${overallCfg.dot}`} />
          Overall: {overallCfg.label} Risk
        </div>
      </div>

      {/* Summary bar */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-6">
        {(["high", "medium", "low"] as RiskLevel[]).map((level) => {
          const cfg = LEVEL_CONFIG[level];
          return (
            <div key={level} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-sm text-slate-300">
                <span className="font-bold">{counts[level]}</span>{" "}
                <span className="text-slate-500">{cfg.label}</span>
              </span>
            </div>
          );
        })}
        <p className="text-xs text-slate-600 ml-auto">Click any card to see the contract clause</p>
      </div>

      {/* Cards grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {riskScores.map((score) => (
          <RiskCard key={score.dimension} score={score} />
        ))}
      </div>
    </div>
  );
}
