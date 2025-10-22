// app/components/ChangePasswordForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { apiPost, ApiError } from "../lib/apiClient";
import { AUTH_ENDPOINTS } from "../lib/authEndpoints";

type Props = { onSuccess?: () => void };

export default function ChangePasswordForm({ onSuccess }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setLoading(true);
    setMsg("");
    try {
      await apiPost(AUTH_ENDPOINTS.changePassword, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMsg("Password updated.");
      setOldPassword("");
      setNewPassword("");
      onSuccess?.();
    } catch (e) {
      let m = "Could not change password.";
      if (e instanceof ApiError) {
        const d = e.data as Record<string, unknown> | null;
        if (d && typeof d === "object") {
          m =
            (typeof d.detail === "string" && d.detail) ||
            (typeof d.message === "string" && d.message) ||
            m;
        } else if (e.message) m = e.message;
      }
      setMsg(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-white font-semibold mb-3">Change password</h3>
      {msg && <div className="mb-2 text-sm text-slate-300">{msg}</div>}
      <label className="block text-sm mb-1">Current password</label>
      <input
        type="password"
        className="border w-full p-2 mb-3 rounded"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        autoComplete="current-password"
      />
      <label className="block text-sm mb-1">New password</label>
      <input
        type="password"
        className="border w-full p-2 mb-3 rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
      />
      <button
        disabled={!oldPassword || !newPassword || loading}
        className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
