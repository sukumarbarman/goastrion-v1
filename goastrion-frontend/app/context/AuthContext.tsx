// app/context/AuthContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AUTH_ENDPOINTS } from "@/app/lib/authEndpoints";
import { apiGet, apiPost } from "@/app/lib/apiClient";

export type AuthUser = {
  id?: number | string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  [key: string]: unknown;
};

type LoginPayload = {
  user: AuthUser;
  access: string;
  refresh?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  accessToken: string | null;
  login: (p: LoginPayload) => void;
  logout: () => Promise<void>;
  refreshAccess: () => Promise<string | null>;
  setUser: (u: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- localStorage keys
const LS_KEYS = {
  access: "auth.access",
  refresh: "auth.refresh",
  user: "auth.user",
};

function readTokens() {
  return {
    access: typeof window !== "undefined" ? localStorage.getItem(LS_KEYS.access) : null,
    refresh: typeof window !== "undefined" ? localStorage.getItem(LS_KEYS.refresh) : null,
  };
}

function writeTokens(access: string | null, refresh: string | null) {
  if (typeof window === "undefined") return;

  if (access) {
    localStorage.setItem(LS_KEYS.access, access);
  } else {
    localStorage.removeItem(LS_KEYS.access);
  }

  if (refresh) {
    localStorage.setItem(LS_KEYS.refresh, refresh);
  } else {
    localStorage.removeItem(LS_KEYS.refresh);
  }
}

function writeUser(u: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (u) {
    localStorage.setItem(LS_KEYS.user, JSON.stringify(u));
  } else {
    localStorage.removeItem(LS_KEYS.user);
  }
}

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---- NEW: lightweight auth flag cookie so middleware/SSR can detect login
function setAuthFlagCookie(on: boolean, days = 14) {
  if (typeof document === "undefined") return;
  const base = "Path=/; SameSite=Lax";
  const isHttps =
    typeof window !== "undefined" && window.location?.protocol === "https:";
  const secure = isHttps ? "; Secure" : "";
  if (on) {
    const maxAge = `; Max-Age=${60 * 60 * 24 * days}`;
    document.cookie = `ga_auth=1; ${base}${maxAge}${secure}`;
  } else {
    document.cookie = `ga_auth=; ${base}; Max-Age=0${secure}`;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    writeTokens(null, null);
    writeUser(null);
    setAuthFlagCookie(false); // NEW
  }, []);

  const doRefresh = useCallback(
    async (refresh: string | null): Promise<string | null> => {
      if (!refresh) return null;
      try {
        // NOTE: provide the body type explicitly
        const data = await apiPost<{ access: string; refresh?: string }, { refresh: string }>(
          AUTH_ENDPOINTS.refresh,
          { refresh }
        );
        const newAccess = data.access;
        const newRefresh = data.refresh ?? refresh;
        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
        writeTokens(newAccess, newRefresh);
        setAuthFlagCookie(true); // NEW
        return newAccess;
      } catch {
        clearAuth();
        return null;
      }
    },
    [clearAuth]
  );

  // bootstrap
  useEffect(() => {
    const { access, refresh } = readTokens();
    const cachedUser = readUser();
    if (cachedUser) setUser(cachedUser);
    if (access) setAccessToken(access);
    if (refresh) setRefreshToken(refresh);

    (async () => {
      try {
        if (access) {
          const me = await apiGet<AuthUser>(AUTH_ENDPOINTS.me, access);
          setUser(me);
          writeUser(me);
          setAuthFlagCookie(true); // NEW
        } else if (refresh) {
          const newAccess = await doRefresh(refresh);
          if (newAccess) {
            const me = await apiGet<AuthUser>(AUTH_ENDPOINTS.me, newAccess);
            setUser(me);
            writeUser(me);
            setAuthFlagCookie(true); // NEW
          } else {
            clearAuth();
          }
        }
      } catch {
        // try refresh once if /me failed
        const newAccess = await doRefresh(refresh || null);
        if (newAccess) {
          try {
            const me = await apiGet<AuthUser>(AUTH_ENDPOINTS.me, newAccess);
            setUser(me);
            writeUser(me);
            setAuthFlagCookie(true); // NEW
          } catch {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // bootstrap once

  const value = useMemo<AuthContextType>(() => {
    const logout = async () => {
      try {
        if (accessToken) {
          // Provide an explicit empty body type for consistency
          await apiPost<unknown, Record<string, never>>(AUTH_ENDPOINTS.logout, {}, accessToken);
        }
      } catch {
        // ignore network failures on logout
      }
      clearAuth();
    };

    const refreshAccess = async () => {
      const nxt = await doRefresh(refreshToken);
      return nxt;
    };

    const login = (p: LoginPayload) => {
      setUser(p.user);
      setAccessToken(p.access);
      setRefreshToken(p.refresh || null);
      writeUser(p.user);
      writeTokens(p.access, p.refresh || null);
      setAuthFlagCookie(true); // NEW
    };

    return {
      user,
      loading,
      accessToken,
      setUser,
      login,
      logout,
      refreshAccess,
    };
  }, [user, loading, accessToken, refreshToken, clearAuth, doRefresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
