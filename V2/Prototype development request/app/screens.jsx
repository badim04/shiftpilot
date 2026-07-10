// screens.jsx — Today, AddSheet, Detail
const { useState: useS, useEffect: useE, useRef: useR } = React;
const S = window.HabitStore;

const INK = '#1A1816';
const SUB = '#8A8278';
const APPBG = '#F6F4F0';
const CARD = '#FFFFFF';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
function longDate() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// ════════════════════════════ TODAY ════════════════════════════
function TodayScreen({ habits, onToggle, onOpen, onAdd }) {
  const tk = S.todayKey();
  const done = habits.filter(h => h.history[tk]).length;
  const total = habits.length;
  const allDone = total > 0 && done === total;

  return (
    <div style={{ padding: '64px 20px 120px', minHeight: '100%', boxSizing: 'border-box' }}>
      {/* header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: SUB, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {longDate()}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: INK, letterSpacing: -0.8, marginTop: 4 }}>
          {greeting()}
        </div>
      </div>

      {/* summary card */}
      <div style={{
        background: INK, borderRadius: 24, padding: 20, marginBottom: 22,
        display: 'flex', alignItems: 'center', gap: 18, color: '#fff',
      }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <ProgressRing value={done} total={total} size={64} stroke={6} color="#fff" />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, fontWeight: 700,
          }}>{total === 0 ? '0' : Math.round((done/total)*100)}<span style={{fontSize:10,marginTop:-4}}>%</span></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>
            {allDone ? 'All done today' : `${done} of ${total} complete`}
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.35 }}>
            {allDone ? 'Perfect day — every habit checked off.'
              : done === 0 ? 'A fresh start. Pick one to begin.'
              : `${total - done} habit${total-done>1?'s':''} left to go. Keep it up.`}
          </div>
        </div>
      </div>

      {/* section label */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 2px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: SUB, letterSpacing: 0.4, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Today's habits
        </span>
        <button onClick={onAdd} style={{
          border: 'none', background: 'transparent', color: INK, fontWeight: 600,
          fontSize: 14, cursor: 'pointer', padding: '2px 4px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke={INK} strokeWidth="2" strokeLinecap="round"/></svg>
          New
        </button>
      </div>

      {/* habit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {habits.map(h => {
          const isDone = !!h.history[tk];
          const streak = S.currentStreak(h);
          return (
            <Pressable key={h.id} onClick={() => onOpen(h.id)} style={{
              background: CARD, borderRadius: 18, padding: 14,
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.025)',
            }}>
              <HabitIcon habit={h} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: isDone ? SUB : INK,
                  textDecoration: isDone ? 'line-through' : 'none',
                  textDecorationColor: 'rgba(0,0,0,0.25)',
                }}>{h.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 13, color: SUB }}>{h.goal}</span>
                  {streak > 0 && <span style={{ color: '#D8D2C8' }}>·</span>}
                  <StreakChip n={streak} color={h.color} />
                </div>
              </div>
              <CheckButton done={isDone} color={h.color} onToggle={() => onToggle(h.id)} size={34} />
            </Pressable>
          );
        })}

        {habits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: SUB }}>
            <div style={{ fontSize: 15, marginBottom: 14 }}>No habits yet.</div>
            <button onClick={onAdd} style={{
              border: 'none', background: INK, color: '#fff', fontWeight: 600,
              fontSize: 15, padding: '11px 22px', borderRadius: 999, cursor: 'pointer',
            }}>Add your first habit</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════ ADD SHEET ══════════════════════════
function AddSheet({ open, onClose, onCreate }) {
  const [name, setName] = useS('');
  const [goal, setGoal] = useS('');
  const [color, setColor] = useS('ocean');
  const inputRef = useR(null);

  useE(() => {
    if (open) {
      setName(''); setGoal(''); setColor('ocean');
      setTimeout(() => inputRef.current && inputRef.current.focus(), 280);
    }
  }, [open]);

  const canSave = name.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    onCreate({ name: name.trim(), goal: goal.trim() || 'Daily', color });
    onClose();
  };

  return (
    <>
      {/* scrim */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 70,
        background: 'rgba(0,0,0,0.35)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .3s ease',
      }} />
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: APPBG, borderRadius: '28px 28px 0 0', padding: '12px 20px 34px',
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .36s cubic-bezier(.32,.72,0,1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 9, background: '#D8D2C8', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button onClick={onClose} style={ghostBtn(SUB)}>Cancel</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>New habit</span>
          <button onClick={submit} disabled={!canSave} style={{
            ...ghostBtn(INK), fontWeight: 700, opacity: canSave ? 1 : 0.3,
          }}>Save</button>
        </div>

        {/* name */}
        <div style={fieldWrap}>
          <input ref={inputRef} value={name} onChange={e => setName(e.target.value)}
            placeholder="Habit name"
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{
              ...inputStyle, fontSize: 18, fontWeight: 600,
            }} />
        </div>
        {/* goal */}
        <div style={fieldWrap}>
          <input value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="Goal (e.g. 20 minutes)" style={inputStyle} />
        </div>

        {/* color */}
        <div style={{ ...fieldWrap, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: SUB, marginBottom: 12 }}>Color</div>
          <div style={{ display: 'flex', gap: 14 }}>
            {S.COLOR_KEYS.map(k => {
              const c = S.PALETTE[k];
              const sel = color === k;
              return (
                <button key={k} onClick={() => setColor(k)} style={{
                  width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
                  background: c.solid, border: 'none', padding: 0,
                  boxShadow: sel ? `0 0 0 3px ${APPBG}, 0 0 0 5px ${c.solid}` : 'none',
                  transition: 'box-shadow .15s ease',
                }} />
              );
            })}
          </div>
        </div>

        {/* preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '4px 4px 0', marginTop: 6,
        }}>
          <HabitIcon habit={{ name: name || '·', color }} size={40} />
          <div style={{ fontSize: 15, fontWeight: 600, color: name ? INK : SUB }}>
            {name || 'Your new habit'}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════ DETAIL ═══════════════════════════
function DetailScreen({ habit, onBack, onToggle, onDelete }) {
  if (!habit) return null;
  const c = S.PALETTE[habit.color];
  const cur = S.currentStreak(habit);
  const best = S.bestStreak(habit);
  const rate = S.completionRate(habit, 30);
  const tk = S.todayKey();
  const isDone = !!habit.history[tk];
  const grid = S.lastNDays(habit, 70); // 10 weeks

  // pad front so grid aligns to weeks (columns = weeks, rows = Sun..Sat)
  const firstDow = grid[0].dow;
  const padded = Array(firstDow).fill(null).concat(grid);

  return (
    <div style={{ padding: '60px 20px 60px', minHeight: '100%', boxSizing: 'border-box' }}>
      {/* nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <button onClick={onBack} style={{ ...ghostBtn(INK), display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Today
        </button>
        <button onClick={onDelete} style={{ ...ghostBtn('#B5483B'), fontWeight: 600 }}>Delete</button>
      </div>

      {/* identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <HabitIcon habit={habit} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: INK, letterSpacing: -0.5 }}>{habit.name}</div>
          <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>{habit.goal} · Daily</div>
        </div>
      </div>

      {/* hero streak */}
      <div style={{
        background: c.bg, borderRadius: 24, padding: '22px 20px', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <svg width="34" height="40" viewBox="0 0 12 14"><path d="M6 0C6 0 1 4 1 8.5A5 5 0 0011 8.5C11 6 9 5 9 5C9 6.5 7.8 7 7.8 7C8.2 4 6 0 6 0Z" fill={c.solid}/></svg>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: c.tint, lineHeight: 1, letterSpacing: -1 }}>
            {cur}<span style={{ fontSize: 16, fontWeight: 600, marginLeft: 6 }}>day{cur===1?'':'s'}</span>
          </div>
          <div style={{ fontSize: 13.5, color: c.tint, opacity: 0.8, marginTop: 4, fontWeight: 600 }}>Current streak</div>
        </div>
      </div>

      {/* stat row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        <Stat label="Best streak" value={best} unit="days" />
        <Stat label="30-day rate" value={rate} unit="%" />
      </div>

      {/* heatmap */}
      <div style={{ fontSize: 13, fontWeight: 700, color: SUB, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 12 }}>
        Last 10 weeks
      </div>
      <div style={{
        background: CARD, borderRadius: 18, padding: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.025)',
      }}>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: 5, justifyContent: 'start' }}>
          {padded.map((d, i) => {
            if (!d) return <div key={i} style={{ width: 18, height: 18 }} />;
            return (
              <div key={i} title={d.key} style={{
                width: 18, height: 18, borderRadius: 5,
                background: d.done ? c.solid : 'rgba(0,0,0,0.05)',
                outline: d.isToday ? `2px solid ${c.tint}` : 'none',
                outlineOffset: 1,
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12, color: SUB }}>
          <span>Less</span>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(0,0,0,0.05)' }} />
          <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg }} />
          <div style={{ width: 12, height: 12, borderRadius: 3, background: c.solid }} />
          <span>More</span>
        </div>
      </div>

      {/* today toggle */}
      <button onClick={() => onToggle(habit.id)} style={{
        marginTop: 22, width: '100%', border: 'none', borderRadius: 16,
        padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        background: isDone ? 'rgba(0,0,0,0.05)' : c.solid,
        color: isDone ? INK : '#fff',
        transition: 'background .2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {isDone ? 'Completed today ✓' : 'Mark done today'}
      </button>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div style={{
      flex: 1, background: CARD, borderRadius: 18, padding: '16px 16px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.025)',
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: INK, letterSpacing: -0.5 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 600, color: SUB, marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 13, color: SUB, marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// shared inline styles
const ghostBtn = (color) => ({
  border: 'none', background: 'transparent', color, fontSize: 15,
  cursor: 'pointer', padding: '4px 2px', fontFamily: 'inherit',
});
const fieldWrap = {
  background: CARD, borderRadius: 16, padding: '4px 4px', marginBottom: 12,
};
const inputStyle = {
  width: '100%', border: 'none', outline: 'none', background: 'transparent',
  padding: '14px 14px', fontSize: 16, color: INK, fontFamily: 'inherit',
  boxSizing: 'border-box',
};

Object.assign(window, { TodayScreen, AddSheet, DetailScreen });
