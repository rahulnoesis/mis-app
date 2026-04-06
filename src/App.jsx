import { useState, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SEED_OUTLETS = [
  { id: "o1", name: "The Table" },
  { id: "o2", name: "Mg St Colaba" },
  { id: "o3", name: "Mg St Bandra" },
  { id: "o4", name: "Mg St LP" },
];

const mk = (id,oId,mo,yr,bA,bB,lA,lB,fA,fB,sA,sB,cv,dO,dR) => ({
  id, outletId:oId, month:mo, year:yr,
  bevActual:bA,bevBudget:bB, liqActual:lA,liqBudget:lB,
  foodActual:fA,foodBudget:fB, scActual:sA,scBudget:sB,
  covers:cv, deliveryOrders:dO, deliveryRevenue:dR
});

const SEED_ENTRIES = [
  mk("e1","o1",4,2025,2700000,2800000,1700000,1800000,5500000,5800000,1350000,1400000,4700,348,600000),
  mk("e2","o1",5,2025,2850000,2800000,1820000,1800000,5650000,5800000,1380000,1400000,4719,349,620000),
  mk("e3","o1",6,2025,2600000,2800000,1680000,1800000,5200000,5800000,1290000,1400000,4280,320,580000),
  mk("e4","o2",4,2025,1800000,2000000,1200000,1300000,3500000,3800000,900000,1000000,5434,1706,1200000),
  mk("e5","o2",5,2025,1950000,2000000,1280000,1300000,3650000,3800000,920000,1000000,5738,1956,1350000),
  mk("e6","o2",6,2025,1870000,2000000,1220000,1300000,3480000,3800000,870000,1000000,5520,1820,1250000),
  mk("e7","o3",4,2025,2100000,2200000,1400000,1500000,4200000,4500000,1050000,1100000,7363,2241,1500000),
  mk("e8","o3",5,2025,2200000,2200000,1450000,1500000,4350000,4500000,1080000,1100000,7332,2613,1620000),
  mk("e9","o4",4,2025,1100000,1200000,750000,800000,2200000,2400000,550000,600000,4432,2983,900000),
  mk("e10","o4",5,2025,1200000,1200000,800000,800000,2350000,2400000,580000,600000,4850,3547,980000),
];

const fmt = n => "₹"+(n/100000).toFixed(1)+"L";
const fmtCr = n => "₹"+(n/10000000).toFixed(2)+"Cr";
const fmtN = n => (n||0).toLocaleString("en-IN");
const fmtMono = n => n.toLocaleString("en-IN");
const varPct = (a,b) => !b ? "—" : ((a-b)/b*100).toFixed(1)+"%";
const isPos = (a,b) => a >= b;

const C = {
  bg: "#FAFBFC",
  card: "#FFFFFF",
  primary: "#2D5A4A",
  primaryHover: "#234839",
  text: "#374151",
  textLight: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  positive: "#059669",
  negative: "#BE123C",
  inputBg: "#F9FAFB",
};

export default function App() {
  const [tab, setTab] = useState("entry");
  const [outlets, setOutlets] = useState(SEED_OUTLETS);
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [subTab, setSubTab] = useState("manual");
  const uid = useRef(200);
  const getId = () => String(uid.current++);

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:C.bg,minHeight:"640px"}}>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:C.primary,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 4px rgba(45,90,74,0.2)"}}>
              <span style={{color:"#fff",fontSize:14,fontWeight:700,"fontFamily":"'Inter',sans-serif"}}>N</span>
            </div>
            <span style={{fontWeight:600,fontSize:16,color:C.text,letterSpacing:"-0.3px"}}>Noesis Tech MIS Platform</span>
          </div>
          <div style={{flex:1}}/>
          <nav style={{display:"flex",gap:4}}>
            {[["outlets","Outlets"],["entry","Data Entry"],["reports","Reports"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:14,fontWeight:tab===k?600:500,background:tab===k?C.primary:"transparent",color:tab===k?"#fff":C.textLight}}>
                {l}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="outlets" && <OutletsPage outlets={outlets} setOutlets={setOutlets} getId={getId}/>}
        {tab==="entry" && <EntryPage outlets={outlets} entries={entries} setEntries={setEntries} dailyEntries={dailyEntries} setDailyEntries={setDailyEntries} subTab={subTab} setSubTab={setSubTab} getId={getId}/>}
        {tab==="reports" && <ReportsPage outlets={outlets} entries={entries} dailyEntries={dailyEntries}/>}
      </div>
    </div>
  );
}

function OutletsPage({outlets,setOutlets,getId}){
  const [name,setName]=useState("");
  const [editing,setEditing]=useState(null);
  const [editName,setEditName]=useState("");
  const add=()=>{if(!name.trim())return;setOutlets(p=>[...p,{id:getId(),name:name.trim()}]);setName("");};
  const remove=id=>setOutlets(p=>p.filter(o=>o.id!==id));
  const startEdit=o=>{setEditing(o.id);setEditName(o.name);};
  const saveEdit=()=>{if(!editName.trim())return;setOutlets(p=>p.map(o=>o.id===editing?{...o,name:editName.trim()}:o));setEditing(null);};
  return(
    <div>
      <PH title="Outlets" sub={`${outlets.length} outlet${outlets.length!==1?"s":""} configured`}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14,alignItems:"start"}}>
        <Card>
          {outlets.length===0&&<div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"28px 0"}}>No outlets yet. Add your first outlet.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {outlets.map((o,i)=>(
              <div key={o.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8fafc",borderRadius:8,border:"0.5px solid #e2e8f0"}}>
                <div style={{width:24,height:24,background:"#dbeafe",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#1d4ed8",flexShrink:0}}>{i+1}</div>
                {editing===o.id?(
                  <>
                    <input value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit()} style={{flex:1,...iStyle}} autoFocus/>
                    <SB bg="#39544B" col="#fff" onClick={saveEdit}>Save</SB>
                    <SB bg="#f1f5f9" col="#64748b" onClick={()=>setEditing(null)}>Cancel</SB>
                  </>
                ):(
                  <>
                    <span style={{flex:1,fontSize:13,fontWeight:500,color:"#0f172a"}}>{o.name}</span>
                    <SB bg="#f1f5f9" col="#64748b" onClick={()=>startEdit(o)}>Edit</SB>
                    <SB bg="#fee2e2" col="#dc2626" onClick={()=>remove(o.id)}>Remove</SB>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Lbl>Outlet name</Lbl>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="e.g. Iktara, MSBC Bandra" style={{width:"100%",...iStyle,boxSizing:"border-box"}}/>
          <button onClick={add} style={{marginTop:10,width:"100%",background:"#39544B",color:"#fff",border:"none",borderRadius:8,padding:"9px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Add Outlet</button>
          <div style={{marginTop:14,padding:"11px",background:"#f0f9ff",borderRadius:8,border:"0.5px solid #bae6fd"}}>
            <div style={{fontSize:10,fontWeight:600,color:"#0369a1",marginBottom:3}}>Tip</div>
            <div style={{fontSize:11,color:"#0c4a6e",lineHeight:1.6}}>Outlet names appear across all entry forms and reports. You can rename at any time.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EntryPage({outlets,entries,setEntries,dailyEntries,setDailyEntries,subTab,setSubTab,getId}){
  return(
    <div>
      <PH title="Data Entry" sub="Add daily or monthly data per outlet"/>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["daily","Daily Entry"],["manual","Monthly Entry"],["csv","CSV Upload"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{padding:"6px 16px",borderRadius:8,border:`0.5px solid ${subTab===k?"#39544B":"#e2e8f0"}`,background:subTab===k?"#39544B":"#fff",color:subTab===k?"#fff":"#64748b",fontSize:12,fontWeight:subTab===k?600:400,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {subTab==="daily"&&<DailyEntry outlets={outlets} dailyEntries={dailyEntries} setDailyEntries={setDailyEntries} getId={getId}/>}
      {subTab==="manual"&&<ManualEntry outlets={outlets} entries={entries} setEntries={setEntries} getId={getId}/>}
      {subTab==="csv"&&<CSVUpload outlets={outlets} entries={entries} setEntries={setEntries} getId={getId}/>}
    </div>
  );
}

function ManualEntry({outlets,entries,setEntries,getId}){
  const blank={outletId:"",month:"",year:"2025",bevActual:"",bevBudget:"",liqActual:"",liqBudget:"",foodActual:"",foodBudget:"",scActual:"",scBudget:"",covers:"",deliveryOrders:"",deliveryRevenue:""};
  const [form,setForm]=useState(blank);
  const [saved,setSaved]=useState(false);
  const [err,setErr]=useState("");
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setSaved(false);setErr("");};
  const existing=entries.find(e=>e.outletId===form.outletId&&String(e.month)===String(form.month)&&String(e.year)===String(form.year));
  const loadEx=()=>{if(!existing)return;setForm({outletId:existing.outletId,month:String(existing.month),year:String(existing.year),bevActual:String(existing.bevActual),bevBudget:String(existing.bevBudget),liqActual:String(existing.liqActual),liqBudget:String(existing.liqBudget),foodActual:String(existing.foodActual),foodBudget:String(existing.foodBudget),scActual:String(existing.scActual),scBudget:String(existing.scBudget),covers:String(existing.covers),deliveryOrders:String(existing.deliveryOrders),deliveryRevenue:String(existing.deliveryRevenue)});};
  const save=()=>{
    if(!form.outletId){setErr("Select an outlet.");return;}
    if(!form.month){setErr("Select a month.");return;}
    const n=k=>Number(form[k])||0;
    const rec={id:existing?.id||getId(),outletId:form.outletId,month:Number(form.month),year:Number(form.year),bevActual:n("bevActual"),bevBudget:n("bevBudget"),liqActual:n("liqActual"),liqBudget:n("liqBudget"),foodActual:n("foodActual"),foodBudget:n("foodBudget"),scActual:n("scActual"),scBudget:n("scBudget"),covers:n("covers"),deliveryOrders:n("deliveryOrders"),deliveryRevenue:n("deliveryRevenue")};
    if(existing)setEntries(p=>p.map(e=>e.id===existing.id?rec:e));
    else setEntries(p=>[...p,rec]);
    setSaved(true);setTimeout(()=>setSaved(false),3000);
  };
  const numInp=(key,pfx="₹")=>(
    <div style={{position:"relative"}}>
      {pfx&&<span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:11,pointerEvents:"none"}}>{pfx}</span>}
      <input type="number" value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:"100%",...iStyle,paddingLeft:pfx?"22px":"10px",boxSizing:"border-box"}}/>
    </div>
  );
  const rows=[["Beverage","bevActual","bevBudget"],["Liquor","liqActual","liqBudget"],["Food","foodActual","foodBudget"],["Service Charge","scActual","scBudget"]];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,alignItems:"start"}}>
      <Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
          <div><Lbl>Outlet</Lbl>
            <select value={form.outletId} onChange={e=>set("outletId",e.target.value)} style={{width:"100%",...selStyle}}>
              <option value="">Select outlet</option>
              {outlets.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div><Lbl>Month</Lbl>
            <select value={form.month} onChange={e=>set("month",e.target.value)} style={{width:"100%",...selStyle}}>
              <option value="">Month</option>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div><Lbl>Year</Lbl>
            <select value={form.year} onChange={e=>set("year",e.target.value)} style={{width:"100%",...selStyle}}>
              {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {existing&&(
          <div style={{padding:"9px 12px",background:"#fef9c3",borderRadius:8,border:"0.5px solid #fde047",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:"#854d0e"}}>Entry exists for this period.</span>
            <button onClick={loadEx} style={{fontSize:11,fontWeight:600,color:"#854d0e",background:"#fde047",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Load & edit</button>
          </div>
        )}
        <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.04em"}}>Revenue (INR)</div>
        <div style={{border:"0.5px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"130px 1fr 1fr",background:"#f8fafc",padding:"7px 12px",borderBottom:"0.5px solid #e2e8f0"}}>
            {["Category","Actual","Budget"].map(h=><div key={h} style={{fontSize:10,fontWeight:600,color:"#94a3b8"}}>{h}</div>)}
          </div>
          {rows.map(([label,aK,bK],i)=>(
            <div key={label} style={{display:"grid",gridTemplateColumns:"130px 1fr 1fr",padding:"9px 12px",gap:8,background:i%2===0?"#fff":"#fafafa",borderBottom:i<3?"0.5px solid #f1f5f9":"none",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:500,color:"#374151"}}>{label}</div>
              {numInp(aK)}{numInp(bK)}
            </div>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.04em"}}>Operations</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          <div><Lbl>Dine-in covers</Lbl>{numInp("covers","")}</div>
          <div><Lbl>Delivery orders</Lbl>{numInp("deliveryOrders","")}</div>
          <div><Lbl>Delivery revenue</Lbl>{numInp("deliveryRevenue")}</div>
        </div>
        {err&&<div style={{background:"#fee2e2",border:"0.5px solid #fca5a5",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#dc2626",marginBottom:10}}>{err}</div>}
        {saved&&<div style={{background:"#dcfce7",border:"0.5px solid #86efac",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#16a34a",marginBottom:10}}>Saved successfully. Go to Reports to view.</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={save} style={{flex:1,background:"#39544B",color:"#fff",border:"none",borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{existing?"Update Entry":"Save Entry"}</button>
          <button onClick={()=>setForm(blank)} style={{padding:"10px 14px",background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:8,fontSize:12,cursor:"pointer"}}>Clear</button>
        </div>
      </Card>
      <Card>
        <div style={{fontSize:12,fontWeight:600,color:"#0f172a",marginBottom:10}}>Recent entries</div>
        {entries.length===0&&<div style={{fontSize:11,color:"#94a3b8",textAlign:"center",padding:"16px 0"}}>No entries yet</div>}
        {[...entries].reverse().slice(0,10).map(e=>{
          const o=outlets.find(x=>x.id===e.outletId);
          const total=e.bevActual+e.liqActual+e.foodActual+e.scActual;
          return(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"0.5px solid #f1f5f9"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:"#0f172a"}}>{o?.name||"?"}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{MONTHS[e.month-1]} {e.year}</div>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:"#39544B"}}>{fmt(total)}</div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function DailyEntry({outlets, dailyEntries, setDailyEntries, getId}) {
  const today = new Date().toISOString().split('T')[0];
  const blank = { outletId: "", date: today, bevActual: "", liqActual: "", foodActual: "", scActual: "", covers: "", deliveryOrders: "", deliveryRevenue: "" };
  const [form, setForm] = useState(blank);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setSaved(false);
    setErr("");
  };

  const existing = dailyEntries.find(e => e.outletId === form.outletId && e.date === String(form.date));

  const save = () => {
    if (!form.outletId) { setErr("Select an outlet."); return; }
    if (!form.date) { setErr("Select a date."); return; }
    if (!form.bevActual && !form.liqActual && !form.foodActual && !form.scActual) { setErr("Enter at least one value."); return; }
    const n = k => Number(form[k]) || 0;
    const rec = {
      id: existing?.id || getId(),
      outletId: form.outletId,
      date: form.date,
      bevActual: n("bevActual"),
      liqActual: n("liqActual"),
      foodActual: n("foodActual"),
      scActual: n("scActual"),
      covers: n("covers"),
      deliveryOrders: n("deliveryOrders"),
      deliveryRevenue: n("deliveryRevenue")
    };
    if (existing) setDailyEntries(p => p.map(e => e.id === existing.id ? rec : e));
    else setDailyEntries(p => [...p, rec]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const numInp = (key, pfx = "₹") => (
    <div style={{ position: "relative" }}>
      {pfx && <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 11, pointerEvents: "none" }}>{pfx}</span>}
      <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", ...iStyle, paddingLeft: pfx ? "22px" : "10px", boxSizing: "border-box" }} />
    </div>
  );

  const rows = [["Beverage", "bevActual"], ["Liquor", "liqActual"], ["Food", "foodActual"], ["Service Charge", "scActual"]];

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const selectedMonth = form.date ? new Date(form.date).getMonth() + 1 : null;
  const selectedYear = form.date ? new Date(form.date).getFullYear() : null;
  const daysInMonth = selectedMonth && selectedYear ? getDaysInMonth(selectedYear, selectedMonth) : 0;

  const entriesForMonth = dailyEntries.filter(e => {
    if (!form.outletId) return false;
    const d = new Date(e.date);
    return e.outletId === form.outletId && d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  const monthlyTotals = entriesForMonth.reduce((acc, e) => ({
    bev: acc.bev + e.bevActual,
    liq: acc.liq + e.liqActual,
    food: acc.food + e.foodActual,
    sc: acc.sc + e.scActual,
    covers: acc.covers + e.covers,
    delOrders: acc.delOrders + e.deliveryOrders,
    delRev: acc.delRev + e.deliveryRevenue
  }), { bev: 0, liq: 0, food: 0, sc: 0, covers: 0, delOrders: 0, delRev: 0 });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" }}>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          <div>
            <Lbl>Outlet</Lbl>
            <select value={form.outletId} onChange={e => set("outletId", e.target.value)} style={{ width: "100%", ...selStyle }}>
              <option value="">Select outlet</option>
              {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Date</Lbl>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ width: "100%", ...iStyle }} />
          </div>
        </div>

        {existing && form.bevActual === "" && (
          <div style={{ padding: "9px 12px", background: "#fef9c3", borderRadius: 8, border: "0.5px solid #fde047", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#854d0e" }}>Entry exists for this date.</span>
            <button onClick={() => setForm({ outletId: existing.outletId, date: existing.date, bevActual: String(existing.bevActual), liqActual: String(existing.liqActual), foodActual: String(existing.foodActual), scActual: String(existing.scActual), covers: String(existing.covers), deliveryOrders: String(existing.deliveryOrders), deliveryRevenue: String(existing.deliveryRevenue) })} style={{ fontSize: 11, fontWeight: 600, color: "#854d0e", background: "#fde047", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Load & edit</button>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Revenue (INR) - Today's Entry</div>
        <div style={{ border: "0.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", background: "#f8fafc", padding: "7px 12px", borderBottom: "0.5px solid #e2e8f0" }}>
            {["Category", "Actual"].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{h}</div>)}
          </div>
          {rows.map(([label, aK], i) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "130px 1fr", padding: "9px 12px", gap: 8, background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < 3 ? "0.5px solid #f1f5f9" : "none", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{label}</div>
              {numInp(aK)}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Operations</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div><Lbl>Dine-in covers</Lbl>{numInp("covers", "")}</div>
          <div><Lbl>Delivery orders</Lbl>{numInp("deliveryOrders", "")}</div>
          <div><Lbl>Delivery revenue</Lbl>{numInp("deliveryRevenue")}</div>
        </div>

        {err && <div style={{ background: "#fee2e2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#dc2626", marginBottom: 10 }}>{err}</div>}
        {saved && <div style={{ background: "#dcfce7", border: "0.5px solid #86efac", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#16a34a", marginBottom: 10 }}>Saved successfully.</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} style={{ flex: 1, background: "#39544B", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{existing ? "Update Entry" : "Save Entry"}</button>
          <button onClick={() => setForm(blank)} style={{ padding: "10px 14px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Clear</button>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>Monthly Summary</div>
        {form.outletId && selectedMonth ? (
          <>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>{MONTHS[selectedMonth - 1]} {selectedYear} • {entriesForMonth.length} of {daysInMonth} days</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KCard label="Beverage" val={fmt(monthlyTotals.bev)} />
              <KCard label="Liquor" val={fmt(monthlyTotals.liq)} />
              <KCard label="Food" val={fmt(monthlyTotals.food)} />
              <KCard label="Svc Charge" val={fmt(monthlyTotals.sc)} />
              <KCard label="Covers" val={fmtN(monthlyTotals.covers)} />
              <KCard label="Del. Rev" val={fmt(monthlyTotals.delRev)} />
            </div>
            <div style={{ marginTop: 12, fontSize: 10, color: "#94a3b8" }}>Total: {fmt(monthlyTotals.bev + monthlyTotals.liq + monthlyTotals.food + monthlyTotals.sc)}</div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>Select outlet and date to see summary</div>
        )}

        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginTop: 20, marginBottom: 10 }}>Recent daily entries</div>
        {dailyEntries.length === 0 && <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>No entries yet</div>}
        {[...dailyEntries].reverse().slice(0, 8).map(e => {
          const o = outlets.find(x => x.id === e.outletId);
          const total = e.bevActual + e.liqActual + e.foodActual + e.scActual;
          return (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "0.5px solid #f1f5f9" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{o?.name || "?"}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.date}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#39544B" }}>{fmt(total)}</div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function CSVUpload({outlets,entries,setEntries,getId}){
  const [preview,setPreview]=useState(null);
  const [errs,setErrs]=useState([]);
  const [ok,setOk]=useState(false);
  const fileRef=useRef();
  const COLS="outlet_name,month,year,beverage_actual,beverage_budget,liquor_actual,liquor_budget,food_actual,food_budget,service_charge_actual,service_charge_budget,dine_in_covers,delivery_orders,delivery_revenue";
  const downloadTpl=()=>{
    const s=[COLS,"The Table,4,2025,2700000,2800000,1700000,1800000,5500000,5800000,1350000,1400000,4700,348,600000","Mg St Colaba,4,2025,1800000,2000000,1200000,1300000,3500000,3800000,900000,1000000,5434,1706,1200000"].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([s],{type:"text/csv"}));a.download="mis_template.csv";a.click();
  };
  const parse=text=>{
    const lines=text.trim().split("\n").filter(l=>l.trim());
    if(lines.length<2)return{rows:[],errs:["File is empty or missing data rows."]};
    const hdrs=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/\s+/g,"_"));
    const rows=[];const errList=[];
    lines.slice(1).forEach((line,i)=>{
      const vals=line.split(",").map(v=>v.trim());
      const row={};hdrs.forEach((h,j)=>row[h]=vals[j]||"");
      const outlet=outlets.find(o=>o.name.toLowerCase()===(row.outlet_name||"").toLowerCase());
      if(!outlet){errList.push(`Row ${i+2}: Outlet "${row.outlet_name}" not found. Add it under Outlets first.`);return;}
      const month=parseInt(row.month);
      if(isNaN(month)||month<1||month>12){errList.push(`Row ${i+2}: Invalid month "${row.month}".`);return;}
      rows.push({outletId:outlet.id,outletName:outlet.name,month,year:parseInt(row.year)||2025,bevActual:Number(row.beverage_actual)||0,bevBudget:Number(row.beverage_budget)||0,liqActual:Number(row.liquor_actual)||0,liqBudget:Number(row.liquor_budget)||0,foodActual:Number(row.food_actual)||0,foodBudget:Number(row.food_budget)||0,scActual:Number(row.service_charge_actual)||0,scBudget:Number(row.service_charge_budget)||0,covers:Number(row.dine_in_covers)||0,deliveryOrders:Number(row.delivery_orders)||0,deliveryRevenue:Number(row.delivery_revenue)||0});
    });
    return{rows,errs:errList};
  };
  const onFile=e=>{
    const f=e.target.files[0];if(!f)return;setOk(false);
    const r=new FileReader();r.onload=ev=>{const{rows,errs:el}=parse(ev.target.result);setPreview(rows);setErrs(el);};r.readAsText(f);
  };
  const importData=()=>{
    if(!preview?.length)return;
    setEntries(prev=>{
      let next=[...prev];
      preview.forEach(row=>{
        const idx=next.findIndex(e=>e.outletId===row.outletId&&e.month===row.month&&e.year===row.year);
        const {outletName,...rest}=row;
        const rec={id:idx>=0?next[idx].id:getId(),...rest};
        if(idx>=0)next[idx]=rec;else next.push(rec);
      });
      return next;
    });
    setOk(true);setPreview(null);if(fileRef.current)fileRef.current.value="";
  };
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{fontSize:13,fontWeight:600,color:"#0f172a",marginBottom:4}}>Step 1: Download template</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:12,lineHeight:1.6}}>Fill the CSV with your data. One row per outlet per month. Column names must match exactly.</div>
          <button onClick={downloadTpl} style={{background:"#f1f5f9",border:"0.5px solid #e2e8f0",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:600,color:"#39544B",cursor:"pointer"}}>Download CSV Template</button>
          <div style={{marginTop:12,background:"#f8fafc",borderRadius:8,padding:"10px",fontFamily:"monospace",fontSize:9,color:"#64748b",lineHeight:1.9,wordBreak:"break-all"}}>
            outlet_name, month, year, beverage_actual, beverage_budget, liquor_actual, liquor_budget, food_actual, food_budget, service_charge_actual, service_charge_budget, dine_in_covers, delivery_orders, delivery_revenue
          </div>
        </Card>
        <Card>
          <div style={{fontSize:13,fontWeight:600,color:"#0f172a",marginBottom:4}}>Step 2: Upload your file</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:12,lineHeight:1.6}}>The system validates and shows a preview before importing. Existing entries for the same outlet and month are overwritten.</div>
          <label style={{display:"block",border:"1.5px dashed #cbd5e1",borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:"#f8fafc"}}>
            <input ref={fileRef} type="file" accept=".csv" onChange={onFile} style={{display:"none"}}/>
            <div style={{fontSize:13,color:"#64748b",marginBottom:3}}>Click to upload CSV</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>.csv files only</div>
          </label>
        </Card>
      </div>
      {errs.length>0&&(
        <div style={{background:"#fee2e2",border:"0.5px solid #fca5a5",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#dc2626",marginBottom:6}}>Validation errors — fix and re-upload</div>
          {errs.map((e,i)=><div key={i} style={{fontSize:11,color:"#dc2626",marginBottom:3}}>{e}</div>)}
        </div>
      )}
      {ok&&<div style={{background:"#dcfce7",border:"0.5px solid #86efac",borderRadius:10,padding:"11px 14px",marginBottom:12}}><span style={{fontSize:12,fontWeight:600,color:"#16a34a"}}>Import successful. View data in Reports.</span></div>}
      {preview&&preview.length>0&&(
        <Card>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>Preview — {preview.length} row{preview.length!==1?"s":""} ready</div>
              <div style={{fontSize:11,color:"#64748b"}}>Existing entries for the same outlet/month will be overwritten.</div>
            </div>
            <button onClick={importData} style={{background:"#39544B",color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Import {preview.length} row{preview.length!==1?"s":""}</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#f8fafc"}}>
                  {["Outlet","Period","Beverage","Liquor","Food","Serv. Charge","Covers","Del. Orders"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:600,color:"#94a3b8",fontSize:10,borderBottom:"0.5px solid #e2e8f0"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row,i)=>(
                  <tr key={i} style={{borderBottom:"0.5px solid #f1f5f9"}}>
                    <td style={{padding:"7px 10px",fontWeight:500,color:"#0f172a"}}>{row.outletName}</td>
                    <td style={{padding:"7px 10px",color:"#64748b"}}>{MONTHS[row.month-1]} {row.year}</td>
                    <td style={{padding:"7px 10px"}}>{fmt(row.bevActual)}</td>
                    <td style={{padding:"7px 10px"}}>{fmt(row.liqActual)}</td>
                    <td style={{padding:"7px 10px"}}>{fmt(row.foodActual)}</td>
                    <td style={{padding:"7px 10px"}}>{fmt(row.scActual)}</td>
                    <td style={{padding:"7px 10px"}}>{fmtN(row.covers)}</td>
                    <td style={{padding:"7px 10px"}}>{fmtN(row.deliveryOrders)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function ReportsPage({outlets, entries, dailyEntries }) {
  const [filterOutlet, setFilterOutlet] = useState("all");

  const aggregatedEntries = useMemo(() => {
    const map = {};
    
    entries.forEach(e => {
      const key = `${e.outletId}-${e.year}-${e.month}`;
      if (!map[key]) {
        map[key] = { outletId: e.outletId, month: e.month, year: e.year, bevActual: 0, liqActual: 0, foodActual: 0, scActual: 0, bevBudget: 0, liqBudget: 0, foodBudget: 0, scBudget: 0, covers: 0, deliveryOrders: 0, deliveryRevenue: 0 };
      }
      map[key].bevActual += e.bevActual;
      map[key].liqActual += e.liqActual;
      map[key].foodActual += e.foodActual;
      map[key].scActual += e.scActual;
      map[key].bevBudget += e.bevBudget;
      map[key].liqBudget += e.liqBudget;
      map[key].foodBudget += e.foodBudget;
      map[key].scBudget += e.scBudget;
      map[key].covers += e.covers;
      map[key].deliveryOrders += e.deliveryOrders;
      map[key].deliveryRevenue += e.deliveryRevenue;
    });
    
    dailyEntries.forEach(e => {
      const d = new Date(e.date);
      const key = `${e.outletId}-${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!map[key]) {
        map[key] = { outletId: e.outletId, month: d.getMonth() + 1, year: d.getFullYear(), bevActual: 0, liqActual: 0, foodActual: 0, scActual: 0, bevBudget: 0, liqBudget: 0, foodBudget: 0, scBudget: 0, covers: 0, deliveryOrders: 0, deliveryRevenue: 0 };
      }
      map[key].bevActual += e.bevActual;
      map[key].liqActual += e.liqActual;
      map[key].foodActual += e.foodActual;
      map[key].scActual += e.scActual;
      map[key].covers += e.covers;
      map[key].deliveryOrders += e.deliveryOrders;
      map[key].deliveryRevenue += e.deliveryRevenue;
    });
    
    return Object.values(map);
  }, [entries, dailyEntries]);

  const filtered = filterOutlet === "all" ? aggregatedEntries : aggregatedEntries.filter(e => e.outletId === filterOutlet);
  const tot = (fn) => filtered.reduce((s, e) => s + fn(e), 0);
  const totalActual = tot(e => e.bevActual + e.liqActual + e.foodActual + e.scActual);
  const totalBudget = tot(e => e.bevBudget + e.liqBudget + e.foodBudget + e.scBudget);
  const totalCovers = tot(e => e.covers);
  const totalDel = tot(e => e.deliveryOrders);
  const apc = totalCovers > 0 ? Math.round((tot(e => e.bevActual + e.liqActual + e.foodActual + e.scActual - e.deliveryRevenue)) / totalCovers) : 0;

  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const k = `${e.year}-${String(e.month).padStart(2, "0")}`;
      if (!map[k]) map[k] = { name: `${MONTHS[e.month-1]} '${String(e.year).slice(2)}`, actual: 0, budget: 0 };
      map[k].actual += e.bevActual + e.liqActual + e.foodActual + e.scActual;
      map[k].budget += e.bevBudget + e.liqBudget + e.foodBudget + e.scBudget;
    });
    const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(function(entry) {
      const v = entry[1];
      return {
        name: v.name,
        actual: Math.round(v.actual / 100000),
        budget: Math.round(v.budget / 100000)
      };
    });
  }, [filtered]);

  const catData=useMemo(()=>[
    {name:"Food",val:Math.round(tot(e=>e.foodActual)/100000),color:"#10b981"},
    {name:"Beverage",val:Math.round(tot(e=>e.bevActual)/100000),color:"#3b82f6"},
    {name:"Liquor",val:Math.round(tot(e=>e.liqActual)/100000),color:"#8b5cf6"},
    {name:"Serv. Charge",val:Math.round(tot(e=>e.scActual)/100000),color:"#f59e0b"},
  ],[filtered]);

  const outletRows=useMemo(()=>outlets.map(o=>{
    const oe=filtered.filter(e=>e.outletId===o.id);
    const actual=oe.reduce((s,e)=>s+e.bevActual+e.liqActual+e.foodActual+e.scActual,0);
    const budget=oe.reduce((s,e)=>s+e.bevBudget+e.liqBudget+e.foodBudget+e.scBudget,0);
    const covers=oe.reduce((s,e)=>s+e.covers,0);
    return{id:o.id,name:o.name,actual,budget,covers,months:oe.length};
  }).filter(o=>o.actual>0).sort((a,b)=>b.actual-a.actual),[outlets,filtered]);

  const exportCSV=()=>{
    const rows=[["Outlet","Month","Year","Bev Actual","Liq Actual","Food Actual","SC Actual","Total Actual","Total Budget","Variance","Covers","Del Orders"]];
    filtered.forEach(e=>{
      const o=outlets.find(x=>x.id===e.outletId);
      const ta=e.bevActual+e.liqActual+e.foodActual+e.scActual;
      const tb=e.bevBudget+e.liqBudget+e.foodBudget+e.scBudget;
      rows.push([o?.name,MONTHS[e.month-1],e.year,e.bevActual,e.liqActual,e.foodActual,e.scActual,ta,tb,ta-tb,e.covers,e.deliveryOrders]);
    });
    const csv=rows.map(r=>r.join(",")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="mis_report.csv";a.click();
  };

  if(entries.length===0)return(
    <div>
      <PH title="Reports" sub="No data yet"/>
      <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8",fontSize:13}}>No data entered yet. Go to Data Entry to get started.</div>
    </div>
  );

  const varColor=isPos(totalActual,totalBudget)?"#16a34a":"#dc2626";
  const catTotal=catData.reduce((s,c)=>s+c.val,0);

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <PH title="Reports" sub="MIS overview — all outlets and periods" noMb/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={filterOutlet} onChange={e=>setFilterOutlet(e.target.value)} style={{...selStyle,width:"auto",minWidth:150}}>
            <option value="all">All outlets</option>
            {outlets.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <button onClick={exportCSV} style={{background:"#39544B",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Export CSV</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginBottom:14}}>
        <KCard label="Revenue YTD" val={fmtCr(totalActual)} sub={`${varPct(totalActual,totalBudget)} vs budget`} subC={varColor}/>
        <KCard label="Budget YTD" val={fmtCr(totalBudget)} sub="Target total"/>
        <KCard label="Dine-in covers" val={fmtN(totalCovers)} sub={`${totalDel.toLocaleString()} del. orders`}/>
        <KCard label="Avg per cover" val={`₹${apc.toLocaleString("en-IN")}`} sub="APC blended"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{fontSize:12,fontWeight:600,color:"#0f172a",marginBottom:2}}>Revenue: actual vs budget</div>
          <div style={{fontSize:10,color:"#94a3b8",marginBottom:10}}>INR Lakhs · monthly</div>
          <div style={{display:"flex",gap:14,marginBottom:10}}>
            {[["#e2e8f0","Budget"],["#39544B","Actual"]].map(([c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#64748b"}}>
                <span style={{width:9,height:9,borderRadius:2,background:c,display:"inline-block"}}/>
                {l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthlyData} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}L`}/>
              <Tooltip formatter={v=>[`₹${v}L`]} contentStyle={{fontSize:11,borderRadius:8,border:"0.5px solid #e2e8f0"}}/>
              <Bar dataKey="budget" fill="#e2e8f0" radius={[3,3,0,0]}/>
              <Bar dataKey="actual" fill="#39544B" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{fontSize:12,fontWeight:600,color:"#0f172a",marginBottom:2}}>Revenue mix</div>
          <div style={{fontSize:10,color:"#94a3b8",marginBottom:16}}>By category · ₹ Lakhs</div>
          {catData.map(c=>{
            const p=catTotal>0?Math.round(c.val/catTotal*100):0;
            return(
              <div key={c.name} style={{marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:"#374151"}}>{c.name}</span>
                  <span style={{fontSize:11,fontWeight:600,color:"#0f172a"}}>₹{c.val}L <span style={{color:"#94a3b8",fontWeight:400}}>({p}%)</span></span>
                </div>
                <div style={{height:5,background:"#f1f5f9",borderRadius:4}}>
                  <div style={{height:"100%",width:`${p}%`,background:c.color,borderRadius:4}}/>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card>
        <div style={{fontSize:12,fontWeight:600,color:"#0f172a",marginBottom:2}}>Outlet breakdown</div>
        <div style={{fontSize:10,color:"#94a3b8",marginBottom:12}}>Sorted by revenue · all recorded months</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:"0.5px solid #e2e8f0"}}>
              {["Outlet","Months","Actual Revenue","Budget","Variance","Var %","Covers"].map((h,i)=>(
                <th key={h} style={{padding:"7px 10px",textAlign:i===0?"left":"right",fontWeight:600,fontSize:10,color:"#94a3b8"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outletRows.map((o,i)=>{
              const v=o.actual-o.budget;
              const vp=o.budget>0?((o.actual-o.budget)/o.budget*100).toFixed(1)+"%" :"—";
              const pos=v>=0;
              return(
                <tr key={o.id} style={{borderBottom:"0.5px solid #f8fafc",background:i%2===0?"#fff":"#fafafa"}}>
                  <td style={{padding:"9px 10px",fontWeight:600,color:"#0f172a"}}>{o.name}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",color:"#64748b"}}>{o.months}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:"#0f172a"}}>{fmtCr(o.actual)}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",color:"#64748b"}}>{fmtCr(o.budget)}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",color:pos?"#16a34a":"#dc2626",fontWeight:500}}>{pos?"+":""}{fmtCr(Math.abs(v))}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",color:pos?"#16a34a":"#dc2626",fontWeight:500}}>{pos?"+":""}{vp}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",color:"#64748b"}}>{fmtN(o.covers)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{borderTop:"1px solid #e2e8f0",background:"#f8fafc"}}>
              <td colSpan={2} style={{padding:"9px 10px",fontWeight:700,fontSize:11,color:"#0f172a"}}>Total</td>
              <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:"#0f172a"}}>{fmtCr(totalActual)}</td>
              <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:"#0f172a"}}>{fmtCr(totalBudget)}</td>
              <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:varColor}}>{isPos(totalActual,totalBudget)?"+":""}{fmtCr(Math.abs(totalActual-totalBudget))}</td>
              <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:varColor}}>{isPos(totalActual,totalBudget)?"+":""}{varPct(totalActual,totalBudget)}</td>
              <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:"#0f172a"}}>{fmtN(totalCovers)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}

function Card({children}){return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>{children}</div>;}
function KCard({label,val,sub,subC=C.textLight}){
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <div style={{fontSize:11,fontWeight:500,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:C.text,letterSpacing:"-0.5px","fontFamily":"'JetBrains Mono',monospace"}}>{val}</div>
      {sub&&<div style={{fontSize:11,color:subC,marginTop:4}}>{sub}</div>}
    </div>
  );
}
function PH({title,sub,noMb}){return <div style={{marginBottom:noMb?0:18}}><div style={{fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.3px"}}>{title}</div>{sub&&<div style={{fontSize:12,color:C.textLight,marginTop:3}}>{sub}</div>}</div>;}
function Lbl({children}){return <div style={{fontSize:11,fontWeight:600,color:C.textLight,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.03em"}}>{children}</div>;}
function SB({bg,col,onClick,children}){return <button onClick={onClick} style={{background:bg,color:col,border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{children}</button>;}
const iStyle={border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",background:C.inputBg,color:C.text};
const selStyle={border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",background:C.card,cursor:"pointer",color:C.text};
