// company2.jsx — modal primitives + Live / Open / Approve / Messages views
const { useState: co2S, useRef: co2R, useEffect: co2E } = React;
const CO = window.RotaData;
const PH = window.CompanyShared.PageHeader;

// ── modal + form primitives (used across the dashboard) ──
function ModalShell({ title, onClose, children, width=440 }){
  return (
    <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:90, background:'rgba(8,10,14,0.5)', backdropFilter:'blur(2px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width, maxWidth:'100%', maxHeight:'90%', overflowY:'auto', background:'var(--surface)', borderRadius:20, border:'1px solid var(--line)', boxShadow:'var(--shadow-lg)', padding:22 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ fontSize:18, fontWeight:800, color:'var(--ink)', letterSpacing:-0.3 }}>{title}</div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:9, border:'none', background:'var(--surface-3)', color:'var(--ink-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="x" size={17}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children, style={} }){
  return (
    <div style={{ marginBottom:14, ...style }}>
      <div style={{ fontSize:12, fontWeight:800, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:7 }}>{label}</div>
      {children}
    </div>
  );
}
function Select({ value, onChange, options }){
  return (
    <div style={{ position:'relative' }}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        width:'100%', appearance:'none', border:'1px solid var(--line-2)', background:'var(--surface-2)',
        color:'var(--ink)', borderRadius:11, padding:'11px 36px 11px 13px', fontSize:14, fontWeight:600,
        fontFamily:'inherit', cursor:'pointer' }}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevD" size={16} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)', pointerEvents:'none' }}/>
    </div>
  );
}

// ════════════════ ON NOW (live) ════════════════
function LiveView({ data }){
  const clock = useRotaClock();
  const oak = data.shifts.filter(s=>s.companyId==='oak'&&s.date===CO.TODAY_KEY);
  const active = oak.filter(s=>s.status==='active');
  const scheduled = oak.filter(s=>s.status==='scheduled');
  const done = oak.filter(s=>s.status==='completed');
  const hoursToday = oak.reduce((a,s)=>a+CO.dur(s.start,s.end),0);
  const nowMin = clock.getHours()*60+clock.getMinutes();

  return (
    <>
      <PH title="On shift now" sub={`${CO.NOW.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})} · live`}
        right={<span style={{ display:'flex', alignItems:'center', gap:8, fontSize:13.5, fontWeight:700, color:'var(--ink-2)' }}><LiveDot/> {fmtHM(clock)}</span>} />
      <div style={{ flex:1, overflow:'auto', padding:'20px 26px 28px' }}>
        {/* stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          <BigStat value={active.length} label="On shift" tone="positive" />
          <BigStat value={scheduled.length} label="Yet to start" />
          <BigStat value={done.length} label="Finished" />
          <BigStat value={`${hoursToday.toFixed(0)}h`} label="Rostered today" />
        </div>

        <Eyebrow style={{ marginBottom:12 }}>Currently clocked in</Eyebrow>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
          {active.map(s=>{
            const w = CO.workerById(s.workerId);
            return (
              <Card key={s.id} pad={15} style={{ display:'flex', alignItems:'center', gap:13 }}>
                <div style={{ position:'relative' }}>
                  <Avatar worker={w} size={46} />
                  <span style={{ position:'absolute', bottom:-1, right:-1, width:14, height:14, borderRadius:'50%', background:'var(--positive)', border:'2.5px solid var(--surface)' }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15.5, fontWeight:800, color:'var(--ink)' }}>{w.name}</div>
                  <div style={{ fontSize:13, color:'var(--ink-2)', fontWeight:600 }}>{s.role} · {s.start}–{s.end}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'var(--positive)', whiteSpace:'nowrap' }}>{elapsedStr(s.clockIn, clock)}</div>
                  <div style={{ fontSize:11.5, color:'var(--ink-3)', fontWeight:600 }}>in at {s.clockIn}</div>
                </div>
              </Card>
            );
          })}
          {active.length===0 && <div style={{ gridColumn:'1/-1', color:'var(--ink-3)', fontSize:14, fontWeight:600, padding:'10px 2px' }}>Nobody clocked in right now.</div>}
        </div>

        <Eyebrow style={{ marginBottom:12 }}>Starting later today</Eyebrow>
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {scheduled.sort((a,b)=>CO.toMin(a.start)-CO.toMin(b.start)).map(s=>{
            const w = CO.workerById(s.workerId);
            const late = nowMin > CO.toMin(s.start)+5;
            return (
              <Card key={s.id} pad={12} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <Avatar worker={w} size={36} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)' }}>{w.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600 }}>{s.role}</div>
                </div>
                {late ? <Badge tone="warning"><Icon name="alert" size={12}/> Not clocked in</Badge>
                      : <Badge tone="neutral">Starts {s.start}</Badge>}
              </Card>
            );
          })}
          {scheduled.length===0 && <div style={{ color:'var(--ink-3)', fontSize:14, fontWeight:600 }}>No more shifts scheduled today.</div>}
        </div>
      </div>
    </>
  );
}
function BigStat({ value, label, tone }){
  const c = tone==='positive'?'var(--positive)':'var(--ink)';
  return (
    <Card pad={16}>
      <div style={{ fontSize:32, fontWeight:800, color:c, letterSpacing:-1 }}>{value}</div>
      <div style={{ fontSize:12.5, fontWeight:700, color:'var(--ink-3)', marginTop:2 }}>{label}</div>
    </Card>
  );
}

// ════════════════ OPEN SHIFTS ════════════════
function OpenView({ data, actions }){
  const [post, setPost] = co2S(false);
  const open = data.shifts.filter(s=>s.companyId==='oak'&&s.status==='open').sort((a,b)=>window.WorkerShifts.sortKey(a)-window.WorkerShifts.sortKey(b));
  const filled = data.shifts.filter(s=>s.companyId==='oak'&&s.workerId==='jamie'&&(s.id==='open-oak-1'||s.id==='open-oak-2'));

  return (
    <>
      <PH title="Open shifts" sub="Posted to your team & connected workers"
        right={<Btn variant="primary" size="md" onClick={()=>setPost(true)}><Icon name="plus" size={16}/> Post open shift</Btn>} />
      <div style={{ flex:1, overflow:'auto', padding:'20px 26px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, maxWidth:760 }}>
          {open.map(s=>(
            <Card key={s.id} pad={16}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:'var(--ink)' }}>{s.role}</div>
                  <div style={{ fontSize:13, color:'var(--ink-3)', fontWeight:600, marginTop:2 }}>{CO.relDayLabel(s.date)} · {s.start}–{s.end}</div>
                </div>
                <Badge tone="accent">£{s.rate.toFixed(2)}/hr</Badge>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid var(--line)' }}>
                <span style={{ fontSize:12.5, color:'var(--ink-2)', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}><Icon name="users" size={15}/> Visible to {CO.WORKERS.length} staff</span>
                <button onClick={()=>actions.removeShift(s.id)} style={{ border:'none', background:'transparent', color:'var(--ink-3)', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><Icon name="x" size={14}/> Unpost</button>
              </div>
            </Card>
          ))}
        </div>
        {open.length===0 && <EmptyCard title="No open shifts posted" sub="Post one and it appears instantly in connected workers' apps." />}
      </div>
      {post && <PostOpenModal actions={actions} onClose={()=>setPost(false)} />}
    </>
  );
}
function EmptyCard({ title, sub }){
  return (
    <div style={{ textAlign:'center', padding:'50px 20px', maxWidth:420, margin:'20px auto', border:'1.5px dashed var(--line-2)', borderRadius:18 }}>
      <div style={{ fontSize:16, fontWeight:800, color:'var(--ink-2)' }}>{title}</div>
      <div style={{ fontSize:13.5, color:'var(--ink-3)', marginTop:5, fontWeight:600 }}>{sub}</div>
    </div>
  );
}
const PHOURS = [];
for (let h=6; h<=23; h++){ PHOURS.push(`${String(h).padStart(2,'0')}:00`); PHOURS.push(`${String(h).padStart(2,'0')}:30`); }
function PostOpenModal({ actions, onClose }){
  const [date, setDate] = co2S(CO.dk(5));
  const [role, setRole] = co2S('Floor');
  const [start, setStart] = co2S('18:00');
  const [end, setEnd] = co2S('23:00');
  const [rate, setRate] = co2S('12.60');
  return (
    <ModalShell title="Post an open shift" onClose={onClose}>
      <Field label="Day"><Select value={date} onChange={setDate} options={CO.DAYS.map((d,i)=>({value:CO.dk(i),label:`${d} ${CO.fmtDayNum(CO.dk(i))}`}))} /></Field>
      <Field label="Role">
        <div style={{ display:'flex', gap:7 }}>
          {['Bar','Floor','Kitchen','Host'].map(r=>(
            <button key={r} onClick={()=>setRole(r)} style={{ flex:1, padding:'9px 0', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, background:role===r?'var(--accent)':'var(--surface-3)', color:role===r?'var(--accent-ink)':'var(--ink-2)' }}>{r}</button>
          ))}
        </div>
      </Field>
      <div style={{ display:'flex', gap:12 }}>
        <Field label="Start" style={{ flex:1 }}><Select value={start} onChange={setStart} options={PHOURS.map(h=>({value:h,label:h}))} /></Field>
        <Field label="End" style={{ flex:1 }}><Select value={end} onChange={setEnd} options={PHOURS.map(h=>({value:h,label:h}))} /></Field>
        <Field label="Rate £/hr" style={{ width:96 }}>
          <input value={rate} onChange={e=>setRate(e.target.value)} style={{ width:'100%', boxSizing:'border-box', border:'1px solid var(--line-2)', background:'var(--surface-2)', color:'var(--ink)', borderRadius:11, padding:'11px 12px', fontSize:14, fontWeight:600, fontFamily:'inherit' }} />
        </Field>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <Btn variant="ghost" full onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" full onClick={()=>{ actions.postOpenShift({date,role,start,end,rate:parseFloat(rate)||12.6}); onClose(); }}>Post shift</Btn>
      </div>
    </ModalShell>
  );
}

// ════════════════ TIMESHEETS / APPROVALS ════════════════
function ApproveView({ data, actions }){
  const all = data.shifts.filter(s=>s.companyId==='oak'&&s.status==='completed');
  const pending = all.filter(s=>!s.approved).sort((a,b)=>window.WorkerShifts.sortKey(b)-window.WorkerShifts.sortKey(a));
  const approved = all.filter(s=>s.approved);
  const totalDue = pending.reduce((a,s)=>a+CO.workedHours(s)*s.rate,0);

  return (
    <>
      <PH title="Timesheets" sub={`${pending.length} awaiting approval · £${totalDue.toFixed(2)} to sign off`}
        right={pending.length>0 && <Btn variant="positive" size="md" onClick={()=>pending.forEach(s=>actions.approveTimesheet(s.id))}><Icon name="check" size={16}/> Approve all</Btn>} />
      <div style={{ flex:1, overflow:'auto', padding:'20px 26px 28px' }}>
        <Eyebrow style={{ marginBottom:12 }}>Awaiting approval</Eyebrow>
        <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:26 }}>
          {pending.map(s=>{
            const w = CO.workerById(s.workerId);
            const sched = CO.dur(s.start,s.end), actual = CO.workedHours(s);
            const over = actual - (sched - (s.breakMins||0)/60);
            return (
              <Card key={s.id} pad={15}>
                <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                  <Avatar worker={w} size={42} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:'var(--ink)' }}>{w.name}</div>
                    <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600 }}>{s.role} · {CO.fmtUK(s.date)}</div>
                  </div>
                  <div style={{ display:'flex', gap:22, marginRight:8 }}>
                    <TS label="Rostered" value={`${s.start}–${s.end}`} />
                    <TS label="Clocked" value={`${s.clockIn}–${s.clockOut}`} flag={Math.abs(over)>0.12} />
                    <TS label="Pay" value={`£${(actual*s.rate).toFixed(2)}`} />
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <Btn variant="soft" size="sm" onClick={()=>actions.approveTimesheet(s.id)}>Query</Btn>
                    <Btn variant="positive" size="sm" onClick={()=>actions.approveTimesheet(s.id)}><Icon name="check" size={15}/> Approve</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
          {pending.length===0 && <EmptyCard title="All caught up" sub="No timesheets waiting for approval." />}
        </div>

        {approved.length>0 && <>
          <Eyebrow style={{ marginBottom:12 }}>Recently approved</Eyebrow>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {approved.map(s=>{
              const w = CO.workerById(s.workerId);
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 15px', borderRadius:13, background:'var(--surface)', border:'1px solid var(--line)' }}>
                  <Avatar worker={w} size={32} />
                  <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--ink)' }}>{w.name} <span style={{ color:'var(--ink-3)', fontWeight:600 }}>· {s.role} · {CO.fmtUK(s.date)}</span></span>
                  <span style={{ fontSize:14, fontWeight:800, color:'var(--ink-2)' }}>£{(CO.workedHours(s)*s.rate).toFixed(2)}</span>
                  <Badge tone="positive"><Icon name="check" size={12}/> Approved</Badge>
                </div>
              );
            })}
          </div>
        </>}
      </div>
    </>
  );
}
function TS({ label, value, flag }){
  return (
    <div style={{ textAlign:'center', minWidth:78 }}>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:0.4 }}>{label}</div>
      <div style={{ fontSize:13.5, fontWeight:800, color:flag?'var(--warning)':'var(--ink)', marginTop:2 }}>{value}</div>
    </div>
  );
}

// ════════════════ MESSAGES ════════════════
function MessagesView({ data, actions }){
  const [active, setActive] = co2S(data.messages[0]?.id);
  const [draft, setDraft] = co2S('');
  const thread = data.messages.find(m=>m.id===active);
  const scrollRef = co2R(null);
  co2E(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [thread, thread&&thread.msgs.length]);

  const send = ()=>{ if(!draft.trim()) return; actions.sendMessage(active, draft.trim()); setDraft(''); };

  return (
    <>
      <PH title="Messages" sub="Your team" />
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* thread list */}
        <div style={{ width:264, flexShrink:0, borderRight:'1px solid var(--line)', overflowY:'auto' }}>
          {data.messages.map(m=>{
            const w = CO.workerById(m.workerId);
            const last = m.msgs[m.msgs.length-1];
            const on = m.id===active;
            return (
              <button key={m.id} onClick={()=>{setActive(m.id); actions.readThread(m.id);}} style={{
                width:'100%', display:'flex', alignItems:'center', gap:11, padding:'13px 16px', border:'none', cursor:'pointer',
                fontFamily:'inherit', textAlign:'left', background:on?'var(--accent-soft)':'transparent', borderBottom:'1px solid var(--line)' }}>
                <Avatar worker={w} size={38} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:14, fontWeight:800, color:'var(--ink)' }}>{w.name}</span>
                    {m.unread && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)' }} />}
                  </div>
                  <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:m.unread?700:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:1 }}>{last.from==='manager'?'You: ':''}{last.text}</div>
                </div>
              </button>
            );
          })}
        </div>
        {/* conversation */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {thread && <>
            <div style={{ flexShrink:0, padding:'13px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:11 }}>
              <Avatar worker={CO.workerById(thread.workerId)} size={36} />
              <div>
                <div style={{ fontSize:14.5, fontWeight:800, color:'var(--ink)' }}>{CO.workerById(thread.workerId).name}</div>
                <div style={{ fontSize:12, color:'var(--positive)', fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><span style={{width:7,height:7,borderRadius:'50%',background:'var(--positive)'}}/> Active</div>
              </div>
            </div>
            <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:10 }}>
              {thread.msgs.map((msg,i)=>{
                const mine = msg.from==='manager';
                return (
                  <div key={i} style={{ alignSelf:mine?'flex-end':'flex-start', maxWidth:'72%' }}>
                    <div style={{ padding:'10px 14px', borderRadius:16, fontSize:14, fontWeight:500, lineHeight:1.4,
                      background:mine?'var(--accent)':'var(--surface)', color:mine?'var(--accent-ink)':'var(--ink)',
                      border:mine?'none':'1px solid var(--line)',
                      borderBottomRightRadius:mine?5:16, borderBottomLeftRadius:mine?16:5 }}>{msg.text}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)', fontWeight:600, marginTop:3, textAlign:mine?'right':'left' }}>{msg.t}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ flexShrink:0, padding:'14px 20px', borderTop:'1px solid var(--line)', display:'flex', gap:10, alignItems:'center' }}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message…" style={{
                flex:1, border:'1px solid var(--line-2)', background:'var(--surface-2)', color:'var(--ink)', borderRadius:12, padding:'11px 14px', fontSize:14, fontFamily:'inherit', outline:'none' }} />
              <Btn variant="primary" onClick={send} style={{ padding:'11px 14px' }}><Icon name="send" size={17}/></Btn>
            </div>
          </>}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ModalShell, Field, Select });
window.CompanyScreens = { LiveView, OpenView, ApproveView, MessagesView };
