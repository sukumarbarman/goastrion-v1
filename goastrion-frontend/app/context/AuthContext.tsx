// goastrion-frontend/app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AuthUser = {
  id?: number | string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  // allow extra fields from your API without using `any`
  [key: string]: unknown;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (u: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (u: AuthUser) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
