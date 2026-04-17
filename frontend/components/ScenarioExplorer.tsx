"use client";

import { useState } from "react";
import type { Scenario, ProtectionLevel } from "@/lib/api";

interface Props {
  scenarios: Scenario[];
}

const PROTECTION_CONFIG: Record<ProtectionLevel, {
  label: string;
  bg: string;
  border: string;
  badge: string;
  dot: string;
  icon: string;
}> = {
  none:     { label: "No Protection",       bg: "bg-red-950/20",    border: "border-red-800/50",    badge: "bg-red-500/15 text-red-300 border-red-500/30",        dot: "bg-red-400",     icon: "🚨" },
  weak:     { label: "Weak Protection",     bg: "bg-amber-950/15",  border: "border-amber-800/40",  badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",  dot: "bg-amber-400",   icon: "⚠️" },
  moderate: { label: "Moderate Protection", bg: "bg-blue-950/15",   border: "border-blue-800/40",   badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",     dot: "bg-blue-400",    icon: "🛡️" },
  strong:   { label: "Strong Protection",   bg: "bg-emerald-950/15",border: "border-emerald-800/40",badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400", icon: "✅" },
};

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PROTECTION_CONFIG[scenario.protection_level];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${cfg.bg} ${cfg.border}`}>
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-100">{scenario.title}</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge} flex-shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {scenario.description}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-5 pt-1 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What the contract says</p>
              <p className="text-xs text-slate-300 leading-relaxed">{scenario.contract_says}</p>
            </div>
            <div className={`rounded-lg p-3 border ${
              scenario.protection_level === "none" || scenario.protection_level === "weak"
                ? "bg-red-950/20 border-red-800/30"
                : "bg-slate-900/60 border-slate-700/50"
            }`}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your exposure</p>
              <p className="text-xs text-slate-300 leading-relaxed">{scenario.your_exposure}</p>
            </div>
          </div>
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5">Recommendation</p>
            <p className="text-xs text-slate-200 leading-relaxed">{scenario.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScenarioExplorer({ scenarios }: Props) {
  const counts = { none: 0, weak: 0, moderate: 0, strong: 0 };
  for (const s of scenarios) counts[s.protection_level]++;
  const unprotected = counts.none + counts.weak;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-600/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Scenario Explorer</p>
            <h2 className="text-base font-semibold text-white leading-tight">
              {scenarios.length} Worst-Case {scenarios.length === 1 ? "Scenario" : "Scenarios"}
            </h2>
          </div>
        </div>
        {unprotected > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-300">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {unprotected} Poorly Protected
          </div>
        )}
      </div>

      {/* Protection summary */}
      <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-5 flex-wrap">
        {(["none", "weak", "moderate", "strong"] as ProtectionLevel[]).map((level) => {
          const cfg = PROTECTION_CONFIG[level];
          if (counts[level] === 0) return null;
          return (
            <div key={level} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-sm text-slate-300">
                <span className="font-bold">{counts[level]}</span>{" "}
                <span className="text-slate-500">{cfg.label}</span>
              </span>
            </div>
          );
        })}
        <p className="text-xs text-slate-600 ml-auto">Click any scenario to see full details</p>
      </div>

      {/* Scenario cards */}
      <div className="p-5 space-y-3">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.title} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
