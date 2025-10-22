// goastrion-frontend/app/profile/settings/page.tsx
"use client";

import Container from "@/app/components/Container";
import { useI18n } from "@/app/lib/i18n";
import { loadPrefs, savePrefs, type Prefs } from "@/app/lib/prefs";
import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";

/** Backend endpoints */
const AUTH = {
  changePassword: "/api/auth/change-password/",
  deleteAccount: "/api/auth/delete-account/",
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* ---------- Change Password (inline component) ---------- */
function ChangePasswordForm() {
  const { accessToken } = useAuth();
  const [current, setCurrent] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const canSubmit = !!current && !!nextPw && nextPw === confirm && !busy;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(AUTH.changePassword, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          old_password: current,
          new_password: nextPw,
        }),
        credentials: "include",
      });

      const data = (await res.json().catch(() => ({}))) as unknown;

      if (!res.ok) {
        let detail = "Failed to change password";
        if (data && typeof data === "object") {
          const d = data as Record<string, unknown>;
          detail =
            (typeof d.detail === "string" && d.detail) ||
            (typeof d.message === "string" && d.message) ||
            Object.values(d).map((v) => String(v)).join(" ") ||
            detail;
        }
        throw new Error(detail);
      }

      setMsg({ kind: "ok", text: "Password updated successfully." });
      setCurrent("");
      setNextPw("");
      setConfirm("");
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to change password";
      setMsg({ kind: "err", text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="block text-sm text-slate-300 mb-1">Current password</label>
          <input
            type="password"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">New password</label>
          <input
            type="password"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
            value={nextPw}
            onChange={(e) => setNextPw(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Confirm new password</label>
          <input
            type="password"
            className="w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
      </div>

      {msg && (
        <p
          className={classNames(
            "text-sm",
            msg.kind === "ok" ? "text-emerald-400" : "text-rose-300"
          )}
        >
          {msg.text}
        </p>
      )}

      <button
        disabled={!canSubmit}
        className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-500 disabled:opacity-60"
      >
        {busy ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

/* ---------- Delete Account (inline modal) ---------- */
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { accessToken, logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === "DELETE" && !busy;

  async function handleDelete() {
    if (!canDelete) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(AUTH.deleteAccount, {
        method: "POST", // change to DELETE if needed by your API
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ confirm: true }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as unknown;

      if (!res.ok) {
        let detail = "Couldn’t delete account";
        if (data && typeof data === "object") {
          const d = data as Record<string, unknown>;
          detail =
            (typeof d.detail === "string" && d.detail) ||
            (typeof d.message === "string" && d.message) ||
            detail;
        }
        throw new Error(detail);
      }
      await logout();
      window.location.assign("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Couldn’t delete account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141A2A] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Delete account</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20"
          >
            Close
          </button>
        </div>

        <p className="text-sm text-slate-300">
          This will permanently delete your account. Type <span className="font-mono">DELETE</span>{" "}
          to confirm.
        </p>

        <input
          className="mt-3 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-slate-200"
          placeholder="DELETE"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />

        {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-slate-200 hover:border-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {busy ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Page -------------------- */

export default function SettingsPage() {
  const { tOr } = useI18n();
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [showDelete, setShowDelete] = useState(false);

  function update(next: Partial<Prefs>) {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    savePrefs(merged);
  }

  function onDateFormatChange(e: ChangeEvent<HTMLSelectElement>) {
    update({ dateFormat: e.target.value as Prefs["dateFormat"] });
  }

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {tOr("settings.title", "Settings")}
        </h1>
        <p className="text-slate-400">
          {tOr("settings.subtitle", "Your preferences are saved on this device.")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 font-semibold text-white">
            {tOr("settings.language", "Language")}
          </div>
          <p className="mb-2 text-sm text-slate-400">
            {tOr("settings.language.help", "Changes apply immediately.")}
          </p>
          {/* Add your LanguageSwitcher here if needed */}
        </section>

        {/* Default landing */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 font-semibold text-white">
            {tOr("settings.landing", "Default landing")}
          </div>
          <div className="flex gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="landing"
                checked={(prefs.landing || "daily") === "daily"}
                onChange={() => update({ landing: "daily" })}
              />
              {tOr("settings.landing.daily", "Open Daily after login")}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="landing"
                checked={prefs.landing === "profile"}
                onChange={() => update({ landing: "profile" })}
              />
              {tOr("settings.landing.profile", "Open Profile after login")}
            </label>
          </div>
        </section>

        {/* Time & format */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 font-semibold text-white">
            {tOr("settings.time.title", "Time & format")}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="timefmt"
                checked={(prefs.timeFormat || "24h") === "12h"}
                onChange={() => update({ timeFormat: "12h" })}
              />
              {tOr("settings.time.12h", "12-hour")}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="timefmt"
                checked={(prefs.timeFormat || "24h") === "24h"}
                onChange={() => update({ timeFormat: "24h" })}
              />
              {tOr("settings.time.24h", "24-hour")}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">
                {tOr("settings.date.format", "Date format")}
              </span>
              <select
                value={prefs.dateFormat || "DD-MM-YYYY"}
                onChange={onDateFormatChange}
                className="rounded bg-black/30 px-2 py-1 text-slate-200 outline-none border border-white/10"
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 font-semibold text-white">
            {tOr("settings.notifications.title", "Notifications")}
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!prefs.dailyReminder}
              onChange={(e) => update({ dailyReminder: e.target.checked })}
            />
            {tOr("settings.notifications.daily", "Daily reminder (this device)")}
          </label>
        </section>

        {/* Privacy */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 font-semibold text-white">
            {tOr("settings.privacy.title", "Privacy & data")}
          </div>
          <p className="text-sm text-slate-400">
            {tOr(
              "settings.privacy.note",
              "We store only your birth details locally. Insights are computed at runtime."
            )}
          </p>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 font-semibold text-white">
            {tOr("settings.security.title", "Security")}
          </div>
          <ChangePasswordForm />
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-2 font-semibold text-white">
              {tOr("settings.security.danger", "Danger zone")}
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
            >
              {tOr("settings.security.delete", "Delete account")}
            </button>
          </div>
        </section>
      </div>

      {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} />}
    </Container>
  );
}
