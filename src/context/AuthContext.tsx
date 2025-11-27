import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string; // id do perfil
  user_id: string;
  clinica_id: string;
  role: string;
  // Campos legados/compatibilidade
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
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthStorage = () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch (err) {
      console.warn('Nao foi possivel limpar cache auth', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Tenta capturar a sessao vinda do OAuth redirect (hash)
        try {
          // @ts-ignore - opcional em supabase-js
          const maybe = await supabase.auth.getSessionFromUrl?.();
          if (maybe && maybe.data?.session) {
            setSession(maybe.data.session as any);
            setUser(maybe.data.session.user as any);
            await fetchOrCreateProfile(maybe.data.session.user as any);
            try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
            setLoading(false);
            return;
          }
        } catch (err) {
          // ignora e segue fluxo normal
        }

        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao obter sessão:', error.message);
          clearAuthStorage();
        }

        if (!isMounted) return;

        const session = sessionData?.session;
        setSession(session ?? null);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchOrCreateProfile(session.user);
        } else {
          clearAuthStorage();
        }
      } finally {
        // Garante que loading volte a false mesmo em caso de erro
        setLoading(false);
      }
    };

    // Se veio erro pela URL, loga e limpa
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('error')) {
        console.error('OAuth error after redirect:', Object.fromEntries(params.entries()));
        history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
    } catch (e) {
      // ignore
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      if (newSession?.user) await fetchOrCreateProfile(newSession.user);
      if (!newSession) {
        setProfile(null);
        clearAuthStorage();
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateProfile = async (user: User) => {
    try {
      const { data, error } = await supabase.from('perfis').select('*').eq('user_id', user.id).maybeSingle();
      if (error) {
        console.warn('Erro ao buscar perfil:', error.message);
      }

      if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }

      const clinicaNome = user.email ? `Clinica de ${user.email}` : 'Clinica Padrao';
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas')
        .insert({ nome: clinicaNome })
        .select()
        .single();
      if (clinicaError || !clinica) {
        console.error('Erro ao criar clinica padrao:', clinicaError);
        setProfile(null);
        return null;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .insert({ user_id: user.id, clinica_id: clinica.id, role: 'admin' })
        .select()
        .single();

      if (perfilError || !perfil) {
        console.error('Erro ao criar perfil padrao:', perfilError);
        setProfile(null);
        return null;
      }

      setProfile(perfil as Profile);
      return perfil as Profile;
    } catch (err) {
      console.error('Erro inesperado ao obter/criar perfil:', err);
      setProfile(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return null;
    return fetchOrCreateProfile(user);
  };

  const signInWithGoogle = async () => {
    const siteUrl = (import.meta as any)?.env?.VITE_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: siteUrl } });
  };

  const signOut = async () => {
    // Primeiro, desloga do Supabase. O evento onAuthStateChange cuidará de limpar o estado.
    await supabase.auth.signOut();
    
    // Garante que qualquer armazenamento local seja limpo, tratando casos de borda.
    clearAuthStorage();

    // Força um redirecionamento de página inteira para a rota de login.
    // Isso garante que todo o estado da aplicação React seja reiniciado, evitando conflitos.
    const siteUrl = (import.meta as any)?.env?.VITE_SITE_URL || window.location.origin;
    window.location.href = `${siteUrl}/#/login`;
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};





