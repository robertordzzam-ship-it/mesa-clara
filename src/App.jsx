import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES  –  Outfit (clean, modern) + Fraunces (organic serif display)
───────────────────────────────────────────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    :root {
      --sand: #f2ede6;
      --sand2: #e8e0d5;
      --sand3: #d9cfc2;
      --bark: #5c4f3a;
      --bark2: #3a3028;
      --moss: #6b7c5c;
      --clay: #b87c5a;
      --clay2: #d4956e;
      --ink: #1e1a15;
      --fog: #f8f5f0;
      --white: #ffffff;
      --bride: #c4a882;
      --groom: #7a9e8e;
      --radius: 12px;
      --shadow: 0 2px 20px rgba(60,40,20,0.08);
      --shadow-lg: 0 8px 40px rgba(60,40,20,0.13);
    }
    body { font-family: 'Outfit', sans-serif; background: var(--sand); color: var(--ink); }
    * { -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--sand3); border-radius: 4px; }
    input, select, textarea, button { font-family: 'Outfit', sans-serif; }
    .fade { animation: fadeUp .3s ease both; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600; letter-spacing:.02em; }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:8px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; }
    .btn:hover { filter: brightness(0.95); transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }
    .btn-primary { background: var(--ink); color: var(--sand); }
    .btn-ghost { background: transparent; color: var(--bark); border: 1.5px solid var(--sand3); }
    .btn-ghost:hover { background: var(--sand2); }
    .input { width:100%; border:1.5px solid var(--sand3); border-radius:8px; padding:9px 13px; font-size:13px; color:var(--ink); background:var(--white); outline:none; transition:border-color .15s; }
    .input:focus { border-color: var(--bark); }
    .card { background: var(--white); border-radius: 14px; border: 1px solid var(--sand2); box-shadow: var(--shadow); }
    .drag-chip { cursor:grab; user-select:none; transition:transform .12s, box-shadow .12s, opacity .12s; }
    .drag-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(60,40,20,0.15); }
    .drag-chip:active { cursor:grabbing; opacity:.85; }
    .table-node { cursor:grab; user-select:none; transition:box-shadow .15s, transform .15s; }
    .table-node:hover { transform: scale(1.03); }
    .table-node.dragging { cursor:grabbing; opacity:.9; transform:scale(1.05); }
    .table-node.drop-over { box-shadow: 0 0 0 3px var(--moss), 0 8px 24px rgba(0,0,0,.15) !important; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────────
   DATA MODEL
───────────────────────────────────────────────────────────────────────────── */
const mkId = () => Math.random().toString(36).slice(2, 9);

const seedGuests = [
  { id:"g1", first:"Elena",     last:"Whitfield", plusOne:true,  plusOneFood:"Salmon",  food:"Beef",       side:"bride", occasion:"30th Birthday",    tableId:null },
  { id:"g2", first:"Roberto",   last:"Navarro",   plusOne:false, plusOneFood:"",        food:"Chicken",    side:"groom", occasion:"",                  tableId:null },
  { id:"g3", first:"Natalie",   last:"Brooks",    plusOne:true,  plusOneFood:"Vegan",   food:"Salmon",     side:"bride", occasion:"Anniversary",        tableId:null },
  { id:"g4", first:"Sebastian", last:"Moore",     plusOne:false, plusOneFood:"",        food:"Beef",       side:"groom", occasion:"",                  tableId:null },
  { id:"g5", first:"Priya",     last:"Sharma",    plusOne:true,  plusOneFood:"Vegan",   food:"Vegetarian", side:"bride", occasion:"New baby",           tableId:null },
  { id:"g6", first:"Carlos",    last:"Navarro",   plusOne:false, plusOneFood:"",        food:"Beef",       side:"groom", occasion:"",                  tableId:null },
  { id:"g7", first:"Amara",     last:"Johnson",   plusOne:true,  plusOneFood:"Chicken", food:"Salmon",     side:"bride", occasion:"Engagement",         tableId:null },
  { id:"g8", first:"Liam",      last:"O'Brien",   plusOne:false, plusOneFood:"",        food:"Chicken",    side:"groom", occasion:"",                  tableId:null },
  { id:"g9", first:"Chloe",     last:"Laurent",   plusOne:true,  plusOneFood:"Salmon",  food:"Vegetarian", side:"bride", occasion:"",                  tableId:null },
  { id:"g10",first:"Felix",     last:"Wagner",    plusOne:false, plusOneFood:"",        food:"Beef",       side:"groom", occasion:"Retirement",         tableId:null },
];

const seedTables = [
  { id:"t1", name:"Table 1",    capacity:8,  x:140, y:130 },
  { id:"t2", name:"Table 2",    capacity:8,  x:340, y:110 },
  { id:"t3", name:"Table 3",    capacity:6,  x:550, y:140 },
  { id:"t4", name:"Table 4",    capacity:8,  x:130, y:310 },
  { id:"t5", name:"Table 5",    capacity:8,  x:350, y:300 },
  { id:"t6", name:"Head Table", capacity:10, x:340, y:470 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fullName  = g => `${g.first} ${g.last}`;
const seats     = g => g.plusOne ? 2 : 1;
const occSeats  = (t, gs) => gs.filter(g=>g.tableId===t.id).reduce((s,g)=>s+seats(g),0);

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const heads = lines[0].split(",").map(h=>h.trim().replace(/"/g,"").toLowerCase());
  const col = (...keys) => { for (const k of keys) { const i=heads.findIndex(h=>h.includes(k)); if(i>=0) return i; } return -1; };
  return lines.slice(1).map((line,i) => {
    const c = line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
    const get = (...k) => { const i=col(...k); return i>=0 ? c[i]||"" : ""; };
    const pRaw = get("plus","plusone","+1","guest2").toLowerCase();
    const side = get("side","bride","groom").toLowerCase().includes("groom") ? "groom" : "bride";
    return {
      id: "csv_"+mkId(), first: get("first","fname","name")||`Guest`, last: get("last","lname","surname")||`${i+1}`,
      plusOne: ["yes","true","1","y"].includes(pRaw),
      food: get("food","meal","dish","menu","preference"),
      plusOneFood: get("plusonefood","plusmeal","+1food","guestfood","guest2food"),
      side, tableId: null,
    };
  }).filter(g => g.first !== "Guest" || g.last !== String(lines.indexOf(lines[1])+1) || true);
}

/* ─────────────────────────────────────────────────────────────────────────────
   SMALL SHARED UI
───────────────────────────────────────────────────────────────────────────── */
function Tag({ color, children }) {
  const styles = {
    bride: { bg:"#f5ede3", text:"#a0623a" },
    groom: { bg:"#e3eee8", text:"#3d7a62" },
    yes:   { bg:"#e7f2ec", text:"#2e7d5a" },
    no:    { bg:"#f5f4f2", text:"#8a7f74" },
  };
  const s = styles[color] || { bg:"#f0ebe4", text:"#5c4f3a" };
  return <span className="pill" style={{ background:s.bg, color:s.text }}>{children}</span>;
}

function Modal({ title, onClose, children, width=460 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(20,15,10,.55)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(3px)" }} onClick={onClose}>
      <div className="card fade" style={{ width, padding:"28px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ fontFamily:"'Fraunces', serif", fontSize:22, fontWeight:400, color:"var(--ink)" }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:16, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--bark)", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: GUESTS  —  summary strip + spreadsheet-style editing
───────────────────────────────────────────────────────────────────────────── */

const emptyGuest = () => ({ id:"g"+mkId(), first:"", last:"", plusOne:false, food:"", plusOneFood:"", side:"bride", occasion:"", tableId:null });

function SummaryBar({ guests, tables, settings }) {
  const total       = guests.length;
  const totalSeats  = guests.reduce((s,g)=>s+seats(g),0);
  const assigned    = guests.filter(g=>g.tableId).length;
  const withPlusOne = guests.filter(g=>g.plusOne).length;
  const unassigned  = total - assigned;

  // by side
  const sideOptions = settings.sideOptions || ["bride","groom"];
  const sideCounts  = Object.fromEntries(sideOptions.map(s=>[s, guests.filter(g=>g.side===s).length]));

  // food breakdown
  const foodMap = {};
  guests.forEach(g=>{
    if(g.food)    foodMap[g.food]    = (foodMap[g.food]||0)+1;
    if(g.plusOne && g.plusOneFood) foodMap[g.plusOneFood] = (foodMap[g.plusOneFood]||0)+1;
  });

  const statCard = (label, value, sub, color="#1e1a15") => (
    <div style={{ background:"var(--white)", border:"1px solid var(--sand2)", borderRadius:12, padding:"14px 18px", minWidth:110 }}>
      <div style={{ fontSize:26, fontWeight:600, color, fontFamily:"'Fraunces', serif", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, fontWeight:600, color:"var(--ink)", marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"var(--bark)", marginTop:2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ background:"var(--fog)", borderBottom:"1px solid var(--sand2)", padding:"14px 28px", flexShrink:0 }}>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"stretch" }}>
        {statCard("Total seats", totalSeats, `across ${total} guests`)}
        {statCard("Total guests", total, `${withPlusOne} with +1`)}
        {statCard("Assigned", assigned, `${unassigned} still unassigned`, assigned===total?"var(--moss)":"var(--clay)")}
        {statCard("Unassigned", unassigned, `${Math.round(unassigned/Math.max(total,1)*100)}% remaining`, unassigned===0?"var(--moss)":"var(--clay)")}
        {/* Side breakdown */}
        <div style={{ background:"var(--white)", border:"1px solid var(--sand2)", borderRadius:12, padding:"14px 18px", minWidth:160 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--ink)", marginBottom:8 }}>By party</div>
          {sideOptions.filter(s=>sideCounts[s]>0).map(s=>(
            <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background: s==="bride"||s==="bride parents"?"var(--clay)": s==="groom"||s==="groom parents"?"var(--moss)":"var(--bark)" }}/>
                <span style={{ fontSize:12, color:"var(--bark)", textTransform:"capitalize" }}>{s}</span>
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{sideCounts[s]}</span>
            </div>
          ))}
        </div>
        {/* Food breakdown */}
        {Object.keys(foodMap).length > 0 && (
          <div style={{ background:"var(--white)", border:"1px solid var(--sand2)", borderRadius:12, padding:"14px 18px", minWidth:160, maxWidth:220 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--ink)", marginBottom:8 }}>Meal choices</div>
            {Object.entries(foodMap).sort((a,b)=>b[1]-a[1]).map(([f,n])=>(
              <div key={f} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:"var(--bark)" }}>{f}</span>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{n}</span>
              </div>
            ))}
          </div>
        )}
        {/* Occasions */}
        {guests.some(g=>g.occasion) && (
          <div style={{ background:"var(--white)", border:"1px solid var(--sand2)", borderRadius:12, padding:"14px 18px", minWidth:160 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--ink)", marginBottom:8 }}>Special occasions</div>
            {guests.filter(g=>g.occasion).map(g=>(
              <div key={g.id} style={{ fontSize:12, color:"var(--bark)", marginBottom:4 }}>
                <span style={{ color:"var(--ink)", fontWeight:500 }}>{g.first}</span> — {g.occasion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GuestsTab({ guests, setGuests, tables, settings }) {
  const [q, setQ]               = useState("");
  const [filterSide, setFilter] = useState("all");
  const [active, setActive]     = useState(null);
  const fileRef                 = useRef();
  const tbodyRef                = useRef();

  const foodOpts     = settings.foodOptions    || [];
  const sideOpts     = settings.sideOptions    || ["bride","groom"];
  const occasionOpts = settings.occasionOptions|| [];

  // Column definitions — built dynamically so dropdowns reflect settings
  const COLS = [
    { key:"first",       label:"First Name",       w:110, type:"text",   placeholder:"Sofia"    },
    { key:"last",        label:"Last Name",         w:120, type:"text",   placeholder:"Martínez" },
    { key:"plusOne",     label:"+1?",               w:66,  type:"toggle"                         },
    { key:"food",        label:"Food",              w:130, type:"dropdown", opts:foodOpts, placeholder:"Select or type…" },
    { key:"plusOneFood", label:"+1 Food",           w:130, type:"dropdown", opts:foodOpts, placeholder:"Select or type…" },
    { key:"side",        label:"Party / Side",      w:130, type:"sideDropdown"                   },
    { key:"occasion",    label:"Special Occasion ✦",w:180, type:"dropdown", opts:occasionOpts, placeholder:"e.g. Birthday…" },
    { key:"tableId",     label:"Table",             w:110, type:"table"                          },
  ];

  const shown = guests.filter(g => {
    if (q && !fullName(g).toLowerCase().includes(q.toLowerCase())) return false;
    if (filterSide !== "all" && g.side !== filterSide) return false;
    return true;
  });

  function patch(id, key, val) { setGuests(gs => gs.map(g => g.id===id ? {...g,[key]:val} : g)); }
  function del(id) { setGuests(gs=>gs.filter(g=>g.id!==id)); setActive(null); }

  function insertRowAfter(id) {
    const ng = emptyGuest();
    setGuests(gs => { const i=gs.findIndex(g=>g.id===id); const n=[...gs]; n.splice(i+1,0,ng); return n; });
    setTimeout(()=>setActive({rowId:ng.id,col:0}),30);
  }
  function addRow() {
    const ng = emptyGuest();
    setGuests(gs=>[...gs,ng]);
    setTimeout(()=>setActive({rowId:ng.id,col:0}),30);
  }

  function handleFile(e) {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{ const p=parseCSV(ev.target.result); if(p.length) setGuests(gs=>[...gs,...p]); else alert("Couldn't parse — export as CSV."); };
    r.readAsText(f); e.target.value="";
  }

  function onKeyDown(e, rowId, colIdx) {
    if (e.key==="Tab") {
      e.preventDefault();
      const nc = e.shiftKey ? colIdx-1 : colIdx+1;
      if (nc>=0&&nc<COLS.length) setActive({rowId,col:nc});
      else if (!e.shiftKey) {
        const ri=shown.findIndex(g=>g.id===rowId);
        const nr=shown[ri+1];
        if(nr) setActive({rowId:nr.id,col:0}); else addRow();
      }
    } else if (e.key==="Enter") { e.preventDefault(); insertRowAfter(rowId); }
    else if (e.key==="Escape")  setActive(null);
  }

  // ── Cell
  function Cell({ g, col, colIdx }) {
    const isActive = active?.rowId===g.id && active?.col===colIdx;
    const tbl = tables.find(t=>t.id===g.tableId);
    const cellBase = {
      padding:0, borderRight:"1px solid var(--sand2)", position:"relative",
      minWidth:col.w, maxWidth:col.w, height:38,
      background: isActive?"#fffdf9":"transparent",
      outline: isActive?"2px solid var(--clay)":"none", outlineOffset:-2,
      cursor:"text", overflow:"hidden",
    };
    const inp = { width:"100%", height:"100%", border:"none", background:"transparent", padding:"0 11px", fontSize:13, color:"var(--ink)", outline:"none", fontFamily:"'Outfit',sans-serif" };
    const activate = e => { e.stopPropagation(); setActive({rowId:g.id,col:colIdx}); };

    // TOGGLE (+1)
    if (col.type==="toggle") {
      return (
        <td style={{...cellBase,cursor:"pointer",textAlign:"center"}} onClick={()=>patch(g.id,col.key,!g[col.key])}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100%"}}>
            <div style={{width:34,height:18,borderRadius:9,background:g[col.key]?"var(--moss)":"var(--sand3)",position:"relative",transition:"background .2s"}}>
              <div style={{position:"absolute",top:2,left:g[col.key]?16:2,width:14,height:14,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .2s"}}/>
            </div>
          </div>
        </td>
      );
    }

    // SIDE DROPDOWN
    if (col.type==="sideDropdown") {
      const sideColor = s => s==="bride"||s==="bride parents"?"#f9f0e8":s==="groom"||s==="groom parents"?"#e8f2ec":"var(--sand2)";
      const sideText  = s => s==="bride"||s==="bride parents"?"var(--clay)":s==="groom"||s==="groom parents"?"var(--moss)":"var(--bark)";
      if (isActive) return (
        <td style={cellBase}>
          <select autoFocus value={g.side} onChange={e=>patch(g.id,"side",e.target.value)}
            onKeyDown={e=>onKeyDown(e,g.id,colIdx)} onBlur={()=>setActive(null)} style={{...inp,cursor:"pointer"}}>
            {sideOpts.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </td>
      );
      return (
        <td style={cellBase} onClick={activate}>
          <div style={{padding:"0 10px",height:"100%",display:"flex",alignItems:"center"}}>
            <span className="pill" style={{background:sideColor(g.side),color:sideText(g.side),textTransform:"capitalize"}}>{g.side||"—"}</span>
          </div>
        </td>
      );
    }

    // TABLE DROPDOWN
    if (col.type==="table") {
      if (isActive) return (
        <td style={cellBase}>
          <select autoFocus value={g.tableId||""} onChange={e=>patch(g.id,"tableId",e.target.value||null)}
            onKeyDown={e=>onKeyDown(e,g.id,colIdx)} onBlur={()=>setActive(null)} style={{...inp,cursor:"pointer"}}>
            <option value="">— unassigned —</option>
            {tables.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </td>
      );
      return (
        <td style={cellBase} onClick={activate}>
          <div style={{padding:"0 11px",height:"100%",display:"flex",alignItems:"center"}}>
            {tbl ? <span className="pill" style={{background:"var(--sand2)",color:"var(--bark2)"}}>{tbl.name}</span>
                 : <span style={{color:"var(--sand3)",fontSize:12}}>—</span>}
          </div>
        </td>
      );
    }

    // DROPDOWN (food, occasion) — autocomplete: type freely OR pick from list
    if (col.type==="dropdown") {
      const disabled = col.key==="plusOneFood" && !g.plusOne;
      const listId = `dl_${col.key}`;
      if (isActive && !disabled) return (
        <td style={cellBase}>
          <input autoFocus list={listId} style={inp}
            value={g[col.key]||""} placeholder={col.placeholder||""}
            onChange={e=>patch(g.id,col.key,e.target.value)}
            onKeyDown={e=>onKeyDown(e,g.id,colIdx)} onBlur={()=>setActive(null)} />
          {col.opts?.length>0 && (
            <datalist id={listId}>{col.opts.map(o=><option key={o} value={o}/>)}</datalist>
          )}
        </td>
      );
      const val = g[col.key]; const empty = !val;
      const warn = col.key==="plusOneFood" && g.plusOne && !val;
      return (
        <td style={{...cellBase,cursor:disabled?"default":"text"}} onClick={disabled?undefined:activate}>
          <div style={{padding:"0 11px",height:"100%",display:"flex",alignItems:"center",
            color:warn?"var(--clay)":empty?"var(--sand3)":"var(--ink)",fontStyle:empty&&!disabled?"italic":"normal",fontSize:13}}>
            {warn?"⚠ missing":empty?(disabled?"—":col.placeholder):val}
          </div>
        </td>
      );
    }

    // TEXT (default)
    if (isActive) return (
      <td style={cellBase}>
        <input autoFocus style={inp} value={g[col.key]||""} placeholder={col.placeholder||""}
          onChange={e=>patch(g.id,col.key,e.target.value)}
          onKeyDown={e=>onKeyDown(e,g.id,colIdx)} onBlur={()=>setActive(null)} />
      </td>
    );
    const val=g[col.key]; const empty=!val;
    return (
      <td style={cellBase} onClick={activate}>
        <div style={{padding:"0 11px",height:"100%",display:"flex",alignItems:"center",
          color:empty?"var(--sand3)":"var(--ink)",fontStyle:empty?"italic":"normal",fontSize:13}}>
          {empty?(col.placeholder||""):(col.key==="first"?<strong>{val}</strong>:val)}
        </div>
      </td>
    );
  }

  return (
    <div className="fade" style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
      {/* Summary */}
      <SummaryBar guests={guests} tables={tables} settings={settings} />

      {/* Toolbar */}
      <div style={{ padding:"10px 20px", flexShrink:0, borderBottom:"1px solid var(--sand2)", background:"var(--fog)", display:"flex", alignItems:"center", gap:10 }}>
        <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search guests…" style={{width:200,height:32,padding:"0 12px",fontSize:13}} />
        <div style={{display:"flex",background:"var(--white)",border:"1.5px solid var(--sand3)",borderRadius:8,padding:3,gap:3}}>
          <button onClick={()=>setFilter("all")} style={{padding:"3px 10px",borderRadius:6,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:filterSide==="all"?"var(--ink)":"transparent",color:filterSide==="all"?"var(--sand)":"var(--bark)",transition:"all .15s"}}>All</button>
          {sideOpts.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"3px 10px",borderRadius:6,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:filterSide===s?"var(--ink)":"transparent",color:filterSide===s?"var(--sand)":"var(--bark)",transition:"all .15s",textTransform:"capitalize"}}>{s}</button>
          ))}
        </div>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:"var(--bark)"}}>Click cell to edit · Tab = next · Enter = new row</span>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleFile}/>
        <button className="btn btn-ghost" style={{height:32,fontSize:12}} onClick={()=>fileRef.current.click()}>↑ CSV</button>
        <button className="btn btn-primary" style={{height:32,fontSize:12}} onClick={addRow}>+ Row</button>
      </div>

      {/* Spreadsheet */}
      <div style={{flex:1,overflowY:"auto",overflowX:"auto"}} onClick={()=>setActive(null)}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,tableLayout:"fixed"}} onClick={e=>e.stopPropagation()}>
          <colgroup>{COLS.map(c=><col key={c.key} style={{width:c.w}}/>)}<col style={{width:36}}/></colgroup>
          <thead style={{position:"sticky",top:0,zIndex:10}}>
            <tr style={{background:"var(--fog)",borderBottom:"2px solid var(--sand2)"}}>
              {COLS.map(c=>(
                <th key={c.key} style={{padding:"9px 11px",textAlign:"left",fontSize:10,fontWeight:700,color:"var(--bark)",textTransform:"uppercase",letterSpacing:".07em",borderRight:"1px solid var(--sand2)",userSelect:"none",whiteSpace:"nowrap"}}>
                  {c.label}
                </th>
              ))}
              <th style={{width:36}}/>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {shown.length===0&&(
              <tr><td colSpan={COLS.length+1} style={{padding:"60px 0",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>🌿</div>
                <div style={{color:"var(--bark)",fontSize:14,marginBottom:12}}>No guests yet</div>
                <button className="btn btn-primary" onClick={addRow}>Add first guest</button>
              </td></tr>
            )}
            {shown.map((g,ri)=>(
              <tr key={g.id} style={{borderBottom:"1px solid var(--sand2)",background:ri%2===0?"var(--white)":"var(--fog)"}}>
                {COLS.map((col,ci)=><Cell key={col.key} g={g} col={col} colIdx={ci}/>)}
                <td style={{width:36,textAlign:"center",borderRight:"none"}}>
                  <button title="Delete" onClick={()=>del(g.id)}
                    style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand3)",fontSize:15,padding:"4px 6px",borderRadius:5,transition:"color .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.color="#c0392b"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--sand3)"}>×</button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={COLS.length+1} style={{padding:"5px 12px",borderTop:"1.5px dashed var(--sand2)"}}>
                <button onClick={addRow} style={{background:"none",border:"none",cursor:"pointer",color:"var(--bark)",fontSize:12,display:"flex",alignItems:"center",gap:6,padding:"4px",borderRadius:6,opacity:.55,transition:"opacity .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.55}>
                  <span style={{fontSize:16,lineHeight:1}}>+</span> Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: SEATING PLANNER
───────────────────────────────────────────────────────────────────────────── */
function PlannerTab({ guests, setGuests, tables, setTables }) {
  const [venueBg, setVenueBg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x:0, y:0 });
  const [selectedId, setSelectedId] = useState(null);
  const [draggingGuest, setDraggingGuest] = useState(null);
  const [overTable, setOverTable] = useState(null);
  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOff, setDragOff] = useState({ x:0, y:0 });
  const [newTblOpen, setNewTblOpen] = useState(false);
  const [newTbl, setNewTbl] = useState({ name:"", capacity:8 });
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);
  const [rawBase64, setRawBase64] = useState(null); // keep base64 for AI analysis
  const canvasRef = useRef();
  const bgFileRef = useRef();

  const unassigned = guests.filter(g => !g.tableId);
  const sel = tables.find(t=>t.id===selectedId);

  /* ── Zoom helpers */
  function handleWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    setZoom(z => Math.min(3, Math.max(0.25, z * factor)));
  }
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive:false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  /* ── Pan with middle-click or space+drag */
  function onCanvasMouseDown(e) {
    if (e.button === 1 || e.altKey) {
      e.preventDefault(); setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }
  useEffect(() => {
    if (!isPanning) return;
    const mv = e => setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    const up = () => setIsPanning(false);
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [isPanning, panStart]);

  /* ── Table drag — distinguish click vs drag by movement distance */
  const dragStartPos = useRef(null);
  const hasDragged = useRef(false);

  function onTableMouseDown(e, id) {
    if (e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    const t = tables.find(x=>x.id===id); if (!t) return;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
    // Capture offset synchronously in closure (don't rely on state)
    const offX = (e.clientX - pan.x) / zoom - t.x;
    const offY = (e.clientY - pan.y) / zoom - t.y;
    // Capture pan/zoom in closure at mousedown time
    const panSnap = { ...pan };
    const zoomSnap = zoom;

    const onMove = (me) => {
      const dx = me.clientX - dragStartPos.current.x;
      const dy = me.clientY - dragStartPos.current.y;
      if (!hasDragged.current && Math.sqrt(dx*dx + dy*dy) > 5) {
        hasDragged.current = true;
        setDraggingTable(id);
      }
      if (hasDragged.current) {
        const x = (me.clientX - panSnap.x) / zoomSnap - offX;
        const y = (me.clientY - panSnap.y) / zoomSnap - offY;
        setTables(ts => ts.map(t => t.id===id ? {...t, x, y} : t));
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!hasDragged.current) {
        setSelectedId(prev => prev === id ? null : id);
      }
      setDraggingTable(null);
      hasDragged.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  // keep pan effect, remove old drag effect (now inline above)

  /* ── Guest drop */
  function onTableDrop(e, tableId) {
    e.preventDefault(); e.stopPropagation();
    if (!draggingGuest) return;
    const tbl = tables.find(t=>t.id===tableId);
    const g = guests.find(x=>x.id===draggingGuest);
    if (!tbl || !g) { setDraggingGuest(null); setOverTable(null); return; }
    const occ = occSeats(tbl, guests);
    const need = seats(g);
    if (occ + need > tbl.capacity) { alert(`"${tbl.name}" is full! (${occ}/${tbl.capacity} seats used)`); setDraggingGuest(null); setOverTable(null); return; }
    setGuests(gs => gs.map(x => x.id===draggingGuest ? {...x, tableId} : x));
    setDraggingGuest(null); setOverTable(null);
  }

  function removeFromTable(gid) { setGuests(gs=>gs.map(g=>g.id===gid?{...g,tableId:null}:g)); }
  function delTable(id) { setGuests(gs=>gs.map(g=>g.tableId===id?{...g,tableId:null}:g)); setTables(ts=>ts.filter(t=>t.id!==id)); if(selectedId===id)setSelectedId(null); }

  function addTable() {
    if (!newTbl.name.trim()) return;
    setTables(ts=>[...ts,{id:"t"+mkId(),name:newTbl.name,capacity:parseInt(newTbl.capacity)||8,x:180+Math.random()*220,y:130+Math.random()*200}]);
    setNewTbl({name:"",capacity:8}); setNewTblOpen(false);
  }

  async function handleBgUpload(e) {
    const f = e.target.files[0]; if(!f) return;
    e.target.value="";
    setDetectError(null);

    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const dataUrl = canvas.toDataURL("image/png");
      setVenueBg(dataUrl);
      setRawBase64(dataUrl.split(",")[1]);
    } else {
      const reader = new FileReader();
      reader.onload = ev => {
        setVenueBg(ev.target.result);
        setRawBase64(ev.target.result.split(",")[1]);
      };
      reader.readAsDataURL(f);
    }
  }

  async function detectTablesWithAI() {
    if (!rawBase64) return;
    setDetecting(true);
    setDetectError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/png", data: rawBase64 }
              },
              {
                type: "text",
                text: `This is a wedding venue floor plan. Carefully identify every guest table.

For each table return:
- "name": the table label/number shown in the image (e.g. "Table 1", "T3", "Head Table"). If no label, name them sequentially.
- "xPct": the horizontal center of the table as a percentage of the total image width (0 = left edge, 100 = right edge)
- "yPct": the vertical center of the table as a percentage of the total image height (0 = top edge, 100 = bottom edge)
- "capacity": estimated number of seats around the table (count chairs if visible, otherwise default 8)
- "shape": "round" or "rect" based on the table shape in the image

Be precise about xPct and yPct — they will be used to place tables on a canvas that mirrors the floor plan exactly.

Respond ONLY with a JSON array, no other text, no markdown. Example:
[{"name":"Table 1","xPct":22,"yPct":35,"capacity":10,"shape":"round"},{"name":"Table 2","xPct":55,"yPct":60,"capacity":8,"shape":"rect"}]`
              }
            ]
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const detected = JSON.parse(clean);
      if (!Array.isArray(detected) || detected.length === 0) throw new Error("No tables found");

      // Map percentages to 900x700 canvas, with padding so tables don't hit edges
      const CANVAS_W = 900, CANVAS_H = 700, MARGIN = 80;
      setTables(detected.map(t => ({
        id: "t" + mkId(),
        name: t.name || "Table",
        capacity: Math.max(2, Math.min(40, t.capacity || 8)),
        shape: t.shape || "round",
        x: Math.round(MARGIN + (t.xPct / 100) * (CANVAS_W - MARGIN * 2)),
        y: Math.round(MARGIN + (t.yPct / 100) * (CANVAS_H - MARGIN * 2)),
      })));
    } catch(err) {
      setDetectError("Couldn't detect tables — try again or add them manually.");
      console.error(err);
    }
    setDetecting(false);
  }

  const R = 46;        // circle radius
  const LABEL_R = 80;  // distance from table center to name labels
  const PAD = 90;      // padding around circle so names don't clip

  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

      {/* LEFT PANEL – unassigned */}
      <div style={{ width:210, background:"var(--white)", borderRight:"1px solid var(--sand2)", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
        <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid var(--sand2)" }}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:18, fontWeight:400, color:"var(--ink)", marginBottom:3 }}>Unassigned</div>
          <div style={{ fontSize:12, color:"var(--bark)" }}>{unassigned.length} guests to place</div>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:"10px 10px 0" }}>
          {unassigned.length === 0 && (
            <div style={{ textAlign:"center", padding:"32px 12px", color:"var(--sand3)" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🎉</div>
              <div style={{ fontSize:12, color:"var(--bark)" }}>All seated!</div>
            </div>
          )}
          {unassigned.map(g => (
            <div key={g.id} draggable className="drag-chip"
              onDragStart={()=>setDraggingGuest(g.id)}
              onDragEnd={()=>{setDraggingGuest(null);setOverTable(null);}}
              style={{
                background: g.side==="bride" ? "#f9f0e8" : "#e8f2ec",
                borderLeft:`3px solid ${g.side==="bride"?"var(--clay)":"var(--moss)"}`,
                borderRadius:8, padding:"8px 10px", marginBottom:6, fontSize:12, fontWeight:500, color:"var(--ink)",
                display:"flex", justifyContent:"space-between", alignItems:"center"
              }}>
              <div>
                <div>{g.first} {g.last}</div>
                {g.food && <div style={{fontSize:10,color:"var(--bark)",marginTop:1}}>🍽 {g.food}</div>}
              </div>
              {g.plusOne && <span className="pill" style={{background:"#e7f2ec",color:"var(--moss)",fontSize:10}}>+1</span>}
            </div>
          ))}
        </div>
        <div style={{ padding:"10px", borderTop:"1px solid var(--sand2)" }}>
          <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>setNewTblOpen(true)}>+ Add table</button>
        </div>
      </div>

      {/* CENTER – canvas */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
        {/* Toolbar */}
        <div style={{ background:"var(--fog)", borderBottom:"1px solid var(--sand2)", padding:"8px 16px", display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
          <input ref={bgFileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" style={{display:"none"}} onChange={handleBgUpload} />
          <button className="btn btn-ghost" style={{fontSize:12,padding:"6px 13px"}} onClick={()=>bgFileRef.current.click()}>🗺 Upload venue map</button>
          {venueBg && <button className="btn" style={{fontSize:12,padding:"6px 10px",background:"#fff2f2",color:"#c0392b",border:"1.5px solid #fecaca"}} onClick={()=>{ setVenueBg(null); setRawBase64(null); setDetectError(null); }}>✕ Remove map</button>}
          {venueBg && (
            <button className="btn" onClick={detectTablesWithAI} disabled={detecting}
              style={{fontSize:12,padding:"6px 14px",background:detecting?"var(--sand2)":"var(--ink)",color:detecting?"var(--bark)":"var(--sand)",border:"none",cursor:detecting?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>
              {detecting
                ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite",fontSize:14}}>⟳</span> Detecting…</>
                : "✦ Detect tables"}
            </button>
          )}
          {detectError && <span style={{fontSize:11,color:"var(--clay)"}}>{detectError}</span>}
          <div style={{flex:1}}/>
          {/* Zoom controls */}
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--white)", border:"1.5px solid var(--sand2)", borderRadius:8, padding:"4px 8px" }}>
            <button onClick={()=>setZoom(z=>Math.max(.25,z-.1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--bark)",padding:"0 4px",lineHeight:1}}>−</button>
            <span style={{fontSize:12,fontWeight:600,color:"var(--bark)",minWidth:38,textAlign:"center"}}>{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(3,z+.1))} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--bark)",padding:"0 4px",lineHeight:1}}>+</button>
          </div>
          <button className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>{setZoom(1);setPan({x:0,y:0});}}>Reset</button>
          <span style={{fontSize:11,color:"var(--bark)"}}>Alt+drag to pan · Scroll to zoom</span>
        </div>

        {/* Canvas viewport */}
        <div
          ref={canvasRef}
          style={{ flex:1, overflow:"hidden", position:"relative", cursor: isPanning?"grabbing": draggingTable?"grabbing":"default" }}
          onMouseDown={onCanvasMouseDown}
          onDragOver={e=>e.preventDefault()}
        >
          {/* Transformed world */}
          <div style={{ position:"absolute", transformOrigin:"0 0", transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`, width: 900, height: 700 }}>
            {/* Subtle dot grid */}
            <svg style={{ position:"absolute", inset:0, width:900, height:700, pointerEvents:"none", opacity:0.4 }}>
              <defs><pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.2" fill="var(--sand3)"/></pattern></defs>
              <rect width="900" height="700" fill="url(#dots)"/>
            </svg>

            {/* Venue bg */}
            {venueBg && (
              <img src={venueBg} alt="venue"
                onError={e=>console.error("venue map failed to load",e)}
                style={{ position:"absolute", top:0, left:0, width:900, height:700, objectFit:"contain", opacity:.45, pointerEvents:"none", zIndex:0 }} />
            )}

            {/* TABLES */}
            {tables.map(t => {
              const occ = occSeats(t, guests);
              const pct = occ / t.capacity;
              const fill = pct >= 1 ? "#c0392b" : pct >= .8 ? "#d4691e" : "var(--moss)";
              const isOver = overTable === t.id;
              const isSel = selectedId === t.id;
              const tableGuests = guests.filter(g => g.tableId === t.id);
              const boxSize = R * 2 + PAD * 2;

              return (
                <div key={t.id}
                  className={`table-node${draggingTable===t.id?" dragging":""}`}
                  style={{
                    position:"absolute",
                    left: t.x - PAD - R,
                    top:  t.y - PAD - R,
                    width: boxSize,
                    height: boxSize,
                    overflow: "visible",
                  }}
                  onMouseDown={e => onTableMouseDown(e, t.id)}
                  onDrop={e => onTableDrop(e, t.id)}
                  onDragOver={e => { e.preventDefault(); setOverTable(t.id); }}
                  onDragLeave={() => setOverTable(null)}
                >
                  {/* Table shape — round or rect based on detection */}
                  <div style={{
                    position:"absolute",
                    left: PAD, top: PAD,
                    width: R*2, height: t.shape==="rect" ? R*1.4 : R*2,
                    borderRadius: t.shape==="rect" ? "10px" : "50%",
                    background: isSel ? "#fdf8f2" : "var(--white)",
                    border:`2.5px solid ${isSel?"var(--clay)":isOver?"var(--moss)":"var(--sand2)"}`,
                    boxShadow: isSel ? `0 0 0 4px ${isOver?"var(--moss)":"var(--clay)"}33, var(--shadow-lg)` : isOver ? `0 0 0 3px var(--moss)` : "var(--shadow)",
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    transition:"border-color .15s, box-shadow .15s",
                    cursor: "grab",
                    zIndex: 2,
                    marginTop: t.shape==="rect" ? R*0.3 : 0,
                  }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--bark2)", textAlign:"center", lineHeight:1.3, padding:"0 6px" }}>{t.name}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:fill, marginTop:2 }}>{occ}/{t.capacity}</div>
                    <svg width="34" height="4" style={{marginTop:3}}>
                      <rect width="34" height="4" rx="2" fill="var(--sand2)"/>
                      <rect width={Math.min(pct*34,34)} height="4" rx="2" fill={fill}/>
                    </svg>
                  </div>

                  {/* Guest name labels orbiting around the circle */}
                  {tableGuests.map((g, idx) => {
                    const total = Math.max(tableGuests.length, 1);
                    const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                    // center of the padded box is PAD + R
                    const cx = PAD + R;
                    const cy = PAD + R;
                    const lx = cx + LABEL_R * Math.cos(angle);
                    const ly = cy + LABEL_R * Math.sin(angle);
                    return (
                      <div key={g.id} style={{
                        position:"absolute",
                        left: lx,
                        top:  ly,
                        transform:"translate(-50%,-50%)",
                        fontSize: 9.5,
                        fontWeight: 500,
                        color:"var(--bark2)",
                        background: g.side === "bride" ? "rgba(249,240,232,0.97)" : "rgba(232,242,236,0.97)",
                        borderRadius: 5,
                        padding:"2px 6px",
                        whiteSpace:"nowrap",
                        pointerEvents:"none",
                        boxShadow:"0 1px 5px rgba(0,0,0,.1)",
                        border:`1px solid ${g.side==="bride"?"#e8d0bc":"#b8d9c8"}`,
                        lineHeight: 1.5,
                        zIndex: 5,
                        maxWidth: 88,
                        overflow:"hidden",
                        textOverflow:"ellipsis",
                        fontFamily:"'Outfit', sans-serif",
                      }}>
                        {g.first}{g.plusOne && <span style={{color:"var(--moss)",fontWeight:700,marginLeft:2}}>+1</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Empty state */}
            {tables.length === 0 && (
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", color:"var(--sand3)" }}>
                <div style={{fontSize:44,marginBottom:12}}>🌿</div>
                <div style={{fontSize:15,color:"var(--bark)"}}>No tables yet</div>
                <div style={{fontSize:13,color:"var(--bark)",marginTop:4}}>Upload a venue map or add tables from the left</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL – inspector */}
      <div style={{ width:240, background:"var(--white)", borderLeft:"1px solid var(--sand2)", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
        <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid var(--sand2)" }}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:18, fontWeight:400, color:"var(--ink)" }}>Inspector</div>
        </div>

        {!sel ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--sand3)", padding:20, textAlign:"center" }}>
            <div style={{fontSize:32,marginBottom:8}}>🪑</div>
            <div style={{fontSize:13,color:"var(--bark)"}}>Click a table to inspect</div>
          </div>
        ) : (
          <div style={{ flex:1, overflow:"auto", padding:16 }}>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:20, fontWeight:400, color:"var(--ink)", marginBottom:4 }}>{sel.name}</div>

            {/* Capacity inline edit */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <span style={{fontSize:12,color:"var(--bark)"}}>Capacity:</span>
              <input type="number" min={1} max={30} defaultValue={sel.capacity}
                key={sel.id}
                onBlur={e => setTables(ts=>ts.map(t=>t.id===sel.id?{...t,capacity:Math.max(1,parseInt(e.target.value)||sel.capacity)}:t))}
                style={{ width:54, border:"1.5px solid var(--sand3)", borderRadius:7, padding:"4px 8px", fontSize:13, outline:"none", background:"var(--fog)" }} />
              <span style={{fontSize:12,color:"var(--bark)"}}>seats</span>
            </div>

            <div style={{fontSize:11,fontWeight:600,color:"var(--bark)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>
              Seated — {occSeats(sel,guests)}/{sel.capacity} seats
            </div>

            {guests.filter(g=>g.tableId===sel.id).map(g => (
              <div key={g.id} style={{ background:g.side==="bride"?"#f9f0e8":"#e8f2ec", borderRadius:9, padding:"8px 10px", marginBottom:7, fontSize:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{fontWeight:600,color:"var(--ink)"}}>{fullName(g)}{g.plusOne&&<span style={{fontSize:10,color:"var(--moss)",marginLeft:4,fontWeight:700}}>+1</span>}</div>
                    {g.food && <div style={{fontSize:11,color:"var(--bark)",marginTop:2}}>🍽 {g.food}</div>}
                    {g.plusOne && g.plusOneFood && <div style={{fontSize:11,color:"var(--bark)",marginTop:1}}>🍽 +1: {g.plusOneFood}</div>}
                    {g.plusOne && !g.plusOneFood && <div style={{fontSize:11,color:"var(--clay)",marginTop:1}}>⚠ +1 food missing</div>}
                    {g.occasion && <div style={{fontSize:11,marginTop:3,background:"#fff3cd",borderRadius:4,padding:"1px 6px",display:"inline-block",color:"#7a5c00"}}>🎉 {g.occasion}</div>}
                  </div>
                  <button onClick={()=>removeFromTable(g.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#c0392b",fontSize:14,lineHeight:1,padding:2}}>×</button>
                </div>
              </div>
            ))}

            {guests.filter(g=>g.tableId===sel.id).length===0 && (
              <div style={{fontSize:12,color:"var(--sand3)",fontStyle:"italic"}}>Drag guests here</div>
            )}

            <button onClick={()=>delTable(sel.id)} style={{width:"100%",marginTop:20,background:"#fff2f2",color:"#c0392b",border:"1.5px solid #fecaca",borderRadius:8,padding:"8px",fontSize:12,cursor:"pointer",fontWeight:500}}>Remove table</button>
          </div>
        )}
      </div>

      {newTblOpen && (
        <Modal title="New table" onClose={()=>setNewTblOpen(false)} width={360}>
          <Field label="Table name"><input className="input" value={newTbl.name} onChange={e=>setNewTbl(t=>({...t,name:e.target.value}))} placeholder="e.g. Table 7" autoFocus /></Field>
          <Field label="Capacity">
            <input className="input" type="number" min={1} max={40} value={newTbl.capacity} onChange={e=>setNewTbl(t=>({...t,capacity:e.target.value}))} />
          </Field>
          <p style={{fontSize:12,color:"var(--bark)",marginTop:4}}>💡 Guests with +1 occupy 2 seats automatically.</p>
          <div style={{display:"flex",gap:10,marginTop:20}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setNewTblOpen(false)}>Cancel</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={addTable}>Add table</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: CONTROL
───────────────────────────────────────────────────────────────────────────── */
function ListEditor({ title, description, items, setItems, placeholder }) {
  const [draft, setDraft] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");

  function add() {
    const v = draft.trim(); if (!v || items.includes(v)) return;
    setItems([...items, v]); setDraft("");
  }
  function remove(i) { setItems(items.filter((_,j)=>j!==i)); }
  function startEdit(i) { setEditIdx(i); setEditVal(items[i]); }
  function saveEdit(i) {
    const v = editVal.trim(); if (!v) return;
    setItems(items.map((x,j)=>j===i?v:x)); setEditIdx(null);
  }
  function move(i, dir) {
    const n=[...items]; const j=i+dir;
    if(j<0||j>=n.length) return;
    [n[i],n[j]]=[n[j],n[i]]; setItems(n);
  }

  return (
    <div className="card" style={{padding:"20px 22px"}}>
      <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{title}</div>
      {description && <div style={{fontSize:12,color:"var(--bark)",marginBottom:14}}>{description}</div>}

      {/* existing items */}
      <div style={{marginBottom:12}}>
        {items.length===0 && <div style={{fontSize:12,color:"var(--sand3)",fontStyle:"italic",marginBottom:8}}>No options yet</div>}
        {items.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,padding:"5px 8px",borderRadius:8,background:"var(--fog)",border:"1px solid var(--sand2)"}}>
            {editIdx===i ? (
              <>
                <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")saveEdit(i);if(e.key==="Escape")setEditIdx(null);}}
                  style={{flex:1,border:"none",background:"transparent",fontSize:13,outline:"none",fontFamily:"'Outfit',sans-serif",color:"var(--ink)"}}/>
                <button onClick={()=>saveEdit(i)} style={{background:"var(--moss)",color:"#fff",border:"none",borderRadius:5,padding:"2px 10px",fontSize:12,cursor:"pointer",fontWeight:600}}>✓</button>
                <button onClick={()=>setEditIdx(null)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--bark)",fontSize:13}}>✕</button>
              </>
            ) : (
              <>
                <span style={{flex:1,fontSize:13,color:"var(--ink)"}}>{item}</span>
                <button onClick={()=>move(i,-1)} title="Move up" style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand3)",fontSize:12,padding:"1px 4px"}} onMouseEnter={e=>e.currentTarget.style.color="var(--bark)"} onMouseLeave={e=>e.currentTarget.style.color="var(--sand3)"}>↑</button>
                <button onClick={()=>move(i,1)}  title="Move down" style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand3)",fontSize:12,padding:"1px 4px"}} onMouseEnter={e=>e.currentTarget.style.color="var(--bark)"} onMouseLeave={e=>e.currentTarget.style.color="var(--sand3)"}>↓</button>
                <button onClick={()=>startEdit(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--bark)",fontSize:12,padding:"1px 6px"}}>✎</button>
                <button onClick={()=>remove(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand3)",fontSize:14,padding:"1px 4px"}} onMouseEnter={e=>e.currentTarget.style.color="#c0392b"} onMouseLeave={e=>e.currentTarget.style.color="var(--sand3)"}>×</button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* add new */}
      <div style={{display:"flex",gap:8}}>
        <input className="input" value={draft} onChange={e=>setDraft(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&add()}
          placeholder={placeholder||"Add option…"} style={{flex:1,height:34,padding:"0 12px",fontSize:13}}/>
        <button className="btn btn-primary" style={{height:34,padding:"0 16px",fontSize:13}} onClick={add}>Add</button>
      </div>
    </div>
  );
}

function ControlTab({ settings, setSettings }) {
  const [emails, setEmails] = useState(["planner@wedding.com"]);
  const [newEmail, setNewEmail] = useState("");
  const set = (key, val) => setSettings(s=>({...s,[key]:val}));

  const accentPresets = [
    {label:"Clay",  val:"#b87c5a"},{label:"Moss",  val:"#6b7c5c"},
    {label:"Dusk",  val:"#8e7aa0"},{label:"Ink",   val:"#3a3028"},
    {label:"Mauve", val:"#c4a882"},{label:"Terra", val:"#c06040"},
  ];

  const derivedName = settings.brideName && settings.groomName
    ? `${settings.brideName} & ${settings.groomName}'s Wedding`
    : settings.brideName ? `${settings.brideName}'s Wedding` : "Wedding Planner";

  return (
    <div className="fade" style={{padding:"24px 32px",flex:1,overflowY:"auto"}}>
      <h2 style={{fontFamily:"'Fraunces', serif",fontSize:28,fontWeight:400,color:"var(--ink)",letterSpacing:"-.01em",marginBottom:4}}>Settings</h2>
      <p style={{color:"var(--bark)",fontSize:13,marginBottom:24}}>Changes apply instantly across the planner.</p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,maxWidth:860}}>

        {/* Event / names */}
        <div className="card" style={{padding:"20px 22px",gridColumn:"1/-1"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Couple</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:10}}>
            <Field label="Bride's name"><input className="input" value={settings.brideName} onChange={e=>set("brideName",e.target.value)} placeholder="e.g. Sofia"/></Field>
            <Field label="Groom's name"><input className="input" value={settings.groomName} onChange={e=>set("groomName",e.target.value)} placeholder="e.g. Diego"/></Field>
          </div>
          <div style={{fontFamily:"'Fraunces', serif",fontSize:22,fontWeight:300,fontStyle:"italic",color:"var(--bark)"}}>{derivedName}</div>
        </div>

        {/* Accent */}
        <div className="card" style={{padding:"20px 22px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Accent Color</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            {accentPresets.map(p=>(
              <div key={p.val} onClick={()=>set("accent",p.val)} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:p.val,border:settings.accent===p.val?"3px solid var(--ink)":"3px solid transparent",outline:settings.accent===p.val?"2px solid "+p.val:"none",outlineOffset:2,transition:"all .15s"}}/>
                <span style={{fontSize:10,color:"var(--bark)"}}>{p.label}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="color" value={settings.accent} onChange={e=>set("accent",e.target.value)} style={{width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",padding:0}}/>
            <span style={{fontSize:12,color:"var(--bark)",fontWeight:500}}>{settings.accent}</span>
          </div>
        </div>

        {/* Font */}
        <div className="card" style={{padding:"20px 22px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Display Font</div>
          {[["Fraunces","'Fraunces', serif","Organic editorial"],["Playfair","'Playfair Display', serif","Classic elegance"],["Lora","'Lora', serif","Literary warmth"]].map(([n,v,d])=>(
            <div key={v} onClick={()=>set("font",v)}
              style={{border:`1.5px solid ${settings.font===v?"var(--bark)":"var(--sand2)"}`,borderRadius:10,padding:"9px 13px",marginBottom:7,cursor:"pointer",background:settings.font===v?"var(--fog)":"var(--white)",transition:"all .15s"}}>
              <div style={{fontFamily:v,fontSize:17,color:"var(--ink)"}}>{settings.brideName||"Sofia"} & {settings.groomName||"Diego"}</div>
              <div style={{fontSize:11,color:"var(--bark)",marginTop:2}}>{n} — {d}</div>
            </div>
          ))}
        </div>

        {/* ─── LIST EDITORS ─── */}
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--bark)",marginBottom:14,paddingBottom:8,borderBottom:"1.5px solid var(--sand2)"}}>
            Dropdown Lists — these appear as autocomplete options in the guest spreadsheet
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18}}>
            <ListEditor
              title="Food Options"
              description="Meal choices guests can select from"
              items={settings.foodOptions||[]}
              setItems={v=>set("foodOptions",v)}
              placeholder="e.g. Salmon, Vegan…"
            />
            <ListEditor
              title="Party / Side Options"
              description="Who each guest belongs to — includes parents"
              items={settings.sideOptions||[]}
              setItems={v=>set("sideOptions",v)}
              placeholder="e.g. bride parents…"
            />
            <ListEditor
              title="Special Occasions"
              description="Celebrations to flag for table service"
              items={settings.occasionOptions||[]}
              setItems={v=>set("occasionOptions",v)}
              placeholder="e.g. Birthday, Anniversary…"
            />
          </div>
        </div>

        {/* Access */}
        <div className="card" style={{padding:"20px 22px",gridColumn:"1/-1"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Access Control</div>
          <div style={{marginBottom:10}}>
            {emails.map(e=>(
              <div key={e} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span className="pill" style={{background:"#e8f0fe",color:"#1a56db"}}>📧 {e}</span>
                <button onClick={()=>setEmails(es=>es.filter(x=>x!==e))} style={{background:"none",border:"1px solid #fecaca",borderRadius:5,padding:"2px 7px",cursor:"pointer",color:"#c0392b",fontSize:12}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input className="input" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newEmail&&!emails.includes(newEmail)&&(setEmails(es=>[...es,newEmail]),setNewEmail(""))} placeholder="Add email address…" style={{maxWidth:300}}/>
            <button className="btn btn-primary" onClick={()=>{if(newEmail&&!emails.includes(newEmail)){setEmails(e=>[...e,newEmail]);setNewEmail("");}}}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────────────────────────────────────── */
function buildExportHTML(guests, tables, settings) {
  const { eventName="Wedding", brideName="Bride", groomName="Groom" } = settings;
  const rows = [];
  tables.forEach(t => {
    guests.filter(g=>g.tableId===t.id).forEach(g=>{
      rows.push({table:t.name,name:fullName(g),food:g.food||"—",plusOne:g.plusOne?"Yes":"No",p1food:g.plusOne?(g.plusOneFood||"⚠ Missing"):"—",side:g.side==="bride"?`${brideName}'s guest`:`${groomName}'s guest`,occasion:g.occasion||""});
    });
  });
  const unass = guests.filter(g=>!g.tableId);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${eventName} — Team Seating Chart</title>
<style>
body{font-family:Georgia,serif;max-width:960px;margin:0 auto;padding:40px 24px;color:#1a1714;background:#fdfaf6}
h1{font-size:34px;text-align:center;font-weight:400;margin-bottom:4px}
.sub{text-align:center;color:#7a6a5a;margin-bottom:40px;font-size:15px}
h2{font-size:18px;font-weight:600;margin:30px 0 10px;padding-bottom:6px;border-bottom:2px solid #e8e0d4}
table{width:100%;border-collapse:collapse;margin-bottom:8px}
th{background:#f7f3ed;padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#5c4a2a;border-bottom:2px solid #e8e0d4}
td{padding:10px 14px;border-bottom:1px solid #f0ebe4;font-size:13px}
tr:nth-child(even)td{background:#faf8f5}
.bride{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;background:#f9f0e8;color:#a0623a}
.groom{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;background:#e8f2ec;color:#3d7a62}
.warn{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin-top:28px;font-size:13px}
@media print{body{padding:10px}}
</style></head><body>
<h1>${eventName}</h1>
<p class="sub">Service & Planning Team — Seating Chart</p>
${tables.filter(t=>guests.some(g=>g.tableId===t.id)).map(t=>{
  const tg = rows.filter(r=>r.table===t.name);
  const occ = tg.reduce((s,r)=>s+(r.plusOne==="Yes"?2:1),0);
  return `<h2>🪑 ${t.name} &nbsp;·&nbsp; ${occ} seats occupied</h2>
<table><thead><tr><th>Guest</th><th>Food</th><th>+1?</th><th>+1 Food</th><th>Special Occasion</th><th>Side</th></tr></thead><tbody>
${tg.map(r=>`<tr><td><strong>${r.name}</strong></td><td>${r.food}</td><td>${r.plusOne}</td><td>${r.p1food}</td><td>${r.occasion?`<span style="background:#fff3cd;padding:2px 8px;border-radius:4px;font-size:12px;">🎉 ${r.occasion}</span>`:"—"}</td><td><span class="${r.side.includes(brideName)?"bride":"groom"}">${r.side}</span></td></tr>`).join("")}
</tbody></table>`;
}).join("")}
${unass.length?`<div class="warn">⚠ <strong>Unassigned guests (${unass.length}):</strong> ${unass.map(g=>fullName(g)).join(", ")}</div>`:""}
</body></html>`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PIN SCREEN
───────────────────────────────────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  brideName:"", groomName:"", accent:"#b87c5a", font:"'Fraunces', serif",
  foodOptions:   ["Beef","Salmon","Chicken","Vegetarian","Vegan","Kids meal","Gluten-free"],
  sideOptions:   ["bride","groom","bride parents","groom parents","both families","both"],
  occasionOptions:["Birthday","Anniversary","Engagement","New baby","Retirement","Graduation","Honeymoon"],
};

function hashPin(pin) {
  // simple deterministic hash — not cryptographic, but enough for local protection
  let h = 0;
  for (let i = 0; i < pin.length; i++) h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  return "mc_" + Math.abs(h).toString(36);
}

function PinScreen({ onUnlock }) {
  const [pin, setPin]       = useState("");
  const [error, setError]   = useState("");
  const [mode, setMode]     = useState("enter"); // "enter" | "create"
  const inputRef            = useRef();
  useEffect(() => inputRef.current?.focus(), []);

  function attempt() {
    if (pin.length < 4) { setError("PIN must be at least 4 characters"); return; }
    const key = hashPin(pin);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        onUnlock(key, data);
      } catch { setError("Couldn't load saved data — try again."); }
    } else {
      // new PIN — start fresh
      onUnlock(key, null);
    }
    setError("");
  }

  // detect if any saved projects exist
  const hasSaved = Object.keys(localStorage).some(k => k.startsWith("mc_"));

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--sand)", fontFamily:"'Outfit', sans-serif" }}>
      <G/>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:42, fontWeight:400, color:"#b87c5a", letterSpacing:".02em", marginBottom:8 }}>Mesa Clara</div>
        <div style={{ fontSize:14, color:"var(--bark)", fontWeight:300 }}>Plan your wedding seating beautifully.</div>
      </div>

      <div className="card" style={{ width:360, padding:"32px 36px" }}>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:22, fontWeight:400, color:"var(--ink)", marginBottom:6 }}>
          {hasSaved ? "Enter your PIN" : "Create a PIN"}
        </div>
        <div style={{ fontSize:13, color:"var(--bark)", marginBottom:24, lineHeight:1.5 }}>
          {hasSaved
            ? "Your progress is saved locally. Enter your PIN to continue where you left off, or use a new PIN to start a fresh plan."
            : "Choose a PIN to protect and save your seating plan. You'll use it each time you return."}
        </div>

        <div style={{ marginBottom:16 }}>
          <input
            ref={inputRef}
            type="password"
            className="input"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Enter PIN (min. 4 characters)"
            style={{ fontSize:18, letterSpacing:".2em", textAlign:"center" }}
          />
          {error && <div style={{ fontSize:12, color:"var(--clay)", marginTop:8, textAlign:"center" }}>{error}</div>}
        </div>

        <button className="btn btn-primary" style={{ width:"100%", padding:"12px", fontSize:14 }} onClick={attempt}>
          {hasSaved ? "Open planner →" : "Create & open planner →"}
        </button>

        <div style={{ marginTop:20, textAlign:"center", fontSize:12, color:"var(--bark)", lineHeight:1.6 }}>
          🔒 Your data stays on this device.<br/>Different PINs = different wedding plans.
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────────────────── */
export default function MesaClara() {
  const [pinKey, setPinKey]   = useState(null); // null = show PIN screen
  const [tab, setTab]         = useState("guests");
  const [guests, setGuests]   = useState(seedGuests);
  const [tables, setTables]   = useState(seedTables);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedAt, setSavedAt] = useState(null);

  // ── Unlock: load saved data or start fresh
  function handleUnlock(key, data) {
    setPinKey(key);
    if (data) {
      if (data.guests)   setGuests(data.guests);
      if (data.tables)   setTables(data.tables);
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      setSavedAt(data.savedAt || null);
    }
  }

  // ── Auto-save whenever guests/tables/settings change (debounced 800ms)
  useEffect(() => {
    if (!pinKey) return;
    const t = setTimeout(() => {
      const payload = { guests, tables, settings, savedAt: new Date().toISOString() };
      localStorage.setItem(pinKey, JSON.stringify(payload));
      setSavedAt(payload.savedAt);
    }, 800);
    return () => clearTimeout(t);
  }, [guests, tables, settings, pinKey]);

  // ── Lock: go back to PIN screen
  function lock() {
    setPinKey(null);
    setGuests(seedGuests);
    setTables(seedTables);
    setSettings(DEFAULT_SETTINGS);
    setSavedAt(null);
    setTab("guests");
  }

  if (!pinKey) return <PinScreen onUnlock={handleUnlock} />;

  const eventName = settings.brideName && settings.groomName
    ? `${settings.brideName} & ${settings.groomName}'s Wedding`
    : settings.brideName ? `${settings.brideName}'s Wedding`
    : "Wedding Planner";

  const pct      = guests.length ? Math.round(guests.filter(g=>g.tableId).length/guests.length*100) : 0;
  const assigned = guests.filter(g=>g.tableId).length;

  const savedLabel = savedAt
    ? `Saved ${new Date(savedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`
    : "Not saved yet";

  function exportCSV() {
    const rows = [["Table","Guest","Food","+1?","+1 Food","Special Occasion","Side"]];
    tables.forEach(t=>guests.filter(g=>g.tableId===t.id).forEach(g=>{
      rows.push([t.name,fullName(g),g.food||"",g.plusOne?"Yes":"No",g.plusOneFood||"",g.occasion||"",g.side]);
    }));
    guests.filter(g=>!g.tableId).forEach(g=>rows.push(["UNASSIGNED",fullName(g),g.food||"",g.plusOne?"Yes":"No",g.plusOneFood||"",g.occasion||"",g.side]));
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="seating.csv"; a.click();
  }

  function exportTeam() {
    const html = buildExportHTML(guests, tables, { ...settings, eventName });
    const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob([html],{type:"text/html"})); a.download="team-seating.html"; a.click();
  }

  const TABS = [
    { id:"guests",  label:"Guests" },
    { id:"planner", label:"Seating Planner" },
    { id:"control", label:"Control" },
  ];

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Outfit', sans-serif", background:"var(--sand)", "--accent":settings.accent }}>
      <G/>
      {/* ─── TOPBAR ─── */}
      <header style={{ background:"var(--bark2)", height:54, display:"flex", alignItems:"center", padding:"0 24px", gap:18, flexShrink:0, boxShadow:"0 2px 16px rgba(0,0,0,.15)" }}>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:21, fontWeight:400, color:settings.accent, letterSpacing:".02em", flexShrink:0 }}>Mesa Clara</div>
        <div style={{ width:1, height:24, background:"rgba(255,255,255,.12)", flexShrink:0 }}/>
        <div style={{ fontFamily:settings.font, fontSize:15, color:"rgba(255,255,255,.85)", fontWeight:300, letterSpacing:".01em", flexShrink:0 }}>{eventName}</div>
        <div style={{ flex:1 }}/>
        {/* Saved indicator */}
        <span style={{ fontSize:11, color:"rgba(255,255,255,.35)", letterSpacing:".02em" }}>💾 {savedLabel}</span>
        <div style={{ width:1, height:24, background:"rgba(255,255,255,.12)", flexShrink:0 }}/>
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.5)" }}>{assigned}/{guests.length}</span>
          <div style={{ width:90, height:4, background:"rgba(255,255,255,.15)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ width:`${pct}%`, height:"100%", background:settings.accent, borderRadius:2, transition:"width .5s" }}/>
          </div>
          <span style={{ fontSize:12, fontWeight:600, color:settings.accent }}>{pct}%</span>
        </div>
        <div style={{ width:1, height:24, background:"rgba(255,255,255,.12)", flexShrink:0 }}/>
        {/* Exports */}
        <button onClick={exportCSV} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.75)", borderRadius:7, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:500 }}>↓ CSV</button>
        <button onClick={exportTeam} style={{ background:settings.accent, color:"#fff", border:"none", borderRadius:7, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:600 }}>📋 Export for Team</button>
        <div style={{ width:1, height:24, background:"rgba(255,255,255,.12)", flexShrink:0 }}/>
        {/* Lock */}
        <button onClick={lock} title="Lock & return to PIN screen" style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.6)", borderRadius:7, padding:"6px 12px", fontSize:13, cursor:"pointer" }}>🔒</button>
      </header>

      {/* ─── NAV ─── */}
      <nav style={{ background:"var(--fog)", borderBottom:"1.5px solid var(--sand2)", display:"flex", padding:"0 24px", gap:2, flexShrink:0 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"11px 22px", background:"transparent", border:"none", cursor:"pointer",
            fontSize:13, fontWeight: tab===t.id ? 600 : 400,
            color: tab===t.id ? "var(--ink)" : "var(--bark)",
            borderBottom: tab===t.id ? `2.5px solid ${settings.accent}` : "2.5px solid transparent",
            transition:"all .15s", marginBottom:-1.5,
          }}>{t.label}</button>
        ))}
      </nav>

      {/* ─── CONTENT ─── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {tab==="guests"  && <GuestsTab  guests={guests} setGuests={setGuests} tables={tables} settings={settings} />}
        {tab==="planner" && <PlannerTab guests={guests} setGuests={setGuests} tables={tables} setTables={setTables} settings={settings} />}
        {tab==="control" && <ControlTab settings={settings} setSettings={setSettings} />}
      </div>
    </div>
  );
}
