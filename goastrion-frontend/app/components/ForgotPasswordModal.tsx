// app/components/ForgotPasswordModal.tsx
"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, ApiError } from "../lib/apiClient";
import { AUTH_ENDPOINTS } from "../lib/authEndpoints";

type Props = { onClose: () => void };

// Body for reset-password API: either token+new_password or uid+token+new_password
type ResetPasswordBody =
  | { token: string; new_password: string }
  | { uid: string; token: string; new_password: string };

function pickErrorMessage(err: unknown, fallback: string): string {
  // Prefer structured ApiError payloads
  if (err instanceof ApiError) {
    const d = err.data;
    if (d && typeof d === "object") {
      const detail = (d as Record<string, unknown>).detail;
      if (typeof detail === "string" && detail) return detail;
      const message = (d as Record<string, unknown>).message;
      if (typeof message === "string" && message) return message;
    }
    if (err.message) return err.message;
  }
  // Generic Error
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function ForgotPasswordModal({ onClose }: Props) {
  const [step, setStep] = useState<"request" | "confirm">("request");

  // Request
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string>("");
  const [requestSuccess, setRequestSuccess] = useState<string>("");

  // Confirm (token or uid+token)
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string>("");
  const [confirmSuccess, setConfirmSuccess] = useState<string>("");

  async function submitRequest(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setRequestLoading(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      // Uses existing auth endpoint keys: forgot / reset
      await apiPost(AUTH_ENDPOINTS.forgot, { email });
      setRequestSuccess("If an account exists for this email, a reset link has been sent.");
      setStep("confirm");
    } catch (err: unknown) {
      setRequestError(pickErrorMessage(err, "Could not start password reset."));
    } finally {
      setRequestLoading(false);
    }
  }

  async function submitConfirm(e: FormEvent) {
    e.preventDefault();
    if (!token.trim() || !newPassword) return;

    setConfirmLoading(true);
    setConfirmError("");
    setConfirmSuccess("");

    const body: ResetPasswordBody = uid.trim()
      ? { uid: uid.trim(), token: token.trim(), new_password: newPassword }
      : { token: token.trim(), new_password: newPassword };

    try {
      await apiPost(AUTH_ENDPOINTS.reset, body);
      setConfirmSuccess("Password has been reset. You can now log in with your new password.");
    } catch (err: unknown) {
      setConfirmError(pickErrorMessage(err, "Could not reset password."));
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-gray-800"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h2 className="text-lg font-semibold mb-2">
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </h2>

          {step === "request" && (
            <form onSubmit={submitRequest}>
              {requestError && (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {requestError}
                </div>
              )}
              {requestSuccess && (
                <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {requestSuccess}
                </div>
              )}

              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="border w-full p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-cyan-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <button
                disabled={!email || requestLoading}
                className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {requestLoading ? "Sending email..." : "Send reset email"}
              </button>

              <div className="mt-3 text-sm text-center">
                <span className="text-gray-500">Have a reset token already? </span>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  className="text-cyan-700 hover:text-cyan-800 font-medium underline underline-offset-2"
                >
                  Enter token
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </form>
          )}

          {step === "confirm" && (
            <form onSubmit={submitConfirm}>
              {confirmError && (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {confirmError}
                </div>
              )}
              {confirmSuccess && (
                <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {confirmSuccess}
                </div>
              )}

              {/* Leave UID blank if your backend doesn't need it */}
              <label className="block text-sm mb-1">UID (optional)</label>
              <input
                type="text"
                placeholder="Paste UID (if required)"
                className="border w-full p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-cyan-300"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                autoComplete="off"
              />

              <label className="block text-sm mb-1">Token</label>
              <input
                type="text"
                placeholder="Paste token from email"
                className="border w-full p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-cyan-300"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="one-time-code"
                required
              />

              <label className="block text-sm mb-1">New password</label>
              <input
                type="password"
                placeholder="New strong password"
                className="border w-full p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-cyan-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                disabled={!token || !newPassword || confirmLoading}
                className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {confirmLoading ? "Resetting..." : "Reset password"}
              </button>

              <div className="mt-3 text-sm text-center">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-gray-600 hover:text-gray-800 underline underline-offset-2"
                >
                  Back
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
