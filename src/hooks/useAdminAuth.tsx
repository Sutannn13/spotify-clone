"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  signInWithPassword,
  signOut,
  getCurrentUser,
  getUserProfile,
  onAuthStateChange,
  type AuthUser,
  type UserProfile,
} from "@/lib/supabase/auth";

interface AdminAuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  logOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  logOut: async () => {},
});

export function useAdminAuth(): AdminAuthContextValue {
  return useContext(AdminAuthContext);
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = profile?.role === "admin";

  const loadProfile = useCallback(async (userId: string, email: string) => {
    const { profile: p, error } = await getUserProfile(userId);
    if (error && error !== "Supabase is not configured") {
      console.warn("Failed to load profile, creating default:", error);
      await import("@/lib/supabase/auth").then(({ createProfile }) => {
        createProfile(userId, email);
      });
    }
    if (p) {
      setProfile(p);
    } else {
      // Default to listener if no profile
      setProfile({
        id: userId,
        email,
        role: "listener",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const result = await signInWithPassword(email, password);
      if (result.user) {
        setUser(result.user);
        await loadProfile(result.user.id, result.user.email);
      }
      setIsLoading(false);
      return { error: result.error };
    },
    [loadProfile]
  );

  const logOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      unsubscribe = onAuthStateChange(async (authUser) => {
        if (!mounted) return;
        if (authUser) {
          setUser(authUser);
          await loadProfile(authUser.id, authUser.email);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });
    };

    init();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [loadProfile]);

  return (
    <AdminAuthContext.Provider
      value={{ user, profile, isAdmin, isLoading, signIn, logOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}