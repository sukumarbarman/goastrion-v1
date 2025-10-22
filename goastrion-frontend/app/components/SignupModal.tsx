// app/components/SignupModal.tsx
"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, ApiError } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { AUTH_ENDPOINTS } from "../lib/authEndpoints";

type User = { id: number; username: string; email: string; [k: string]: unknown };
type SignupBody = { username: string; email: string; password: string };
type SignupSuccess = { user: User; access: string; refresh?: string };
type ValidationErrors = Record<string, string[] | string>;

export default function SignupModal({
  onClose,
  onOpenLogin,
}: { onClose: () => void; onOpenLogin?: () => void }) {
  const [form, setForm] = useState<SignupBody>({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const canSubmit = form.username.trim() && form.email.trim() && form.password && !loading;

  function setField<K extends keyof SignupBody>(k: K, v: SignupBody[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<SignupSuccess, SignupBody>(AUTH_ENDPOINTS.register, form);
      login({ user: data.user, access: data.access, refresh: data.refresh });
      onClose();
    } catch (e) {
      let msg = "Registration failed";
      if (e instanceof ApiError) {
        const d = e.data as unknown;
        if (d && typeof d === "object") {
          const obj = d as ValidationErrors & { detail?: string; message?: string };
          msg = obj.detail ?? obj.message ?? msg;
          if (msg === "Registration failed") {
            const parts: string[] = [];
            for (const v of Object.values(obj)) {
              if (Array.isArray(v)) parts.push(...v.map(String));
              else if (typeof v === "string") parts.push(v);
            }
            if (parts.length) msg = parts.join(" ");
          }
        } else if (e.message) msg = e.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
        <motion.form onSubmit={handleSignup}
          className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-gray-800"
          initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
          <h2 className="text-lg font-semibold mb-4 text-center">Sign Up</h2>

          {error && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

          <input name="username" placeholder="Username"
            className="border w-full p-2 mb-2 rounded outline-none focus:ring-2 focus:ring-cyan-300"
            value={form.username} onChange={(e) => setField("username", e.target.value)} autoComplete="username" />
          <input name="email" type="email" placeholder="Email"
            className="border w-full p-2 mb-2 rounded outline-none focus:ring-2 focus:ring-cyan-300"
            value={form.email} onChange={(e) => setField("email", e.target.value)} autoComplete="email" />
          <input name="password" type="password" placeholder="Password"
            className="border w-full p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-cyan-300"
            value={form.password} onChange={(e) => setField("password", e.target.value)} autoComplete="new-password" />

          <button disabled={!canSubmit}
            className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="mt-3 text-sm text-center">
            <span className="text-gray-500">Already have an account? </span>
            <button type="button" onClick={onOpenLogin}
              className="text-cyan-700 hover:text-cyan-800 font-medium underline underline-offset-2">
              Log in
            </button>
          </div>

          <button type="button" onClick={onClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
