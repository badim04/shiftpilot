import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

export interface AuthState {
  ready: boolean;
  user: User | null;
  session: Session | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ ready: !supabaseConfigured, user: null, session: null });

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setState({ ready: true, user: data.session?.user ?? null, session: data.session ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ ready: true, user: session?.user ?? null, session });
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
