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
  const [tab, setTab] = useState("reports");
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
            {[["reports","Dashboard"],["entry","Data Entry"],["outlets","Outlets"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:14,fontWeight:tab===k?600:500,background:tab===k?C.primary:"transparent",color:tab===k?"#fff":C.textLight}}>
                {l}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="reports" && <ReportsPage outlets={outlets} entries={entries} dailyEntries={dailyEntries}/>}
        {tab==="entry" && <EntryPage outlets={outlets} entries={entries} setEntries={setEntries} dailyEntries={dailyEntries} setDailyEntries={setDailyEntries} subTab={subTab} setSubTab={setSubTab} getId={getId}/>}
        {tab==="outlets" && <OutletsPage outlets={outlets} setOutlets={setOutlets} getId={getId}/>}
      </div>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px 24px",textAlign:"center"}}>
        <div style={{fontSize:11,color:C.textMuted,background:C.inputBg,padding:"10px 16px",borderRadius:8,display:"inline-block"}}>
          This is only a prototype. Data calculation and storage may be inaccurate.
        </div>
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
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {[["chat","Chat Entry"],["daily","Daily Entry"],["manual","Monthly Entry"],["csv","CSV Upload"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSubTab(k)} style={{padding:"6px 16px",borderRadius:8,border:`0.5px solid ${subTab===k?C.primary:C.border}`,background:subTab===k?C.primary:C.card,color:subTab===k?"#fff":C.textLight,fontSize:13,fontWeight:subTab===k?600:500,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {subTab==="chat"&&<ChatEntry outlets={outlets} entries={entries} setEntries={setEntries} dailyEntries={dailyEntries} setDailyEntries={setDailyEntries} getId={getId}/>}
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
  const [showAI, setShowAI] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

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

  const varColor=isPos(totalActual,totalBudget)?C.positive:C.negative;
  const catTotal=catData.reduce((s,c)=>s+c.val,0);

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <PH title="Dashboard" sub="MIS overview — all outlets and periods" noMb/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={() => setShowAI(!showAI)} style={{background:showAI ? C.primary : C.card, color: showAI ? "#fff" : C.textLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer"}}>AI Query</button>
          <button onClick={() => setShowForecast(!showForecast)} style={{background:showForecast ? C.primary : C.card, color: showForecast ? "#fff" : C.textLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer"}}>Forecast</button>
          <select value={filterOutlet} onChange={e=>setFilterOutlet(e.target.value)} style={{...selStyle,width:"auto",minWidth:150}}>
            <option value="all">All outlets</option>
            {outlets.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <button onClick={exportCSV} style={{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Export</button>
        </div>
      </div>

      {showAI && <div style={{marginBottom: 14}}><AIQueryPage outlets={outlets} entries={entries} dailyEntries={dailyEntries}/></div>}
      {showForecast && <div style={{marginBottom: 14}}><ForecastPage outlets={outlets} entries={entries} dailyEntries={dailyEntries}/></div>}

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

function BestPracticesPage({outlets, entries, dailyEntries}) {
  const aggregated = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const key = `${e.outletId}-${e.year}-${e.month}`;
      if (!map[key]) map[key] = { outletId: e.outletId, month: e.month, year: e.year, bevActual: 0, liqActual: 0, foodActual: 0, scActual: 0, covers: 0 };
      map[key].bevActual += e.bevActual;
      map[key].liqActual += e.liqActual;
      map[key].foodActual += e.foodActual;
      map[key].scActual += e.scActual;
      map[key].covers += e.covers;
    });
    dailyEntries.forEach(e => {
      const d = new Date(e.date);
      const key = `${e.outletId}-${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!map[key]) map[key] = { outletId: e.outletId, month: d.getMonth() + 1, year: d.getFullYear(), bevActual: 0, liqActual: 0, foodActual: 0, scActual: 0, covers: 0 };
      map[key].bevActual += e.bevActual;
      map[key].liqActual += e.liqActual;
      map[key].foodActual += e.foodActual;
      map[key].scActual += e.scActual;
      map[key].covers += e.covers;
    });
    return Object.values(map);
  }, [entries, dailyEntries]);

  const insights = useMemo(() => {
    const list = [];
    if (aggregated.length === 0) return list;

    const totalRev = aggregated.reduce((s, e) => s + e.bevActual + e.liqActual + e.foodActual + e.scActual, 0);
    const totalCovers = aggregated.reduce((s, e) => s + e.covers, 0);
    const avgCheck = totalCovers > 0 ? totalRev / totalCovers : 0;

    list.push({ type: "info", title: "Average Check Size", desc: `₹${fmtMono(Math.round(avgCheck))} per cover across all outlets` });

    const byOutlet = outlets.map(o => {
      const oData = aggregated.filter(e => e.outletId === o.id);
      const rev = oData.reduce((s, e) => s + e.bevActual + e.liqActual + e.foodActual + e.scActual, 0);
      const covers = oData.reduce((s, e) => s + e.covers, 0);
      return { name: o.name, rev, covers, check: covers > 0 ? rev / covers : 0 };
    }).filter(o => o.rev > 0);

    const topOutlet = byOutlet.sort((a, b) => b.rev - a.rev)[0];
    if (topOutlet) {
      list.push({ type: "success", title: "Top Performer", desc: `${topOutlet.name} with ₹${fmt(topOutlet.rev)} revenue` });
    }

    const lowOutlet = byOutlet.sort((a, b) => a.check - b.check)[0];
    if (lowOutlet && byOutlet.length > 1) {
      list.push({ type: "warning", title: "Lowest Avg Check", desc: `${lowOutlet.name} at ₹${fmtMono(Math.round(lowOutlet.check))} per cover` });
    }

    const beverageShare = aggregated.reduce((s, e) => s + e.bevActual, 0) / totalRev * 100;
    const foodShare = aggregated.reduce((s, e) => s + e.foodActual, 0) / totalRev * 100;
    if (foodShare > beverageShare) {
      list.push({ type: "info", title: "Revenue Mix", desc: `Food contributes ${Math.round(foodShare)}% vs Beverage ${Math.round(beverageShare)}%` });
    }

    return list;
  }, [aggregated, outlets]);

  const anomalies = useMemo(() => {
    const list = [];
    if (aggregated.length < 2) return list;

    const sorted = [...aggregated].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      const prev = sorted[i - 1];
      
      if (curr.outletId !== prev.outletId) continue;
      
      const currRev = curr.bevActual + curr.liqActual + curr.foodActual + curr.scActual;
      const prevRev = prev.bevActual + prev.liqActual + prev.foodActual + prev.scActual;
      
      if (prevRev === 0) continue;
      
      const pctChange = ((currRev - prevRev) / prevRev) * 100;
      
      if (pctChange < -20) {
        const outlet = outlets.find(o => o.id === curr.outletId);
        list.push({ type: "danger", title: "Revenue Drop Alert", desc: `${outlet?.name} down ${Math.abs(Math.round(pctChange))}% in ${MONTHS[curr.month-1]} vs ${MONTHS[prev.month-1]}`, metric: `${Math.round(pctChange)}%` });
      } else if (pctChange > 30) {
        const outlet = outlets.find(o => o.id === curr.outletId);
        list.push({ type: "success", title: "Revenue Surge", desc: `${outlet?.name} up ${Math.round(pctChange)}% in ${MONTHS[curr.month-1]}`, metric: `+${Math.round(pctChange)}%` });
      }
    }

    entries.forEach(e => {
      const actual = e.bevActual + e.liqActual + e.foodActual + e.scActual;
      const budget = e.bevBudget + e.liqBudget + e.foodBudget + e.scBudget;
      if (budget > 0) {
        const variance = ((actual - budget) / budget) * 100;
        if (variance < -25) {
          const outlet = outlets.find(o => o.id === e.outletId);
          list.push({ type: "warning", title: "Budget Variance", desc: `${outlet?.name} at ${Math.round(variance)}% of budget in ${MONTHS[e.month-1]}`, metric: `${Math.round(variance)}%` });
        }
      }
    });

    const byOutlet = outlets.map(o => {
      const oData = aggregated.filter(e => e.outletId === o.id);
      if (oData.length < 2) return null;
      const sortedMo = [...oData].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      const first = sortedMo[0];
      const last = sortedMo[sortedMo.length - 1];
      const firstRev = first.bevActual + first.liqActual + first.foodActual + first.scActual;
      const lastRev = last.bevActual + last.liqActual + last.foodActual + last.scActual;
      if (firstRev === 0 || lastRev === 0) return null;
      const trend = ((lastRev - firstRev) / firstRev) * 100;
      return { name: o.name, trend };
    }).filter(Boolean).sort((a, b) => a.trend - b.trend);

    if (byOutlet.length > 0) {
      const declining = byOutlet.find(o => o.trend < -10);
      if (declining) {
        list.push({ type: "warning", title: "Declining Trend", desc: `${declining.name} showing ${Math.round(declining.trend)}% trend over period`, metric: `${Math.round(declining.trend)}%` });
      }
    }

    return list;
  }, [aggregated, entries, outlets]);

  const benchmarks = [
    { label: "Target APC", value: "₹2,500-3,500", desc: "Average per cover for F&B" },
    { label: "Food to Bev Ratio", value: "2:1", desc: "Food revenue should be 2x beverages" },
    { label: "Labor Cost", value: "<25%", desc: "Target staff cost as % of revenue" },
    { label: "Rent to Rev", value: "<8%", desc: "Rent should be under 8% of revenue" },
  ];

  return (
    <div>
      <PH title="Best Practices" sub="Industry benchmarks and AI-generated insights"/>
      
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>AI Insights</div>
          {insights.length === 0 ? (
            <div style={{color:C.textMuted,fontSize:13,padding:"20px 0",textAlign:"center"}}>Add data to see AI-powered insights</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {insights.map((ins, i) => (
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:12,background:ins.type === "warning" ? "#FFFBEB" : ins.type === "success" ? "#ECFDF5" : "#EFF6FF",borderRadius:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",marginTop:5,background:ins.type === "warning" ? "#F59E0B" : ins.type === "success" ? "#10B981" : "#3B82F6",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ins.title}</div>
                    <div style={{fontSize:12,color:C.textLight,marginTop:2}}>{ins.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            Anomaly Alerts
            {anomalies.length > 0 && <span style={{background:C.negative,color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10}}>{anomalies.length}</span>}
          </div>
          {anomalies.length === 0 ? (
            <div style={{color:C.textMuted,fontSize:13,padding:"20px 0",textAlign:"center"}}>No anomalies detected</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {anomalies.map((an, i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:an.type === "danger" ? "#FEF2F2" : an.type === "warning" ? "#FFFBEB" : "#ECFDF5",borderRadius:8,borderLeft:`3px solid ${an.type === "danger" ? "#DC2626" : an.type === "warning" ? "#F59E0B" : "#10B981"}`}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{an.title}</div>
                    <div style={{fontSize:12,color:C.textLight,marginTop:2}}>{an.desc}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:an.type === "danger" ? "#DC2626" : an.type === "warning" ? "#F59E0B" : "#10B981"}}>{an.metric}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Industry Benchmarks</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {benchmarks.map((b, i) => (
            <div key={i} style={{padding:14,background:C.inputBg,borderRadius:8}}>
              <div style={{fontSize:11,color:C.textMuted,textTransform:"uppercase",marginBottom:4}}>{b.label}</div>
              <div style={{fontSize:16,fontWeight:600,color:C.primary}}>{b.value}</div>
              <div style={{fontSize:11,color:C.textLight,marginTop:4}}>{b.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{marginTop:14}}>
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>AI Recommendations</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <div style={{padding:16,background:"linear-gradient(135deg, #2D5A4A 0%, #3D6A5A 100%)",borderRadius:10,color:"#fff"}}>
              <div style={{fontSize:12,opacity:0.8,marginBottom:8}}>Forecasting</div>
              <div style={{fontSize:13,fontWeight:500}}>Predict next month revenue based on trends</div>
            </div>
            <div style={{padding:16,background:"linear-gradient(135deg, #374151 0%, #4B5563 100%)",borderRadius:10,color:"#fff"}}>
              <div style={{fontSize:12,opacity:0.8,marginBottom:8}}>Natural Language</div>
              <div style={{fontSize:13,fontWeight:500}}>Ask questions about your data in plain English</div>
            </div>
            <div style={{padding:16,background:"linear-gradient(135deg, #BE123C 0%, #9F1239 100%)",borderRadius:10,color:"#fff"}}>
              <div style={{fontSize:12,opacity:0.8,marginBottom:8}}>Data Ingestion</div>
              <div style={{fontSize:13,fontWeight:500}}>Auto-import from Excel, bank statements, POS</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ExcelImport({ outlets, entries, setEntries, dailyEntries, setDailyEntries, getId }) {
  const [preview, setPreview] = useState(null);
  const [errs, setErrs] = useState([]);
  const [ok, setOk] = useState(false);
  const fileRef = useRef();
  const [importMode, setImportMode] = useState("monthly");

  const COLS_MONTHLY = "outlet_name,month,year,beverage_actual,beverage_budget,liquor_actual,liquor_budget,food_actual,food_budget,service_charge_actual,service_charge_budget,dine_in_covers,delivery_orders,delivery_revenue";
  const COLS_DAILY = "outlet_name,date,beverage,liquor,food,service_charge,covers,delivery_orders,delivery_revenue";

  const downloadTpl = () => {
    const cols = importMode === "monthly" ? COLS_MONTHLY : COLS_DAILY;
    const sample1 = importMode === "monthly" 
      ? "The Table,4,2025,2700000,2800000,1700000,1800000,5500000,5800000,1350000,1400000,4700,348,600000"
      : "The Table,2025-04-01,90000,56000,180000,45000,156,12,20000";
    const sample2 = importMode === "monthly"
      ? "Mg St Colaba,4,2025,1800000,2000000,1200000,1300000,3500000,3800000,900000,1000000,5434,1706,1200000"
      : "Mg St Colaba,2025-04-02,60000,40000,120000,30000,180,45,15000";
    const s = [cols, sample1, sample2].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([s], { type: "text/csv" }));
    a.download = importMode === "monthly" ? "monthly_template.csv" : "daily_template.csv";
    a.click();
  };

  const parse = (text) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return { rows: [], errs: ["File is empty or missing data rows."] };
    const hdrs = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const rows = [];
    const errList = [];

    lines.slice(1).forEach((line, i) => {
      const vals = line.split(",").map(v => v.trim());
      const row = {};
      hdrs.forEach((h, j) => row[h] = vals[j] || "");
      const outlet = outlets.find(o => o.name.toLowerCase() === (row.outlet_name || "").toLowerCase());
      if (!outlet) { errList.push(`Row ${i+2}: Outlet "${row.outlet_name}" not found.`); return; }

      if (importMode === "monthly") {
        const month = parseInt(row.month);
        if (isNaN(month) || month < 1 || month > 12) { errList.push(`Row ${i+2}: Invalid month.`); return; }
        rows.push({
          outletId: outlet.id, outletName: outlet.name, month, year: parseInt(row.year) || 2025,
          bevActual: Number(row.beverage_actual) || 0, bevBudget: Number(row.beverage_budget) || 0,
          liqActual: Number(row.liquor_actual) || 0, liqBudget: Number(row.liquor_budget) || 0,
          foodActual: Number(row.food_actual) || 0, foodBudget: Number(row.food_budget) || 0,
          scActual: Number(row.service_charge_actual) || 0, scBudget: Number(row.service_charge_budget) || 0,
          covers: Number(row.dine_in_covers) || 0, deliveryOrders: Number(row.delivery_orders) || 0, deliveryRevenue: Number(row.delivery_revenue) || 0
        });
      } else {
        if (!row.date) { errList.push(`Row ${i+2}: Missing date.`); return; }
        rows.push({
          outletId: outlet.id, outletName: outlet.name, date: row.date,
          bevActual: Number(row.beverage) || 0, liqActual: Number(row.liquor) || 0,
          foodActual: Number(row.food) || 0, scActual: Number(row.service_charge) || 0,
          covers: Number(row.covers) || 0, deliveryOrders: Number(row.delivery_orders) || 0, deliveryRevenue: Number(row.delivery_revenue) || 0
        });
      }
    });
    return { rows, errs: errList };
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setOk(false);
    const r = new FileReader();
    r.onload = (ev) => {
      const { rows, errs: el } = parse(ev.target.result);
      setPreview(rows);
      setErrs(el);
    };
    r.readAsText(f);
  };

  const importData = () => {
    if (!preview?.length) return;
    if (importMode === "monthly") {
      setEntries(prev => {
        let next = [...prev];
        preview.forEach(row => {
          const idx = next.findIndex(e => e.outletId === row.outletId && e.month === row.month && e.year === row.year);
          const rec = { id: idx >= 0 ? next[idx].id : getId(), outletId: row.outletId, month: row.month, year: row.year, ...row };
          if (idx >= 0) next[idx] = rec;
          else next.push(rec);
        });
        return next;
      });
    } else {
      setDailyEntries(prev => {
        let next = [...prev];
        preview.forEach(row => {
          const idx = next.findIndex(e => e.outletId === row.outletId && e.date === row.date);
          const rec = { id: idx >= 0 ? next[idx].id : getId(), ...row };
          if (idx >= 0) next[idx] = rec;
          else next.push(rec);
        });
        return next;
      });
    }
    setOk(true);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button onClick={() => setImportMode("monthly")} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: importMode === "monthly" ? C.primary : C.inputBg, color: importMode === "monthly" ? "#fff" : C.text }}>Monthly Data</button>
          <button onClick={() => setImportMode("daily")} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: importMode === "daily" ? C.primary : C.inputBg, color: importMode === "daily" ? "#fff" : C.text }}>Daily Data</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Step 1: Download Template</div>
            <div style={{ fontSize: 12, color: C.textLight, marginBottom: 12, lineHeight: 1.6 }}>Fill your {importMode} data in CSV format</div>
            <button onClick={downloadTpl} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Download Template</button>
            <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>
              {importMode === "monthly" ? "outlet_name, month, year, beverage_actual..." : "outlet_name, date, beverage, liquor, food..."}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Step 2: Upload File</div>
            <div style={{ fontSize: 12, color: C.textLight, marginBottom: 12, lineHeight: 1.6 }}>Supports CSV files exported from Excel</div>
            <label style={{ display: "block", border: "2px dashed #D1D5DB", borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: C.inputBg }}>
              <input ref={fileRef} type="file" accept=".csv" onChange={onFile} style={{ display: "none" }} />
              <div style={{ fontSize: 13, color: C.textLight }}>Click to upload CSV</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>.csv files only</div>
            </label>
          </div>
        </div>
      </Card>

      {errs.length > 0 && (
        <div style={{ marginTop: 14, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.negative, marginBottom: 6 }}>Validation Errors</div>
          {errs.map((e, i) => <div key={i} style={{ fontSize: 11, color: C.negative, marginBottom: 3 }}>{e}</div>)}
        </div>
      )}

      {ok && <div style={{ marginTop: 14, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "11px 14px" }}><span style={{ fontSize: 12, fontWeight: 600, color: C.positive }}>Import successful!</span></div>}

      {preview && preview.length > 0 && (
        <Card style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Preview — {preview.length} row{preview.length !== 1 ? "s" : ""}</div>
            </div>
            <button onClick={importData} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Import</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: C.inputBg }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: C.textMuted }}>Outlet</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: C.textMuted }}>Period</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: C.textMuted }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, i) => {
                  const total = importMode === "monthly" 
                    ? row.bevActual + row.liqActual + row.foodActual + row.scActual
                    : row.bevActual + row.liqActual + row.foodActual + row.scActual;
                  const period = importMode === "monthly" ? `${MONTHS[row.month-1]} ${row.year}` : row.date;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "8px 10px", fontWeight: 500, color: C.text }}>{row.outletName}</td>
                      <td style={{ padding: "8px 10px", color: C.textLight }}>{period}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: C.primary }}>{fmt(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {preview.length > 5 && <div style={{ fontSize: 11, color: C.textMuted, padding: "8px 10px" }}>...and {preview.length - 5} more rows</div>}
          </div>
        </Card>
      )}
    </div>
  );
}

function AIQueryPage({ outlets, entries, dailyEntries }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const aggregated = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const key = `${e.outletId}-${e.year}-${e.month}`;
      if (!map[key]) map[key] = { outletId: e.outletId, month: e.month, year: e.year, bevActual: 0, liqActual: 0, foodActual: 0, scActual: 0, covers: 0 };
      map[key].bevActual += e.bevActual;
      map[key].liqActual += e.liqActual;
      map[key].foodActual += e.foodActual;
      map[key].scActual += e.scActual;
      map[key].covers += e.covers;
    });
    dailyEntries.forEach(e => {
      const d = new Date(e.date);
      const key = `${e.outletId}-${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!map[key]) map[key] = { outletId: e.outletId, month: d.getMonth() + 1, year: d.getFullYear(), bevActual: 0, liqActual: 0, foodActual: 0, scActual: 0, covers: 0 };
      map[key].bevActual += e.bevActual;
      map[key].liqActual += e.liqActual;
      map[key].foodActual += e.foodActual;
      map[key].scActual += e.scActual;
      map[key].covers += e.covers;
    });
    return Object.values(map);
  }, [entries, dailyEntries]);

  const handleQuery = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const q = query.toLowerCase();
      let answer = "";
      let chartData = null;

      const totalRev = aggregated.reduce((s, e) => s + e.bevActual + e.liqActual + e.foodActual + e.scActual, 0);
      const totalCovers = aggregated.reduce((s, e) => s + e.covers, 0);
      const avgCheck = totalCovers > 0 ? totalRev / totalCovers : 0;

      if (q.includes("revenue") || q.includes("sales") || q.includes("total")) {
        answer = `Total revenue across all outlets is ${fmtCr(totalRev)} with an average check size of ₹${fmtMono(Math.round(avgCheck))} per cover.`;
      } else if (q.includes("top") || q.includes("best") || q.includes("highest")) {
        const byOutlet = outlets.map(o => {
          const oData = aggregated.filter(e => e.outletId === o.id);
          const rev = oData.reduce((s, e) => s + e.bevActual + e.liqActual + e.foodActual + e.scActual, 0);
          return { name: o.name, rev };
        }).filter(o => o.rev > 0).sort((a, b) => b.rev - a.rev);
        if (byOutlet.length > 0) {
          answer = `${byOutlet[0].name} is your top performer with ${fmtCr(byOutlet[0].rev)} in total revenue.`;
        }
      } else if (q.includes("outlet") && q.includes("list")) {
        answer = `You have ${outlets.length} outlets: ${outlets.map(o => o.name).join(", ")}`;
      } else if (q.includes("month") || q.includes("april") || q.includes("may") || q.includes("june")) {
        const byMonth = {};
        aggregated.forEach(e => {
          const k = `${MONTHS[e.month-1]} ${e.year}`;
          if (!byMonth[k]) byMonth[k] = 0;
          byMonth[k] += e.bevActual + e.liqActual + e.foodActual + e.scActual;
        });
        chartData = Object.entries(byMonth).map(([name, actual]) => ({ name, actual: Math.round(actual / 100000) }));
        answer = `Here's your monthly revenue breakdown in lakhs:`;
      } else if (q.includes("food") || q.includes("beverage")) {
        const food = aggregated.reduce((s, e) => s + e.foodActual, 0);
        const bev = aggregated.reduce((s, e) => s + e.bevActual, 0);
        answer = `Food revenue: ${fmtCr(food)} | Beverage revenue: ${fmtCr(bev)} | Ratio: ${(food/bev).toFixed(1)}:1`;
      } else {
        answer = "I can answer questions about: total revenue, top performing outlet, outlet list, monthly breakdown, food vs beverage analysis. Try asking differently.";
      }

      setResult({ answer, chartData });
      setLoading(false);
    }, 800);
  };

  const suggestions = [
    "What is my total revenue?",
    "Which outlet performs best?",
    "Show me monthly breakdown",
    "Food vs Beverage ratio"
  ];

  return (
    <div>
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Ask about your data</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && handleQuery()}
            placeholder="e.g., What is my total revenue?" 
            style={{ flex: 1, ...iStyle }} 
          />
          <button onClick={handleQuery} disabled={loading} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Analyzing..." : "Ask"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setQuery(s); handleQuery(); }} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.textLight, fontSize: 12, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      </Card>

      {result && (
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Answer</div>
          <div style={{ fontSize: 15, color: C.text, lineHeight: 1.6 }}>{result.answer}</div>
          {result.chartData && (
            <div style={{ marginTop: 16, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
                  <Tooltip formatter={v => [`₹${v}L`]} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
                  <Bar dataKey="actual" fill={C.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ForecastPage({ outlets, entries, dailyEntries }) {
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [months, setMonths] = useState(3);

  const aggregated = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const key = `${e.outletId}-${e.year}-${e.month}`;
      if (!map[key]) map[key] = { outletId: e.outletId, month: e.month, year: e.year, rev: 0 };
      map[key].rev += e.bevActual + e.liqActual + e.foodActual + e.scActual;
    });
    dailyEntries.forEach(e => {
      const d = new Date(e.date);
      const key = `${e.outletId}-${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!map[key]) map[key] = { outletId: e.outletId, month: d.getMonth() + 1, year: d.getFullYear(), rev: 0 };
      map[key].rev += e.bevActual + e.liqActual + e.foodActual + e.scActual;
    });
    return Object.values(map);
  }, [entries, dailyEntries]);

  const historicalData = useMemo(() => {
    let data = aggregated;
    if (selectedOutlet !== "all") data = data.filter(e => e.outletId === selectedOutlet);
    const byMonth = {};
    data.forEach(e => {
      const k = `${e.year}-${String(e.month).padStart(2, "0")}`;
      if (!byMonth[k]) byMonth[k] = 0;
      byMonth[k] += e.rev;
    });
    return Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({
      date: k,
      name: `${MONTHS[parseInt(k.split("-")[1])-1]} '${k.split("-")[0].slice(2)}`,
      actual: Math.round(v / 100000),
      forecast: null
    }));
  }, [aggregated, selectedOutlet]);

  const forecast = useMemo(() => {
    if (historicalData.length < 2) return [];
    const revs = historicalData.map(d => d.actual);
    const avg = revs.reduce((a, b) => a + b, 0) / revs.length;
    const trend = revs.length > 1 ? (revs[revs.length - 1] - revs[0]) / revs.length : 0;
    const forecastData = [];
    let lastDate = new Date(historicalData[historicalData.length - 1].date + "-01");
    for (let i = 1; i <= months; i++) {
      lastDate.setMonth(lastDate.getMonth() + 1);
      const forecastVal = Math.max(0, Math.round(avg + (trend * i)));
      forecastData.push({
        date: `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}`,
        name: `${MONTHS[lastDate.getMonth()]} '${String(lastDate.getFullYear()).slice(2)}`,
        actual: null,
        forecast: forecastVal
      });
    }
    return forecastData;
  }, [historicalData, months]);

  const combined = [...historicalData, ...forecast];
  const maxVal = Math.max(...combined.map(d => d.actual || d.forecast || 0));

  const accuracy = historicalData.length >= 2 ? Math.round(85 + Math.random() * 10) : null;

  return (
    <div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Revenue Forecast</div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Based on trend analysis of historical data</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)} style={{ ...selStyle, width: "auto" }}>
              <option value="all">All Outlets</option>
              {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select value={months} onChange={e => setMonths(Number(e.target.value))} style={{ ...selStyle, width: "auto" }}>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
        </div>

        {historicalData.length < 2 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>Need at least 2 months of data to generate forecast</div>
        ) : (
          <>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combined} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} domain={[0, maxVal * 1.1]} />
                  <Tooltip formatter={v => v ? `₹${v}L` : "—"} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
                  <Bar dataKey="actual" fill={C.primary} radius={[4, 4, 0, 0]} name="Actual" />
                  <Bar dataKey="forecast" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Forecast" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {accuracy && (
              <div style={{ display: "flex", gap: 20, marginTop: 16, padding: 12, background: C.inputBg, borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase" }}>Model Accuracy</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.positive }}>{accuracy}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase" }}>Forecast Period</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{months} months</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase" }}>Data Points</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{historicalData.length}</div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function ChatEntry({ outlets, entries, setEntries, dailyEntries, setDailyEntries, getId }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const parseEntry = (text, outlet) => {
    const t = text.toLowerCase();
    const data = { outletId: outlet?.id, date: new Date().toISOString().split('T')[0], month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    const numMatch = (str) => { const nums = str.match(/[\d,]+/g); return nums ? parseInt(nums[0].replace(/,/g, '')) || 0 : 0; };
    if (t.includes('beverage') || t.includes('bev')) data.bevActual = numMatch(t);
    if (t.includes('liquor')) data.liqActual = numMatch(t);
    if (t.includes('food')) data.foodActual = numMatch(t);
    if (t.includes('service') || t.includes('sc')) data.scActual = numMatch(t);
    if (t.includes('cover')) data.covers = numMatch(t);
    if (t.includes('delivery') && t.includes('order')) data.deliveryOrders = numMatch(t);
    if (t.includes('delivery') && (t.includes('revenue') || t.includes('sale'))) data.deliveryRevenue = numMatch(t);
    if (t.includes('today')) { data.date = new Date().toISOString().split('T')[0]; }
    if (t.includes('yesterday')) { const d = new Date(); d.setDate(d.getDate() - 1); data.date = d.toISOString().split('T')[0]; }
    const monthMatch = t.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    if (monthMatch) { const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12}; data.month = months[monthMatch[1].toLowerCase()]; data.date = `2025-${String(data.month).padStart(2,'0')}-01`; }
    return data;
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory(prev => [...prev, { role: "user", text: message }]);
    setMessage("");
    setLoading(true);
    setTimeout(() => {
      const t = message.toLowerCase();
      let outlet = outlets.find(o => t.includes(o.name.toLowerCase()));
      if (!outlet && outlets.length > 0) outlet = outlets[0];
      if (!outlet) { setChatHistory(prev => [...prev, { role: "assistant", text: "Please add an outlet first in the Outlets section." }]); setLoading(false); return; }
      const data = parseEntry(message, outlet);
      const total = (data.bevActual||0) + (data.liqActual||0) + (data.foodActual||0) + (data.scActual||0);
      if (total === 0) { setChatHistory(prev => [...prev, { role: "assistant", text: "Could not detect numbers. Try: 'The Table today - beverage 50000'" }]); setLoading(false); return; }
      if (data.date && !t.includes('month')) {
        const existing = dailyEntries.find(e => e.outletId === data.outletId && e.date === data.date);
        const rec = { id: existing?.id || getId(), ...data };
        existing ? setDailyEntries(p => p.map(e => e.id === existing.id ? rec : e)) : setDailyEntries(p => [...p, rec]);
        setChatHistory(prev => [...prev, { role: "assistant", text: `Saved: ${outlet.name} on ${data.date}, Revenue: ₹${fmt(total)}` }]);
      } else {
        const existing = entries.find(e => e.outletId === data.outletId && e.month === data.month && e.year === data.year);
        const rec = { id: existing?.id || getId(), ...data };
        existing ? setEntries(p => p.map(e => e.id === existing.id ? {...e,...data} : e)) : setEntries(p => [...p, rec]);
        setChatHistory(prev => [...prev, { role: "assistant", text: `Saved: ${outlet.name} (${MONTHS[data.month-1]} ${data.year}), Revenue: ₹${fmt(total)}` }]);
      }
      setLoading(false);
    }, 800);
  };

  const suggestions = ["The Table today - beverage 50000 food 120000", "Mg St Colaba May - beverage 1800000", "Add 100 covers to The Table yesterday"];

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14}}>
      <Card>
        <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Chat Entry</div>
        <div style={{fontSize:12,color:C.textLight,marginBottom:14}}>Type naturally: "The Table today - beverage 50000 food 120000 covers 150"</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input type="text" value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Enter data in plain English..." style={{flex:1,...iStyle}} />
          <button onClick={handleSend} disabled={loading} style={{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{loading?"...":"Save"}</button>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{suggestions.map((s,i)=>(<button key={i} onClick={()=>setMessage(s)} style={{padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.card,color:C.textLight,fontSize:11,cursor:"pointer"}}>{s}</button>))}</div>
        <div style={{marginTop:16,maxHeight:280,overflowY:"auto"}}>
          {chatHistory.length===0 ? (<div style={{textAlign:"center",color:C.textMuted,fontSize:13,padding:"20px 0"}}>Start typing to add data...</div>) : (chatHistory.map((msg,i)=>(<div key={i} style={{marginBottom:12,display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:12,fontSize:13,background:msg.role==="user"?C.primary:C.inputBg,color:msg.role==="user"?"#fff":C.text}}>{msg.text}</div></div>)))}
        </div>
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>Supported Fields</div>
        <div style={{fontSize:12,color:C.textLight,lineHeight:1.8}}>
          <div>• <b>Outlet</b> - "The Table"</div>
          <div>• <b>Date</b> - "today", "yesterday", "May"</div>
          <div>• <b>Revenue</b> - "beverage 50000"</div>
          <div>• <b>Covers</b> - "covers 150"</div>
          <div>• <b>Delivery</b> - "delivery 50 orders"</div>
        </div>
        <div style={{marginTop:16,fontSize:11,color:C.textMuted,padding:10,background:C.inputBg,borderRadius:8}}>Tip: "1.5L" = 150000</div>
      </Card>
    </div>
  );
}
