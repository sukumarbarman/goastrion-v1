// app/components/LoginModal.tsx
"use client";
import { useState } from "react";
import { apiPost, ApiError } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ---- Types returned by your backend
type User = {
  id: number;
  username: string;
  email: string;
  [k: string]: unknown;
};

type LoginSuccess = {
  user: User;
  access: string;
  refresh?: string;
};

type LoginBody = {
  identifier: string;
  password: string;
};

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !loading;

  async function handleLogin() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<LoginSuccess, LoginBody>("/api/auth/login/", {
        identifier,
        password,
      });

      // ✅ AuthContext.login expects a single payload argument
      login({ user: data.user, access: data.access, refresh: data.refresh });

      onClose();
    } catch (e) {
      let msg = "Invalid credentials";
      if (e instanceof ApiError) {
        const d = e.data as Record<string, unknown> | null;
        if (d && typeof d === "object") {
          msg =
            (typeof d.detail === "string" && d.detail) ||
            (typeof d.message === "string" && d.message) ||
            msg;
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
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-gray-800"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-center">Log In</h2>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <input
            type="text"
            placeholder="Email or Username"
            className="border w-full p-2 mb-2 rounded"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username email"
          />
          <input
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            onClick={handleLogin}
            disabled={!canSubmit}
            className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
