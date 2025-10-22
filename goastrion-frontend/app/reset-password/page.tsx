// app/reset-password/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Couldn’t reset password";
  }
}

function ResetPasswordInner() {
  const sp = useSearchParams();
  const router = useRouter();

  // Support both common patterns:
  //   /reset-password?token=...   OR   /reset-password?uid=...&token=...
  const presetToken = sp.get("token") || "";
  const presetUid = sp.get("uid") || "";

  const [token, setToken] = useState(presetToken);
  const [uid, setUid] = useState(presetUid);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    setToken(presetToken);
    setUid(presetUid);
  }, [presetToken, presetUid]);

  const canSubmit = !!token && pw1.length > 0 && pw1 === pw2 && !busy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch("/api/auth/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,             // required by your PasswordResetConfirmView
          uid: uid || null,  // optional – sent if present
          new_password: pw1, // common DRF naming
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          (typeof data === "object" ? Object.values(data).flat().join(" ") : null) ||
          "Couldn’t reset password";
        throw new Error(String(msg));
      }

      setOk("Password updated. You can now log in.");
      setPw1("");
      setPw2("");

      // Small grace period, then go to login
      setTimeout(() => router.push("/"), 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-160px)] flex items-center justify-center p-6 bg-[#0B1020] text-slate-200">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-6">
        <h1 className="text-xl font-semibold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your new password. If your link carried a token, it’s prefilled below.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Token</label>
            <input
              className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from email"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">UID (optional)</label>
            <input
              className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Only if your link provides it"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">New password</label>
              <input
                type="password"
                className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Confirm password</label>
              <input
                type="password"
                className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}
          {ok && <p className="text-sm text-emerald-400">{ok}</p>}

          <div className="mt-2 flex items-center justify-between">
            <Link href="/" className="text-sm text-cyan-400 hover:underline">
              Back to home / login
            </Link>
            <button
              disabled={!canSubmit}
              className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-500 disabled:opacity-60"
            >
              {busy ? "Updating..." : "Set new password"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-6 text-slate-200">Loading…</main>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
