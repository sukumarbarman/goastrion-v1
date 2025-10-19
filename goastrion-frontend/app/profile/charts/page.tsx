"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

interface Chart {
  id: number;
  name: string;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  created_at: string;
}

export default function SavedChartsPage() {
  const { user } = useAuth();
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCharts() {
    try {
      const token = localStorage.getItem("access");
      const resp = await fetch("http://127.0.0.1:8000/api/astro/charts/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      if (resp.ok) setCharts(data);
      else setError(data.detail || "Failed to load charts.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteChart(id: number) {
    if (!confirm("Delete this chart?")) return;
    const token = localStorage.getItem("access");
    await fetch(`http://127.0.0.1:8000/api/astro/charts/${id}/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    setCharts((prev) => prev.filter((c) => c.id !== id));
  }

  useEffect(() => {
    fetchCharts();
  }, []);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-6 shadow-lg"
    >
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">Saved Charts</h1>

      {loading && <p className="text-slate-400">Loading charts...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && charts.length === 0 && (
        <p className="text-slate-400 text-sm">
          You have no saved charts yet. Create one from the{" "}
          <Link href="/create" className="text-cyan-400 underline">
            Create Chart
          </Link>{" "}
          page.
        </p>
      )}

      <div className="space-y-3 mt-4">
        {charts.map((chart) => (
          <div
            key={chart.id}
            className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-lg hover:bg-black/50 transition"
          >
            <div>
              <p className="font-medium text-white">{chart.name}</p>
              <p className="text-xs text-slate-400">
                {new Date(chart.birth_datetime).toLocaleString()} — {chart.timezone}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/chart/${chart.id}`}
                className="text-cyan-400 text-sm hover:underline"
              >
                View
              </Link>
              <button
                onClick={() => deleteChart(chart.id)}
                className="text-red-400 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
