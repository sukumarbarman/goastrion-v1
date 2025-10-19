// goastrion-frontend/app/components/ForgotPasswordModal.tsx
"use client";

import { useState } from "react";
import { apiPost, ApiError } from "../lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailTrimmed = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const canSubmit = emailValid && !loading;

  async function handleSendLink(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    try {
      // 👇 specify both generics: <void, { email: string }>
      await apiPost<void, { email: string }>(
        "/api/auth/password-reset-request/",
        { email: emailTrimmed }
      );

      setSent(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      let msg = "Could not send reset link. Please check your email.";
      if (err instanceof ApiError) {
        const d = err.data as Record<string, unknown> | null;
        if (d && typeof d === "object") {
          msg =
            (typeof d.detail === "string" && d.detail) ||
            (typeof d.message === "string" && d.message) ||
            msg;
        } else if (err.message) {
          msg = err.message;
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm"
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Reset Password</h2>
          <p className="text-gray-600 text-sm mb-4">
            Enter your registered email address. We’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSendLink} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={!!error || (email.length > 0 && !emailValid)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-cyan-400 outline-none"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {sent && (
              <p className="text-green-600 text-sm">
                Reset link sent! Please check your inbox.
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-500 transition-colors flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full text-gray-500 text-sm mt-3 hover:text-gray-700 transition-colors"
          >
            Back
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
