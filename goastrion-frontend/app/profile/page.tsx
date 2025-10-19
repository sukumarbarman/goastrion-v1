///app/profile/page.tsx
"use client";

import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-6 shadow-lg"
    >
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">
        Welcome, {user.username || "User"} 👋
      </h1>
      <p className="text-slate-300 mb-2">
        Email: <span className="text-white">{user.email}</span>
      </p>

      <div className="mt-6 text-slate-400 text-sm leading-relaxed">
        <p>
          This is your personal GoAstrion profile dashboard. You’ll soon be able to:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Access your saved Vedic charts</li>
          <li>View Saturn (Sade Sati) timelines</li>
          <li>Find personalized ShubhDin predictions</li>
          <li>Update your preferences and language</li>
        </ul>
      </div>
    </motion.div>
  );
}
