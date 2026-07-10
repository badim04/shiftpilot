// root.jsx — app state, actions, landing/mode switch, theme + Tweaks, stages
const { useState: rS, useEffect: rE, useRef: rR, useLayoutEffect: rLE } = React;
const R = window.RotaData;
const { themeVars, isDark } = window.RotaTheme;

const STORE_KEY = 'rota_app_v2';
const boot = Date.now();
const vNow = () => new Date(R.NOW.getTime() + (Date.now() - boot));
const vNowHM = () => fmtHM(vNow());

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "midnight",
  "accent": "",
  "view": "worker"
}/*EDITMODE-END*/;

const ACCENTS = ['', '#2F6BF0', '#7A5AE0', '#0E9E8E', '#E0633A', '#E0A845'];

// ── persistence ──
function loadStore(){
  try { const r = localStorage.getItem(STORE_KEY); if(r) return JSON.parse(r); } catch(e){}
  return null;
}
function saveStore(obj){ try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch(e){} }

// ── fit-to-viewport scaling hook ──
function useFitScale(w, h){
  const ref = rR(null);
  const [scale, setScale] = rS(1);
  rLE(()=>{
    const el = ref.current; if(!el) return;
    const fit = ()=>{
      const aw = el.clientWidth - 24, ah = el.clientHeight - 24;
      setScale(Math.min(aw/w, ah/h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return ()=>ro.disconnect();
  }, [w, h]);
  return [ref, scale];
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const persisted = rR(loadStore()).current;
  const [data, setData] = rS(()=> persisted?.data || R.initialData());
  const [mode, setMode] = rS(()=> persisted?.mode || 'landing');  // landing | worker | company

  rE(()=>{ saveStore({ data, mode }); }, [data, mode]);

  // ── actions (mutate shared data) ──
  const tx = (fn)=> setData(d=>{ const next = { ...d, shifts: d.shifts.map(s=>({...s})), messages: d.messages.map(m=>({...m, msgs:[...m.msgs]})), availability: JSON.parse(JSON.stringify(d.availability)) }; fn(next); return next; });
  const find = (next,id)=> next.shifts.find(s=>s.id===id);
  const actions = {
    clockIn: (id)=> tx(n=>{ const s=find(n,id); if(s){ s.status='active'; s.clockIn = R.toMin(s.start)<=R.MIN_NOW ? s.start : vNowHM(); } }),
    clockOut:(id)=> tx(n=>{ const s=find(n,id); if(s){ s.status='completed'; s.clockOut = vNowHM(); s.approved=false; } }),
    acceptOpen:(id)=> tx(n=>{ const s=find(n,id); if(s){ s.workerId='jamie'; s.status='scheduled'; } }),
    requestSwap:(id)=> tx(n=>{ const s=find(n,id); if(s) s.swap=true; }),
    dropShift:(id)=> tx(n=>{ const s=find(n,id); if(s) s.drop=true; }),
    toggleAvailability:(day,period)=> tx(n=>{ n.availability[day][period] = !n.availability[day][period]; }),
    addShift:({workerId,date,role,start,end,rate})=> tx(n=>{ n.shifts.push(R.S({companyId:'oak',workerId,date,role,start,end,rate,breakMins:30})); }),
    removeShift:(id)=> tx(n=>{ n.shifts = n.shifts.filter(s=>s.id!==id); }),
    postOpenShift:({date,role,start,end,rate})=> tx(n=>{ n.shifts.push(R.S({companyId:'oak',workerId:null,date,role,start,end,rate,status:'open',breakMins:30})); }),
    approveTimesheet:(id)=> tx(n=>{ const s=find(n,id); if(s) s.approved=true; }),
    sendMessage:(tid,text)=> tx(n=>{ const m=n.messages.find(x=>x.id===tid); if(m){ m.msgs.push({from:'manager',text,t:'Now'}); m.unread=false; } }),
    readThread:(tid)=> tx(n=>{ const m=n.messages.find(x=>x.id===tid); if(m) m.unread=false; }),
  };
  const reset = ()=>{ setData(R.initialData()); };

  // ── theme vars + accent override ──
  const vars = { ...themeVars(t.theme) };
  if (t.accent){ vars['--accent']=t.accent; vars['--accent-2']=t.accent; vars['--accent-ink']='#fff';
    vars['--accent-soft']=`color-mix(in srgb, ${t.accent} 15%, transparent)`; }
  const dark = isDark(t.theme);

  return (
    <div className="rota-root" style={{ ...vars, height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg-2)', color:'var(--ink)' }}>
      {mode!=='landing' && (
        <Toolbar mode={mode} setMode={setMode} onReset={reset} />
      )}
      <div style={{ flex:1, minHeight:0 }}>
        {mode==='landing' && <Landing onPick={setMode} />}
        {mode==='worker'  && <WorkerStage data={data} actions={actions} dark={dark} />}
        {mode==='company' && <CompanyStage data={data} actions={actions} />}
      </div>

      <TweaksPanel>
        <TweakSection label="Look & feel" />
        <TweakRadio label="Theme" value={t.theme} options={[{value:'midnight',label:'Midnight'},{value:'daylight',label:'Daylight'},{value:'warmth',label:'Warmth'}]} onChange={v=>setTweak('theme',v)} />
        <div style={{ padding:'4px 0 2px' }}>
          <AccentPicker value={t.accent} onChange={v=>setTweak('accent',v)} />
        </div>
        <TweakSection label="Demo" />
        <TweakButton label="Back to start" onClick={()=>setMode('landing')} />
        <TweakButton label="Reset sample data" secondary onClick={reset} />
      </TweaksPanel>
    </div>
  );
}

function AccentPicker({ value, onChange }){
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:600, color:'#8a8a8a', marginBottom:8 }}>Accent</div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {ACCENTS.map(c=>{
          const on = value===c;
          return (
            <button key={c||'def'} onClick={()=>onChange(c)} title={c||'Theme default'} style={{
              width:30, height:30, borderRadius:'50%', cursor:'pointer', padding:0,
              border: on?'2px solid #fff':'2px solid transparent',
              boxShadow: on?'0 0 0 2px #5B8DEF':'inset 0 0 0 1px rgba(255,255,255,0.2)',
              background: c || 'conic-gradient(from 0deg, #5B8DEF, #0E9E8E, #E0A845, #E0633A, #7A5AE0, #5B8DEF)',
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ── top toolbar (above the framed apps) ──
function Toolbar({ mode, setMode, onReset }){
  const W = window.CompanyShared.Wordmark;
  return (
    <div style={{ flexShrink:0, height:54, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', borderBottom:'1px solid var(--line)', background:'var(--surface)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <W size={19} />
        <span style={{ fontSize:12, fontWeight:700, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:6 }}><LiveDot/> Shared live data</span>
      </div>
      <Segmented value={mode} onChange={setMode} options={[{value:'worker',label:'Worker app'},{value:'company',label:'Company dashboard'}]} />
      <div style={{ display:'flex', gap:10 }}>
        <Btn variant="ghost" size="sm" onClick={()=>setMode('landing')}>Home</Btn>
      </div>
    </div>
  );
}

// ── landing / mode switcher ──
function Landing({ onPick }){
  const W = window.CompanyShared.Wordmark;
  return (
    <div style={{ height:'100%', overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:'var(--bg-2)' }}>
      <div style={{ maxWidth:880, width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}><W size={30} /></div>
        <h1 style={{ textAlign:'center', fontSize:42, fontWeight:800, color:'var(--ink)', letterSpacing:-1.4, margin:'0 0 12px', lineHeight:1.05 }}>Shifts, sorted —<br/>for both sides of the rota.</h1>
        <p style={{ textAlign:'center', fontSize:17, color:'var(--ink-2)', fontWeight:500, maxWidth:560, margin:'0 auto 40px', lineHeight:1.5 }}>
          One platform for UK businesses building rotas and the workers juggling shifts across every company they work for. Pick a side — the data's shared and live.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          <EntryCard onClick={()=>onPick('worker')} icon="user" tag="Mobile app"
            title="I'm a worker" desc="See every shift across all your companies in one calendar. Clock in, set availability, swap shifts and track your pay & holiday."
            cta="Open worker app" />
          <EntryCard onClick={()=>onPick('company')} icon="building" tag="Web dashboard"
            title="I'm a manager" desc="Build & publish the weekly rota, post open shifts, see who's on right now, approve timesheets and message your team."
            cta="Open dashboard" />
        </div>
        <div style={{ textAlign:'center', marginTop:28, fontSize:13, color:'var(--ink-3)', fontWeight:600 }}>You can switch sides any time from the top bar.</div>
      </div>
    </div>
  );
}
function EntryCard({ onClick, icon, tag, title, desc, cta }){
  const [h,setH]=rS(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      background:'var(--surface)', border:'1px solid var(--line)', borderRadius:22, padding:26, cursor:'pointer',
      boxShadow: h?'var(--shadow-lg)':'var(--shadow)', transform:h?'translateY(-3px)':'none', transition:'transform .18s, box-shadow .18s' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <div style={{ width:50, height:50, borderRadius:15, background:'var(--accent-soft)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={icon} size={26}/></div>
        <Badge tone="neutral">{tag}</Badge>
      </div>
      <div style={{ fontSize:23, fontWeight:800, color:'var(--ink)', letterSpacing:-0.5, marginBottom:8 }}>{title}</div>
      <p style={{ fontSize:14.5, color:'var(--ink-2)', fontWeight:500, lineHeight:1.55, margin:'0 0 20px' }}>{desc}</p>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--accent)', fontWeight:800, fontSize:15 }}>{cta} <Icon name="arrowR" size={18}/></div>
    </div>
  );
}

// ── stages ──
function WorkerStage({ data, actions, dark }){
  const [ref, scale] = useFitScale(402, 874);
  return (
    <div ref={ref} style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ transform:`scale(${scale})`, transformOrigin:'center' }}>
        <IOSDevice width={402} height={874} dark={dark} time={fmtHM(R.NOW)}>
          <WorkerApp data={data} actions={actions} dark={dark} />
        </IOSDevice>
      </div>
    </div>
  );
}
function CompanyStage({ data, actions }){
  const [ref, scale] = useFitScale(1200, 768);
  return (
    <div ref={ref} style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ transform:`scale(${scale})`, transformOrigin:'center' }}>
        <ChromeWindow width={1200} height={768} url="oakwood.rota.app/rota" tabs={[{title:'Rota · Oakwood Hospitality'}]}>
          <div style={{ height:'100%' }}>
            <CompanyApp data={data} actions={actions} />
          </div>
        </ChromeWindow>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
