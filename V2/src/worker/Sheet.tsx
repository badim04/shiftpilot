import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';

export function Sheet({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'var(--bg)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .34s cubic-bezier(.32,.72,0,1)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}

export function SheetHeader({
  title,
  onClose,
  right,
}: {
  title: string;
  onClose: () => void;
  right?: ReactNode;
}) {
  return (
    <div style={{ paddingTop: 56, padding: '56px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <button
        onClick={onClose}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--surface-3)',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Icon name="chevD" size={20} />
      </button>
      <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{title}</div>
      {right}
    </div>
  );
}
