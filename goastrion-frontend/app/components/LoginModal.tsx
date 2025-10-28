// app/components/LoginModal.tsx
"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, apiGet, ApiError } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { AUTH_ENDPOINTS } from "../lib/authEndpoints";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { useRouter } from "next/navigation";

type User = {
  id?: number;
  username?: string;
  email?: string;
  [k: string]: unknown;
};

type LoginBody = { identifier: string; password: string };

type TokenBag = {
  access?: string;
  token?: string;
  access_token?: string;
  jwt?: string;

  refresh?: string;
  refresh_token?: string;

  tokens?: {
    access?: string;
    refresh?: string;
  } | null;
};

type LoginResponse = Partial<{
  user: User;
  detail: string;
  message: string;
}> &
  TokenBag;

type ErrorPayload = Partial<{
  detail: string;
  message: string;
  non_field_errors: string[];
  identifier: string[];
  password: string[];
}>;

function extractTokens(resp: TokenBag | null | undefined): {
  access: string | null;
  refresh: string | null;
} {
  if (!resp || typeof resp !== "object") return { access: null, refresh: null };

  const access =
    (typeof resp.access === "string" && resp.access) ||
    (typeof resp.token === "string" && resp.token) ||
    (typeof resp.access_token === "string" && resp.access_token) ||
    (typeof resp.jwt === "string" && resp.jwt) ||
    (resp.tokens &&
      typeof resp.tokens === "object" &&
      typeof resp.tokens.access === "string" &&
      resp.tokens.access) ||
    null;

  const refresh =
    (typeof resp.refresh === "string" && resp.refresh) ||
    (typeof resp.refresh_token === "string" && resp.refresh_token) ||
    (resp.tokens &&
      typeof resp.tokens === "object" &&
      typeof resp.tokens.refresh === "string" &&
      resp.tokens.refresh) ||
    null;

  return { access, refresh };
}

function readServerError(err: unknown): string {
  if (err instanceof ApiError) {
    const d = err.data as unknown;
    if (d && typeof d === "object") {
      const p = d as ErrorPayload;
      return (
        p.detail ||
        p.message ||
        p.non_field_errors?.[0] ||
        p.identifier?.[0] ||
        p.password?.[0] ||
        err.message
      );
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Invalid credentials. Please try again.";
}

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const canSubmit = identifier.trim() !== "" && password !== "" && !loading;

  async function handleLogin() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const body: LoginBody = { identifier: identifier.trim(), password };
      const resp = await apiPost<LoginResponse, LoginBody>(
        AUTH_ENDPOINTS.login,
        body
      );

      const { access, refresh } = extractTokens(resp);
      if (!access) throw new Error("Login succeeded but no access token returned.");

      let user: User | undefined = resp.user;
      if (!user) {
        try {
          user = await apiGet<User>(AUTH_ENDPOINTS.me, access);
        } catch {
          user = { username: body.identifier };
        }
      }

      login({ user, access, refresh });
      window.dispatchEvent(new Event("auth:logged_in"));
      router.replace("/profile");
      onClose();
    } catch (e) {
      setError(readServerError(e));
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      handleLogin();
    }
  }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <AnimatePresence>
      {!showSignup && !showForgot && (
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
            <h2 className="text-lg font-semibold mb-4 text-center">Log In</h2>

            {error && (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setShowSignup(true)}
                    className="font-medium underline underline-offset-2"
                  >
                    Need an account? Sign up
                  </button>
                  <button
                    onClick={() => setShowForgot(true)}
                    className="font-medium underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <label className="block text-sm mb-1">Email or Username</label>
            <input
              type="text"
              placeholder="you@example.com or username"
              className="border w-full p-2 mb-3 rounded outline-none focus:ring-2 focus:ring-cyan-300"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="username email"
            />

            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="border w-full p-1.5 mb-1 rounded outline-none focus:ring-2 focus:ring-cyan-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="current-password"
            />

            <div className="mt-1 mb-3 text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs text-gray-600 hover:text-gray-800 underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={!canSubmit}
              className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="mt-3 text-sm text-center">
              <span className="text-gray-500">No account? </span>
              <button
                onClick={() => setShowSignup(true)}
                className="text-cyan-700 hover:text-cyan-800 font-medium underline underline-offset-2"
              >
                Sign up
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}

      {showSignup && (
        <SignupModal
          onClose={() => {
            setShowSignup(false);
            onClose();
          }}
          onOpenLogin={() => setShowSignup(false)}
        />
      )}

      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}
    </AnimatePresence>
  );
}
