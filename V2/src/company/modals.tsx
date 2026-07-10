import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../ui/Icon';

export function ModalShell({
  title,
  onClose,
  children,
  width = 440,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        background: 'rgba(8,10,14,0.5)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: '100%',
          maxHeight: '90%',
          overflowY: 'auto',
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-lg)',
          padding: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              border: 'none',
              background: 'var(--surface-3)',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="x" size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  style = {},
}: {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          appearance: 'none',
          border: '1px solid var(--line-2)',
          background: 'var(--surface-2)',
          color: 'var(--ink)',
          borderRadius: 11,
          padding: '11px 36px 11px 13px',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevD"
        size={16}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--ink-3)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export function EmptyCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px 20px',
        maxWidth: 420,
        margin: '20px auto',
        border: '1.5px dashed var(--line-2)',
        borderRadius: 18,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink-2)' }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 5, fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

export const HOURS: string[] = [];
for (let h = 6; h <= 23; h++) {
  HOURS.push(`${String(h).padStart(2, '0')}:00`);
  HOURS.push(`${String(h).padStart(2, '0')}:30`);
}
