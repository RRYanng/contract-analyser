"use client";

import { useState } from "react";
import type { ClauseAnalysis } from "@/lib/api";

interface Props {
  clauses: ClauseAnalysis[];
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors flex-shrink-0"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function ClauseCard({ clause, index }: { clause: ClauseAnalysis; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${
      clause.must_change
        ? "border-red-800/60 bg-red-950/15"
        : "border-amber-800/40 bg-amber-950/10"
    }`}>
      {/* Header row */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Index / flag */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
          clause.must_change ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
        }`}>
          {clause.must_change ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            index + 1
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-100">
              {clause.clause_number}
            </span>
            {clause.must_change && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                Must Change
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {clause.risk_identified}
          </p>
        </div>

        <svg
          className={`w-4 h-4 text-slate-500 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-5 pt-1 border-t border-white/5 space-y-5">

          {/* Original text */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Original Clause</p>
            <blockquote className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/70 rounded-lg px-3 py-2.5 border border-slate-700/50 italic">
              "{clause.original_text}"
            </blockquote>
          </div>

          {/* Plain English */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">What This Means</p>
            <p className="text-sm text-slate-200 leading-relaxed">{clause.plain_english}</p>
          </div>

          {/* Risk + Worst Case side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Risk Identified</p>
              <p className="text-xs text-slate-300 leading-relaxed">{clause.risk_identified}</p>
            </div>
            <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">Worst Case</p>
              <p className="text-xs text-slate-300 leading-relaxed">{clause.worst_case_scenario}</p>
            </div>
          </div>

          {/* Suggested revision */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Suggested Revision</p>
              <CopyButton text={clause.suggested_revision} label="Copy Suggestion" />
            </div>
            <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-200 font-mono leading-relaxed">{clause.suggested_revision}</p>
            </div>
          </div>

          {/* Negotiation talking point */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Negotiation Talking Point</p>
              <CopyButton text={clause.negotiation_talking_point} label="Copy Talking Point" />
            </div>
            <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-200 leading-relaxed">{clause.negotiation_talking_point}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClauseAnalysisSection({ clauses }: Props) {
  const mustChangeCount = clauses.filter((c) => c.must_change).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-600/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Clause Analysis</p>
            <h2 className="text-base font-semibold text-white leading-tight">
              {clauses.length} Risky {clauses.length === 1 ? "Clause" : "Clauses"} Found
            </h2>
          </div>
        </div>
        {mustChangeCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-300">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {mustChangeCount} Must Change
          </div>
        )}
      </div>

      {clauses.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">No high-risk clauses detected</p>
          <p className="text-xs text-slate-500 mt-1">All clauses appear reasonable for Party B</p>
        </div>
      ) : (
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500 mb-1">Click any clause to see plain-English explanation, risks, suggested revision, and negotiation talking points.</p>
          {clauses.map((clause, i) => (
            <ClauseCard key={clause.clause_number} clause={clause} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
