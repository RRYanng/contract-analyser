"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { uploadContract } from "@/lib/api";

type Mode = "idle" | "uploading" | "done" | "error";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasInput = file !== null || pastedText.trim().length > 0;

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setPastedText("");
    setErrorMsg(null);
    setMode("idle");
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedText(e.target.value);
    if (e.target.value.trim()) {
      setFile(null);
    }
    setErrorMsg(null);
    setMode("idle");
  };

  const handleSubmit = async () => {
    if (!hasInput) return;
    setMode("uploading");
    setErrorMsg(null);

    try {
      const result = await uploadContract(file, pastedText || null);
      sessionStorage.setItem("contractText", result.text);
      router.push("/analysis");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
      setMode("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">ContractGuard</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:block">Not legal advice — for decision support only</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-8">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 rounded-full px-4 py-1.5 text-xs text-blue-300 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              US Business Contracts · Plain English Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Understand Your Contract<br />in 60 Seconds
            </h1>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
              Upload any US business contract. Get a plain&#8209;English risk analysis with actionable revision suggestions.
            </p>
          </div>

          {/* Upload card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 w-fit">
              <button
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-slate-700 text-white"
                disabled
              >
                Upload File
              </button>
              <button
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors text-slate-400"
                disabled
              >
                Paste Text
              </button>
            </div>

            <FileUpload onFileSelect={handleFileSelect} disabled={mode === "uploading"} />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600 font-medium">or paste contract text</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Textarea */}
            <textarea
              value={pastedText}
              onChange={handleTextChange}
              disabled={mode === "uploading"}
              placeholder="Paste your contract text here…"
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors disabled:opacity-50"
            />

            {/* Error */}
            {mode === "error" && errorMsg && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleSubmit}
              disabled={!hasInput || mode === "uploading"}
              className="w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
            >
              {mode === "uploading" ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Extracting text…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Start Analysis
                </>
              )}
            </button>
          </div>


          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🔒", label: "No storage", sub: "Analyzed in-session only" },
              { icon: "⚡", label: "60 seconds", sub: "Average analysis time" },
              { icon: "🇺🇸", label: "US law", sub: "English contracts only" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-lg">{item.icon}</div>
                <div className="text-xs font-semibold text-slate-300">{item.label}</div>
                <div className="text-xs text-slate-600">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="border-t border-slate-800 px-6 py-4 text-center">
        <p className="text-xs text-slate-600 max-w-2xl mx-auto">
          <span className="text-slate-500 font-medium">Legal disclaimer:</span> This tool provides risk identification and decision support only. It is not legal advice. For formal legal opinions, please consult a licensed attorney.
        </p>
      </footer>
    </div>
  );
}
