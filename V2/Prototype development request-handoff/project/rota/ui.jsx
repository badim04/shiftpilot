// ui.jsx — shared primitives for both apps. Exposes to window.
// All colors via CSS vars so themes apply uniformly.
const { useState: _uS } = React;

function Avatar({ worker, size = 38, ring = false }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:worker.color, color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight:700, fontSize:size*0.36, letterSpacing:0.2,
      boxShadow: ring ? '0 0 0 2px var(--surface), 0 0 0 4px var(--accent)' : 'none',
    }}>{worker.initials}</div>
  );
}

function CompanyDot({ company, size = 10 }) {
  return <span style={{ width:size, height:size, borderRadius:3, background:company.color, flexShrink:0, display:'inline-block' }} />;
}

function CompanyChip({ company }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12.5, fontWeight:600, color:'var(--ink-2)' }}>
      <CompanyDot company={company} size={9} />{company.short}
    </span>
  );
}

// pill badge
function Badge({ children, tone = 'neutral', solid = false, style = {} }) {
  const map = {
    neutral:  ['var(--ink-2)', 'var(--surface-3)'],
    accent:   ['var(--accent)', 'var(--accent-soft)'],
    positive: ['var(--positive)', 'var(--positive-soft)'],
    warning:  ['var(--warning)', 'var(--warning-soft)'],
    danger:   ['var(--danger)', 'var(--danger-soft)'],
  };
  const [fg, bg] = map[tone] || map.neutral;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:999, fontSize:11.5, fontWeight:700,
      letterSpacing:0.2, lineHeight:1.4,
      color: solid ? 'var(--accent-ink)' : fg,
      background: solid ? fg : bg,
      ...style,
    }}>{children}</span>
  );
}

function LiveDot({ color = 'var(--positive)' }) {
  return (
    <span style={{ position:'relative', width:8, height:8, display:'inline-block', flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color }} />
      <span style={{ position:'absolute', inset:-3, borderRadius:'50%', background:color, opacity:0.35,
        animation:'rotaPulse 1.8s ease-out infinite' }} />
    </span>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', full = false, disabled = false, style = {}, type }) {
  const [down, setDown] = _uS(false);
  const sizes = { sm:['7px 12px',13], md:['11px 16px',14.5], lg:['14px 20px',16] };
  const [pad, fs] = sizes[size] || sizes.md;
  const variants = {
    primary:  { background:'var(--accent)', color:'var(--accent-ink)', border:'1px solid transparent' },
    positive: { background:'var(--positive)', color:'#fff', border:'1px solid transparent' },
    danger:   { background:'var(--danger-soft)', color:'var(--danger)', border:'1px solid transparent' },
    ghost:    { background:'transparent', color:'var(--ink)', border:'1px solid var(--line-2)' },
    soft:     { background:'var(--surface-3)', color:'var(--ink)', border:'1px solid transparent' },
    accentSoft:{ background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid transparent' },
  };
  return (
    <button type={type} onClick={disabled?undefined:onClick} disabled={disabled}
      onPointerDown={()=>setDown(true)} onPointerUp={()=>setDown(false)} onPointerLeave={()=>setDown(false)}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
        padding:pad, fontSize:fs, fontWeight:700, fontFamily:'inherit',
        borderRadius:12, cursor:disabled?'default':'pointer',
        width: full?'100%':undefined, whiteSpace:'nowrap',
        opacity:disabled?0.4:1,
        transform:down&&!disabled?'scale(0.97)':'scale(1)',
        transition:'transform .12s ease, background .15s ease',
        WebkitTapHighlightColor:'transparent',
        ...variants[variant], ...style,
      }}>{children}</button>
  );
}

function Card({ children, pad = 16, style = {}, onClick, hover = false }) {
  const [h, setH] = _uS(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>hover&&setH(true)} onMouseLeave={()=>hover&&setH(false)}
      style={{
        background:'var(--surface)', borderRadius:18, padding:pad,
        border:'1px solid var(--line)',
        boxShadow: h ? 'var(--shadow)' : 'none',
        cursor:onClick?'pointer':'default',
        transition:'box-shadow .15s ease, transform .12s ease, border-color .15s ease',
        transform: h ? 'translateY(-1px)':'none',
        ...style,
      }}>{children}</div>
  );
}

// section label
function Eyebrow({ children, style = {} }) {
  return <div style={{ fontSize:11.5, fontWeight:800, letterSpacing:1, textTransform:'uppercase', color:'var(--ink-3)', ...style }}>{children}</div>;
}

// segmented control
function Segmented({ options, value, onChange, size='md' }) {
  const pad = size==='sm' ? '6px 10px' : '8px 14px';
  const fs = size==='sm' ? 12.5 : 13.5;
  return (
    <div style={{ display:'inline-flex', background:'var(--surface-3)', borderRadius:12, padding:3, gap:2 }}>
      {options.map(o => {
        const v = typeof o==='string'?o:o.value, l = typeof o==='string'?o:o.label;
        const on = v===value;
        return (
          <button key={v} onClick={()=>onChange(v)} style={{
            padding:pad, fontSize:fs, fontWeight:700, fontFamily:'inherit', border:'none',
            borderRadius:9, cursor:'pointer', whiteSpace:'nowrap',
            background:on?'var(--surface)':'transparent',
            color:on?'var(--ink)':'var(--ink-2)',
            boxShadow:on?'var(--shadow)':'none',
            transition:'background .15s, color .15s',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// virtual clock — starts at the simulated NOW (14:30) and ticks with real time
function useRotaClock(intervalMs = 1000) {
  const base = window.RotaData.NOW.getTime();
  const start = React.useRef(Date.now()).current;
  const [t, setT] = _uS(base);
  React.useEffect(() => {
    const id = setInterval(() => setT(base + (Date.now() - start)), intervalMs);
    return () => clearInterval(id);
  }, []);
  return new Date(t);
}
function fmtHM(d){ return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function elapsedStr(fromHM, now){
  const [h,m] = fromHM.split(':').map(Number);
  let mins = (now.getHours()*60+now.getMinutes()) - (h*60+m);
  if (mins < 0) mins += 1440;
  const hh = Math.floor(mins/60), mm = mins%60;
  return `${hh}h ${String(mm).padStart(2,'0')}m`;
}

// shift role → soft color band keyed off company color is handled per-card.
Object.assign(window, { Avatar, CompanyDot, CompanyChip, Badge, LiveDot, Btn, Card, Eyebrow, Segmented, useRotaClock, fmtHM, elapsedStr });
