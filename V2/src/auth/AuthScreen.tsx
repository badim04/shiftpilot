import { useState } from 'react';
import { Btn } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { Wordmark } from '../company/Wordmark';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Mode } from '../data/types';

type Tab = 'signin' | 'signup' | 'magic';

export function AuthScreen({
  intent,
  onCancel,
}: {
  intent: Exclude<Mode, 'landing'>;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const role: 'worker' | 'manager' = intent === 'company' ? 'manager' : 'worker';

  const submit = async () => {
    if (!supabase) {
      setErr('Supabase not configured. Check .env.local.');
      return;
    }
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setNotice('Check your inbox to confirm your email, then sign in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setNotice('Magic link sent — check your email.');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!supabaseConfigured) {
    return (
      <div style={shellStyle}>
        <div style={cardStyle}>
          <Wordmark size={22} />
          <h2 style={{ margin: '12px 0 8px', fontSize: 22, color: 'var(--ink)' }}>Supabase not configured</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
            <code>.env.local</code> and restart the dev server.
          </p>
          <Btn variant="ghost" onClick={onCancel}>
            Back
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
        <Wordmark size={22} />
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginTop: 18,
          }}
        >
          {role === 'manager' ? 'Manager sign-in' : 'Worker sign-in'}
        </div>
        <h2 style={{ margin: '4px 0 18px', fontSize: 24, color: 'var(--ink)', letterSpacing: -0.4 }}>
          {tab === 'signup' ? 'Create your account' : tab === 'magic' ? 'Email me a magic link' : 'Welcome back'}
        </h2>

        <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--surface-3)', borderRadius: 11, marginBottom: 16 }}>
          {(['signin', 'signup', 'magic'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setErr(null);
                setNotice(null);
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 700,
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--ink-2)',
              }}
            >
              {t === 'signin' ? 'Sign in' : t === 'signup' ? 'Sign up' : 'Magic link'}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 11 }}
        >
          <label style={labelStyle}>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          {tab !== 'magic' && (
            <label style={labelStyle}>
              Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}
          {err && (
            <div
              style={{
                padding: '9px 11px',
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {err}
            </div>
          )}
          {notice && (
            <div
              style={{
                padding: '9px 11px',
                background: 'var(--positive-soft)',
                color: 'var(--positive)',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {notice}
            </div>
          )}
          <Btn type="submit" variant="primary" full disabled={busy}>
            {busy ? 'Working…' : tab === 'signup' ? 'Create account' : tab === 'magic' ? 'Send magic link' : 'Sign in'}
          </Btn>
        </form>

        <button
          onClick={onCancel}
          style={{
            marginTop: 14,
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-2)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Icon name="arrowR" size={13} style={{ transform: 'rotate(180deg)' }} /> Back to landing
        </button>
      </div>
    </div>
  );
}

const shellStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 28,
  background: 'var(--bg)',
} as const;

const cardStyle = {
  width: 'min(440px, 100%)',
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 22,
  padding: 30,
  boxShadow: 'var(--shadow-lg)',
} as const;

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: 12.5,
  fontWeight: 700,
  color: 'var(--ink-2)',
} as const;

const inputStyle = {
  border: '1px solid var(--line-2)',
  background: 'var(--surface-2)',
  color: 'var(--ink)',
  borderRadius: 11,
  padding: '12px 14px',
  fontSize: 14.5,
  fontFamily: 'inherit',
  outline: 'none',
} as const;
