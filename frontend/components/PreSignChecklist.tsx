"use client";

import { useState } from "react";
import type { ChecklistItem, ChecklistPriority, ChecklistStatus } from "@/lib/api";

interface Props {
  checklist: ChecklistItem[];
}

const PRIORITY_CONFIG: Record<ChecklistPriority, { label: string; dot: string; badge: string }> = {
  critical:    { label: "Critical",    dot: "bg-red-400",    badge: "bg-red-500/15 text-red-300 border-red-500/30" },
  recommended: { label: "Recommended", dot: "bg-amber-400",  badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  optional:    { label: "Optional",    dot: "bg-slate-400",  badge: "bg-slate-500/15 text-slate-300 border-slate-700" },
};

const STATUS_CONFIG: Record<ChecklistStatus, { icon: string; color: string }> = {
  needs_action:   { icon: "○", color: "text-red-400" },
  acceptable:     { icon: "✓", color: "text-emerald-400" },
  not_applicable: { icon: "–", color: "text-slate-600" },
};

function ChecklistRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const priorityCfg = PRIORITY_CONFIG[item.priority];
  const statusCfg = STATUS_CONFIG[item.status];

  return (
    <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors group ${
      checked ? "bg-emerald-950/20 border border-emerald-800/30" : "bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50"
    }`}>
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-emerald-500 border-emerald-500"
            : "border-slate-600 group-hover:border-slate-400"
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${checked ? "line-through text-slate-500" : "text-slate-100"}`}>
            {item.item}
          </span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border ${priorityCfg.badge} flex-shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
            {priorityCfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.details}</p>
      </div>

      {/* Initial status indicator */}
      {!checked && (
        <span className={`text-sm font-bold flex-shrink-0 mt-0.5 ${statusCfg.color}`}>
          {statusCfg.icon}
        </span>
      )}
    </label>
  );
}

export default function PreSignChecklist({ checklist }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = checklist.length;
  const criticalItems = checklist.filter((c) => c.priority === "critical");
  const criticalDone = criticalItems.filter((_, i) =>
    checked[checklist.indexOf(criticalItems[i])]
  ).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pre-Signing Checklist</p>
            <h2 className="text-base font-semibold text-white leading-tight">{total} Items to Review</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{doneCount}/{total}</p>
          <p className="text-xs text-slate-500">completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>{pct}% complete</span>
          <span>{criticalItems.length} critical items</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="p-5 space-y-2">
        {checklist.map((item, i) => (
          <ChecklistRow
            key={i}
            item={item}
            checked={!!checked[i]}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>

      {/* Done state */}
      {doneCount === total && total > 0 && (
        <div className="mx-5 mb-5 p-4 bg-emerald-950/30 border border-emerald-700/40 rounded-xl text-center">
          <p className="text-sm font-semibold text-emerald-300">All items reviewed — you're ready to sign! 🎉</p>
          <p className="text-xs text-slate-500 mt-1">Remember: this is decision support, not legal advice.</p>
        </div>
      )}
    </div>
  );
}
