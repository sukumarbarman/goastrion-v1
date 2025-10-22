// app/components/Field.tsx
"use client";
import type React from "react";

type FieldProps = {
  /** Visible label above the input */
  label: string;
  /** Optional wrapper class for the whole field */
  containerClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Field({
  label,
  containerClassName,
  className,
  ...inputProps
}: FieldProps) {
  return (
    <div className={containerClassName}>
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <input
        {...inputProps}
        className={`w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-cyan-300 ${className ?? ""}`}
      />
    </div>
  );
}
