// worker3.jsx — ShiftDetail + Availability overlays, WorkerApp shell + bottom nav
const { useState: w3S } = React;
const W3 = window.RotaData;

// slide-up overlay wrapper (covers the device content area)
function Sheet({ open, onClose, children }){
  return (
    <div style={{
      position:'absolute', inset:0, zIndex:80, background:'var(--bg)',
      transform: open?'translateY(0)':'translateY(100%)',
      transition:'transform .34s cubic-bezier(.32,.72,0,1)',
      display:'flex', flexDirection:'column', pointerEvents:open?'auto':'none',
    }}>{children}</div>
  );
}
function SheetHeader({ title, onClose, right }){
  return (
    <div style={{ paddingTop:56, padding:'56px 16px 12px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
      <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', border:'none', background:'var(--surface-3)', color:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Icon name="chevD" size={20}/></button>
      <div style={{ flex:1, fontSize:17, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{title}</div>
      {right}
    </div>
  );
}

// ════════════════ SHIFT DETAIL ════════════════
function ShiftDetail({ shift, data, actions, clock, onClose }){
  if (!shift) return <Sheet open={false} onClose={onClose}><div/></Sheet>;
  const s = data.shifts.find(x=>x.id===shift) || shift;
  const co = W3.companyById(s.companyId);
  const active = s.status==='active';
  const completed = s.status==='completed';
  const open = s.status==='open';
  const isToday = s.date===W3.TODAY_KEY;
  const canClockIn = isToday && s.status==='scheduled';
  const future = s.status==='scheduled' && !isToday;

  return (
    <Sheet open={!!shift} onClose={onClose}>
      <SheetHeader title="Shift details" onClose={onClose} />
      <div style={{ flex:1, overflowY:'auto', padding:'4px 18px 30px' }}>
        {/* company banner */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:co.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:19 }}>{co.short[0]}</div>
          <div>
            <div style={{ fontSize:13, color:'var(--ink-3)', fontWeight:700 }}>{co.name}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)', letterSpacing:-0.4 }}>{s.role}</div>
          </div>
        </div>

        {active && (
          <div style={{ borderRadius:16, padding:'14px 16px', background:'var(--positive-soft)', display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <LiveDot/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--positive)' }}>On shift · clocked in {s.clockIn}</div>
              <div style={{ fontSize:12.5, color:'var(--ink-2)', fontWeight:600 }}>{elapsedStr(s.clockIn, clock)} elapsed</div>
            </div>
          </div>
        )}

        {/* facts grid */}
        <Card pad={0} style={{ overflow:'hidden', marginBottom:14 }}>
          <Fact icon="calendar" label="Date" value={W3.fmtLong(s.date)} />
          <Fact icon="clock" label="Time" value={`${s.start} – ${s.end}`} sub={`${W3.dur(s.start,s.end)}h${s.breakMins?` · ${s.breakMins}m break`:''}`} />
          <Fact icon="pound" label={completed?'Earned':'Estimated pay'} value={`£${(completed?W3.workedHours(s)*s.rate:W3.payOf(s)).toFixed(2)}`} sub={`£${s.rate.toFixed(2)}/hr`} />
          {completed && <Fact icon="checkCircle" label="Clocked" value={`${s.clockIn} – ${s.clockOut}`} sub={`${W3.workedHours(s).toFixed(2)}h worked`} last />}
          {!completed && <Fact icon="pin" label="Location" value={`${co.short} — main site`} last />}
        </Card>

        {completed && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:13, background:s.approved?'var(--positive-soft)':'var(--warning-soft)', marginBottom:14 }}>
            <Icon name={s.approved?'checkCircle':'clock'} size={18} style={{ color:s.approved?'var(--positive)':'var(--warning)' }}/>
            <span style={{ fontSize:13.5, fontWeight:700, color:s.approved?'var(--positive)':'var(--warning)' }}>{s.approved?'Approved by manager':'Submitted — awaiting approval'}</span>
          </div>
        )}

        {/* actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:4 }}>
          {canClockIn && <Btn variant="primary" full size="lg" onClick={()=>{actions.clockIn(s.id);}}><Icon name="play" size={16} fill/> Clock in now</Btn>}
          {active && <Btn variant="positive" full size="lg" onClick={()=>{actions.clockOut(s.id); onClose();}}><Icon name="stop" size={15} fill/> Clock out</Btn>}
          {open && <Btn variant="primary" full size="lg" onClick={()=>{actions.acceptOpen(s.id); onClose();}}><Icon name="plus" size={17}/> Pick up this shift</Btn>}
          {future && !s.swap && !s.drop && (
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="soft" full size="lg" onClick={()=>actions.requestSwap(s.id)}><Icon name="swap2" size={16}/> Request swap</Btn>
              <Btn variant="danger" full size="lg" onClick={()=>actions.dropShift(s.id)}><Icon name="x" size={16}/> Drop shift</Btn>
            </div>
          )}
          {s.swap && <div style={{ textAlign:'center', padding:'12px', borderRadius:12, background:'var(--warning-soft)', color:'var(--warning)', fontWeight:700, fontSize:14 }}>Swap requested — manager notified</div>}
          {s.drop && <div style={{ textAlign:'center', padding:'12px', borderRadius:12, background:'var(--danger-soft)', color:'var(--danger)', fontWeight:700, fontSize:14 }}>Drop requested — pending cover</div>}
        </div>
      </div>
    </Sheet>
  );
}
function Fact({ icon, label, value, sub, last }){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px', borderBottom:last?'none':'1px solid var(--line)' }}>
      <Icon name={icon} size={18} style={{ color:'var(--ink-3)' }}/>
      <span style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-3)', width:74 }}>{label}</span>
      <div style={{ flex:1, textAlign:'right' }}>
        <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)' }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:600, marginTop:1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ════════════════ AVAILABILITY ════════════════
const PERIODS = [['morning','Morning','sun'],['afternoon','Afternoon','coffee'],['evening','Evening','moon'],['night','Night','clock']];
function AvailabilitySheet({ open, data, actions, onClose }){
  const av = data.availability;
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetHeader title="My availability" onClose={onClose} />
      <div style={{ flex:1, overflowY:'auto', padding:'4px 18px 30px' }}>
        <p style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600, margin:'0 0 18px', lineHeight:1.5 }}>
          Tap to mark when you can work. Managers across all your companies see this when filling shifts.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {W3.DAYS.map(d=>(
            <div key={d}>
              <div style={{ fontSize:13, fontWeight:800, color:'var(--ink-2)', marginBottom:7, letterSpacing:0.3 }}>{d}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {PERIODS.map(([k,lbl,ic])=>{
                  const on = av[d] && av[d][k];
                  return (
                    <button key={k} onClick={()=>actions.toggleAvailability(d,k)} style={{
                      border:'none', cursor:'pointer', fontFamily:'inherit', borderRadius:13, padding:'11px 4px',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                      background:on?'var(--accent)':'var(--surface)', color:on?'var(--accent-ink)':'var(--ink-3)',
                      boxShadow:on?'none':'inset 0 0 0 1px var(--line)', transition:'background .15s',
                    }}>
                      <Icon name={ic} size={17}/>
                      <span style={{ fontSize:10.5, fontWeight:800 }}>{lbl}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'12px 18px 30px', flexShrink:0 }}>
        <Btn variant="primary" full size="lg" onClick={onClose}>Save availability</Btn>
      </div>
    </Sheet>
  );
}

// ════════════════ APP SHELL ════════════════
const WTABS = [
  { id:'shifts', label:'Shifts', icon:'calendar' },
  { id:'pickup', label:'Pick up', icon:'plus' },
  { id:'time',   label:'Timesheet', icon:'pound' },
  { id:'me',     label:'Account', icon:'user' },
];
function WorkerApp({ data, actions, dark }){
  const [tab, setTab] = w3S('shifts');
  const [detail, setDetail] = w3S(null);
  const [avail, setAvail] = w3S(false);
  const clock = useRotaClock();
  const WSc = window.WorkerScreens;
  const openCount = data.shifts.filter(s=>s.status==='open').length;

  const titles = { shifts:'Your shifts', pickup:'Open shifts', time:'Timesheet', me:'Account' };

  return (
    <div style={{ position:'relative', height:'100%', background:'var(--bg)' }}>
      {/* header */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:30, paddingTop:54, background:'var(--bg)' }}>
        <div style={{ padding:'2px 18px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--ink-3)' }}>{tab==='shifts'?`${W3.NOW.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}`:'Rota'}</div>
            <div style={{ fontSize:24, fontWeight:800, color:'var(--ink)', letterSpacing:-0.6, marginTop:1 }}>{titles[tab]}</div>
          </div>
          <button onClick={()=>setTab('me')} style={{ border:'none', background:'transparent', cursor:'pointer', padding:0 }}>
            <Avatar worker={W3.workerById('jamie')} size={40} />
          </button>
        </div>
      </div>

      {/* scrollable content */}
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, overflowY:'auto', paddingTop:104, paddingBottom:86 }}>
        {tab==='shifts' && <window.WorkerShifts.ShiftsScreen data={data} actions={actions} clock={clock} onOpenShift={setDetail} />}
        {tab==='pickup' && <WSc.PickupScreen data={data} actions={actions} onOpenShift={setDetail} />}
        {tab==='time'   && <WSc.TimesheetScreen data={data} onOpenShift={setDetail} />}
        {tab==='me'     && <WSc.MeScreen data={data} onAvailability={()=>setAvail(true)} />}
      </div>

      {/* bottom nav */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:30, paddingBottom:26, paddingTop:8,
        background:'var(--bg)', borderTop:'1px solid var(--line)', display:'flex' }}>
        {WTABS.map(t=>{
          const on = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
              display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:on?'var(--accent)':'var(--ink-3)',
            }}>
              <div style={{ position:'relative' }}>
                <Icon name={t.icon} size={23} fill={on && (t.icon==='user')} stroke={on?2.2:1.9}/>
                {t.id==='pickup' && openCount>0 && (
                  <span style={{ position:'absolute', top:-5, right:-9, minWidth:16, height:16, padding:'0 4px', borderRadius:8, background:'var(--accent)', color:'var(--accent-ink)', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{openCount}</span>
                )}
              </div>
              <span style={{ fontSize:10.5, fontWeight:700 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <ShiftDetail shift={detail} data={data} actions={actions} clock={clock} onClose={()=>setDetail(null)} />
      <AvailabilitySheet open={avail} data={data} actions={actions} onClose={()=>setAvail(false)} />
    </div>
  );
}
window.WorkerApp = WorkerApp;
