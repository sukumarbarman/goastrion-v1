//app/components/SignupModal.tsx
"use client";
import { useState } from "react";
import { apiPost } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/api/auth/register/", form);
      if (data.user && data.access) {
        login(data.user, data.access, data.refresh);
        onClose();
      } else {
        setError(
          Object.values(data).flat().join(" ") || "Registration failed"
        );
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
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border w-full p-2 mb-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            disabled={loading}
            className="bg-cyan-600 text-white w-full py-2 rounded-lg hover:bg-cyan-500 transition"
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
