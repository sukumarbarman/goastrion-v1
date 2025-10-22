// app/components/AuthModals.tsx
"use client";
import type React from "react";
import { useRef, useState, useEffect } from "react";
import Field from "./Field";
import { AUTH_ENDPOINTS } from "@/app/lib/authEndpoints";
import { useAuth, type AuthUser } from "@/app/context/AuthContext";

type Mode = "login" | "signup";

export default function AuthModals({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  // Use the real login method from AuthContext (not setUser)
  const { login } = useAuth();

  // form state
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Center the dialog when it opens
  useEffect(() => {
    if (!open) return;
    setPos({ x: 0, y: 0 });
    setErr("");
    setPassword("");
  }, [open]);

  // Mouse handlers
  const onMouseDownHeader = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, left: pos.x, top: pos.y };
    document.body.style.userSelect = "none";
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: dragStart.current.left + dx, y: dragStart.current.top + dy });
  };
  const onMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    document.body.style.userSelect = "";
  };

  // Touch handlers
  const onTouchStartHeader = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX, y: t.clientY, left: pos.x, top: pos.y };
    document.body.style.userSelect = "none";
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    setPos({ x: dragStart.current.left + dx, y: dragStart.current.top + dy });
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  if (!open) return null;

  async function doLogin() {
    setErr("");
    setSubmitting(true);
    try {
      const res = await fetch(AUTH_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        cache: "no-store",
      });
      const data: {
        success?: boolean;
        error?: string;
        detail?: string;
        access?: string;
        refresh?: string | null;
        user?: unknown;
      } = await res.json().catch(() => ({} as const));

      if (!res.ok || !data?.success || !data.access || !data.user) {
        const msg =
          data?.error ||
          data?.detail ||
          "Login failed. Check your username/email and password.";
        throw new Error(msg);
      }

      // Route through AuthContext so tokens + user are set consistently
      login({
        user: data.user as AuthUser,
        access: data.access,
        refresh: data.refresh ?? null,
      });

      // Notify listeners (SaveChartButton waits for this)
      window.dispatchEvent(new Event("auth:logged_in"));
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function doSignup() {
    setErr("");
    setSubmitting(true);
    try {
      // 1) register
      const r = await fetch(AUTH_ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email: identifier, password }),
        cache: "no-store",
      });
      if (!r.ok) {
        const dj: { error?: string } = await r.json().catch(() => ({} as const));
        throw new Error(dj?.error || "Sign up failed");
      }
      // 2) login with same credentials
      await doLogin();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  const title = mode === "login" ? "Login" : "Sign Up";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141A2A] shadow-xl"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        {/* Header / drag handle */}
        <div
          className="cursor-move select-none rounded-t-2xl px-6 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between"
          onMouseDown={onMouseDownHeader}
          onTouchStart={onTouchStartHeader}
        >
          <div className="text-white text-lg font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === "signup" && (
            <Field
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
          )}
          <div className="mt-2">
            <Field
              label={mode === "signup" ? "Email" : "Username or Email"}
              placeholder={
                mode === "signup" ? "you@example.com" : "alice or you@example.com"
              }
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIdentifier(e.target.value)
              }
            />
          </div>
          <div className="mt-2">
            <Field
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
          </div>

          {err && (
            <div className="mt-3 text-sm rounded-md bg-red-600/20 border border-red-500/40 text-red-200 px-3 py-2">
              {err}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200"
            >
              Cancel
            </button>
            {mode === "login" ? (
              <button
                onClick={doLogin}
                disabled={submitting}
                className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Continue"}
              </button>
            ) : (
              <button
                onClick={doSignup}
                disabled={submitting}
                className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create account"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
