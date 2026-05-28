"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

/**
 * @typedef {Object} AuthContextValue
 * @property {import("@supabase/supabase-js").Session | null} session
 * @property {import("@supabase/supabase-js").User | null} user
 * @property {boolean} loading
 * @property {boolean} authEnabled
 */

const AuthContext = createContext(null);

/**
 * Provides the current Supabase auth session to the whole app. When env vars
 * are missing, the provider intentionally stays in demo mode so the calculator
 * can still be used without auth features.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").JSX.Element}
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const authEnabled = hasSupabaseEnv();
  const [loading, setLoading] = useState(authEnabled);

  useEffect(() => {
    if (!authEnabled) {
      return undefined;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [authEnabled]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      authEnabled,
    }),
    [authEnabled, loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Gives components access to the shared auth context.
 *
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}
