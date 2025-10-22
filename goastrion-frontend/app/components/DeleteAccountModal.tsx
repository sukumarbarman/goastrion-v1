// app/components/DeleteAccountModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, ApiError } from "../lib/apiClient";
import { AUTH_ENDPOINTS } from "../lib/authEndpoints";
import { useAuth } from "../context/AuthContext";

export default function DeleteAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState(""); // use if your API requires password confirm
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const canDelete = confirmText === "DELETE" && !loading;

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    setErr("");
    try {
      // If your API doesn't require password, send empty body or {}
      await apiPost(AUTH_ENDPOINTS.deleteAccount, password ? { password } : {});
      // Optional: also call logout endpoint
      try { await apiPost(AUTH_ENDPOINTS.logout, {}); } catch {}
      logout();
      onClose();
    } catch (e) {
      let m = "Could not delete account.";
      if (e instanceof ApiError) {
        const d = e.data as Record<string, unknown> | null;
        if (d && typeof d === "object") {
          m =
            (typeof d.detail === "string" && d.detail) ||
            (typeof d.message === "string" && d.message) ||
            m;
        } else if (e.message) m = e.message;
      }
      setErr(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
        <motion.div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-gray-800"
          initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
          <h2 className="text-lg font-semibold mb-3 text-red-600">Delete account</h2>
          <p className="text-sm text-gray-700 mb-3">
            This action is permanent. Type <strong>DELETE</strong> to confirm.
          </p>

          {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

          <input
            placeholder="DELETE"
            className="border w-full p-2 mb-3 rounded"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />

          {/* If your API requires password confirmation, keep this; otherwise remove it */}
          <input
            type="password"
            placeholder="Password (if required)"
            className="border w-full p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="flex gap-2">
            <button
              disabled={!canDelete}
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
            <button onClick={onClose} className="border px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
