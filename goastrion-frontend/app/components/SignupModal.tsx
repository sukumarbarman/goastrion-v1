// app/components/SignupModal.tsx
"use client";

import { useState, type FormEvent } from "react";
import { apiPost, ApiError } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ---- Backend types (adjust if your API differs)
type User = {
  id: number;
  username: string;
  email: string;
  [k: string]: unknown;
};

type SignupBody = {
  username: string;
  email: string;
  password: string;
};

type SignupSuccess = {
  user: User;
  access: string;
  refresh?: string;
};

// Typical DRF-style validation errors: { field: ["msg"], ... }
type ValidationErrors = Record<string, string[] | string>;

export default function SignupModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<SignupBody>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const canSubmit =
    form.username.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length > 0 &&
    !loading;

  function setField<K extends keyof SignupBody>(key: K, value: SignupBody[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiPost<SignupSuccess, SignupBody>(
        "/api/auth/register/",
        form
      );

      // AuthContext.login expects a single payload object
      login({ user: data.user, access: data.access, refresh: data.refresh });
      onClose();
    } catch (e) {
      let msg = "Registration failed";
      if (e instanceof ApiError) {
        const d = e.data as unknown;
        if (d && typeof d === "object") {
          const obj = d as ValidationErrors & { detail?: string; message?: string };
          // Prefer detail/message if present
          msg = obj.detail ?? obj.message ?? msg;

          if (msg === "Registration failed") {
            // Build a readable string from field errors
            const parts: string[] = [];
            for (const v of Object.values(obj)) {
              if (Array.isArray(v)) parts.push(...v.map(String));
              else if (typeof v === "string") parts.push(v);
            }
            if (parts.length) msg = parts.join(" ");
          }
        } else if (e.message) {
          msg = e.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.form
          onSubmit={handleSignup}
          className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-gray-800"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-center">Sign Up</h2>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <input
            name="username"
            placeholder="Username"
            className="border w-full p-2 mb-2 rounded"
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            autoComplete="username"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border w-full p-2 mb-2 rounded"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            autoComplete="new-password"
          />

          <button
            disabled={!canSubmit}
            className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
