// worker.jsx — Rota worker mobile app: shell, bottom nav, Shifts (home), ShiftDetail
const { useState: wuS } = React;
const WK = window.RotaData;

// ── selectors ──────────────────────────────────────────────────
function jamieShifts(data){ return data.shifts.filter(s => s.workerId === 'jamie'); }
function sortKey(s){ return WK.parseKey(s.date).getTime() + WK.toMin(s.start); }
function upNext(data){
  const mine = jamieShifts(data);
  const active = mine.find(s => s.status === 'active');
  if (active) return active;
  const future = mine
    .filter(s => s.status === 'scheduled' && sortKey(s) >= WK.parseKey(WK.TODAY_KEY).getTime())
    .sort((a,b)=>sortKey(a)-sortKey(b));
  return future[0] || null;
}

// ── small pieces ───────────────────────────────────────────────
function StatusBadge({ s }){
  if (s.status==='active')    return <Badge tone="positive"><LiveDot/> On shift</Badge>;
  if (s.status==='completed') return s.approved ? <Badge tone="neutral"><Icon name="check" size={12}/> Approved</Badge> : <Badge tone="warning">Submitted</Badge>;
  if (s.status==='open')      return <Badge tone="accent">Open</Badge>;
  if (s.swap)                 return <Badge tone="warning">Swap requested</Badge>;
  if (s.drop)                 return <Badge tone="danger">Drop requested</Badge>;
  return null;
}

function ShiftRow({ s, onClick }){
  const co = WK.companyById(s.companyId);
  const hrs = WK.dur(s.start, s.end);
  return (
    <Card onClick={onClick} pad={0} hover style={{ overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'stretch' }}>
        {/* color spine */}
        <div style={{ width:4, background:co.color, flexShrink:0 }} />
        <div style={{ flex:1, padding:'13px 14px', display:'flex', alignItems:'center', gap:13, minWidth:0 }}>
          <div style={{ textAlign:'center', minWidth:46 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{s.start}</div>
            <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:600 }}>{s.end}</div>
          </div>
          <div style={{ width:1, alignSelf:'stretch', background:'var(--line)' }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15.5, fontWeight:700, color:'var(--ink)', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.role}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <CompanyChip company={co} />
              <span style={{ color:'var(--line-2)' }}>·</span>
              <span style={{ fontSize:12.5, color:'var(--ink-2)', fontWeight:600 }}>{hrs % 1 === 0 ? hrs : hrs.toFixed(1)}h</span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <StatusBadge s={s} />
            <span style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-2)' }}>£{WK.payOf(s).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── hero "up next" ─────────────────────────────────────────────
function UpNextHero({ s, onOpen, onClockIn, onClockOut, clock }){
  if (!s) return (
    <Card style={{ textAlign:'center', padding:'26px 18px' }}>
      <div style={{ color:'var(--ink-2)', fontSize:14.5, fontWeight:600 }}>No upcoming shifts.</div>
      <div style={{ color:'var(--ink-3)', fontSize:13, marginTop:4 }}>Pick one up from the open list.</div>
    </Card>
  );
  const co = WK.companyById(s.companyId);
  const active = s.status==='active';
  const isToday = s.date===WK.TODAY_KEY;
  const canClockIn = isToday && s.status==='scheduled';

  return (
    <div style={{
      borderRadius:22, padding:18, position:'relative', overflow:'hidden',
      background:'var(--surface)', border:'1px solid var(--line)',
      boxShadow:'var(--shadow)',
    }}>
      {/* tinted glow */}
      <div style={{ position:'absolute', top:-40, right:-30, width:160, height:160, borderRadius:'50%',
        background:active?'var(--positive-soft)':'var(--accent-soft)', filter:'blur(8px)', pointerEvents:'none' }} />
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <Eyebrow style={{ color: active?'var(--positive)':'var(--accent)' }}>
            {active ? 'On shift now' : isToday ? 'Up next · Today' : `Up next · ${WK.relDayLabel(s.date)}`}
          </Eyebrow>
          <span onClick={onOpen} style={{ cursor:'pointer', color:'var(--ink-3)', display:'flex' }}><Icon name="arrowR" size={18}/></span>
        </div>
        <div onClick={onOpen} style={{ cursor:'pointer' }}>
          <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)', letterSpacing:-0.5 }}>{s.role}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5, marginBottom:14 }}>
            <CompanyDot company={co} size={11} />
            <span style={{ fontSize:14.5, fontWeight:700, color:'var(--ink-2)' }}>{co.name}</span>
          </div>
          <div style={{ display:'flex', gap:22, marginBottom:16 }}>
            <HeroStat icon="clock" label={active?'Clocked in':'Starts'} value={active?s.clockIn:`${s.start}`} sub={active?`${elapsedStr(s.clockIn, clock)} elapsed`:`ends ${s.end}`} />
            <HeroStat icon="pound" label="Est. pay" value={`£${WK.payOf(s).toFixed(0)}`} sub={`${WK.dur(s.start,s.end)}h @ £${s.rate.toFixed(2)}`} />
          </div>
        </div>
        {canClockIn && <Btn variant="primary" full size="lg" onClick={onClockIn}><Icon name="play" size={17} fill/> Clock in</Btn>}
        {active && <Btn variant="positive" full size="lg" onClick={onClockOut}><Icon name="stop" size={16} fill/> Clock out</Btn>}
        {!canClockIn && !active && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px',
            borderRadius:12, background:'var(--surface-3)', color:'var(--ink-2)', fontWeight:700, fontSize:14 }}>
            <Icon name="calendar" size={16}/> {WK.relDayLabel(s.date)} · {s.start}–{s.end}
          </div>
        )}
      </div>
    </div>
  );
}
function HeroStat({ icon, label, value, sub }){
  return (
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--ink-3)', marginBottom:4 }}>
        <Icon name={icon} size={13}/><span style={{ fontSize:11.5, fontWeight:700, textTransform:'uppercase', letterSpacing:0.6 }}>{label}</span>
      </div>
      <div style={{ fontSize:19, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{value}</div>
      <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:600, marginTop:1 }}>{sub}</div>
    </div>
  );
}

// ── week strip ─────────────────────────────────────────────────
function WeekStrip({ data, selected, onSelect }){
  const mine = jamieShifts(data);
  return (
    <div style={{ display:'flex', gap:7 }}>
      {WK.DAYS.map((d,i)=>{
        const key = WK.dk(i);
        const dayShifts = mine.filter(s=>s.date===key);
        const isSel = key===selected;
        const isToday = key===WK.TODAY_KEY;
        const cos = [...new Set(dayShifts.map(s=>s.companyId))];
        return (
          <button key={d} onClick={()=>onSelect(key)} style={{
            flex:1, border:'none', cursor:'pointer', fontFamily:'inherit',
            borderRadius:13, padding:'9px 0 7px', background:isSel?'var(--accent)':'var(--surface)',
            boxShadow:isSel?'none':'inset 0 0 0 1px var(--line)',
            transition:'background .15s',
          }}>
            <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:0.5, color:isSel?'var(--accent-ink)':'var(--ink-3)', opacity:isSel?0.8:1 }}>{d[0]}</div>
            <div style={{ fontSize:16, fontWeight:800, color:isSel?'var(--accent-ink)':'var(--ink)', marginTop:2,
              ...(isToday&&!isSel?{textDecoration:'underline', textDecorationColor:'var(--accent)', textUnderlineOffset:3}:{}) }}>{WK.fmtDayNum(key)}</div>
            <div style={{ display:'flex', gap:2.5, justifyContent:'center', height:5, marginTop:4 }}>
              {cos.slice(0,3).map(cid=>(
                <span key={cid} style={{ width:4, height:4, borderRadius:'50%',
                  background:isSel?'var(--accent-ink)':WK.companyById(cid).color, opacity:isSel?0.85:1 }} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Shifts (home) screen ───────────────────────────────────────
function ShiftsScreen({ data, actions, onOpenShift, clock }){
  const [sel, setSel] = wuS(WK.TODAY_KEY);
  const next = upNext(data);
  const dayShifts = jamieShifts(data).filter(s=>s.date===sel).sort((a,b)=>WK.toMin(a.start)-WK.toMin(b.start));

  return (
    <div style={{ padding:'10px 18px 24px' }}>
      <UpNextHero s={next} clock={clock}
        onOpen={()=>next&&onOpenShift(next.id)}
        onClockIn={()=>next&&actions.clockIn(next.id)}
        onClockOut={()=>next&&actions.clockOut(next.id)} />

      <div style={{ height:20 }} />
      <Eyebrow style={{ marginBottom:10 }}>This week</Eyebrow>
      <WeekStrip data={data} selected={sel} onSelect={setSel} />

      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'20px 0 10px' }}>
        <div style={{ fontSize:17, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{WK.relDayLabel(sel)}</div>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--ink-3)' }}>{dayShifts.length} shift{dayShifts.length!==1?'s':''}</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {dayShifts.map(s=><ShiftRow key={s.id} s={s} onClick={()=>onOpenShift(s.id)} />)}
        {dayShifts.length===0 && (
          <Card style={{ textAlign:'center', padding:'30px 18px' }}>
            <div style={{ color:'var(--ink-2)', fontSize:14.5, fontWeight:600 }}>Nothing booked.</div>
            <div style={{ color:'var(--ink-3)', fontSize:13, marginTop:3 }}>Enjoy the day off — or pick up a shift.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

window.WorkerShifts = { ShiftsScreen, ShiftRow, StatusBadge, jamieShifts, upNext, sortKey };
