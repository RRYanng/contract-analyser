"use client";

import type { ContractOverview } from "@/lib/api";

interface Props {
  data: ContractOverview;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}

export default function ContractOverviewCard({ data }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Contract Overview</p>
            <h2 className="text-base font-semibold text-white leading-tight">{data.contract_type}</h2>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Purpose */}
        <div className="bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Purpose</p>
          <p className="text-sm text-slate-200 leading-relaxed">{data.purpose}</p>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Party A", party: data.party_a },
            { label: "Party B", party: data.party_b },
          ].map(({ label, party }) => (
            <div key={label} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-white">{party.name}</p>
              <p className="text-xs text-slate-400">{party.role}</p>
            </div>
          ))}
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoRow label="Effective Date" value={data.effective_date} />
          <InfoRow label="Duration" value={data.duration} />
          <InfoRow label="Payment" value={data.payment_summary} />
        </div>

        {/* Top concerns */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Top Things to Watch
          </p>
          <ol className="space-y-2">
            {data.top_concerns.map((concern, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300 leading-relaxed">{concern}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
