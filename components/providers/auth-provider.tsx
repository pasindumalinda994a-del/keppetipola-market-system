"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiFetch,
  changePassword as changePasswordApi,
  registerAccount,
  type AuthResponse,
  type MeResponse,
  type RegisterPayload,
  type RegisterResponse,
  updateProfile as updateProfileApi,
  type UpdateProfilePayload,
} from "@/lib/api";
import {
  clearStoredAuth,
  normalizeUser,
  readStoredAuth,
  writeStoredAuth,
} from "@/lib/auth";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = readStoredAuth();
      if (!stored) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch<MeResponse>("/auth/me", {
          token: stored.token,
        });
        if (cancelled) return;
        const nextUser = normalizeUser(data.user);
        setToken(stored.token);
        setUser(nextUser);
        writeStoredAuth({ token: stored.token, user: nextUser });
      } catch {
        if (cancelled) return;
        clearStoredAuth();
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((nextToken: string, nextUser: User) => {
    const user = normalizeUser(nextUser);
    writeStoredAuth({ token: nextToken, user });
    setToken(nextToken);
    setUser(user);
    return user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      return persist(data.token, data.user);
    },
    [persist]
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    return registerAccount(payload);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      if (!token) throw new Error("Not authenticated");
      const data = await updateProfileApi(token, payload);
      return persist(token, data.user);
    },
    [token, persist]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!token) throw new Error("Not authenticated");
      await changePasswordApi(token, { currentPassword, newPassword });
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
