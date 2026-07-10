// components.jsx — shared visual building blocks
// Exposes UI components to window

const { useState, useEffect, useRef } = React;
const HS = window.HabitStore;

// ── icon: rounded square, habit color, monogram ────────────────
function HabitIcon({ habit, size = 44 }) {
  const c = HS.PALETTE[habit.color];
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: c.bg, color: c.tint, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.42, letterSpacing: -0.5,
    }}>{habit.name.charAt(0).toUpperCase()}</div>
  );
}

// ── round check button ─────────────────────────────────────────
function CheckButton({ done, color, onToggle, size = 32 }) {
  const c = HS.PALETTE[color];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        border: done ? 'none' : `2px solid ${c.solid}40`,
        background: done ? c.solid : 'transparent',
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .18s cubic-bezier(.34,1.56,.64,1), background .18s ease',
        transform: done ? 'scale(1)' : 'scale(1)',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-pressed={done}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" style={{
        opacity: done ? 1 : 0,
        transform: done ? 'scale(1)' : 'scale(0.5)',
        transition: 'opacity .15s ease, transform .2s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <path d="M5 13l4 4L19 7" fill="none" stroke="#fff" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── progress ring ──────────────────────────────────────────────
function ProgressRing({ value, total, size = 64, stroke = 6, color = '#1A1816' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : value / total;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(0,0,0,0.07)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  );
}

// ── flame / streak chip ────────────────────────────────────────
function StreakChip({ n, color }) {
  const c = HS.PALETTE[color];
  if (n <= 0) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 13, fontWeight: 600, color: c.tint,
    }}>
      <svg width="12" height="14" viewBox="0 0 12 14">
        <path d="M6 0C6 0 1 4 1 8.5A5 5 0 0011 8.5C11 6 9 5 9 5C9 6.5 7.8 7 7.8 7C8.2 4 6 0 6 0Z" fill={c.solid}/>
      </svg>
      {n}
    </span>
  );
}

// ── generic pressable card wrapper (subtle press feedback) ─────
function Pressable({ children, onClick, style = {} }) {
  const [down, setDown] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        transition: 'transform .12s ease',
        transform: down ? 'scale(0.985)' : 'scale(1)',
        WebkitTapHighlightColor: 'transparent', cursor: 'pointer',
        ...style,
      }}
    >{children}</div>
  );
}

Object.assign(window, { HabitIcon, CheckButton, ProgressRing, StreakChip, Pressable });
