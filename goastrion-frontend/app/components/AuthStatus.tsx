// app/components/AuthStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/apiClient";

type AuthUser = {
  id?: number | string;
  username: string;
  email?: string;
  // add extra fields if /api/auth/me/ returns more
};

export default function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    apiGet("/api/auth/me/", token)
      .then((res) => setUser(res as AuthUser)) // cast if apiGet isn't generic
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      await apiPost("/api/auth/logout/", { refresh });
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  if (!user)
    return <span className="text-slate-400 text-sm">Not logged in</span>;

  return (
    <div className="flex items-center gap-2 text-slate-200 text-sm">
      <span>Hi, {user.username || user.email || "User"}</span>
      <button onClick={handleLogout} className="text-cyan-400 hover:underline">
        Logout
      </button>
    </div>
  );
}
