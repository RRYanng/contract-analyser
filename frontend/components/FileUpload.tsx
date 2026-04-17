"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [".pdf", ".docx", ".txt"];
const MAX_SIZE_MB = 10;

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validate = (file: File): string | null => {
    const name = file.name.toLowerCase();
    if (!ACCEPTED_TYPES.some((ext) => name.endsWith(ext))) {
      return "Unsupported file type. Please upload a PDF, DOCX, or TXT file.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="w-full">
      <label
        className={cn(
          "flex flex-col items-center justify-center w-full min-h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
          dragging
            ? "border-blue-500 bg-blue-950/30"
            : "border-slate-600 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={disabled ? undefined : onDrop}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={onInputChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          {/* Upload icon */}
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            selectedFile ? "bg-blue-600/20" : "bg-slate-700"
          )}>
            {selectedFile ? (
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {selectedFile ? (
            <>
              <p className="text-sm font-medium text-blue-300">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB — click to change
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-200">
                Drop your contract here, or <span className="text-blue-400">browse</span>
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, DOCX, TXT — up to 10MB
              </p>
            </>
          )}
        </div>
      </label>

      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
