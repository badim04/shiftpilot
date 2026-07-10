import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { StoreProvider, useStore } from './data/store';
import { ACCENTS, isDark, themeVars } from './theme';
import type { ThemeKey } from './theme';
import { Toolbar } from './shell/Toolbar';
import { CompanyStage, WorkerStage } from './shell/Stage';
import { Landing } from './landing/Landing';
import { AuthScreen } from './auth/AuthScreen';
import { signOut, useAuth } from './auth/useAuth';
import { supabaseConfigured } from './lib/supabase';
import type { Mode } from './data/types';

const THEME_KEY = 'rota_app_v2_theme';

interface ThemePrefs {
  themeKey: ThemeKey;
  accent: string;
}
function loadPrefs(): ThemePrefs {
  try {
    const r = localStorage.getItem(THEME_KEY);
    if (r) return JSON.parse(r) as ThemePrefs;
  } catch {
    /* ignore */
  }
  return { themeKey: 'midnight', accent: '' };
}
function savePrefs(p: ThemePrefs) {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function Shell({ requireAuth, signedIn, onSignOut }: { requireAuth: boolean; signedIn: boolean; onSignOut: () => void }) {
  const { mode, setMode, actions, online } = useStore();
  const [authIntent, setAuthIntent] = useState<Exclude<Mode, 'landing'> | null>(null);
  const initial = useMemo(() => loadPrefs(), []);
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(initial.themeKey);
  const [accent, setAccentState] = useState<string>(
    ACCENTS.includes(initial.accent as (typeof ACCENTS)[number]) ? initial.accent : '',
  );

  const setThemeKey = (k: ThemeKey) => {
    setThemeKeyState(k);
    savePrefs({ themeKey: k, accent });
  };
  const setAccent = (a: string) => {
    setAccentState(a);
    savePrefs({ themeKey, accent: a });
  };

  const vars = themeVars(themeKey);
  const rootStyle: CSSProperties = { ...(vars as CSSProperties) };
  if (accent) {
    (rootStyle as Record<string, string>)['--accent'] = accent;
    (rootStyle as Record<string, string>)['--accent-2'] = accent;
    (rootStyle as Record<string, string>)['--accent-ink'] = isDark(themeKey) ? '#0A0C10' : '#FFFFFF';
    (rootStyle as Record<string, string>)['--accent-soft'] = hexAlpha(accent, isDark(themeKey) ? 0.18 : 0.12);
  }

  const handleSetMode = (m: Mode) => {
    if (m !== 'landing' && requireAuth && !signedIn) {
      setAuthIntent(m);
      return;
    }
    setAuthIntent(null);
    setMode(m);
  };

  return (
    <div
      className="rota-root"
      style={{
        ...rootStyle,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--ink)',
        overflow: 'hidden',
      }}
    >
      <Toolbar
        mode={mode}
        setMode={handleSetMode}
        themeKey={themeKey}
        setThemeKey={setThemeKey}
        accent={accent}
        setAccent={setAccent}
        signedIn={signedIn}
        online={online}
        onSignOut={onSignOut}
        onReset={() => {
          actions.reset();
          handleSetMode('landing');
          setAuthIntent(null);
        }}
      />
      {authIntent && (
        <AuthScreen
          intent={authIntent}
          onCancel={() => setAuthIntent(null)}
        />
      )}
      {!authIntent && mode === 'landing' && (
        <Landing setMode={handleSetMode} demoBadge={!supabaseConfigured || !signedIn} />
      )}
      {!authIntent && mode === 'worker' && <WorkerStage themeKey={themeKey} />}
      {!authIntent && mode === 'company' && <CompanyStage />}
    </div>
  );
}

function hexAlpha(hex: string, a: number): string {
  const m = hex.replace('#', '');
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function App() {
  const auth = useAuth();
  // Require auth only if Supabase is configured; otherwise stay in demo mode.
  const requireAuth = supabaseConfigured;
  const signedIn = Boolean(auth.user);

  if (supabaseConfigured && !auth.ready) {
    return <div style={{ background: '#0E1116', color: '#9DA7B4', height: '100vh' }} />;
  }

  return (
    <StoreProvider userId={auth.user?.id ?? null}>
      <Shell requireAuth={requireAuth} signedIn={signedIn} onSignOut={() => signOut()} />
    </StoreProvider>
  );
}
