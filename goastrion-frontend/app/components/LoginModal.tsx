//app/components/LoginModal.tsx
"use client";
import { useState } from "react";
import { apiPost } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/api/auth/login/", { identifier, password });
      if (data.user && data.access) {
        login(data.user, data.access, data.refresh);
        onClose();
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch {
      setError("Network error");
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
          />
          <input
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition"
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
