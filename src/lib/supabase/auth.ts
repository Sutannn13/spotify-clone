import { getSupabaseClient } from "./client";

export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "listener";
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { user: null, error: "Supabase is not configured" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: "No user returned" };

  return {
    user: { id: data.user.id, email: data.user.email ?? "" },
    error: null,
  };
}

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase is not configured" };

  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user
    ? { id: data.user.id, email: data.user.email ?? "" }
    : null;
}

export async function getUserProfile(
  userId: string
): Promise<{ profile: UserProfile | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { profile: null, error: "Supabase is not configured" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  return {
    profile: data
      ? {
          id: data.id,
          email: data.email ?? "",
          role: (data.role as "admin" | "listener") ?? "listener",
          created_at: data.created_at,
          updated_at: data.updated_at,
        }
      : null,
    error: null,
  };
}

export async function createProfile(
  userId: string,
  email: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase is not configured" };

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    role: "listener",
  });

  return { error: error?.message ?? null };
}

export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // No client, just return a no-op cleanup
    return () => {};
  }

  // Run once immediately to pick up existing session
  supabase.auth.getUser().then(({ data }) => {
    callback(
      data.user
        ? { id: data.user.id, email: data.user.email ?? "" }
        : null
    );
  });

  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    callback(
      session?.user
        ? { id: session.user.id, email: session.user.email ?? "" }
        : null
    );
  });

  return () => data.subscription.unsubscribe();
}