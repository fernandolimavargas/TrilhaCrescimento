import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  api,
  clearAccessToken,
  getAccessToken,
  setStoredUserId,
  type ApiUser,
  type AppRole,
  type AuthSession,
  type AuthUser,
  type Profile,
  type RoleRow,
} from "@/lib/api";

export type { AppRole, Profile, RoleRow };

type AuthValue = {
  loading: boolean;
  session: AuthSession | null;
  user: ApiUser | null;
  profile: Profile | null;
  roles: RoleRow[];
  isAdmin: boolean;
  isLeader: boolean;
  leaderAreas: string[];
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<ApiUser | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!getAccessToken()) {
      setContext(null);
      return;
    }
    try {
      const nextContext = await api.auth.getMe();
      setStoredUserId(nextContext.id);
      setContext(nextContext);
    } catch {
      clearAccessToken();
      setContext(null);
    }
  }, []);

  useEffect(() => {
    void refreshProfile().finally(() => setLoading(false));
  }, [refreshProfile]);

  const value = useMemo<AuthValue>(() => {
    const roles: RoleRow[] = [];
    const leaderAreas = roles
      .filter((r) => r.role === "leader" && r.area)
      .map((r) => r.area as string);
    return {
      loading,
      session: context && getAccessToken() ? { accessToken: getAccessToken()! } : null,
      user: context,
      profile: null,
      roles,
      isAdmin: roles.some((r) => r.role === "admin"),
      isLeader: roles.some((r) => r.role === "leader"),
      leaderAreas,
      refreshProfile,
      signOut: async () => {
        await api.auth.signOut();
        setContext(null);
      },
    };
  }, [context, loading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
