// goastrion-frontend/app/components/AuthStatus.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext";

export default function AuthStatus() {
  const { user, logout } = useAuth();

  if (!user) {
    return <span className="text-slate-400 text-sm">Not logged in</span>;
  }

  return (
    <div className="flex items-center gap-2 text-slate-200 text-sm">
      <span>Hi, {String(user.username || user.email || "User")}</span>
      <button
        onClick={logout}
        className="text-cyan-400 hover:underline"
      >
        Logout
      </button>
    </div>
  );
}
