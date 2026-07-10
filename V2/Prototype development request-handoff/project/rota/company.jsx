// company.jsx — Rota company dashboard: shell, sidebar, weekly rota grid, add-shift modal
const { useState: cuS } = React;
const CD = window.RotaData;
const MANAGER = { name:'Sam Carter', role:'Duty Manager', initials:'SC', color:'#3B4252' };
const ROLES = ['Bar','Floor','Kitchen','Host'];

// ════════════════ SHELL ════════════════
const CTABS = [
  { id:'rota',     label:'Rota',        icon:'grid' },
  { id:'live',     label:'On now',      icon:'pin' },
  { id:'open',     label:'Open shifts', icon:'briefcase' },
  { id:'approve',  label:'Timesheets',  icon:'checkCircle' },
  { id:'messages', label:'Messages',    icon:'chat' },
];
function CompanyApp({ data, actions }){
  const [tab, setTab] = cuS('rota');
  const oak = CD.companyById('oak');
  const openCount = data.shifts.filter(s=>s.companyId==='oak'&&s.status==='open').length;
  const pendingCount = data.shifts.filter(s=>s.companyId==='oak'&&s.status==='completed'&&!s.approved).length;
  const unread = data.messages.filter(m=>m.unread).length;
  const counts = { open:openCount, approve:pendingCount, messages:unread };
  const C2 = window.CompanyScreens;

  return (
    <div style={{ display:'flex', height:'100%', background:'var(--bg)', color:'var(--ink)', fontFamily:'inherit' }}>
      {/* sidebar */}
      <div style={{ width:218, flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', padding:'18px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'2px 8px 18px' }}>
          <Wordmark size={20} />
        </div>
        {/* company switcher */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:12, background:'var(--surface-3)', marginBottom:16, cursor:'pointer' }}>
          <div style={{ width:30, height:30, borderRadius:8, background:oak.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15 }}>O</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13.5, fontWeight:800, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{oak.short}</div>
            <div style={{ fontSize:11, color:'var(--ink-3)', fontWeight:600 }}>Hospitality</div>
          </div>
          <Icon name="chevD" size={15} style={{ color:'var(--ink-3)' }}/>
        </div>
        {/* nav */}
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {CTABS.map(t=>{
            const on = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:11, padding:'10px 11px', borderRadius:11,
                border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                background:on?'var(--accent-soft)':'transparent', color:on?'var(--accent)':'var(--ink-2)',
                fontSize:14, fontWeight:700, transition:'background .12s',
              }}>
                <Icon name={t.icon} size={19} stroke={on?2.1:1.8}/>
                <span style={{ flex:1 }}>{t.label}</span>
                {counts[t.id]>0 && <span style={{ minWidth:19, height:19, padding:'0 5px', borderRadius:10, background:on?'var(--accent)':'var(--surface-3)', color:on?'var(--accent-ink)':'var(--ink-2)', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{counts[t.id]}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ flex:1 }} />
        {/* manager */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:12, border:'1px solid var(--line)' }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:MANAGER.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>{MANAGER.initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>{MANAGER.name}</div>
            <div style={{ fontSize:11, color:'var(--ink-3)', fontWeight:600 }}>{MANAGER.role}</div>
          </div>
        </div>
      </div>

      {/* main */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {tab==='rota'     && <RotaView data={data} actions={actions} />}
        {tab==='live'     && <C2.LiveView data={data} />}
        {tab==='open'     && <C2.OpenView data={data} actions={actions} />}
        {tab==='approve'  && <C2.ApproveView data={data} actions={actions} />}
        {tab==='messages' && <C2.MessagesView data={data} actions={actions} />}
      </div>
    </div>
  );
}

function Wordmark({ size=22, light }){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:size*1.1, height:size*1.1, borderRadius:size*0.32, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon name="calendar" size={size*0.62} style={{ color:'var(--accent-ink)' }} stroke={2.2}/>
      </div>
      <span style={{ fontSize:size, fontWeight:800, letterSpacing:-0.5, color:light?'#fff':'var(--ink)' }}>rota</span>
    </div>
  );
}

// page header used by all views
function PageHeader({ title, sub, right }){
  return (
    <div style={{ flexShrink:0, padding:'20px 26px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div>
        <div style={{ fontSize:21, fontWeight:800, color:'var(--ink)', letterSpacing:-0.4, whiteSpace:'nowrap' }}>{title}</div>
        {sub && <div style={{ fontSize:13.5, color:'var(--ink-3)', fontWeight:600, marginTop:2 }}>{sub}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>{right}</div>
    </div>
  );
}

// ════════════════ ROTA GRID ════════════════
function RotaView({ data, actions }){
  const [add, setAdd] = cuS(null);       // {date, workerId} or null
  const [published, setPublished] = cuS(false);
  const oakShifts = data.shifts.filter(s=>s.companyId==='oak');
  const roster = CD.WORKERS;
  const weekHours = oakShifts.filter(s=>s.status!=='open').reduce((a,s)=>a+CD.dur(s.start,s.end),0);
  const weekCost = oakShifts.filter(s=>s.status!=='open').reduce((a,s)=>a+CD.payOf(s),0);

  const openByDay = (i)=>oakShifts.filter(s=>s.status==='open'&&s.date===CD.dk(i));
  const cellShifts = (wid,i)=>oakShifts.filter(s=>s.workerId===wid&&s.date===CD.dk(i));

  return (
    <>
      <PageHeader title="Weekly rota" sub={`Week of ${CD.fmtUK(CD.dk(0))} · ${weekHours.toFixed(0)} hrs · £${weekCost.toFixed(0)} labour`}
        right={<>
          <Btn variant="ghost" size="md" onClick={()=>setAdd({date:CD.TODAY_KEY, workerId:roster[0].id})}><Icon name="plus" size={16}/> Add shift</Btn>
          <Btn variant={published?'positive':'primary'} size="md" onClick={()=>setPublished(true)}>
            {published ? <><Icon name="check" size={16}/> Published</> : <>Publish rota</>}
          </Btn>
        </>} />
      {published && (
        <div style={{ flexShrink:0, padding:'9px 26px', background:'var(--positive-soft)', color:'var(--positive)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
          <Icon name="checkCircle" size={16}/> Rota published — all {roster.length} staff notified for week of {CD.fmtUK(CD.dk(0))}.
        </div>
      )}

      <div style={{ flex:1, overflow:'auto', padding:'18px 26px 28px' }}>
        <div style={{ minWidth:780 }}>
          {/* header row */}
          <div style={{ display:'grid', gridTemplateColumns:'160px repeat(7,1fr)', gap:8, marginBottom:8 }}>
            <div/>
            {CD.DAYS.map((d,i)=>{
              const today = CD.dk(i)===CD.TODAY_KEY;
              return (
                <div key={d} style={{ textAlign:'center', padding:'6px 0', borderRadius:10, background:today?'var(--accent-soft)':'transparent' }}>
                  <div style={{ fontSize:11.5, fontWeight:800, color:today?'var(--accent)':'var(--ink-3)', letterSpacing:0.5 }}>{d}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:today?'var(--accent)':'var(--ink)' }}>{CD.fmtDayNum(CD.dk(i))}</div>
                </div>
              );
            })}
          </div>

          {/* open shifts row */}
          <div style={{ display:'grid', gridTemplateColumns:'160px repeat(7,1fr)', gap:8, marginBottom:8 }}>
            <RowLabel title="Open shifts" sub="Unfilled" icon />
            {CD.DAYS.map((d,i)=>(
              <div key={d} style={{ minHeight:54, display:'flex', flexDirection:'column', gap:5 }}>
                {openByDay(i).map(s=>(
                  <div key={s.id} style={{ borderRadius:9, padding:'7px 8px', border:'1.5px dashed var(--accent)', background:'var(--accent-soft)' }}>
                    <div style={{ fontSize:11.5, fontWeight:800, color:'var(--accent)' }}>{s.role}</div>
                    <div style={{ fontSize:10.5, fontWeight:600, color:'var(--accent)', opacity:0.8 }}>{s.start}–{s.end}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* worker rows */}
          {roster.map(w=>(
            <div key={w.id} style={{ display:'grid', gridTemplateColumns:'160px repeat(7,1fr)', gap:8, marginBottom:8 }}>
              <RowLabel worker={w} />
              {CD.DAYS.map((d,i)=>{
                const cs = cellShifts(w.id,i);
                return (
                  <div key={d} onClick={()=>cs.length===0&&setAdd({date:CD.dk(i), workerId:w.id})}
                    className="rota-cell"
                    style={{ minHeight:54, borderRadius:9, background:'var(--surface)', border:'1px solid var(--line)',
                      display:'flex', flexDirection:'column', gap:4, padding:cs.length?5:0, cursor:cs.length?'default':'pointer' }}>
                    {cs.map(s=><ShiftChip key={s.id} s={s} onRemove={()=>actions.removeShift(s.id)} />)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {add && <AddShiftModal init={add} actions={actions} onClose={()=>setAdd(null)} />}
    </>
  );
}

function RowLabel({ worker, title, sub, icon }){
  if (worker) return (
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'4px 2px' }}>
      <Avatar worker={worker} size={32} />
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{worker.first}</div>
        <div style={{ fontSize:11, color:'var(--ink-3)', fontWeight:600 }}>£{worker.rate.toFixed(2)}/hr</div>
      </div>
    </div>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'4px 2px' }}>
      <div style={{ width:32, height:32, borderRadius:9, border:'1.5px dashed var(--accent)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="briefcase" size={16}/></div>
      <div><div style={{ fontSize:13, fontWeight:800, color:'var(--ink)' }}>{title}</div><div style={{ fontSize:11, color:'var(--ink-3)', fontWeight:600 }}>{sub}</div></div>
    </div>
  );
}

function ShiftChip({ s, onRemove }){
  const tone = s.status==='active' ? ['var(--positive)','var(--positive-soft)']
    : s.status==='completed' ? ['var(--ink-2)','var(--surface-3)']
    : ['var(--accent)','var(--accent-soft)'];
  return (
    <div className="shift-chip" style={{ position:'relative', borderRadius:8, padding:'6px 8px', background:tone[1], minHeight:42 }}>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        {s.status==='active' && <LiveDot/>}
        <span style={{ fontSize:11.5, fontWeight:800, color:tone[0] }}>{s.role}</span>
      </div>
      <div style={{ fontSize:10.5, fontWeight:600, color:tone[0], opacity:0.85, marginTop:1 }}>{s.start}–{s.end}</div>
      <button className="chip-x" onClick={(e)=>{e.stopPropagation(); onRemove();}} style={{
        position:'absolute', top:3, right:3, width:16, height:16, borderRadius:'50%', border:'none',
        background:'var(--surface)', color:'var(--ink-2)', cursor:'pointer', display:'none',
        alignItems:'center', justifyContent:'center', padding:0 }}><Icon name="x" size={11}/></button>
    </div>
  );
}

// ════════════════ ADD SHIFT MODAL ════════════════
const HOURS = [];
for (let h=6; h<=23; h++){ HOURS.push(`${String(h).padStart(2,'0')}:00`); HOURS.push(`${String(h).padStart(2,'0')}:30`); }
function AddShiftModal({ init, actions, onClose }){
  const [workerId, setW] = cuS(init.workerId);
  const [date, setDate] = cuS(init.date);
  const [role, setRole] = cuS('Floor');
  const [start, setStart] = cuS('17:00');
  const [end, setEnd] = cuS('23:00');
  const w = CD.workerById(workerId);
  const hrs = CD.dur(start,end);
  const cost = hrs * (w?w.rate:12.6);

  return (
    <ModalShell title="Add shift" onClose={onClose}>
      <Field label="Staff member">
        <Select value={workerId} onChange={setW} options={CD.WORKERS.map(x=>({value:x.id,label:x.name}))} />
      </Field>
      <Field label="Day">
        <Select value={date} onChange={setDate} options={CD.DAYS.map((d,i)=>({value:CD.dk(i),label:`${d} ${CD.fmtDayNum(CD.dk(i))}`}))} />
      </Field>
      <Field label="Role">
        <div style={{ display:'flex', gap:7 }}>
          {ROLES.map(r=>(
            <button key={r} onClick={()=>setRole(r)} style={{ flex:1, padding:'9px 0', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700,
              background:role===r?'var(--accent)':'var(--surface-3)', color:role===r?'var(--accent-ink)':'var(--ink-2)' }}>{r}</button>
          ))}
        </div>
      </Field>
      <div style={{ display:'flex', gap:12 }}>
        <Field label="Start" style={{ flex:1 }}><Select value={start} onChange={setStart} options={HOURS.map(h=>({value:h,label:h}))} /></Field>
        <Field label="End" style={{ flex:1 }}><Select value={end} onChange={setEnd} options={HOURS.map(h=>({value:h,label:h}))} /></Field>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:'var(--surface-3)', marginTop:4 }}>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--ink-2)' }}>{hrs}h · {w&&w.first}</span>
        <span style={{ fontSize:15, fontWeight:800, color:'var(--ink)' }}>£{cost.toFixed(2)}</span>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:18 }}>
        <Btn variant="ghost" full onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" full onClick={()=>{ actions.addShift({workerId,date,role,start,end,rate:w?w.rate:12.6}); onClose(); }}>Add to rota</Btn>
      </div>
    </ModalShell>
  );
}

window.CompanyApp = CompanyApp;
window.CompanyShared = { PageHeader, Wordmark, MANAGER };
