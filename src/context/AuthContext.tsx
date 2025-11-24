import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string; // id do perfil
  user_id: string;
  clinica_id: string;
  role: string;
  // Esses podem vir de um join com a tabela users ou profiles legada, mantendo por compatibilidade
  full_name?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // First: try to get session from URL (handles OAuth redirect where token is in hash)
      try {
        // Supabase v2: getSessionFromUrl will parse the URL fragment if present
        // and create a session. If there's no session in the URL it is a no-op.
        // Wrap in try/catch because not all flows will return data here.
        // @ts-ignore
        const maybe = await supabase.auth.getSessionFromUrl?.();
        if (maybe && maybe.data?.session) {
          setSession(maybe.data.session as any);
          setUser(maybe.data.session.user as any);
          await fetchProfile(maybe.data.session.user.id);
          // clear hash to avoid interfering with HashRouter or other parsing
          try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch(e) {}
          setLoading(false);
          return;
        }

      } catch (err) {
        // ignore — fallback to normal flow
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(session ?? null);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    // If redirect contained error in search params, log it for debugging and clear URL
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('error')) {
        console.error('OAuth error after redirect:', Object.fromEntries(params.entries()));
        // clear search
        history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
    } catch (e) {
      // ignore
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      if (newSession?.user) fetchProfile(newSession.user.id);
      if (!newSession) setProfile(null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Busca na nova tabela 'perfis' usando o 'user_id'
      const { data, error } = await supabase.from('perfis').select('*').eq('user_id', userId).single();
      if (error) {
        // perfil pode não existir ainda
        console.warn(`Perfil não encontrado para user_id: ${userId}`, error.message);
        setProfile(null);
        return;
      }
      setProfile(data as Profile);
    } catch (err) {
      setProfile(null);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
