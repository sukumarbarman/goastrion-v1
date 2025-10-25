// ================================================
// app/components/ContactForm.tsx (client component)
// ================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../lib/i18n";

export type ContactKind = "general" | "feedback" | "bug" | "feature";

export default function ContactForm({ initialType }: { initialType?: ContactKind }) {
  const { user } = useAuth();
  const { tOr } = useI18n();

  const [kind, setKind] = useState<ContactKind>(initialType ?? "general");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail((e) => e || user.email || "");
      setName((n) => n || user.username || "");
    }
  }, [user]);

  const canSend = useMemo(() => {
    const validEmail = /.+@.+\..+/.test(email);
    return !busy && validEmail && message.trim().length >= 10;
  }, [busy, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setOk(null); setErr(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || defaultSubject(kind),
          message: message.trim(),
          path: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed: ${res.status}`);
      setOk(tOr("contact.thanks", "Thanks! We'll get back to you soon."));
      setSubject("");
      setMessage("");
      setKind(initialType ?? "general");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  function defaultSubject(k: ContactKind) {
    switch (k) {
      case "feedback": return "Product feedback";
      case "bug": return "Bug report";
      case "feature": return "Feature request";
      default: return "General inquiry";
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-[#0F1731] border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Type</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ContactKind)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
          >
            <option value="general">General</option>
            <option value="feedback">Feedback</option>
            <option value="bug">Bug report</option>
            <option value="feature">Feature request</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            placeholder="Your name (optional)"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            placeholder="Short title"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">Message</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-36 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
          placeholder="Write a few lines..."
        />
        <p className="text-xs text-slate-400 mt-1">Minimum 10 characters.</p>
      </div>

      {err && <div className="text-sm text-red-400">{err}</div>}
      {ok && <div className="text-sm text-emerald-400">{ok}</div>}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">We&apos;ll only use your email to reply to this request.</p>
        <button
          type="submit"
          disabled={!canSend}
          className="bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400 transition"
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
