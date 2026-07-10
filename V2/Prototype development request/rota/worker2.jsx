// worker2.jsx — Pickup, Timesheet, Me, Availability, ShiftDetail + WorkerApp shell
const { useState: w2S } = React;
const WD = window.RotaData;
const WS = () => window.WorkerShifts;

// ════════════════ PICK UP (open shifts) ════════════════
function PickupScreen({ data, actions, onOpenShift }){
  const [filter, setFilter] = w2S('all');
  let open = data.shifts.filter(s=>s.status==='open').sort((a,b)=>WS().sortKey(a)-WS().sortKey(b));
  if (filter!=='all') open = open.filter(s=>s.companyId===filter);
  const cos = WD.COMPANIES;

  return (
    <div style={{ padding:'6px 18px 24px' }}>
      <div style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:14, margin:'0 -2px' }}>
        <FilterChip label="All" on={filter==='all'} onClick={()=>setFilter('all')} />
        {cos.map(c=><FilterChip key={c.id} label={c.short} dot={c.color} on={filter===c.id} onClick={()=>setFilter(c.id)} />)}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
        {open.map(s=>{
          const co = WD.companyById(s.companyId);
          return (
            <Card key={s.id} pad={15} hover>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <CompanyChip company={co} />
                <Badge tone="accent">£{s.rate.toFixed(2)}/hr</Badge>
              </div>
              <div style={{ fontSize:17, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{s.role}</div>
              <div style={{ display:'flex', alignItems:'center', gap:14, margin:'8px 0 14px', color:'var(--ink-2)' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13.5, fontWeight:600 }}><Icon name="calendar" size={15}/>{WD.relDayLabel(s.date)}</span>
                <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13.5, fontWeight:600 }}><Icon name="clock" size={15}/>{s.start}–{s.end}</span>
              </div>
              <div style={{ display:'flex', gap:9 }}>
                <Btn variant="soft" size="md" onClick={()=>onOpenShift(s.id)} style={{ flex:'0 0 auto' }}>Details</Btn>
                <Btn variant="primary" size="md" full onClick={()=>actions.acceptOpen(s.id)}>Pick up · £{WD.payOf(s).toFixed(0)}</Btn>
              </div>
            </Card>
          );
        })}
        {open.length===0 && <EmptyState title="No open shifts" sub="You're all caught up. Check back soon." />}
      </div>
    </div>
  );
}
function FilterChip({ label, dot, on, onClick }){
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
      padding:'7px 13px', borderRadius:999, border:'none', cursor:'pointer', fontFamily:'inherit',
      fontSize:13, fontWeight:700, background:on?'var(--accent)':'var(--surface)',
      color:on?'var(--accent-ink)':'var(--ink-2)', boxShadow:on?'none':'inset 0 0 0 1px var(--line)',
    }}>
      {dot && <span style={{ width:8, height:8, borderRadius:3, background:on?'var(--accent-ink)':dot }} />}
      {label}
    </button>
  );
}

// ════════════════ TIMESHEET ════════════════
function TimesheetScreen({ data, onOpenShift }){
  const mine = WS().jamieShifts(data).filter(s=>s.status==='completed').sort((a,b)=>WS().sortKey(b)-WS().sortKey(a));
  const now = WD.NOW;
  const inMonth = (s)=>{ const d=WD.parseKey(s.date); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); };
  const monthShifts = mine.filter(inMonth);
  const totalHours = monthShifts.reduce((a,s)=>a+WD.workedHours(s),0);
  const totalPay = monthShifts.reduce((a,s)=>a+WD.workedHours(s)*s.rate,0);
  const pending = mine.filter(s=>!s.approved).length;
  const jamie = WD.workerById('jamie');

  return (
    <div style={{ padding:'6px 18px 24px' }}>
      {/* earnings hero */}
      <div style={{ borderRadius:22, padding:18, background:'var(--accent)', color:'var(--accent-ink)', marginBottom:14, boxShadow:'var(--shadow)' }}>
        <div style={{ fontSize:11.5, fontWeight:800, letterSpacing:1, textTransform:'uppercase', opacity:0.8 }}>{now.toLocaleDateString('en-GB',{month:'long'})} earnings</div>
        <div style={{ fontSize:40, fontWeight:800, letterSpacing:-1, margin:'4px 0 2px' }}>£{totalPay.toFixed(2)}</div>
        <div style={{ display:'flex', gap:18, marginTop:12 }}>
          <MiniStat label="Hours" value={totalHours.toFixed(1)} on />
          <MiniStat label="Shifts" value={monthShifts.length} on />
          <MiniStat label="Pending" value={pending} on />
        </div>
      </div>
      {/* holiday accrual */}
      <Card pad={15} style={{ marginBottom:18, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:'var(--positive-soft)', color:'var(--positive)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="sun" size={22}/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)' }}>Holiday accrued</div>
          <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600, marginTop:1 }}>12.07% of hours worked · all employers</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:19, fontWeight:800, color:'var(--ink)' }}>{jamie.holiday}h</div>
          <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:600 }}>≈ {(jamie.holiday/8).toFixed(1)} days</div>
        </div>
      </Card>

      <Eyebrow style={{ marginBottom:10 }}>Recent timesheets</Eyebrow>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {mine.map(s=>{
          const co = WD.companyById(s.companyId);
          return (
            <Card key={s.id} pad={0} hover onClick={()=>onOpenShift(s.id)} style={{ overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ width:4, alignSelf:'stretch', background:co.color }} />
                <div style={{ flex:1, padding:'13px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:'var(--ink)' }}>{s.role}</span>
                    {s.approved ? <Badge tone="positive"><Icon name="check" size={12}/> Approved</Badge> : <Badge tone="warning">Pending</Badge>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'var(--ink-2)', fontWeight:600 }}>
                    <CompanyDot company={co} size={8}/>{co.short}
                    <span style={{ color:'var(--line-2)' }}>·</span>{WD.fmtUK(s.date)}
                    <span style={{ color:'var(--line-2)' }}>·</span>{WD.workedHours(s).toFixed(1)}h
                  </div>
                </div>
                <div style={{ padding:'0 16px', fontSize:16, fontWeight:800, color:'var(--ink)' }}>£{(WD.workedHours(s)*s.rate).toFixed(0)}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function MiniStat({ label, value, on }){
  return (
    <div>
      <div style={{ fontSize:20, fontWeight:800, letterSpacing:-0.3 }}>{value}</div>
      <div style={{ fontSize:11.5, fontWeight:700, opacity:on?0.8:1, color:on?'inherit':'var(--ink-3)', textTransform:'uppercase', letterSpacing:0.5, marginTop:1 }}>{label}</div>
    </div>
  );
}

// ════════════════ ME ════════════════
function MeScreen({ data, onAvailability }){
  const jamie = WD.workerById('jamie');
  const earned = WS().jamieShifts(data).filter(s=>s.status==='completed').reduce((a,s)=>a+WD.workedHours(s)*s.rate,0);
  return (
    <div style={{ padding:'6px 18px 24px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <Avatar worker={jamie} size={58} />
        <div>
          <div style={{ fontSize:21, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{jamie.name}</div>
          <div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600, display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
            <Icon name="briefcase" size={14}/> Multi-company worker · 3 employers
          </div>
        </div>
      </div>

      <Eyebrow style={{ marginBottom:10 }}>Your companies</Eyebrow>
      <Card pad={0} style={{ marginBottom:18, overflow:'hidden' }}>
        {WD.COMPANIES.map((c,i)=>{
          const role = WS().jamieShifts(data).find(s=>s.companyId===c.id);
          const rate = role ? role.rate : c.id==='oak'?jamie.rate:12.5;
          return (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px', borderTop:i?'1px solid var(--line)':'none' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:c.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15 }}>{c.short[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600 }}>{c.kind}</div>
              </div>
              <span style={{ fontSize:13.5, fontWeight:800, color:'var(--ink-2)' }}>£{rate.toFixed(2)}/hr</span>
            </div>
          );
        })}
      </Card>

      <Eyebrow style={{ marginBottom:10 }}>Manage</Eyebrow>
      <Card pad={0} style={{ overflow:'hidden' }}>
        <MeRow icon="clock" label="My availability" detail="Set weekly" onClick={onAvailability} first />
        <MeRow icon="pound" label="Earnings to date" detail={`£${earned.toFixed(0)}`} />
        <MeRow icon="bell" label="Notifications" detail="On" />
        <MeRow icon="settings" label="Account & pay details" last />
      </Card>
      <div style={{ textAlign:'center', marginTop:18 }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:7, color:'var(--danger)', fontWeight:700, fontSize:14, cursor:'pointer' }}><Icon name="logout" size={16}/> Sign out</span>
      </div>
    </div>
  );
}
function MeRow({ icon, label, detail, onClick, last, first }){
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 15px', borderTop:first?'none':'1px solid var(--line)', cursor:onClick?'pointer':'default' }}>
      <div style={{ width:32, height:32, borderRadius:9, background:'var(--surface-3)', color:'var(--ink-2)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={icon} size={17}/></div>
      <span style={{ flex:1, fontSize:14.5, fontWeight:700, color:'var(--ink)' }}>{label}</span>
      {detail && <span style={{ fontSize:13.5, fontWeight:600, color:'var(--ink-3)' }}>{detail}</span>}
      {onClick && <Icon name="chevR" size={16} style={{ color:'var(--ink-3)' }} />}
    </div>
  );
}
// first row has no top border
function EmptyState({ title, sub }){
  return (
    <Card style={{ textAlign:'center', padding:'34px 18px' }}>
      <div style={{ color:'var(--ink-2)', fontSize:15, fontWeight:700 }}>{title}</div>
      <div style={{ color:'var(--ink-3)', fontSize:13, marginTop:4 }}>{sub}</div>
    </Card>
  );
}

window.WorkerScreens = { PickupScreen, TimesheetScreen, MeScreen, EmptyState };
