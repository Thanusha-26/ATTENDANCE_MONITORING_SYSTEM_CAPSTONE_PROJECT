import { useState, useCallback } from "react";
import axios from "axios";

// ═══════════════════════════════════════════════════════════════════
// API LAYER
// ═══════════════════════════════════════════════════════════════════
const BASE = "http://localhost:5000/api";

axios.interceptors.request.use(cfg => {
  const t = localStorage.getItem("ae_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const errMsg = e => e?.response?.data?.message || e?.message || "Something went wrong";

const api = {
  login:          (role,id,pw)   => axios.post(`${BASE}/auth/login`,{role,id,password:pw}),
  fetchAll:       ()             => Promise.all([
    axios.get(`${BASE}/faculty`).catch(()=>({data:[]})),
    axios.get(`${BASE}/students`).catch(()=>({data:[]})),
    axios.get(`${BASE}/courses`).catch(()=>({data:[]})),
    axios.get(`${BASE}/assignments`).catch(()=>({data:[]})),
    axios.get(`${BASE}/attendance`).catch(()=>({data:[]})),
  ]).then(([f,s,c,a,at])=>({faculties:f.data,students:s.data,courses:c.data,facultySection:a.data,attendance:at.data})),
  addFaculty:     (form)         => axios.post(`${BASE}/faculty`,form),
  approveFaculty: (id,approved)  => axios.patch(`${BASE}/faculty/${id}/approve`,{approved}),
  deleteFaculty:  (id)           => axios.delete(`${BASE}/faculty/${id}`),
  updateFaculty:  (id,form)      => axios.put(`${BASE}/faculty/${id}`,form),
  facultyPw:      (id,o,n)       => axios.patch(`${BASE}/faculty/${id}/password`,{oldPassword:o,newPassword:n}),
  addStudent:     (form)         => axios.post(`${BASE}/students`,form),
  deleteStudent:  (rn)           => axios.delete(`${BASE}/students/${rn}`),
  changeSection:  (rn,sec)       => axios.patch(`${BASE}/students/${rn}/section`,{section:sec}),
  updateStudent:  (rn,form)      => axios.put(`${BASE}/students/${rn}`,form),
  studentPw:      (rn,o,n)       => axios.patch(`${BASE}/students/${rn}/password`,{oldPassword:o,newPassword:n}),
  addCourse:      (form)         => axios.post(`${BASE}/courses`,form),
  deleteCourse:   (code)         => axios.delete(`${BASE}/courses/${code}`),
  assign:         (fid,code)     => axios.post(`${BASE}/assignments`,{facultyId:fid,courseCode:code}),
  removeAssign:   (code)         => axios.delete(`${BASE}/assignments/${code}`),
  postAttendance: (payload)      => axios.post(`${BASE}/attendance`,payload),
};

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#03060f;--s1:#080d1a;--s2:#0e1525;--s3:#141c2e;--s4:#1a2438;
  --blue:#3b82f6;--indigo:#6366f1;--cyan:#06b6d4;--em:#10b981;
  --amber:#f59e0b;--rose:#f43f5e;--violet:#8b5cf6;--pink:#ec4899;
  --text:#f0f4ff;--text2:#94a3c4;--muted:#4a5577;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --font:'Outfit',sans-serif;--mono:'JetBrains Mono',monospace;
}
html,body,#root{height:100%;background:var(--bg);font-family:var(--font);color:var(--text);}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--s4);border-radius:99px;}
input,select,button,textarea{font-family:var(--font);}

@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes orbitCW{from{transform:rotate(0deg) translateX(var(--r)) rotate(0deg)}to{transform:rotate(360deg) translateX(var(--r)) rotate(-360deg)}}
@keyframes orbitCCW{from{transform:rotate(0deg) translateX(var(--r)) rotate(0deg)}to{transform:rotate(-360deg) translateX(var(--r)) rotate(360deg)}}

.au{animation:slideUp .4s ease both}
.au2{animation:slideUp .4s .08s ease both}
.au3{animation:slideUp .4s .16s ease both}
.au4{animation:slideUp .4s .24s ease both}
.afloat{animation:float 5s ease-in-out infinite}

.lp{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;}
@media(max-width:768px){.lp{grid-template-columns:1fr;}.lp-left{display:none!important;}}
.lp-left{display:flex;flex-direction:column;justify-content:center;align-items:center;
  padding:60px;position:relative;overflow:hidden;
  background:radial-gradient(ellipse 700px 700px at 30% 40%,rgba(59,130,246,.1),transparent 60%),
             radial-gradient(ellipse 500px 500px at 80% 70%,rgba(99,102,241,.07),transparent 60%),var(--bg);}
.lp-right{background:var(--s1);display:flex;flex-direction:column;justify-content:center;
  padding:52px;border-left:1px solid var(--border);position:relative;overflow-y:auto;}
.lp-right::after{content:'';position:absolute;top:-80px;right:-80px;width:280px;height:280px;
  background:radial-gradient(circle,rgba(99,102,241,.07),transparent 70%);pointer-events:none;}
.orbit-wrap{position:absolute;width:0;height:0;top:50%;left:50%;pointer-events:none;}
.orbit-ring{position:absolute;border:1px solid rgba(59,130,246,.1);border-radius:50%;transform:translate(-50%,-50%);}
.orbit-dot{width:8px;height:8px;border-radius:50%;position:absolute;left:50%;top:0;margin-left:-4px;margin-top:-4px;}

.rtabs{display:flex;background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:5px;margin-bottom:24px;}
.rtab{flex:1;padding:10px 6px;border:none;background:none;border-radius:10px;cursor:pointer;
  font-family:var(--font);font-size:12px;font-weight:600;transition:all .2s;color:var(--muted);
  display:flex;flex-direction:column;align-items:center;gap:3px;}
.rtab .ri{font-size:22px;}.rtab .rl{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;}
.rtab.active{background:var(--s3);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.5);}

.fl{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px;display:block;}
.fi{width:100%;background:var(--s2);border:1.5px solid var(--border);border-radius:12px;
  padding:12px 16px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;
  transition:border-color .2s,box-shadow .2s;}
.fi:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,.12);}
.fi::placeholder{color:var(--muted);}
.fi-icon{padding-left:44px;}.fi-wrap{position:relative;}
.fi-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;opacity:.45;pointer-events:none;}
.fsel{appearance:none;cursor:pointer;}.fsel option{background:var(--s2);}
.fg{margin-bottom:16px;}

.btn{padding:10px 20px;border-radius:10px;font-weight:600;cursor:pointer;border:none;
  transition:all .15s;font-family:var(--font);font-size:13.5px;}
.btn:hover{filter:brightness(1.1);}.btn:active{transform:scale(.98);}
.btn-primary{background:var(--blue);color:#fff;}
.btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border2);}
.btn-ghost:hover{border-color:var(--blue);color:var(--blue);}
.btn-danger{background:rgba(244,63,94,.15);color:var(--rose);border:1px solid rgba(244,63,94,.25);}
.btn-success{background:var(--em);color:#fff;}
.btn-amber{background:rgba(245,158,11,.15);color:var(--amber);border:1px solid rgba(245,158,11,.25);}
.btn-sm{padding:6px 13px;font-size:12px;border-radius:8px;}
.btn-lg{padding:14px 28px;font-size:15px;}
.btn-full{width:100%;}
.btn-login{width:100%;padding:14px;border:none;border-radius:12px;font-family:var(--font);
  font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;color:#fff;
  position:relative;overflow:hidden;letter-spacing:.02em;}
.btn-login::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.1),transparent);pointer-events:none;}
.btn-login:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.35);}

.shell{display:flex;min-height:100vh;}
.sidebar{width:248px;background:var(--s1);border-right:1px solid var(--border);
  display:flex;flex-direction:column;position:fixed;height:100vh;left:0;top:0;z-index:50;}
.sb-logo{padding:22px 20px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;}
.sb-logo-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.sb-nav{flex:1;padding:14px 10px;overflow-y:auto;display:flex;flex-direction:column;gap:1px;}
.nav-sec{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:.16em;text-transform:uppercase;padding:12px 10px 5px;}
.nb{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;
  background:none;cursor:pointer;font-family:var(--font);font-size:13.5px;font-weight:500;
  color:var(--text2);width:100%;text-align:left;transition:all .15s;}
.nb:hover{background:var(--s2);color:var(--text);}
.nb.active{background:rgba(59,130,246,.12);color:var(--blue);font-weight:600;}
.nb .ni{font-size:17px;width:22px;text-align:center;flex-shrink:0;}
.sb-user{padding:14px 16px 18px;border-top:1px solid var(--border);}
.main{margin-left:248px;flex:1;padding:30px 34px;min-height:100vh;overflow-y:auto;}

.card{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:22px;}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;
  letter-spacing:.1em;padding:0 10px 12px 0;border-bottom:1px solid var(--border);white-space:nowrap;}
.tbl td{padding:12px 10px 12px 0;border-bottom:1px solid var(--border);font-size:13.5px;vertical-align:middle;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:rgba(255,255,255,.015);}

.mo{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;
  justify-content:center;z-index:200;backdrop-filter:blur(6px);animation:fadeIn .2s ease;padding:20px;}
.mb{background:var(--s1);border:1px solid var(--border2);border-radius:20px;
  width:100%;max-height:88vh;overflow-y:auto;animation:slideUp .25s ease;}
.mh{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 0;margin-bottom:20px;}
.mbody{padding:0 24px 24px;}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;
  font-size:11px;font-weight:700;letter-spacing:.04em;white-space:nowrap;}
.pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;
  font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
.err-box{background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.25);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--rose);margin-bottom:16px;}
.ok-box{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--em);margin-bottom:16px;}
.warn-box{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--amber);margin-bottom:16px;}
.info-box{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.18);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--text2);margin-bottom:16px;}
.divider{height:1px;background:var(--border);margin:16px 0;}
.sc1::before{background:linear-gradient(90deg,var(--blue),transparent);}
.sc2::before{background:linear-gradient(90deg,var(--indigo),transparent);}
.sc3::before{background:linear-gradient(90deg,var(--em),transparent);}
.sc4::before{background:linear-gradient(90deg,var(--amber),transparent);}
.sc5::before{background:linear-gradient(90deg,var(--rose),transparent);}
.sc6::before{background:linear-gradient(90deg,var(--cyan),transparent);}
.scard{position:relative;overflow:hidden;}
.scard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}

.profile-hero{background:linear-gradient(135deg,var(--s2),var(--s1));border:1px solid var(--border);
  border-radius:20px;padding:32px;display:flex;align-items:center;gap:28px;margin-bottom:24px;
  position:relative;overflow:hidden;}
.profile-hero::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 400px 300px at 100% 50%,rgba(59,130,246,.06),transparent);pointer-events:none;}
.profile-avatar-lg{width:90px;height:90px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-weight:800;font-size:32px;flex-shrink:0;box-shadow:0 0 0 4px rgba(59,130,246,.2);}
.edit-overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:50%;
  display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;cursor:pointer;}
.profile-avatar-wrap:hover .edit-overlay{opacity:1;}
.profile-avatar-wrap{position:relative;width:90px;height:90px;}
`;

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const DEPARTMENTS = ["CSE","ECE","MECH","CIVIL","EEE","IT","AIDS","CSBS"];
const SECTIONS    = ["A","B","C","D","E"];
const TIME_SLOTS  = ["8:00–9:00 AM","9:00–10:00 AM","10:00–11:00 AM","11 AM–12 PM","12–1 PM","2:00–3:00 PM","3:00–4:00 PM","4:00–5:00 PM"];
const COLORS      = ["#3b82f6","#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6","#ec4899"];

// Generate passout years: current year + 4 down to current - 2
const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({length:7},(_,i)=>String(currentYear+4-i));

// ═══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const colorOf = s => COLORS[(s||"X").charCodeAt(0) % COLORS.length];
const inits   = n => (n||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

function Av({ name, size=36, style:sx }) {
  const c = colorOf(name);
  return <div style={{width:size,height:size,borderRadius:"50%",background:c+"22",color:c,
    display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,
    fontSize:size*.36,flexShrink:0,...sx}}>{inits(name)}</div>;
}
function Bdg({ text, color="#3b82f6" }) {
  return <span className="badge" style={{background:color+"18",color}}>{text}</span>;
}
function Pill({ status }) {
  const m={present:{bg:"rgba(16,185,129,.12)",c:"#10b981"},absent:{bg:"rgba(244,63,94,.12)",c:"#f43f5e"}};
  const s=m[status]||m.absent;
  return <span className="pill" style={{background:s.bg,color:s.c}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:s.c,display:"inline-block",flexShrink:0}}/>{status}
  </span>;
}
function Fi({ label, type="text", value, onChange, placeholder, icon, mono, disabled }) {
  return <div className="fg">
    {label&&<label className="fl">{label}</label>}
    <div className="fi-wrap">
      {icon&&<span className="fi-ico">{icon}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled} className={`fi${icon?" fi-icon":""}`}
        style={mono?{fontFamily:"var(--mono)",letterSpacing:".06em"}:{}}/>
    </div>
  </div>;
}
function Fs({ label, value, onChange, options, placeholder, disabled }) {
  return <div className="fg">
    {label&&<label className="fl">{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
      className="fi fsel" style={{color:value?"var(--text)":"var(--muted)",opacity:disabled?.5:1}}>
      {placeholder&&<option value="">{placeholder}</option>}
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>;
}
function Btn({ children, onClick, cn="btn-primary", size="", full, sx, disabled }) {
  return <button onClick={onClick} disabled={disabled}
    className={`btn ${cn} ${size} ${full?"btn-full":""}`}
    style={{opacity:disabled?.5:1,...sx}}>{children}</button>;
}
function Modal({ title, sub, children, onClose, width=520 }) {
  return <div className="mo" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="mb" style={{maxWidth:width}}>
      <div className="mh">
        <div>
          <div style={{fontWeight:700,fontSize:18}}>{title}</div>
          {sub&&<div style={{fontSize:13,color:"var(--text2)",marginTop:3}}>{sub}</div>}
        </div>
        <button onClick={onClose} style={{background:"var(--s2)",border:"1px solid var(--border)",color:"var(--muted)",width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div className="mbody">{children}</div>
    </div>
  </div>;
}
function StatCard({ label, value, icon, color, sub, sc }) {
  return <div className={`card scard sc${sc||1}`}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>{label}</div>
        <div style={{fontWeight:800,fontSize:34,color,lineHeight:1}}>{value}</div>
        {sub&&<div style={{fontSize:12,color:"var(--text2)",marginTop:6}}>{sub}</div>}
      </div>
      <div style={{fontSize:28,opacity:.7}}>{icon}</div>
    </div>
  </div>;
}
function PageHdr({ title, sub, children }) {
  return <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:26}}>
    <div>
      <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.03em"}}>{title}</h1>
      {sub&&<p style={{fontSize:13.5,color:"var(--text2)",marginTop:4}}>{sub}</p>}
    </div>
    {children&&<div style={{display:"flex",gap:10}}>{children}</div>}
  </div>;
}
function ProfileHero({ name, id, role, dept, editing, onEdit }) {
  return <div className="profile-hero">
    <div className="profile-avatar-wrap">
      <div className="profile-avatar-lg" style={{background:colorOf(name)+"22",color:colorOf(name)}}>{inits(name)}</div>
      {!editing&&<div className="edit-overlay" onClick={onEdit}><span style={{fontSize:18}}>✏️</span></div>}
    </div>
    <div>
      <div style={{fontWeight:800,fontSize:24,letterSpacing:"-.02em",marginBottom:6}}>{name}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        <Bdg text={id} color="var(--blue)"/>
        <Bdg text={role} color="var(--indigo)"/>
        <Bdg text={dept} color={colorOf(dept)}/>
      </div>
    </div>
  </div>;
}
function Sidebar({ user, nav, setNav, items, onLogout }) {
  const rc={admin:"var(--rose)",faculty:"var(--indigo)",student:"var(--cyan)"};
  const rb={admin:"linear-gradient(135deg,var(--rose),#be123c)",faculty:"linear-gradient(135deg,var(--indigo),var(--violet))",student:"linear-gradient(135deg,var(--cyan),var(--blue))"};
  return <div className="sidebar">
    <div className="sb-logo">
      <div className="sb-logo-icon" style={{background:rb[user.role]}}>🎓</div>
      <div>
        <div style={{fontWeight:800,fontSize:16}}>AttendEase</div>
        <div style={{fontSize:10,color:rc[user.role],textTransform:"uppercase",fontWeight:700,letterSpacing:".1em"}}>{user.role}</div>
      </div>
    </div>
    <nav className="sb-nav">
      {items.map((it,i)=>(
        <div key={i}>
          {it.sec&&<div className="nav-sec">{it.sec}</div>}
          {it.id&&<button className={`nb${nav===it.id?" active":""}`} onClick={()=>setNav(it.id)}>
            <span className="ni">{it.icon}</span>{it.label}
          </button>}
        </div>
      ))}
    </nav>
    <div className="sb-user">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <Av name={user.name} size={34}/>
        <div style={{overflow:"hidden"}}>
          <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
          <div style={{fontSize:11,color:"var(--muted)"}}>{user.id||user.rollNo}</div>
        </div>
      </div>
      <Btn full onClick={onLogout} cn="btn-ghost" size="btn-sm">Sign Out</Btn>
    </div>
  </div>;
}

// ─────────────────────────────────────────────────────────────────
// REPLACE the entire LoginPage function in your App.js with this
// (from "function LoginPage({ onLogin }) {" to its closing "}")
// ─────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [role,setRole]         = useState("admin");
  const [form,setForm]         = useState({id:"",password:""});
  const [err,setErr]           = useState("");
  const [loading,setLoading]   = useState(false);

  // Forgot password states
  const [showForgot,setShowForgot] = useState(false);
  const [fpId,setFpId]             = useState("");
  const [fpNew,setFpNew]           = useState("");
  const [fpConfirm,setFpConfirm]   = useState("");
  const [fpErr,setFpErr]           = useState("");
  const [fpOk,setFpOk]             = useState("");
  const [fpLoading,setFpLoading]   = useState(false);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const gradients = {
    admin:   "linear-gradient(135deg,#3b82f6,#6366f1)",
    faculty: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    student: "linear-gradient(135deg,#06b6d4,#3b82f6)",
  };
  const roleData = [
    {id:"admin",  icon:"🛡️", label:"Admin"},
    {id:"faculty",icon:"👨‍🏫",label:"Faculty"},
    {id:"student",icon:"🎓", label:"Student"},
  ];

  const login = async () => {
    if(!form.id||!form.password) return setErr("Please enter your credentials");
    setErr(""); setLoading(true);
    try {
      const res = await api.login(role, form.id, form.password);
      localStorage.setItem("ae_token", res.data.token);
      onLogin(res.data.user);
    } catch(e) { setErr(errMsg(e)); }
    finally { setLoading(false); }
  };

  const handleKey = e => { if(e.key==="Enter") login(); };

  // Forgot password submit
  const resetPassword = async () => {
    setFpErr(""); setFpOk("");
    if(!fpId)      return setFpErr("Please enter your ID / Roll No");
    if(!fpNew)     return setFpErr("Please enter a new password");
    if(fpNew.length < 4) return setFpErr("Password must be at least 4 characters");
    if(fpNew !== fpConfirm) return setFpErr("Passwords do not match");
    setFpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, id: fpId, newPassword: fpNew }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFpOk("✅ Password reset! You can now login.");
      setFpId(""); setFpNew(""); setFpConfirm("");
      setTimeout(() => { setShowForgot(false); setFpOk(""); }, 2500);
    } catch(e) { setFpErr(e.message); }
    finally { setFpLoading(false); }
  };

  const orbitData = [
    {size:200,color:"#3b82f6",dur:14,dir:"CW"},
    {size:310,color:"#6366f1",dur:22,dir:"CCW"},
    {size:430,color:"#06b6d4",dur:34,dir:"CW"},
  ];

  const idLabel       = role==="student" ? "Roll Number"       : role==="faculty" ? "Employee ID" : "Admin ID";
  const idIcon        = role==="student" ? "🎓"                : role==="faculty" ? "🪪"           : "🛡️";
  const idPlaceholder = role==="student" ? "Enter roll number" : role==="faculty" ? "Enter employee ID" : "Enter admin ID";

  return (
    <div className="lp">
      {/* LEFT */}
      <div className="lp-left">
        <div className="orbit-wrap">
          {orbitData.map((o,i)=>(
            <div key={i} className="orbit-ring" style={{width:o.size,height:o.size,marginLeft:-o.size/2,marginTop:-o.size/2}}>
              <div className="orbit-dot" style={{background:o.color,boxShadow:`0 0 12px ${o.color}`,
                animationName:`orbit${o.dir}`,animationDuration:`${o.dur}s`,animationTimingFunction:"linear",
                animationIterationCount:"infinite","--r":`${o.size/2}px`}}/>
            </div>
          ))}
        </div>
        <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
          <div className="afloat" style={{width:88,height:88,margin:"0 auto 28px",
            background:"linear-gradient(135deg,rgba(59,130,246,.25),rgba(99,102,241,.15))",
            border:"1px solid rgba(59,130,246,.35)",borderRadius:26,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,
            boxShadow:"0 0 80px rgba(59,130,246,.18),inset 0 1px 0 rgba(255,255,255,.08)"}}>🎓</div>
          <h1 style={{fontWeight:900,fontSize:48,letterSpacing:"-.05em",marginBottom:14,
            background:"linear-gradient(135deg,#fff 20%,rgba(147,197,253,.6) 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>AttendEase</h1>
          <p style={{fontSize:15,color:"var(--text2)",maxWidth:280,lineHeight:1.75,margin:"0 auto 44px"}}>
            Smart attendance monitoring for modern educational institutions
          </p>
          {[{icon:"✦",text:"Real-time attendance tracking"},{icon:"⚡",text:"Faculty & student dashboards"},{icon:"📊",text:"Analytics & reports"}].map((item,i)=>(
            <div key={i} className={`au${i+2}`} style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:13,fontSize:14,color:"var(--text2)"}}>
              <span style={{color:"var(--cyan)",fontWeight:700,fontSize:16}}>{item.icon}</span>{item.text}
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:24,fontSize:12,color:"var(--muted)",fontFamily:"var(--mono)"}}>v5.0 · MERN Stack</div>
      </div>

      {/* RIGHT */}
      <div className="lp-right">
        <div style={{maxWidth:420,width:"100%",margin:"0 auto"}}>

          {!showForgot ? (
            <>
              <div className="au" style={{marginBottom:30}}>
                <h2 style={{fontWeight:800,fontSize:30,letterSpacing:"-.03em",marginBottom:6}}>Welcome back</h2>
                <p style={{fontSize:14,color:"var(--text2)"}}>Sign in to your account</p>
              </div>

              <div className="rtabs au2">
                {roleData.map(r=>(
                  <button key={r.id} className={`rtab${role===r.id?" active":""}`}
                    onClick={()=>{setRole(r.id);setForm({id:"",password:""});setErr("");}}>
                    <span className="ri">{r.icon}</span><span className="rl">{r.label}</span>
                  </button>
                ))}
              </div>

              {err&&<div className="err-box au">{err}</div>}

              <div className="au3">
                <Fi label={idLabel} icon={idIcon} value={form.id} onChange={v=>f("id",v)}
                  placeholder={idPlaceholder} mono/>
                <Fi label="Password" type="password" icon="🔒" value={form.password}
                  onChange={v=>f("password",v)} placeholder="Enter your password" onKeyDown={handleKey}/>
                <button className="btn-login" onClick={login}
                  disabled={loading} style={{background:gradients[role],boxShadow:"0 4px 20px rgba(59,130,246,.22)",opacity:loading?.7:1}}>
                  {loading?"Signing in…":"Sign In →"}
                </button>

                {/* Forgot Password Link */}
                <div style={{textAlign:"center",marginTop:16}}>
                  <button onClick={()=>{setShowForgot(true);setFpErr("");setFpOk("");}}
                    style={{background:"none",border:"none",color:"var(--blue)",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>
                    Forgot Password?
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* FORGOT PASSWORD FORM */}
              <div className="au" style={{marginBottom:30}}>
                <h2 style={{fontWeight:800,fontSize:28,letterSpacing:"-.03em",marginBottom:6}}>Reset Password</h2>
                <p style={{fontSize:14,color:"var(--text2)"}}>Enter your ID and choose a new password</p>
              </div>

              <div className="rtabs au2">
                {roleData.map(r=>(
                  <button key={r.id} className={`rtab${role===r.id?" active":""}`}
                    onClick={()=>{setRole(r.id);setFpId("");setFpErr("");setFpOk("");}}>
                    <span className="ri">{r.icon}</span><span className="rl">{r.label}</span>
                  </button>
                ))}
              </div>

              {fpErr&&<div className="err-box au">{fpErr}</div>}
              {fpOk &&<div className="au" style={{background:"rgba(16,185,129,.12)",border:"1px solid rgba(16,185,129,.3)",
                borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--em)",marginBottom:12}}>{fpOk}</div>}

              <div className="au3">
                <Fi label={idLabel} icon={idIcon} value={fpId} onChange={v=>setFpId(v)}
                  placeholder={idPlaceholder} mono/>
                <Fi label="New Password" type="password" icon="🔑" value={fpNew}
                  onChange={v=>setFpNew(v)} placeholder="Enter new password"/>
                <Fi label="Confirm Password" type="password" icon="🔒" value={fpConfirm}
                  onChange={v=>setFpConfirm(v)} placeholder="Confirm new password"/>

                <button className="btn-login" onClick={resetPassword}
                  disabled={fpLoading} style={{background:gradients[role],boxShadow:"0 4px 20px rgba(59,130,246,.22)",opacity:fpLoading?.7:1}}>
                  {fpLoading?"Resetting…":"Reset Password"}
                </button>

                <div style={{textAlign:"center",marginTop:16}}>
                  <button onClick={()=>{setShowForgot(false);setFpErr("");setFpOk("");}}
                    style={{background:"none",border:"none",color:"var(--text2)",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>
                    ← Back to Login
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════════
function AdminPortal({ data, refresh, user, onLogout }) {
  const [nav,setNav] = useState("dashboard");
  const items = [
    {sec:"Overview"}, {id:"dashboard",icon:"⊞",label:"Dashboard"},
    {sec:"Management"},{id:"students",icon:"🎓",label:"Students"},
    {id:"faculty",icon:"👨‍🏫",label:"Faculty"},{id:"courses",icon:"📚",label:"Courses"},
    {id:"assign",icon:"🏫",label:"Assign Faculty"},
    {sec:"Account"},{id:"profile",icon:"👤",label:"Profile"},
  ];
  return (
    <div className="shell">
      <Sidebar user={user} nav={nav} setNav={setNav} items={items} onLogout={onLogout}/>
      <main className="main">
        {nav==="dashboard"&&<AdminDash    data={data}/>}
        {nav==="students" &&<AdminStudents data={data} refresh={refresh}/>}
        {nav==="faculty"  &&<AdminFaculty  data={data} refresh={refresh}/>}
        {nav==="courses"  &&<AdminCourses  data={data} refresh={refresh}/>}
        {nav==="assign"   &&<AdminAssign   data={data} refresh={refresh}/>}
        {nav==="profile"  &&<AdminProfile  user={user}/>}
      </main>
    </div>
  );
}
function BarChart({ data, color = "#3b82f6", height = 220, title }) {
  if (!data || data.length === 0)
    return <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>No data available</div>;

  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(64, Math.floor(680 / data.length) - 14);
  const totalW = Math.max(data.length * (barW + 14) + 60, 360);

  return (
    <div style={{ marginBottom: 8, overflowX: "auto" }}>
      {title && <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${totalW} ${height + 60}`} style={{ overflow: "visible", minWidth: totalW }}>
        {[0, 25, 50, 75, 100].map(pct => {
          const y = height - (pct / 100) * height;
          return (
            <g key={pct}>
              <line x1="42" y1={y} x2={totalW - 10} y2={y}
                stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="5 5" />
              <text x="36" y={y + 4} fontSize="10" fill="var(--muted)" textAnchor="end">{pct}%</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const barH = Math.max(6, (d.value / max) * height);
          const x = 48 + i * (barW + 14);
          const y = height - barH;
          const barColor = d.color || color;
          return (
            <g key={i}>
              <rect x={x} y={0} width={barW} height={height} fill="rgba(255,255,255,0.025)" rx="8" />
              <rect x={x} y={y} width={barW} height={barH} fill={barColor} rx="8" opacity="0.9" />
              <text x={x + barW / 2} y={y - 8} fontSize="11" fill="var(--text)"
                textAnchor="middle" fontWeight="800">{d.value}%</text>
              <text x={x + barW / 2} y={height + 22} fontSize="10" fill="var(--text2)"
                textAnchor="middle" fontWeight="600">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PieChart({ data, size = 220 }) {
  if (!data || data.length === 0)
    return <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>No data available</div>;

  const cx = size / 2, cy = size / 2, r = size / 2 - 28;
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  if (total === 0)
    return <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>No attendance data yet</div>;

  let startAngle = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const midAngle = startAngle + angle / 2;
    const lx = cx + (r + 18) * Math.cos(midAngle);
    const ly = cy + (r + 18) * Math.sin(midAngle);
    const slice = { ...d, x1, y1, x2, y2, large, midAngle, lx, ly, angle, startAngle, endAngle };
    startAngle = endAngle;
    return slice;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r + 4} fill="rgba(255,255,255,0.02)" />
        {slices.map((s, i) => (
          <path key={i}
            d={`M${cx},${cy} L${s.x1},${s.y1} A${r},${r} 0 ${s.large},1 ${s.x2},${s.y2} Z`}
            fill={s.color} opacity="0.88" stroke="var(--bg)" strokeWidth="2" />
        ))}
        {slices.map((s, i) => s.angle > 0.25 && (
          <text key={i} x={cx + (r * 0.65) * Math.cos(s.startAngle + s.angle / 2)}
            y={cy + (r * 0.65) * Math.sin(s.startAngle + s.angle / 2)}
            fontSize="11" fill="#fff" textAnchor="middle" dominantBaseline="middle" fontWeight="800">
            {s.value}%
          </text>
        ))}
        <circle cx={cx} cy={cy} r={r * 0.42} fill="var(--s1)" />
        <text x={cx} y={cy - 7} fontSize="11" fill="var(--text2)" textAnchor="middle">Total</text>
        <text x={cx} y={cy + 10} fontSize="15" fill="var(--text)" textAnchor="middle" fontWeight="800">
          {Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)}%
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{d.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.value}% attendance</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDash({ data }) {
  const pending = data.faculties.filter(f => f.approved === false);
  const allRec  = data.attendance.flatMap(a => a.records);
  const rate    = allRec.length
    ? Math.round(allRec.filter(r => r.status === "present").length / allRec.length * 100)
    : 0;

  // ── Section-wise attendance (pie chart) ─────────────────────────
  const secPieColors = ["#3b82f6","#6366f1","#06b6d4","#8b5cf6","#ec4899","#f59e0b","#10b981","#f43f5e"];
  const sections = [...new Set(data.students.map(s => s.section))].sort();
  const sectionChartData = sections.map((sec, i) => {
    const secStudents = data.students.filter(s => s.section === sec).map(s => s.rollNo);
    const secRecs = data.attendance.flatMap(a =>
      a.records.filter(r => secStudents.includes(r.rollNo))
    );
    const pres  = secRecs.filter(r => r.status === "present").length;
    const value = secRecs.length ? Math.round(pres / secRecs.length * 100) : 0;
    return { label: `Section ${sec}`, value, color: secPieColors[i % secPieColors.length] };
  });

  // ── Course-wise attendance (pie chart) ───────────────────────────
  const pieColors = ["#3b82f6","#6366f1","#06b6d4","#8b5cf6","#ec4899","#f59e0b","#10b981","#f43f5e"];
  const courseChartData = data.courses.map((c, i) => {
    const recs = data.attendance
      .filter(a => a.courseCode === c.code)
      .flatMap(a => a.records);
    const pres  = recs.filter(r => r.status === "present").length;
    const value = recs.length ? Math.round(pres / recs.length * 100) : 0;
    return { label: c.code, value, color: pieColors[i % pieColors.length] };
  });

  return (
    <div className="au">
      <PageHdr title="Admin Dashboard" sub="System overview" />
      <div className="g4" style={{ marginBottom: 22 }}>
        <StatCard label="Students"       value={data.students.length}                          icon="🎓" color="var(--blue)"   sub="registered" sc={1} />
        <StatCard label="Faculty"        value={data.faculties.filter(f => f.approved !== false).length} icon="👨‍🏫" color="var(--indigo)" sub={`${pending.length} pending`} sc={2} />
        <StatCard label="Courses"        value={data.courses.length}                            icon="📚" color="var(--em)"     sub="total courses" sc={3} />
        <StatCard label="Avg Attendance" value={rate + "%"}                                     icon="📊" color={rate >= 75 ? "var(--em)" : "var(--rose)"} sub="overall" sc={4} />
      </div>

      {/* ── Charts: side by side ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Section-wise: pie chart */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>📊 Section-wise Attendance</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Average attendance % per section</div>
          {sectionChartData.length === 0
            ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No attendance data yet</div>
            : <PieChart data={sectionChartData} size={210} />}
        </div>

        {/* Course-wise: pie chart */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>📚 Course-wise Attendance</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Average attendance % per course</div>
          {courseChartData.length === 0
            ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No attendance data yet</div>
            : <PieChart data={courseChartData} size={210} />}
        </div>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: 20, border: "1px solid rgba(245,158,11,.2)" }}>
          <div style={{ fontWeight: 700, color: "var(--amber)", marginBottom: 14 }}>⏳ Pending Faculty Approvals</div>
          {pending.map(f => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <Av name={f.name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{f.id} · {f.dept}</div>
              </div>
              <Bdg text="Pending" color="var(--amber)" />
            </div>
          ))}
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>→ Go to Faculty to approve/reject</div>
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Faculty — Course Assignments</div>
        {data.faculties.filter(f => f.approved !== false).length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>No approved faculty yet.</div>
        )}
        {data.faculties.filter(f => f.approved !== false).map(fac => {
          const assigned = data.facultySection.filter(fs => fs.facultyId === fac.id);
          return (
            <div key={fac.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <Av name={fac.name} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{fac.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {assigned.length > 0
                    ? assigned.map(a => { const c = data.courses.find(x => x.code === a.courseCode); return c?.name; }).filter(Boolean).join(", ")
                    : "No courses assigned"}
                </div>
              </div>
              <Bdg text={`${assigned.length} course${assigned.length !== 1 ? "s" : ""}`} color="var(--em)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}


// Admin Profile
function AdminProfile({ user }) {
  const [editing,setEditing] = useState(false);
  const [form,setForm]       = useState({name:"Administrator",email:"admin@college.edu",phone:"",institution:""});
  const [pw,setPw]           = useState({old:"",nw:"",conf:""});
  const [err,setErr]         = useState(""); const [ok,setOk] = useState("");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=()=>{setOk("Profile updated!");setEditing(false);};
  const changePw=()=>{
    if(!pw.old||!pw.nw) return setErr("Fill all fields");
    if(pw.nw!==pw.conf) return setErr("Passwords don't match");
    setOk("Password changed!"); setPw({old:"",nw:"",conf:""}); setErr("");
  };
  return (
    <div className="au">
      <PageHdr title="My Profile"/>
      <ProfileHero name={form.name} id="ADMIN" role="System Administrator" dept="Administration" editing={editing} onEdit={()=>setEditing(true)}/>
      {ok&&<div className="ok-box">{ok}</div>}
      {err&&<div className="err-box">{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontWeight:700}}>Personal Info</div>
            {!editing
              ?<Btn cn="btn-ghost" size="btn-sm" onClick={()=>setEditing(true)}>✏️ Edit</Btn>
              :<div style={{display:"flex",gap:8}}><Btn cn="btn-ghost" size="btn-sm" onClick={()=>setEditing(false)}>Cancel</Btn><Btn cn="btn-success" size="btn-sm" onClick={save}>Save</Btn></div>
            }
          </div>
          <Fi label="Full Name" value={form.name} onChange={v=>f("name",v)} disabled={!editing}/>
          <Fi label="Email" value={form.email} onChange={v=>f("email",v)} disabled={!editing}/>
          <Fi label="Phone" value={form.phone} onChange={v=>f("phone",v)} placeholder="Contact number" disabled={!editing}/>
          <Fi label="Institution" value={form.institution} onChange={v=>f("institution",v)} placeholder="Institution name" disabled={!editing}/>
        </div>
        <div className="card">
          <div style={{fontWeight:700,marginBottom:18}}>Change Password</div>
          <Fi label="Current Password" type="password" value={pw.old} onChange={v=>setPw(p=>({...p,old:v}))} placeholder="Current password"/>
          <Fi label="New Password"     type="password" value={pw.nw}  onChange={v=>setPw(p=>({...p,nw:v}))}  placeholder="New password"/>
          <Fi label="Confirm Password" type="password" value={pw.conf} onChange={v=>setPw(p=>({...p,conf:v}))} placeholder="Confirm new password"/>
          <Btn cn="btn-primary" full onClick={changePw}>Update Password</Btn>
        </div>
      </div>
    </div>
  );
}

// Admin Students
function AdminStudents({ data, refresh }) {
  const [showAdd,setShowAdd]         = useState(false);
  const [editStu,setEditStu]         = useState(null);
  const [confirmStu,setConfirmStu]   = useState(null); // confirmation step
  const [search,setSearch]           = useState("");
  const [fDept,setFDept]             = useState("");
  const [fSec,setFSec]               = useState("");
  const [form,setForm]               = useState({rollNo:"",name:"",email:"",dept:"CSE",section:"A"});
  const [newSection,setNewSection]   = useState("");
  const [err,setErr]                 = useState("");
  const [loading,setLoading]         = useState(false);
  const fset = (k,v) => setForm(p=>({...p,[k]:v}));

  const add = async () => {
    if(!form.rollNo||!form.name) return setErr("Roll No and Name required");
    setLoading(true);
    try {
      await api.addStudent(form); await refresh();
      setShowAdd(false); setForm({rollNo:"",name:"",email:"",dept:"CSE",section:"A"}); setErr("");
    } catch(e) { setErr(errMsg(e)); } finally { setLoading(false); }
  };

  // Step 1: open section selector
  const openChangeSection = (s) => {
    setEditStu(s); setNewSection(s.section); setConfirmStu(null);
  };

  // Step 2: show confirmation
  const askConfirm = () => {
    if(!newSection || newSection === editStu.section) return;
    setConfirmStu({ student: editStu, from: editStu.section, to: newSection });
  };

  // Step 3: actually apply
  const confirmChangeSection = async () => {
    try {
      await api.changeSection(confirmStu.student.rollNo, confirmStu.to);
      await refresh();
      setEditStu(null); setConfirmStu(null); setNewSection("");
    } catch(e) { setErr(errMsg(e)); }
  };

  const filtered = data.students.filter(s=>
    (!search||s.name.toLowerCase().includes(search.toLowerCase())||s.rollNo.includes(search))&&
    (!fDept||s.dept===fDept)&&(!fSec||s.section===fSec)
  );

  return (
    <div className="au">
      <PageHdr title="Students" sub={`${data.students.length} registered`}>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Student</Btn>
      </PageHdr>

      <div className="card" style={{marginBottom:18,padding:"14px 18px"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12,alignItems:"end"}}>
          <div className="fi-wrap">
            <span className="fi-ico">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or roll number…" className="fi fi-icon" style={{marginBottom:0}}/>
          </div>
          <select value={fDept} onChange={e=>setFDept(e.target.value)} className="fi fsel" style={{marginBottom:0,color:fDept?"var(--text)":"var(--muted)"}}>
            <option value="">All Depts</option>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
          </select>
          <select value={fSec} onChange={e=>setFSec(e.target.value)} className="fi fsel" style={{marginBottom:0,color:fSec?"var(--text)":"var(--muted)"}}>
            <option value="">All Sections</option>{SECTIONS.map(s=><option key={s} value={s}>Sec {s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:14}}>{filtered.length} students</div>
        <table className="tbl">
          <thead><tr><th>Roll No</th><th>Name</th><th>Email</th><th>Dept</th><th>Section</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s=>(
              <tr key={s.rollNo}>
                <td><Bdg text={s.rollNo} color="var(--blue)"/></td>
                <td><div style={{display:"flex",alignItems:"center",gap:8}}><Av name={s.name} size={28}/><span style={{fontWeight:500}}>{s.name}</span></div></td>
                <td style={{color:"var(--text2)",fontSize:13}}>{s.email||"—"}</td>
                <td><Bdg text={s.dept} color={colorOf(s.dept)}/></td>
                <td><Bdg text={`Sec ${s.section}`} color="var(--cyan)"/></td>
                <td>
                  <Btn cn="btn-amber" size="btn-sm" onClick={()=>openChangeSection(s)}>Change Section</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAdd&&(
        <Modal title="Add New Student" onClose={()=>{setShowAdd(false);setErr("");}}>
          {err&&<div className="err-box">{err}</div>}
          <div className="g2">
            <Fi label="Roll Number" value={form.rollNo} onChange={v=>fset("rollNo",v)} placeholder="e.g. 22CSE009" mono/>
            <Fi label="Full Name" value={form.name} onChange={v=>fset("name",v)} placeholder="Student name"/>
          </div>
          <Fi label="Email (optional)" type="email" value={form.email} onChange={v=>fset("email",v)} placeholder="student@email.com"/>
          <div className="g2">
            <Fs label="Department" value={form.dept} onChange={v=>fset("dept",v)} options={DEPARTMENTS}/>
            <Fs label="Section" value={form.section} onChange={v=>fset("section",v)} options={SECTIONS.map(s=>({value:s,label:`Section ${s}`}))}/>
          </div>
          <div className="info-box">🔑 Default password: <span style={{fontFamily:"var(--mono)",color:"var(--cyan)"}}>stu123</span></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn cn="btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={add} disabled={loading}>{loading?"Adding…":"Add Student"}</Btn>
          </div>
        </Modal>
      )}

      {/* Change Section – select new section */}
      {editStu&&!confirmStu&&(
        <Modal title="Change Section" sub={`${editStu.name} (${editStu.rollNo})`} onClose={()=>setEditStu(null)}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"var(--s2)",borderRadius:12,marginBottom:20}}>
            <Av name={editStu.name}/>
            <div>
              <div style={{fontWeight:600}}>{editStu.name}</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>{editStu.rollNo} · {editStu.dept}</div>
            </div>
            <div style={{marginLeft:"auto"}}><Bdg text={`Current: Sec ${editStu.section}`} color="var(--amber)"/></div>
          </div>
          <Fs label="New Section" value={newSection} onChange={setNewSection}
            options={SECTIONS.map(s=>({value:s,label:`Section ${s}`}))}/>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn cn="btn-ghost" onClick={()=>setEditStu(null)}>Cancel</Btn>
            <Btn cn="btn-success" onClick={askConfirm} disabled={!newSection||newSection===editStu.section}>Next →</Btn>
          </div>
        </Modal>
      )}

      {/* Confirmation popup */}
      {confirmStu&&(
        <Modal title="Confirm Section Change" onClose={()=>setConfirmStu(null)} width={420}>
          <div style={{textAlign:"center",padding:"10px 0 20px"}}>
            <div style={{fontSize:44,marginBottom:12}}>🔄</div>
            <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>Are you sure?</div>
            <div style={{fontSize:14,color:"var(--text2)",lineHeight:1.7}}>
              You are about to move<br/>
              <span style={{fontWeight:700,color:"var(--text)"}}>{confirmStu.student.name}</span><br/>
              from <Bdg text={`Section ${confirmStu.from}`} color="var(--rose)"/> to <Bdg text={`Section ${confirmStu.to}`} color="var(--em)"/>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn cn="btn-ghost" onClick={()=>setConfirmStu(null)}>Cancel</Btn>
            <Btn cn="btn-success" onClick={confirmChangeSection}>Yes, Change Section</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Admin Faculty
function AdminFaculty({ data, refresh }) {
  const [showAdd,setShowAdd]     = useState(false);
  const [confirmDel,setConfirmDel] = useState(null); // faculty to delete
  const [approvingId,setApprovingId] = useState(null);
  const [form,setForm]           = useState({id:"",name:"",email:"",dept:"CSE",password:""});
  const [err,setErr]             = useState("");
  const [loading,setLoading]     = useState(false);
  const fset=(k,v)=>setForm(p=>({...p,[k]:v}));

  const approve=async(id,val)=>{
    setApprovingId(id);
    try{
      await api.approveFaculty(id,val);
      await refresh();
    }
    catch(e){ setErr(errMsg(e)); }
    finally{ setApprovingId(null); }
  };

  const del=async()=>{
    if(!confirmDel) return;
    try{ await api.deleteFaculty(confirmDel.id); await refresh(); setConfirmDel(null); }
    catch(e){ alert(errMsg(e)); }
  };

  const add=async()=>{
    if(!form.id||!form.name||!form.password) return setErr("Employee ID, Name & Password required");
    setLoading(true);
    try{
      await api.addFaculty({...form,qualification:"",courseCode:"",approved:true});
      await refresh(); setShowAdd(false); setErr("");
      setForm({id:"",name:"",email:"",dept:"CSE",password:""});
    }catch(e){setErr(errMsg(e));}finally{setLoading(false);}
  };

  // approved===undefined means old seeded data without the field — treat as approved
  const pending  = data.faculties.filter(f=> f.approved === false);
  const approved = data.faculties.filter(f=> f.approved !== false);

  return (
    <div className="au">
      <PageHdr title="Faculty" sub={`${approved.length} active · ${pending.length} pending`}>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Faculty</Btn>
      </PageHdr>

      {err&&<div className="err-box" style={{marginBottom:12}}>{err}</div>}

      {pending.length>0&&(
        <div className="card" style={{marginBottom:18,border:"1px solid rgba(245,158,11,.2)"}}>
          <div style={{fontWeight:700,color:"var(--amber)",marginBottom:14}}>⏳ Pending Approvals</div>
          {pending.map(fac=>(
            <div key={fac.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid var(--border)"}}>
              <Av name={fac.name}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:500}}>{fac.name}</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>{fac.id} · {fac.email} · {fac.dept}</div>
                {fac.courseCode&&<div style={{fontSize:11,color:"var(--cyan)",marginTop:2}}>Requested: {fac.courseCode}</div>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn cn="btn-success" size="btn-sm"
                  disabled={approvingId===fac.id}
                  onClick={()=>approve(fac.id,true)}>
                  {approvingId===fac.id?"…":"✓ Approve"}
                </Btn>
                <Btn cn="btn-danger" size="btn-sm" onClick={()=>setConfirmDel(fac)}>✗ Reject</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <table className="tbl">
          <thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Courses</th><th>Action</th></tr></thead>
          <tbody>
            {approved.map(fac=>{
              const cnt=data.facultySection.filter(fs=>fs.facultyId===fac.id).length;
              return (
                <tr key={fac.id}>
                  <td><Bdg text={fac.id} color="var(--indigo)"/></td>
                  <td><div style={{display:"flex",alignItems:"center",gap:8}}><Av name={fac.name} size={28}/><span style={{fontWeight:500}}>{fac.name}</span></div></td>
                  <td style={{color:"var(--text2)",fontSize:13}}>{fac.email||"—"}</td>
                  <td><Bdg text={fac.dept} color={colorOf(fac.dept)}/></td>
                  <td><Bdg text={`${cnt} courses`} color="var(--em)"/></td>
                  <td><Btn cn="btn-danger" size="btn-sm" onClick={()=>setConfirmDel(fac)}>Remove</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd&&(
        <Modal title="Add Faculty Member" onClose={()=>{setShowAdd(false);setErr("");}}>
          {err&&<div className="err-box">{err}</div>}
          <div className="g2">
            <Fi label="Employee ID" value={form.id} onChange={v=>fset("id",v)} placeholder="e.g. FAC004" mono/>
            <Fi label="Full Name" value={form.name} onChange={v=>fset("name",v)} placeholder="Faculty name"/>
          </div>
          <Fi label="Email" type="email" value={form.email} onChange={v=>fset("email",v)} placeholder="faculty@college.edu"/>
          <div className="g2">
            <Fs label="Department" value={form.dept} onChange={v=>fset("dept",v)} options={DEPARTMENTS}/>
            <Fi label="Password" type="password" value={form.password} onChange={v=>fset("password",v)} placeholder="Set password"/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn cn="btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={add} disabled={loading}>{loading?"Adding…":"Add Faculty"}</Btn>
          </div>
        </Modal>
      )}

      {/* Delete / Reject confirmation popup */}
      {confirmDel&&(
        <Modal title="Confirm Removal" onClose={()=>setConfirmDel(null)} width={420}>
          <div style={{textAlign:"center",padding:"10px 0 20px"}}>
            <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
            <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>Are you sure?</div>
            <div style={{fontSize:14,color:"var(--text2)",lineHeight:1.8}}>
              You are about to remove faculty<br/>
              <span style={{fontWeight:700,color:"var(--text)"}}>{confirmDel.name}</span>
              <span style={{color:"var(--muted)"}}> ({confirmDel.id})</span>
              <br/>from the system. This cannot be undone.
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn cn="btn-ghost" onClick={()=>setConfirmDel(null)}>Cancel</Btn>
            <Btn cn="btn-danger" onClick={del}>Yes, Remove Faculty</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Admin Courses
function AdminCourses({ data, refresh }) {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({code:"",name:"",dept:"CSE",section:"A",credits:"3"});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const fset=(k,v)=>setForm(p=>({...p,[k]:v}));

  const add=async()=>{
    if(!form.code||!form.name) return setErr("Code and name required");
    setLoading(true);
    try{ await api.addCourse(form); await refresh(); setShowAdd(false); setErr(""); }
    catch(e){ setErr(errMsg(e)); }finally{ setLoading(false); }
  };
  const removeCourse=async code=>{
    try{ await api.deleteCourse(code); await refresh(); }
    catch(e){ alert(errMsg(e)); }
  };

  return (
    <div className="au">
      <PageHdr title="Courses" sub={`${data.courses.length} courses`}>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Course</Btn>
      </PageHdr>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {data.courses.map((c,i)=>{
          const fs=data.facultySection.find(x=>x.courseCode===c.code);
          const fac=fs?data.faculties.find(f=>f.id===fs.facultyId):null;
          const col=COLORS[i%COLORS.length];
          return (
            <div key={c.code} className="card" style={{position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${col},transparent)`}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <Bdg text={c.code} color={col}/>
                <Btn cn="btn-danger" size="btn-sm" onClick={()=>removeCourse(c.code)}>×</Btn>
              </div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{c.name}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                <Bdg text={c.dept} color={colorOf(c.dept)}/><Bdg text={`Sec ${c.section}`} color="var(--amber)"/><Bdg text={`${c.credits} Cr`} color="var(--muted)"/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--text2)",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                {fac?<><Av name={fac.name} size={22}/>{fac.name}</>:<span style={{color:"var(--muted)"}}>⚠️ No faculty assigned</span>}
              </div>
            </div>
          );
        })}
      </div>
      {showAdd&&(
        <Modal title="Add Course" onClose={()=>{setShowAdd(false);setErr("");}}>
          {err&&<div className="err-box">{err}</div>}
          <div className="g2">
            <Fi label="Course Code" value={form.code} onChange={v=>fset("code",v)} placeholder="e.g. CSE401" mono/>
            <Fi label="Course Name" value={form.name} onChange={v=>fset("name",v)} placeholder="e.g. Algorithms"/>
          </div>
          <div className="g3">
            <Fs label="Department" value={form.dept} onChange={v=>fset("dept",v)} options={DEPARTMENTS}/>
            <Fs label="Section" value={form.section} onChange={v=>fset("section",v)} options={SECTIONS.map(s=>({value:s,label:`Sec ${s}`}))}/>
            <Fs label="Credits" value={form.credits} onChange={v=>fset("credits",v)} options={["1","2","3","4","5"]}/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn cn="btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={add} disabled={loading}>{loading?"Adding…":"Add Course"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Admin Assign Faculty
function AdminAssign({ data, refresh }) {
  const [fDept,setFDept]=useState("");
  const [fSec,setFSec]=useState("");
  const [showAssign,setShowAssign]=useState(null);
  const [selFac,setSelFac]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const assign=async()=>{
    if(!selFac) return setErr("Select a faculty member");
    setLoading(true); setErr("");
    try{
      // server.js POST /api/assignments already removes existing assignment then creates new
      await api.assign(selFac, showAssign);
      await refresh();
      setShowAssign(null); setSelFac(""); setErr("");
    }catch(e){ setErr(errMsg(e)); }
    finally{ setLoading(false); }
  };
  const removeAssign=async code=>{
    try{ await api.removeAssign(code); await refresh(); }
    catch(e){ alert(errMsg(e)); }
  };

  const filtered=data.courses.filter(c=>(!fDept||c.dept===fDept)&&(!fSec||c.section===fSec));

  return (
    <div className="au">
      <PageHdr title="Assign Faculty to Sections" sub="Map faculty to courses"/>
      <div className="card" style={{marginBottom:18,padding:"14px 18px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <select value={fDept} onChange={e=>setFDept(e.target.value)} className="fi fsel" style={{marginBottom:0,color:fDept?"var(--text)":"var(--muted)"}}>
            <option value="">All Departments</option>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
          </select>
          <select value={fSec} onChange={e=>setFSec(e.target.value)} className="fi fsel" style={{marginBottom:0,color:fSec?"var(--text)":"var(--muted)"}}>
            <option value="">All Sections</option>{SECTIONS.map(s=><option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gap:10}}>
        {filtered.map((c,i)=>{
          const fs=data.facultySection.find(x=>x.courseCode===c.code);
          const fac=fs?data.faculties.find(f=>f.id===fs.facultyId):null;
          const col=COLORS[i%COLORS.length];
          return (
            <div key={c.code} className="card" style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px"}}>
              <div style={{width:52,height:52,background:col+"18",border:`1px solid ${col}33`,borderRadius:12,
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:10,color:col,fontFamily:"var(--mono)",textAlign:"center",padding:4,flexShrink:0}}>
                {c.code}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{c.name}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Bdg text={c.dept} color={colorOf(c.dept)}/><Bdg text={`Sec ${c.section}`} color="var(--amber)"/>
                  <Bdg text={`${c.credits} Credits`} color="var(--muted)"/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {fac?(
                  <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--s2)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 14px"}}>
                    <Av name={fac.name} size={26}/>
                    <div><div style={{fontSize:13,fontWeight:600}}>{fac.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{fac.id}</div></div>
                  </div>
                ):(
                  <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"8px 14px",fontSize:13,color:"var(--amber)"}}>⚠️ Unassigned</div>
                )}
                <Btn cn={fac?"btn-ghost":"btn-primary"} size="btn-sm" onClick={()=>{setShowAssign(c.code);setSelFac(fs?.facultyId||"");}}>{fac?"Change":"Assign"}</Btn>
                {fac&&<Btn cn="btn-danger" size="btn-sm" onClick={()=>removeAssign(c.code)}>Remove</Btn>}
              </div>
            </div>
          );
        })}
      </div>
      {showAssign&&(
        <Modal title="Assign Faculty" sub={`${showAssign} – ${data.courses.find(c=>c.code===showAssign)?.name}`} onClose={()=>{setShowAssign(null);setErr("");}}>
          {err&&<div className="err-box">{err}</div>}
          <Fs label="Faculty Member" value={selFac} onChange={setSelFac} placeholder="Choose faculty…"
            options={data.faculties.filter(f => f.approved !== false).map(f=>({value:f.id,label:`${f.name} (${f.id}) · ${f.dept}`}))}/>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn cn="btn-ghost" onClick={()=>setShowAssign(null)}>Cancel</Btn>
            <Btn onClick={assign} disabled={loading}>{loading?"Assigning…":"Assign"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FACULTY PORTAL
// ═══════════════════════════════════════════════════════════════════
function FacultyPortal({ data, refresh, user, onLogout }) {
  const [nav,setNav]           = useState("dashboard");
  const [userData,setUserData] = useState({...user});
  const items=[
    {sec:"Overview"},{id:"dashboard",icon:"⊞",label:"Dashboard"},
    {sec:"Attendance"},{id:"mark",icon:"✅",label:"Mark Attendance"},{id:"sessions",icon:"📋",label:"My Sessions"},
    {sec:"Students"},{id:"students",icon:"👥",label:"Student Roster"},
    {sec:"Account"},{id:"profile",icon:"👤",label:"Profile"},
  ];
  const myCourses=data.facultySection.filter(fs=>fs.facultyId===userData.id).map(fs=>data.courses.find(c=>c.code===fs.courseCode)).filter(Boolean);
  return (
    <div className="shell">
      <Sidebar user={userData} nav={nav} setNav={setNav} items={items} onLogout={onLogout}/>
      <main className="main">
        {nav==="dashboard"&&<FacultyDash    data={data} user={userData} myCourses={myCourses}/>}
        {nav==="mark"     &&<FacultyMark    data={data} refresh={refresh} user={userData} myCourses={myCourses}/>}
        {nav==="sessions" &&<FacultySessions data={data} user={userData} myCourses={myCourses}/>}
        {nav==="students" &&<FacultyStudents data={data} user={userData} myCourses={myCourses}/>}
        {nav==="profile"  &&<FacultyProfile  data={data} refresh={refresh} user={userData} setUser={setUserData}/>}
      </main>
    </div>
  );
}

// Faculty Dashboard
function FacultyDash({ data, user, myCourses }) {
  const mySess = data.attendance.filter(a => a.facultyId === user.id);

  // ── Course-wise attendance pie chart ─────────────────────────────
  const pieColors = ["#3b82f6","#6366f1","#06b6d4","#8b5cf6","#ec4899","#f59e0b","#10b981","#f43f5e"];
  const courseChartData = myCourses.map((c, i) => {
    const recs  = mySess.filter(a => a.courseCode === c.code).flatMap(a => a.records);
    const p     = recs.filter(r => r.status === "present").length;
    const value = recs.length ? Math.round(p / recs.length * 100) : 0;
    return { label: `${c.code} (Sec ${c.section})`, value, color: pieColors[i % pieColors.length] };
  });

  return (
    <div className="au">
      <PageHdr title={`Welcome, ${user.name.split(" ")[0]}! 👋`} sub={`${user.id} · ${user.dept}`} />
      <div className="g2" style={{ marginBottom: 22 }}>
        <StatCard label="My Courses" value={myCourses.length} icon="📚" color="var(--blue)"   sc={1} />
        <StatCard label="Sessions"   value={mySess.length}   icon="✅" color="var(--indigo)" sc={2} />
      </div>

      {/* Course-wise pie chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>📚 Course-wise Attendance</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Attendance % for each of your courses</div>
        {courseChartData.length === 0
          ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No courses assigned yet</div>
          : <PieChart data={courseChartData} size={230} />}
      </div>

      {/* Assigned Courses list */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Assigned Courses</div>
        {myCourses.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>No courses assigned yet.</div>}
        {myCourses.map((c, i) => {
          const cnt = data.students.filter(s => s.dept === c.dept && s.section === c.section).length;
          const col = COLORS[i % COLORS.length];
          return (
            <div key={c.code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 44, height: 44, background: col + "18", border: `1px solid ${col}33`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 10, color: col, fontFamily: "var(--mono)", textAlign: "center", padding: 4, flexShrink: 0 }}>{c.code}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                  <Bdg text={c.dept} color={colorOf(c.dept)} /><Bdg text={`Sec ${c.section}`} color="var(--amber)" /><Bdg text={`${c.credits} Cr`} color="var(--muted)" />
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{cnt} students</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// Faculty Mark Attendance — new flow: passout year → dept → section → courses list → pick course + slot
function FacultyMark({ data, refresh, user, myCourses }) {
  const [step,setStep]         = useState(1);
  const [selYear,setSelYear]   = useState("");
  const [selDept,setSelDept]   = useState("");
  const [selSec,setSelSec]     = useState("");
  const [selCourse,setSelCourse] = useState("");
  const [selDate,setSelDate]   = useState(new Date().toISOString().split("T")[0]);
  const [selSlot,setSelSlot]   = useState("");
  const [records,setRecords]   = useState({});
  const [saved,setSaved]       = useState(false);
  const [err,setErr]           = useState("");
  const [loading,setLoading]   = useState(false);

  // Courses matching selected dept+section that faculty is assigned to
  const sectionCourses = myCourses.filter(c=>
    (!selDept || c.dept===selDept) && (!selSec || c.section===selSec)
  );

  const course   = data.courses.find(c=>c.code===selCourse);
  const enrolled = course ? data.students.filter(s=>s.dept===course.dept && s.section===course.section) : [];

  const proceed = () => {
    if(!selYear||!selDept||!selSec) return setErr("Select year, department and section");
    if(!selCourse) return setErr("Select a course");
    if(!selSlot)   return setErr("Select a time slot");
    if(!selDate)   return setErr("Select a date");

    // Conflict: any faculty already marked for same course+date+slot
    const conflict = data.attendance.find(a=>a.courseCode===selCourse&&a.date===selDate&&a.slot===selSlot);
    if(conflict){
      const takenBy=data.faculties.find(f=>f.id===conflict.facultyId);
      return setErr(`Attendance already posted for this slot by ${takenBy?.name||"another faculty"}`);
    }
    const init={}; enrolled.forEach(s=>{init[s.rollNo]="present";});
    setRecords(init); setErr(""); setStep(2);
  };

  const toggle=rollNo=>{
    setRecords(p=>({...p,[rollNo]:p[rollNo]==="present"?"absent":"present"}));
  };

  const save=async()=>{
    setLoading(true); setErr("");
    try{
      await api.postAttendance({
        courseCode:selCourse, date:selDate, slot:selSlot, facultyId:user.id,
        records:enrolled.map(s=>({rollNo:s.rollNo,status:records[s.rollNo]||"present"}))
      });
      await refresh(); setSaved(true);
    }catch(e){ setErr(errMsg(e)); }finally{ setLoading(false); }
  };

  const reset=()=>{
    setStep(1);setSelYear("");setSelDept("");setSelSec("");
    setSelCourse("");setSelSlot("");setRecords({});setSaved(false);setErr("");
  };

  const presentCount=Object.values(records).filter(v=>v==="present").length;
  const absentCount =Object.values(records).filter(v=>v==="absent").length;

  if(saved) return (
    <div className="au" style={{textAlign:"center",paddingTop:60}}>
      <div style={{fontSize:72,marginBottom:16}}>✅</div>
      <div style={{fontWeight:800,fontSize:28,marginBottom:8}}>Attendance Saved!</div>
      <div style={{color:"var(--text2)",marginBottom:8}}>{course?.name} · {selDate} · {selSlot}</div>
      <div style={{display:"flex",justifyContent:"center",gap:28,marginBottom:32}}>
        {[{l:"Present",v:presentCount,c:"var(--em)"},{l:"Absent",v:absentCount,c:"var(--rose)"}].map(x=>(
          <div key={x.l} style={{textAlign:"center"}}><div style={{fontWeight:800,fontSize:30,color:x.c}}>{x.v}</div><div style={{fontSize:12,color:"var(--muted)"}}>{x.l}</div></div>
        ))}
      </div>
      <Btn onClick={reset}>Mark Another</Btn>
    </div>
  );

  return (
    <div className="au">
      <PageHdr title="Mark Attendance" sub="Step 1: Select class details"/>

      {/* Stepper */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:26}}>
        {["Select Class","Mark Students"].map((label,i)=>{
          const s=i+1; const active=step>=s;
          return (
            <div key={s} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,background:active?"var(--blue)":"var(--s2)",color:active?"#fff":"var(--muted)",border:active?"none":"1px solid var(--border)",transition:"all .2s"}}>{s}</div>
              <span style={{fontSize:13,fontWeight:step===s?700:400,color:step===s?"var(--text)":"var(--muted)"}}>{label}</span>
              {i<1&&<div style={{width:36,height:1,background:"var(--border)",margin:"0 4px"}}/>}
            </div>
          );
        })}
      </div>

      {step===1&&(
        <div className="card" style={{maxWidth:580}}>
          {err&&<div className="err-box">{err}</div>}

          {/* Row 1: Year + Dept + Section */}
          <div className="g3">
            <Fs label="Passout Year" value={selYear} onChange={v=>{setSelYear(v);setSelCourse("");}}
              placeholder="Select year" options={PASSOUT_YEARS}/>
            <Fs label="Department" value={selDept} onChange={v=>{setSelDept(v);setSelCourse("");}}
              placeholder="Select dept" options={DEPARTMENTS}/>
            <Fs label="Section" value={selSec} onChange={v=>{setSelSec(v);setSelCourse("");}}
              placeholder="Select section" options={SECTIONS.map(s=>({value:s,label:`Section ${s}`}))}/>
          </div>

          {/* Courses for selected dept+section that faculty handles */}
          {selDept&&selSec&&(
            <>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text2)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>
                Courses for {selDept} — Section {selSec}
              </div>
              {sectionCourses.length===0?(
                <div className="warn-box">No courses assigned to you for this section.</div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:16}}>
                  {sectionCourses.map((c,i)=>{
                    const col=COLORS[i%COLORS.length];
                    const isSelected=selCourse===c.code;
                    return (
                      <div key={c.code} onClick={()=>setSelCourse(c.code)}
                        style={{padding:"13px 16px",borderRadius:12,cursor:"pointer",transition:"all .15s",
                          background:isSelected?"rgba(59,130,246,.1)":"var(--s2)",
                          border:`1.5px solid ${isSelected?"var(--blue)":"var(--border)"}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <Bdg text={c.code} color={col}/>
                          {isSelected&&<span style={{marginLeft:"auto",color:"var(--blue)",fontSize:16}}>✓</span>}
                        </div>
                        <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                        <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{c.credits} credits</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Date + Slot */}
          <div className="g2">
            <Fi label="Date" type="date" value={selDate} onChange={setSelDate}/>
            <Fs label="Time Slot" value={selSlot} onChange={setSelSlot} placeholder="Select period"
              options={TIME_SLOTS.map(t=>({value:t,label:t}))}/>
          </div>

          {/* Booked slots warning */}
          {selCourse&&selDate&&(()=>{
            const booked=data.attendance.filter(a=>a.courseCode===selCourse&&a.date===selDate);
            if(!booked.length) return null;
            return <div className="warn-box">
              ⚠️ Already posted: {booked.map(b=>{const f=data.faculties.find(x=>x.id===b.facultyId);return `${b.slot} (by ${f?.name||b.facultyId})`;}).join(", ")}
            </div>;
          })()}

          {enrolled.length>0&&selCourse&&(
            <div className="info-box">📋 {enrolled.length} students will be marked for this session</div>
          )}

          <Btn full onClick={proceed}>Continue →</Btn>
        </div>
      )}

      {step===2&&(
        <>
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{course?.name} <Bdg text={selCourse} color="var(--blue)"/></div>
                <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>
                  {selDept} · Sec {selSec} · {selDate} · {selSlot}
                </div>
              </div>
              <div style={{display:"flex",gap:20}}>
                {[{l:"Present",v:presentCount,c:"var(--em)"},{l:"Absent",v:absentCount,c:"var(--rose)"}].map(x=>(
                  <div key={x.l} style={{textAlign:"center"}}><div style={{fontWeight:800,fontSize:24,color:x.c}}>{x.v}</div><div style={{fontSize:11,color:"var(--muted)"}}>{x.l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn cn="btn-ghost" size="btn-sm" onClick={()=>{const r={};enrolled.forEach(s=>{r[s.rollNo]="present";});setRecords(r);}}>All Present</Btn>
                <Btn cn="btn-ghost" size="btn-sm" onClick={()=>{const r={};enrolled.forEach(s=>{r[s.rollNo]="absent";});setRecords(r);}}>All Absent</Btn>
              </div>
            </div>
          </div>

          {err&&<div className="err-box">{err}</div>}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10,marginBottom:18}}>
            {enrolled.map(s=>{
              const st=records[s.rollNo]||"present";
              const isPresent=st==="present";
              return (
                <div key={s.rollNo} onClick={()=>toggle(s.rollNo)}
                  style={{display:"flex",alignItems:"center",gap:11,padding:13,borderRadius:12,cursor:"pointer",transition:"all .15s",userSelect:"none",
                    background:isPresent?"rgba(16,185,129,.08)":"rgba(244,63,94,.08)",
                    border:`1px solid ${isPresent?"rgba(16,185,129,.25)":"rgba(244,63,94,.25)"}`}}>
                  <Av name={s.name} size={36}/>
                  <div style={{flex:1,overflow:"hidden"}}>
                    <div style={{fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                    <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"}}>{s.rollNo}</div>
                  </div>
                  <Pill status={st}/>
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn cn="btn-ghost" onClick={()=>setStep(1)}>← Back</Btn>
            <Btn cn="btn-success" onClick={save} disabled={loading}>{loading?"Saving…":"💾 Save Attendance"}</Btn>
          </div>
        </>
      )}
    </div>
  );
}

// Faculty Sessions
function FacultySessions({ data, user, myCourses }) {
  const [fc,setFc]=useState("");
  const sessions=data.attendance.filter(a=>a.facultyId===user.id&&(!fc||a.courseCode===fc));
  return (
    <div className="au">
      <PageHdr title="My Sessions" sub={`${sessions.length} sessions recorded`}/>
      <div className="card">
        <select value={fc} onChange={e=>setFc(e.target.value)} className="fi fsel" style={{maxWidth:340,marginBottom:20,color:fc?"var(--text)":"var(--muted)"}}>
          <option value="">All My Courses</option>{myCourses.map(c=><option key={c.code} value={c.code}>{c.code} – {c.name}</option>)}
        </select>
        {sessions.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No sessions recorded yet.</div>}
        {[...sessions].reverse().map(a=>{
          const c=data.courses.find(x=>x.code===a.courseCode);
          const p=a.records.filter(r=>r.status==="present").length;
          const rate=a.records.length?Math.round(p/a.records.length*100):0;
          return (
            <div key={a.id||a._id} style={{marginBottom:12,border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <span style={{fontWeight:600}}>{c?.name}</span>
                  <span style={{marginLeft:8}}><Bdg text={a.courseCode} color="var(--blue)"/></span>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>{a.date} · {a.slot}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,fontSize:20,color:rate>=75?"var(--em)":"var(--rose)"}}>{rate}%</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{p}/{a.records.length}</div>
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {a.records.map(r=>{
                  const st=data.students.find(s=>s.rollNo===r.rollNo);
                  const col=r.status==="present"?"var(--em)":"var(--rose)";
                  return <span key={r.rollNo} style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:col+"18",color:col}}>{st?.name?.split(" ")[0]||r.rollNo}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Faculty Student Roster
function FacultyStudents({ data, user, myCourses }) {
  const [selCourse,setSelCourse]=useState(myCourses[0]?.code||"");
  const course=data.courses.find(c=>c.code===selCourse);
  const enrolled=course?data.students.filter(s=>s.dept===course.dept&&s.section===course.section):[];
  // Only sessions for this faculty's course
  const courseSessions=data.attendance.filter(a=>a.courseCode===selCourse&&a.facultyId===user.id);

  return (
    <div className="au">
      <PageHdr title="Student Roster" sub="Attendance by course"/>
      <div className="card" style={{marginBottom:20,padding:"14px 18px"}}>
        <Fs label="" value={selCourse} onChange={setSelCourse} placeholder="Select course"
          options={myCourses.map(c=>({value:c.code,label:`${c.code} — ${c.name} (Sec ${c.section})`}))}/>
        {course&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:-8}}>
          <Bdg text={course.dept} color={colorOf(course.dept)}/>
          <Bdg text={`Section ${course.section}`} color="var(--amber)"/>
          <Bdg text={`${enrolled.length} enrolled`} color="var(--em)"/>
          <Bdg text={`${courseSessions.length} sessions`} color="var(--indigo)"/>
        </div>}
      </div>

      {!selCourse&&(
        <div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Select a course to view student attendance.</div>
      )}

      {selCourse&&enrolled.length===0&&(
        <div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>No students enrolled in this section.</div>
      )}

      {enrolled.length>0&&(
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Classes Attended</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map((s,idx)=>{
                const recs=courseSessions.flatMap(a=>a.records.filter(r=>r.rollNo===s.rollNo));
                const p=recs.filter(r=>r.status==="present").length;
                const rate=recs.length?Math.round(p/recs.length*100):null;
                const col=rate===null?"var(--muted)":rate>=85?"var(--em)":rate>=75?"var(--amber)":"var(--rose)";
                return (
                  <tr key={s.rollNo}>
                    <td style={{color:"var(--muted)",fontSize:12,width:36}}>{idx+1}</td>
                    <td><Bdg text={s.rollNo} color="var(--blue)"/></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Av name={s.name} size={30}/>
                        <span style={{fontWeight:600,fontSize:14}}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{color:"var(--text2)",fontSize:13}}>
                      {recs.length?`${p} / ${recs.length}`:"—"}
                    </td>
                    <td>
                      {rate!==null?(
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:80,height:6,background:"var(--s2)",borderRadius:99,overflow:"hidden"}}>
                            <div style={{height:"100%",width:rate+"%",background:col,borderRadius:99}}/>
                          </div>
                          <span style={{fontWeight:700,color:col,fontSize:14}}>{rate}%</span>
                        </div>
                      ):<span style={{color:"var(--muted)",fontSize:13}}>No data</span>}
                    </td>
                    <td>
                      <Bdg
                        text={rate===null?"No data":rate>=75?"✓ Eligible":"⚠ Low Alert"}
                        color={rate===null?"var(--muted)":rate>=75?"var(--em)":"var(--rose)"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Faculty Profile
function FacultyProfile({ data, refresh, user, setUser }) {
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({name:user.name,email:user.email||"",phone:user.phone||"",qualification:user.qualification||"",dept:user.dept});
  const [pw,setPw]=useState({old:"",nw:"",conf:""});
  const [err,setErr]=useState(""); const [ok,setOk]=useState("");
  const [loading,setLoading]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const save=async()=>{
    setLoading(true);
    try{
      const res=await api.updateFaculty(user.id,form);
      setUser(p=>({...p,...res.data})); setOk("Profile updated!"); setEditing(false);
    }catch(e){setErr(errMsg(e));}finally{setLoading(false);}
  };
  const changePw=async()=>{
    if(!pw.old||!pw.nw) return setErr("Fill all fields");
    if(pw.nw!==pw.conf) return setErr("Passwords don't match");
    setLoading(true);
    try{
      await api.facultyPw(user.id,pw.old,pw.nw);
      setOk("Password changed!"); setPw({old:"",nw:"",conf:""}); setErr("");
    }catch(e){setErr(errMsg(e));}finally{setLoading(false);}
  };

  const myCourses=data.facultySection.filter(fs=>fs.facultyId===user.id).map(fs=>data.courses.find(c=>c.code===fs.courseCode)).filter(Boolean);

  return (
    <div className="au">
      <PageHdr title="My Profile"/>
      <ProfileHero name={form.name} id={user.id} role="Faculty" dept={form.dept} editing={editing} onEdit={()=>setEditing(true)}/>
      {ok&&<div className="ok-box">{ok}</div>}
      {err&&<div className="err-box">{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontWeight:700}}>Personal Info</div>
            {!editing
              ?<Btn cn="btn-ghost" size="btn-sm" onClick={()=>setEditing(true)}>✏️ Edit</Btn>
              :<div style={{display:"flex",gap:8}}><Btn cn="btn-ghost" size="btn-sm" onClick={()=>setEditing(false)}>Cancel</Btn><Btn cn="btn-success" size="btn-sm" onClick={save} disabled={loading}>{loading?"Saving…":"Save"}</Btn></div>
            }
          </div>
          <Fi label="Full Name" value={form.name} onChange={v=>f("name",v)} disabled={!editing}/>
          <Fi label="Email" type="email" value={form.email} onChange={v=>f("email",v)} disabled={!editing} placeholder="email@college.edu"/>
          <Fi label="Phone" value={form.phone} onChange={v=>f("phone",v)} disabled={!editing} placeholder="Contact number"/>
          <Fi label="Qualification" value={form.qualification} onChange={v=>f("qualification",v)} disabled={!editing} placeholder="e.g. Ph.D Computer Science"/>
          <Fs label="Department" value={form.dept} onChange={v=>f("dept",v)} options={DEPARTMENTS} disabled={!editing}/>
        </div>
        <div className="card">
          <div style={{fontWeight:700,marginBottom:18}}>Change Password</div>
          <Fi label="Current Password" type="password" value={pw.old} onChange={v=>setPw(p=>({...p,old:v}))} placeholder="Current password"/>
          <Fi label="New Password"     type="password" value={pw.nw}  onChange={v=>setPw(p=>({...p,nw:v}))}  placeholder="New password"/>
          <Fi label="Confirm Password" type="password" value={pw.conf} onChange={v=>setPw(p=>({...p,conf:v}))} placeholder="Confirm new password"/>
          <Btn cn="btn-primary" full onClick={changePw} disabled={loading}>{loading?"Updating…":"Update Password"}</Btn>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:700,marginBottom:14}}>My Assigned Courses</div>
        {myCourses.length===0&&<div style={{color:"var(--muted)",fontSize:13}}>No courses assigned yet.</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12}}>
          {myCourses.map((c,i)=>{
            const col=COLORS[i%COLORS.length];
            const cnt=data.students.filter(s=>s.dept===c.dept&&s.section===c.section).length;
            return (
              <div key={c.code} style={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:12,padding:14,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${col},transparent)`}}/>
                <Bdg text={c.code} color={col}/>
                <div style={{fontWeight:700,fontSize:14,margin:"8px 0 6px"}}>{c.name}</div>
                <div style={{display:"flex",gap:6}}><Bdg text={c.dept} color={colorOf(c.dept)}/><Bdg text={`Sec ${c.section}`} color="var(--amber)"/></div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:8}}>{cnt} students · {c.credits} credits</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STUDENT PORTAL
// ═══════════════════════════════════════════════════════════════════
function StudentPortal({ data, user, onLogout }) {
  const [nav,setNav]=useState("dashboard");
  const [userData,setUserData]=useState({...user});
  const items=[
    {sec:"Overview"},{id:"dashboard",icon:"⊞",label:"Dashboard"},
    {sec:"Academics"},{id:"attendance",icon:"📊",label:"My Attendance"},
    {sec:"Account"},{id:"profile",icon:"👤",label:"Profile"},
  ];
  const myCourses=data.courses.filter(c=>c.dept===userData.dept&&c.section===userData.section);
  return (
    <div className="shell">
      <Sidebar user={{...userData,id:userData.rollNo}} nav={nav} setNav={setNav} items={items} onLogout={onLogout}/>
      <main className="main">
        {nav==="dashboard" &&<StudentDash    data={data} user={userData} myCourses={myCourses}/>}
        {nav==="attendance"&&<StudentAtt     data={data} user={userData} myCourses={myCourses}/>}
        {nav==="profile"   &&<StudentProfile data={data} user={userData} setUser={setUserData}/>}
      </main>
    </div>
  );
}

function StudentDash({ data, user, myCourses }) {
  const all=data.attendance.flatMap(a=>a.records.filter(r=>r.rollNo===user.rollNo));
  const rate=all.length?Math.round(all.filter(r=>r.status==="present").length/all.length*100):0;
  const rateCol=rate>=85?"var(--em)":rate>=75?"var(--amber)":"var(--rose)";
  const low=myCourses.filter(c=>{
    const recs=data.attendance.filter(a=>a.courseCode===c.code).flatMap(a=>a.records.filter(r=>r.rollNo===user.rollNo));
    return recs.length>0&&Math.round(recs.filter(r=>r.status==="present").length/recs.length*100)<75;
  });
  return (
    <div className="au">
      <div style={{marginBottom:24}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.03em"}}>Hello, {user.name.split(" ")[0]}! 👋</h1>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:10}}>
          <Bdg text={user.rollNo} color="var(--blue)"/><Bdg text={user.dept} color={colorOf(user.dept)}/><Bdg text={`Sec ${user.section}`} color="var(--amber)"/>
        </div>
      </div>
      <div className="g2" style={{marginBottom:22}}>
        <StatCard label="Attendance"  value={rate+"%"}   icon="📊" color={rateCol} sub={`${all.filter(r=>r.status==="present").length}/${all.length} classes`} sc={1}/>
        <StatCard label="Low Alerts"  value={low.length} icon="⚠️" color={low.length>0?"var(--rose)":"var(--em)"} sub={low.length>0?`${low.length} below 75%`:"All good"} sc={5}/>
      </div>
      {low.length>0&&(
        <div className="card" style={{marginBottom:20,border:"1px solid rgba(244,63,94,.2)"}}>
          <div style={{fontWeight:700,color:"var(--rose)",marginBottom:12}}>⚠️ Attendance Warning</div>
          {low.map(c=>{
            const recs=data.attendance.filter(a=>a.courseCode===c.code).flatMap(a=>a.records.filter(r=>r.rollNo===user.rollNo));
            const r=recs.length?Math.round(recs.filter(x=>x.status==="present").length/recs.length*100):0;
            return <div key={c.code} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:14}}>
              <span>{c.name}</span><span style={{color:"var(--rose)",fontWeight:700}}>{r}%</span>
            </div>;
          })}
        </div>
      )}
      <div className="card">
        <div style={{fontWeight:700,marginBottom:14}}>Course-wise Attendance</div>
        {myCourses.map((c,i)=>{
          const sessions=data.attendance.filter(a=>a.courseCode===c.code);
          const recs=sessions.flatMap(a=>a.records.filter(r=>r.rollNo===user.rollNo));
          const p=recs.filter(r=>r.status==="present").length;
          const r=recs.length?Math.round(p/recs.length*100):0;
          const col=r>=85?"var(--em)":r>=75?"var(--amber)":"var(--rose)";
          const fs=data.facultySection.find(x=>x.courseCode===c.code);
          const fac=fs?data.faculties.find(f=>f.id===fs.facultyId):null;
          return (
            <div key={c.code} style={{marginBottom:14,padding:"12px 14px",background:"var(--s2)",borderRadius:11,border:"1px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{c.name} <span style={{marginLeft:4}}><Bdg text={c.code} color={COLORS[i%COLORS.length]}/></span></div>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>{fac?`Prof. ${fac.name.split(" ").slice(-1)[0]}`:"No faculty"} · {sessions.length} sessions</div>
                </div>
                <div style={{fontWeight:800,fontSize:26,color:recs.length?col:"var(--muted)"}}>{recs.length?r+"%":"—"}</div>
              </div>
              <div style={{height:5,background:"var(--s1)",borderRadius:99,overflow:"hidden",marginBottom:5}}>
                <div style={{height:"100%",width:(recs.length?r:0)+"%",background:col,borderRadius:99}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)"}}>
                <span>{p}/{recs.length} classes attended</span>
                <span style={{color:recs.length?col:"var(--muted)",fontWeight:600}}>{recs.length?(r>=75?"✓ Eligible":"✗ Below threshold"):"No data"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentAtt({ data, user, myCourses }) {
  const [fc,setFc]=useState("");

  // Get ALL attendance records for this student across all sessions
  const allCourseCodes = [...new Set(
    data.attendance
      .filter(a => a.records.some(r => r.rollNo === user.rollNo))
      .map(a => a.courseCode)
  )];

  // Build list of (course, session, status) for this student
  const logs = data.attendance
    .filter(a => !fc || a.courseCode === fc)
    .map(a => {
      const rec = a.records.find(r => r.rollNo === user.rollNo);
      if (!rec) return null;
      const c = data.courses.find(x => x.code === a.courseCode);
      return { ...rec, code: a.courseCode, cname: c?.name || a.courseCode, date: a.date, slot: a.slot };
    })
    .filter(Boolean);

  // Per-course summary
  const courseSummary = allCourseCodes.map(code => {
    const c = data.courses.find(x => x.code === code);
    const recs = data.attendance
      .filter(a => a.courseCode === code)
      .map(a => a.records.find(r => r.rollNo === user.rollNo))
      .filter(Boolean);
    const p = recs.filter(r => r.status === "present").length;
    const rate = recs.length ? Math.round(p / recs.length * 100) : 0;
    const col = rate >= 85 ? "var(--em)" : rate >= 75 ? "var(--amber)" : "var(--rose)";
    return { code, name: c?.name || code, total: recs.length, present: p, rate, col };
  });

  // Dropdown courses = union of myCourses + courses found in attendance
  const dropdownCourses = [...new Map([
    ...myCourses.map(c => [c.code, c]),
    ...allCourseCodes.map(code => {
      const c = data.courses.find(x => x.code === code);
      return [code, c || { code, name: code }];
    })
  ].filter(([,c])=>c)).values()];

  return (
    <div className="au">
      <PageHdr title="My Attendance" sub="Detailed attendance records"/>

      {/* Per-course summary cards */}
      {courseSummary.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
          {courseSummary.map((cs,i)=>(
            <div key={cs.code} className="card" style={{padding:"14px 16px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:COLORS[i%COLORS.length]}}/>
              <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{cs.name}</div>
              <Bdg text={cs.code} color={COLORS[i%COLORS.length]}/>
              <div style={{marginTop:10,fontWeight:800,fontSize:26,color:cs.col}}>{cs.rate}%</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{cs.present}/{cs.total} classes</div>
              <div style={{marginTop:8,height:4,background:"var(--s2)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:cs.rate+"%",background:cs.col,borderRadius:99}}/>
              </div>
              <div style={{marginTop:6,fontSize:11,fontWeight:600,color:cs.rate>=75?"var(--em)":"var(--rose)"}}>
                {cs.rate>=75?"✓ Eligible":"⚠ Below 75%"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed log */}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>Session Log</div>
          <select value={fc} onChange={e=>setFc(e.target.value)} className="fi fsel"
            style={{maxWidth:260,marginBottom:0,color:fc?"var(--text)":"var(--muted)"}}>
            <option value="">All Courses</option>
            {dropdownCourses.map(c=><option key={c.code} value={c.code}>{c.code} – {c.name||c.code}</option>)}
          </select>
        </div>
        {logs.length===0 && (
          <div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>
            {fc ? "No records for this course." : "No attendance records found."}
          </div>
        )}
        {logs.length>0&&(
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>Course</th><th>Time Slot</th><th>Status</th></tr>
            </thead>
            <tbody>
              {[...logs].sort((a,b)=>b.date.localeCompare(a.date)).map((l,i)=>(
                <tr key={i}>
                  <td style={{fontFamily:"var(--mono)",fontSize:12}}>{l.date}</td>
                  <td>
                    <div style={{fontWeight:500}}>{l.cname}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{l.code}</div>
                  </td>
                  <td style={{color:"var(--text2)",fontSize:13}}>{l.slot}</td>
                  <td><Pill status={l.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StudentProfile({ data, user, setUser }) {
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({name:user.name,email:user.email||"",phone:user.phone||""});
  const [pw,setPw]=useState({old:"",nw:"",conf:""});
  const [err,setErr]=useState(""); const [ok,setOk]=useState("");
  const [loading,setLoading]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const save=async()=>{
    setLoading(true);
    try{
      const res=await api.updateStudent(user.rollNo,form);
      setUser(p=>({...p,...res.data})); setOk("Profile updated!"); setEditing(false);
    }catch(e){setErr(errMsg(e));}finally{setLoading(false);}
  };
  const changePw=async()=>{
    if(!pw.old||!pw.nw) return setErr("Fill all fields");
    if(pw.nw!==pw.conf) return setErr("Passwords don't match");
    setLoading(true);
    try{
      await api.studentPw(user.rollNo,pw.old,pw.nw);
      setOk("Password changed!"); setPw({old:"",nw:"",conf:""}); setErr("");
    }catch(e){setErr(errMsg(e));}finally{setLoading(false);}
  };

  return (
    <div className="au">
      <PageHdr title="My Profile"/>
      <ProfileHero name={form.name} id={user.rollNo} role="Student" dept={user.dept} editing={editing} onEdit={()=>setEditing(true)}/>
      {ok&&<div className="ok-box">{ok}</div>}
      {err&&<div className="err-box">{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontWeight:700}}>Personal Info</div>
            {!editing
              ?<Btn cn="btn-ghost" size="btn-sm" onClick={()=>setEditing(true)}>✏️ Edit</Btn>
              :<div style={{display:"flex",gap:8}}><Btn cn="btn-ghost" size="btn-sm" onClick={()=>setEditing(false)}>Cancel</Btn><Btn cn="btn-success" size="btn-sm" onClick={save} disabled={loading}>{loading?"Saving…":"Save"}</Btn></div>
            }
          </div>
          <Fi label="Full Name" value={form.name} onChange={v=>f("name",v)} disabled={!editing}/>
          <Fi label="Email" type="email" value={form.email} onChange={v=>f("email",v)} disabled={!editing} placeholder="your@email.com"/>
          <Fi label="Phone" value={form.phone} onChange={v=>f("phone",v)} disabled={!editing} placeholder="Contact number"/>
          <div className="divider"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{label:"Roll Number",val:user.rollNo},{label:"Department",val:user.dept},{label:"Section",val:`Sec ${user.section}`}].map(x=>(
              <div key={x.label} style={{background:"var(--s2)",borderRadius:10,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{x.label}</div>
                <div style={{fontWeight:600,fontSize:14}}>{x.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{fontWeight:700,marginBottom:18}}>Change Password</div>
          <Fi label="Current Password" type="password" value={pw.old} onChange={v=>setPw(p=>({...p,old:v}))} placeholder="Current password"/>
          <Fi label="New Password"     type="password" value={pw.nw}  onChange={v=>setPw(p=>({...p,nw:v}))}  placeholder="New password"/>
          <Fi label="Confirm Password" type="password" value={pw.conf} onChange={v=>setPw(p=>({...p,conf:v}))} placeholder="Confirm new password"/>
          <Btn cn="btn-primary" full onClick={changePw} disabled={loading}>{loading?"Updating…":"Update Password"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
const EMPTY_DATA = { faculties:[], students:[], courses:[], facultySection:[], attendance:[] };

export default function App() {
  const [data,setData]       = useState(EMPTY_DATA);
  const [user,setUser]       = useState(null);
  const [loading,setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try { const fresh=await api.fetchAll(); setData(fresh); }
    catch(e) { console.error("refresh error",e); }
  }, []);

  const handleLogin = async u => {
    setLoading(true);
    try {
      const fresh = await api.fetchAll();
      setData(fresh);
      setUser(u);
    } catch(e) {
      console.error("Bootstrap error:",e);
      setUser(u);
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("ae_token");
    setUser(null);
    setData(EMPTY_DATA);
  };

  if(loading) return (
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <div style={{fontSize:48}}>🎓</div>
        <div style={{fontSize:18,fontWeight:700}}>Loading AttendEase…</div>
        <div style={{fontSize:13,color:"var(--muted)"}}>Connecting to server</div>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      {!user
        ? <LoginPage onLogin={handleLogin}/>
        : user.role==="admin"   ? <AdminPortal   data={data} refresh={refresh} user={user} onLogout={handleLogout}/>
        : user.role==="faculty" ? <FacultyPortal data={data} refresh={refresh} user={user} onLogout={handleLogout}/>
        :                         <StudentPortal data={data} user={user} onLogout={handleLogout}/>
      }
    </>
  );
}