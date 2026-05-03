import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Banknote, Building2, CalendarDays, ClipboardList, FileText, GanttChartSquare, Home, Layers, Link2, MapPin, MoreVertical, Package, Plug, Plus, Search, Settings, Trash2, Wrench, ListChecks } from "lucide-react";
import versionInfo from "./version.json";
import { createWorker } from "tesseract.js";
import "./style.css";

const STORAGE_KEY = "ergotaxiako_app_v14";
const stages = ["Αποξηλώσεις","Ηλεκτρολόγος","Υδραυλικός","Γκρο μπετά","Πλακάκια μπάνιου","Κουζίνα","Διακόπτες","Φωτιστικά","Ολοκλήρωση έργου","Παράδοση έργου"];
const switchCats = ["Πρίζες","Διακόπτες","DATA / TV","Πλαίσια","Πλακίδια","Ειδικά"];
const accountFields = [
  { key:"provider", label:"Πάροχος", type:"text", enabled:true },
  { key:"billType", label:"Είδος λογαριασμού", type:"text", enabled:true },
  { key:"invoiceType", label:"Τύπος τιμολογίου", type:"text", enabled:true },
  { key:"amount", label:"Ποσό πληρωμής (€)", type:"number", enabled:true },
  { key:"dueDate", label:"Εξόφληση έως", type:"date", enabled:true },
  { key:"issueDate", label:"Ημερομηνία έκδοσης", type:"date", enabled:true },
  { key:"consumptionStart", label:"Έναρξη περιόδου κατανάλωσης", type:"date", enabled:true },
  { key:"consumptionEnd", label:"Λήξη περιόδου κατανάλωσης", type:"date", enabled:true },
  { key:"days", label:"Ημέρες", type:"number", enabled:true },
  { key:"consumption", label:"Κατανάλωση", type:"text", enabled:true },
  { key:"accountNumber", label:"Α/Α λογαριασμού", type:"text", enabled:true },
  { key:"supplyNumber", label:"Αριθμός παροχής", type:"text", enabled:true },
  { key:"paymentCode", label:"Κωδικός ηλεκτρονικής πληρωμής", type:"text", enabled:true },
  { key:"propertyAddress", label:"Διεύθυνση ακινήτου", type:"text", enabled:true },
  { key:"customerName", label:"Όνομα πελάτη / υπόχρεου", type:"text", enabled:true },
  { key:"status", label:"Κατάσταση πληρωμής", type:"select", enabled:true, options:["Εκκρεμεί","Πληρώθηκε"] },
  { key:"notes", label:"Σημειώσεις", type:"textarea", enabled:true }
];
const switchTemplate = [
  ["Πρίζες","Πρίζα σούκο, Legrand Valena Life","753020",30], ["Πρίζες","Πρίζα εξωτερικού χώρου / με καπάκι","",4],
  ["Διακόπτες","Απλός διακόπτης","752000",20], ["Διακόπτες","Αλέ-ρετούρ","752006",12], ["Διακόπτες","Διπλός διακόπτης","752008",7], ["Διακόπτες","Τριπλός διακόπτης","752003",2],
  ["DATA / TV","Πρίζα DATA RJ45","755410",4], ["DATA / TV","Πρίζα TV","753060",4],
  ["Πλαίσια","Πλαίσιο 1 θέσης","754001",15], ["Πλαίσια","Πλαίσιο 2 θέσεων","754002",10], ["Πλαίσια","Πλαίσιο 3 θέσεων","754003",6], ["Πλαίσια","Πλαίσιο 4 θέσεων","754004",4],
  ["Πλακίδια","Πλακίδιο διακόπτη","755020",41], ["Πλακίδια","Πλακίδιο πρίζας","754950",30], ["Πλακίδια","Πλακίδιο DATA","755410",4], ["Πλακίδια","Πλακίδιο TV","754820",4],
  ["Ειδικά","Παροχές A/C","",4], ["Ειδικά","Θερμοστάτης","",1], ["Ειδικά","Θυροτηλέφωνο","",1]
].map((x,i)=>({id:i+1,category:x[0],name:x[1],code:x[2],qty:x[3],received:false,installed:false,room:"",notes:""}));
const defaultSettings = { statuses:["Σε εξέλιξη","Επείγον","Αναμονή","Ολοκληρωμένο"], stages, crews:["Ηλεκτρολόγος","Υδραυλικός","Πλακάς","Ελαιοχρωματιστής"], switchMaterialCategories:switchCats, accountFields };
const defaultProjects = [{ id:1, name:"Π. Ιωακείμ 14", address:"", stage:"Ηλεκτρολόγος", deliveryDate:"Δεν ορίστηκε", status:"Σε εξέλιξη", notes:"Έργο αναφοράς για διακοπτικό υλικό.", specs:"Σειρά υλικού: Legrand Valena Life", accounts:[], schedule:[], switchMaterials:switchTemplate }];
function load(){try{const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem("ergotaxiako_app_v13")||localStorage.getItem("ergotaxiako_app_v12")||localStorage.getItem("ergotaxiako_app_v11")||localStorage.getItem("ergotaxiako_app_v10"); if(!raw)return{projects:defaultProjects,settings:defaultSettings}; const p=JSON.parse(raw); const projects=(p.projects?.length?p.projects:defaultProjects).map(pr=>({...pr,accounts:pr.accounts||[],schedule:pr.schedule||[],switchMaterials:pr.switchMaterials||(pr.name==="Π. Ιωακείμ 14"?switchTemplate:[])})); if(!projects.some(x=>x.name==="Π. Ιωακείμ 14"))projects.unshift(defaultProjects[0]); return {projects,settings:{...defaultSettings,...(p.settings||{}),switchMaterialCategories:p.settings?.switchMaterialCategories||switchCats, accountFields:p.settings?.accountFields||accountFields}}}catch{return{projects:defaultProjects,settings:defaultSettings}}}
function dval(d){return d?new Date(d+"T00:00:00").getTime():null} function days(a,b){const x=dval(a),y=dval(b);return x&&y?Math.max(1,Math.round((y-x)/86400000)+1):0} function delayed(i){if(!i.endDate||i.status==="Ολοκληρώθηκε")return false; const t=new Date();t.setHours(0,0,0,0);return dval(i.endDate)<t.getTime()}
function App(){const init=load();const[projects,setProjects]=useState(init.projects);const[settings,setSettings]=useState(init.settings);const[view,setView]=useState({type:"home"});const[query,setQuery]=useState("");const[statusFilter,setStatusFilter]=useState("all");const[showNew,setShowNew]=useState(false);useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify({projects,settings})),[projects,settings]);const project=projects.find(p=>p.id===view.projectId);function update(id,patch){setProjects(projects.map(p=>p.id===id?{...p,...patch}:p))}function addProject(p){const n={...p,id:Date.now(),accounts:[],schedule:[],switchMaterials:[]};setProjects([n,...projects]);setShowNew(false);setView({type:"project",projectId:n.id,tab:"general"})}if(view.type==="project"&&project)return <ProjectPage project={project} settings={settings} tab={view.tab||"general"} onBack={()=>setView({type:"home"})} onTab={tab=>setView({type:"project",projectId:project.id,tab})} onUpdate={patch=>update(project.id,patch)} onDelete={()=>{setProjects(projects.filter(p=>p.id!==project.id));setView({type:"home"})}}/>;if(view.type==="settings")return <SettingsPage settings={settings} setSettings={setSettings} route={view.section||"index"} onRoute={section=>setView({type:"settings",section})} onBack={()=>setView({type:"home"})}/>;return <HomePage {...{projects,settings,query,setQuery,statusFilter,setStatusFilter,showNew,setShowNew,addProject}} onOpen={id=>setView({type:"project",projectId:id,tab:"general"})} onSettings={()=>setView({type:"settings",section:"index"})}/>}
function HomePage({projects,settings,query,setQuery,statusFilter,setStatusFilter,showNew,setShowNew,addProject,onOpen,onSettings}){const[menu,setMenu]=useState(false);const[form,setForm]=useState({name:"",address:"",stage:settings.stages[0]||"",deliveryDate:"",status:"Σε εξέλιξη",notes:"",specs:""});const stats={total:projects.length,active:projects.filter(p=>p.status==="Σε εξέλιξη").length,urgent:projects.filter(p=>p.status==="Επείγον").length,waiting:projects.filter(p=>p.status==="Αναμονή").length};const filtered=projects.filter(p=>(statusFilter==="all"||p.status===statusFilter)&&`${p.name} ${p.address} ${p.stage}`.toLowerCase().includes(query.toLowerCase()));return <div className="app-shell"><header className="topbar"><div><p className="eyebrow">Εργοταξιακό App</p><h1>Έργα</h1><p className="subtitle">Dashboard έργων με modules ανά έργο.</p></div><div className="header-actions"><button className="secondary-btn" onClick={onSettings}><Settings size={18}/> Διαχείριση</button><div className="more-wrap"><button className="icon-btn" onClick={()=>setMenu(!menu)}><MoreVertical size={20}/></button>{menu&&<div className="more-menu"><button onClick={()=>{setShowNew(true);setMenu(false)}}><Plus size={16}/> Προσθήκη έργου</button><button onClick={()=>{setStatusFilter("all");setMenu(false)}}><ListChecks size={16}/> Όλα τα έργα</button><button onClick={onSettings}><Settings size={16}/> Διαχείριση</button></div>}</div></div></header><nav className="taskbar">{["all","Σε εξέλιξη","Επείγον","Αναμονή"].map(x=><button key={x} className={statusFilter===x?"active":""} onClick={()=>setStatusFilter(x)}>{x==="all"?"Όλα":x}</button>)}</nav><section className="stats-grid"><Stat label="Σε εξέλιξη" value={stats.active}/><Stat label="Επείγοντα" value={stats.urgent}/><Stat label="Σε αναμονή" value={stats.waiting}/><Stat label="Όλα τα έργα" value={stats.total}/></section><main><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Αναζήτηση έργου..."/></div>{showNew&&<section className="detail-card new-project-panel"><div className="panel-head"><h2><Plus size={20}/> Προσθήκη έργου</h2><button className="secondary-btn" onClick={()=>setShowNew(false)}>Κλείσιμο</button></div><div className="two-col"><Field label="Όνομα έργου" value={form.name} onChange={v=>setForm({...form,name:v})}/><Field label="Διεύθυνση" value={form.address} onChange={v=>setForm({...form,address:v})}/><Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={v=>setForm({...form,stage:v})}/><Field label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={v=>setForm({...form,deliveryDate:v})}/><Select label="Κατάσταση" value={form.status} options={settings.statuses} onChange={v=>setForm({...form,status:v})}/></div><TextArea label="Σημειώσεις" value={form.notes} onChange={v=>setForm({...form,notes:v})}/><button className="primary-btn" onClick={()=>form.name.trim()&&addProject({...form,deliveryDate:form.deliveryDate||"Δεν ορίστηκε"})}>Αποθήκευση έργου</button></section>}<div className="project-grid">{filtered.map(p=><button className="project-card" key={p.id} onClick={()=>onOpen(p.id)}><div className="card-head"><div><h3>{p.name}</h3><p>{p.stage}</p></div><Building2 size={22}/></div><div className="mini-info"><MapPin size={15}/> {p.address||"Χωρίς διεύθυνση"}</div><div className="mini-info"><CalendarDays size={15}/> Παράδοση: {p.deliveryDate}</div>{p.switchMaterials?.length>0&&<div className="mini-info"><Plug size={15}/> Διακοπτικό: {p.switchMaterials.length} είδη</div>}<span className="status blue">{p.status}</span></button>)}</div></main></div>}
function ProjectPage({project,settings,tab,onBack,onTab,onUpdate,onDelete}){const tabs=[['general','Γενικά',FileText],['daily','Ημερολόγιο',CalendarDays],['tasks','Εκκρεμότητες',ClipboardList],['stages','Στάδια εργασιών',Layers],['schedule','Χρονοδιάγραμμα',GanttChartSquare],['switch','Διακοπτικό Υλικό',Plug],['materials','Υλικά',Package],['accounts','Λογαριασμοί',Banknote]];return <div className="project-layout"><aside className="sidebar"><button className="back-btn" onClick={onBack}><ArrowLeft size={18}/> Πίσω στα έργα</button><div className="project-title"><Building2 size={28}/><div><h2>{project.name}</h2><p>{project.address||"Χωρίς διεύθυνση"}</p></div></div><nav className="tab-nav">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>onTab(id)}><Icon size={18}/> {label}</button>)}</nav></aside><main className="detail-main"><div className="detail-header"><div><p className="eyebrow">Σελίδα έργου</p><h1>{project.name}</h1></div><button className="danger-btn" onClick={onDelete}><Trash2 size={18}/> Διαγραφή έργου</button></div>{tab==='general'&&<GeneralTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==='switch'&&<SwitchTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==='schedule'&&<ScheduleTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==='stages'&&<StagesTab stages={settings.stages}/>} {tab==='accounts'&&<AccountsTab project={project} settings={settings} onUpdate={onUpdate}/>} {['daily','tasks','materials'].includes(tab)&&<Placeholder title={tabs.find(t=>t[0]===tab)[1]} text="Θα επεκταθεί σε επόμενο βήμα."/>}</main></div>}
function SwitchTab({project,settings,onUpdate}){const materials=project.switchMaterials||[];const[cat,setCat]=useState('Όλα');const[form,setForm]=useState({category:settings.switchMaterialCategories[0],name:'',code:'',qty:1,room:'',notes:''});const filtered=cat==='Όλα'?materials:materials.filter(m=>m.category===cat);const total=materials.length, rec=materials.filter(m=>m.received).length, inst=materials.filter(m=>m.installed).length, pending=materials.filter(m=>!m.received||!m.installed).length;const rp=total?Math.round(rec/total*100):0, ip=total?Math.round(inst/total*100):0;function update(id,patch){onUpdate({switchMaterials:materials.map(m=>m.id===id?{...m,...patch}:m)})}function add(){if(!form.name.trim())return;onUpdate({switchMaterials:[...materials,{id:Date.now(),...form,qty:Number(form.qty)||1,received:false,installed:false}]});setForm({category:settings.switchMaterialCategories[0],name:'',code:'',qty:1,room:'',notes:''})}function loadTemplate(){onUpdate({switchMaterials:switchTemplate.map(m=>({...m,id:Date.now()+m.id}))})}const missing=materials.filter(m=>!m.received||!m.installed);return <section className="detail-card switch-module"><div className="module-head"><div><h2><Plug size={22}/> Διακοπτικό Υλικό Έργου</h2><p className="subtitle">Σειρά υλικού: <strong>Legrand Valena Life</strong></p></div><button className="secondary-btn" onClick={loadTemplate}>Φόρτωση λίστας Π. Ιωακείμ 14</button></div><div className="progress-grid"><Progress label="% παραλαβής" value={rp}/><Progress label="% τοποθέτησης" value={ip}/><div className="progress-card"><p>Εκκρεμή υλικά</p><strong>{pending}</strong><small>σε επίπεδο είδους</small></div></div><div className="category-chips">{['Όλα',...settings.switchMaterialCategories].map(c=><button key={c} className={cat===c?'active':''} onClick={()=>setCat(c)}>{c}</button>)}</div><section className="add-material-card"><h3>Προσθήκη υλικού</h3><div className="material-form"><Select label="Κατηγορία" value={form.category} options={settings.switchMaterialCategories} onChange={v=>setForm({...form,category:v})}/><Field label="Ονομασία υλικού" value={form.name} onChange={v=>setForm({...form,name:v})}/><Field label="Κωδικός" value={form.code} onChange={v=>setForm({...form,code:v})}/><Field label="Ποσότητα" type="number" value={form.qty} onChange={v=>setForm({...form,qty:v})}/><Field label="Χώρος / δωμάτιο" value={form.room} onChange={v=>setForm({...form,room:v})}/><Field label="Παρατηρήσεις" value={form.notes} onChange={v=>setForm({...form,notes:v})}/></div><button className="primary-btn" onClick={add}>Προσθήκη υλικού</button></section><div className="materials-list">{filtered.map(item=><div className="material-card" key={item.id}><div className="material-top"><div><span className="material-category">{item.category}</span><h3>{item.name}</h3><p>{item.code?`Κωδικός: ${item.code}`:'Χωρίς κωδικό'} · Ποσότητα: {item.qty}</p></div><button className="icon-danger" onClick={()=>onUpdate({switchMaterials:materials.filter(m=>m.id!==item.id)})}><Trash2 size={16}/></button></div><div className="check-row"><label className={item.received?'checked':''}><input type="checkbox" checked={item.received} onChange={e=>update(item.id,{received:e.target.checked})}/> Παραλαβή</label><label className={item.installed?'checked':''}><input type="checkbox" checked={item.installed} onChange={e=>update(item.id,{installed:e.target.checked})}/> Τοποθέτηση</label></div><div className="material-edit-grid"><Field label="Χώρος / δωμάτιο" value={item.room||''} onChange={v=>update(item.id,{room:v})}/><Field label="Παρατηρήσεις" value={item.notes||''} onChange={v=>update(item.id,{notes:v})}/></div></div>)}</div><section className="missing-box"><h3>Τι λείπει από το εργοτάξιο / εκκρεμεί</h3>{missing.length===0?<p>Δεν υπάρχουν εκκρεμότητες.</p>:<ul>{missing.map(m=><li key={m.id}>{m.name} · {m.category} · Ποσότητα {m.qty} {!m.received?'· δεν έχει παραληφθεί':''} {!m.installed?'· δεν έχει τοποθετηθεί':''}</li>)}</ul>}</section></section>}


function parseGreekBillText(rawText){
  const text = (rawText || "").replace(/\s+/g, " ").trim();
  const lines = (rawText || "").split(/\n+/).map(l => l.trim()).filter(Boolean);

  function find(regex){
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  }

  function toIsoDate(value){
    if(!value) return "";
    const m = value.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if(!m) return "";
    return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  }

  function normalizeAmount(value){
    if(!value) return "";
    return value.replace("*","").replace("€","").replace(",", ".").trim();
  }

  const provider =
    /ΔΕΗ|DEI/i.test(text) ? "ΔΕΗ" :
    /ΕΥΑΘ/i.test(text) ? "ΕΥΑΘ" :
    /ΟΤΕ|COSMOTE/i.test(text) ? "COSMOTE" :
    "";

  const amount =
    find(/(?:ΠΟΣΟ ΠΛΗΡΩΜΗΣ|Συνολικό ποσό πληρωμής|Πληρωτέο ποσό)[^\d*€]*([*]?\d+[,.]\d{2})\s*€?/i) ||
    find(/([*]?\d+[,.]\d{2})\s*€/i);

  const dueDate =
    find(/(?:ΕΞΟΦΛΗΣΗ ΕΩΣ|Πληρωμή έως|Λήξη πληρωμής)[^\d]*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i);

  const issueDate =
    find(/(?:Ημ\/νία Έκδοσης|Ημερομηνία έκδοσης|Ημ\. Έκδοσης)[^\d]*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i);

  const accountNumber =
    find(/(?:Α\/Α Λογαριασμού|Αριθμός λογαριασμού)[^\d]*(\d+)/i);

  const supplyNumber =
    find(/(?:Αριθμός παροχής|Αρ\.?\s*παροχής)[^\d]*(\d[\d\s-]+)/i);

  const paymentCode =
    find(/(RF[A-Z0-9]{10,})/i);

  const consumption =
    find(/Κατανάλωση[^0-9]*(\d+\s*kWh)/i) ||
    find(/Κατανάλωση Ηλεκτρικής Ενέργειας[^0-9]*(\d+)/i);

  const period = text.match(/(?:Περίοδος Κατανάλωσης)[^\d]*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\s*[-–]\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i);

  const days = find(/(?:Ημέρες)[^\d]*(\d+)/i);

  const billType =
    /Εκκαθαριστικός/i.test(text) ? "Εκκαθαριστικός λογαριασμός" :
    /Έναντι|Εναντι/i.test(text) ? "Έναντι λογαριασμός" :
    "";

  const invoiceType =
    /Ειδικό τιμολόγιο/i.test(text) ? "Ειδικό τιμολόγιο" :
    /Οικιακό Τιμολόγιο/i.test(text) ? "Οικιακό Τιμολόγιο" :
    "";

  return {
    provider,
    billType,
    invoiceType,
    amount: normalizeAmount(amount),
    dueDate: toIsoDate(dueDate),
    issueDate: toIsoDate(issueDate),
    consumptionStart: period ? toIsoDate(period[1]) : "",
    consumptionEnd: period ? toIsoDate(period[2]) : "",
    days,
    consumption: consumption ? (consumption.includes("kWh") ? consumption : `${consumption} kWh`) : "",
    accountNumber,
    supplyNumber: supplyNumber.replace(/\s+/g, " ").trim(),
    paymentCode: paymentCode.toUpperCase(),
    status: "Εκκρεμεί",
    notes: rawText ? `OCR κείμενο:\n${rawText.slice(0, 1200)}` : ""
  };
}

function AccountsTab({project,settings,onUpdate}){
  const fields=(settings.accountFields||accountFields).filter(f=>f.enabled!==false);
  const initial=Object.fromEntries((settings.accountFields||accountFields).map(f=>[f.key,f.key==="status"?"Εκκρεμεί":""]));
  const[form,setForm]=useState(initial);
  const[ocrText,setOcrText]=useState("");
  const[ocrStatus,setOcrStatus]=useState("");
  const[imagePreview,setImagePreview]=useState("");
  const[isReading,setIsReading]=useState(false);
  const accounts=project.accounts||[];

  const total=accounts.reduce((s,a)=>s+(Number(a.amount)||0),0);
  const paid=accounts.filter(a=>a.status==="Πληρώθηκε").reduce((s,a)=>s+(Number(a.amount)||0),0);
  const pending=total-paid;

  function applyParsed(parsed){
    setForm(prev=>({...prev,...Object.fromEntries(Object.entries(parsed).filter(([_,v])=>v!==""&&v!==null&&v!==undefined))}));
  }

  async function handleImageUpload(event){
    const file=event.target.files?.[0];
    if(!file)return;
    setOcrStatus("Ανάγνωση φωτογραφίας...");
    setIsReading(true);
    setOcrText("");
    const url=URL.createObjectURL(file);
    setImagePreview(url);
    try{
      const worker=await createWorker("ell+eng");
      const result=await worker.recognize(file);
      await worker.terminate();
      const text=result?.data?.text||"";
      setOcrText(text);
      const parsed=parseGreekBillText(text);
      applyParsed(parsed);
      setOcrStatus("Ολοκληρώθηκε. Έλεγξε τα πεδία πριν αποθήκευση.");
    }catch(error){
      console.error(error);
      setOcrStatus("Δεν ολοκληρώθηκε η ανάγνωση. Μπορείς να συμπληρώσεις τα πεδία χειροκίνητα.");
    }finally{
      setIsReading(false);
    }
  }

  function addAccount(){
    if(!form.provider&&!form.paymentCode&&!form.amount)return;
    onUpdate({accounts:[{id:Date.now(),...form,amount:Number(form.amount)||0},...accounts]});
    setForm(initial);
    setOcrText("");
    setOcrStatus("");
    setImagePreview("");
  }

  function updateAccount(id,patch){
    onUpdate({accounts:accounts.map(a=>a.id===id?{...a,...patch}:a)});
  }

  function deleteAccount(id){
    onUpdate({accounts:accounts.filter(a=>a.id!==id)});
  }

  return <section className="detail-card">
    <h2><Banknote size={22}/> Λογαριασμοί</h2>

    <div className="account-summary">
      <div><p>Σύνολο</p><strong>{total.toFixed(2)} €</strong></div>
      <div><p>Πληρωμένα</p><strong>{paid.toFixed(2)} €</strong></div>
      <div><p>Εκκρεμούν</p><strong>{pending.toFixed(2)} €</strong></div>
    </div>

    <div className="ocr-panel">
      <div>
        <h3>Προσθήκη λογαριασμού από φωτογραφία</h3>
        <p>Ανέβασε φωτογραφία λογαριασμού. Το OCR θα προσπαθήσει να συμπληρώσει αυτόματα τα βασικά πεδία.</p>
      </div>
      <label className="upload-btn">
        📷 Ανέβασε φωτογραφία
        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload}/>
      </label>
    </div>

    {ocrStatus&&<div className={`ocr-status ${isReading?"loading":""}`}>{ocrStatus}</div>}
    {imagePreview&&<img className="ocr-preview" src={imagePreview} alt="Προεπισκόπηση λογαριασμού"/>}
    {ocrText&&<details className="ocr-text"><summary>Προβολή OCR κειμένου</summary><pre>{ocrText}</pre></details>}

    <div className="accounts-note">Έλεγξε πάντα τα πεδία πριν πατήσεις Προσθήκη λογαριασμού.</div>

    <div className="account-form">
      {fields.map(field=>field.type==="textarea"
        ? <TextArea key={field.key} label={field.label} value={form[field.key]||""} onChange={v=>setForm({...form,[field.key]:v})}/>
        : field.type==="select"
          ? <Select key={field.key} label={field.label} value={form[field.key]||"Εκκρεμεί"} options={field.options||[]} onChange={v=>setForm({...form,[field.key]:v})}/>
          : <Field key={field.key} label={field.label} type={field.type} value={form[field.key]||""} onChange={v=>setForm({...form,[field.key]:v})}/>
      )}
    </div>

    <button className="primary-btn account-add" onClick={addAccount}>Προσθήκη λογαριασμού</button>

    <div className="accounts-list">
      {accounts.length===0&&<div className="empty-state">Δεν έχουν προστεθεί λογαριασμοί για αυτό το έργο.</div>}
      {accounts.map(acc=><div className="account-card" key={acc.id}>
        <div className="account-card-head">
          <div><h3>{acc.provider||acc.billType||"Λογαριασμός"}</h3><p>{acc.billType||"Χωρίς είδος"} · {acc.dueDate?`Εξόφληση: ${acc.dueDate}`:"Χωρίς ημερομηνία"}</p></div>
          <strong className="account-amount">{(Number(acc.amount)||0).toFixed(2)} €</strong>
        </div>
        <div className="account-details-grid">
          {fields.filter(f=>f.key!=="amount").map(field=><div className="account-detail" key={field.key}><span>{field.label}</span><p>{acc[field.key]||"—"}</p></div>)}
        </div>
        <div className="account-actions">
          <select value={acc.status||"Εκκρεμεί"} onChange={e=>updateAccount(acc.id,{status:e.target.value})}><option>Εκκρεμεί</option><option>Πληρώθηκε</option></select>
          <button className="icon-danger" onClick={()=>deleteAccount(acc.id)}><Trash2 size={16}/></button>
        </div>
      </div>)}
    </div>
  </section>
}

function StagesTab({stages}){return <section className="detail-card"><h2>Στάδια εργασιών</h2><div className="ordered-stages">{stages.map((s,i)=><div className="ordered-stage" key={s}><span>{i+1}</span><p>{s}</p></div>)}</div></section>}
function Placeholder({title,text}){return <section className="detail-card placeholder"><Wrench size={42}/><h2>{title}</h2><p>{text}</p></section>}
function VersionBadge(){return <div className="version-badge">{versionInfo.version} · commit {versionInfo.commit} · {versionInfo.branch}</div>}
function Stat({label,value}){return <button className="stat-card"><p>{label}</p><strong>{value}</strong></button>}
function Field({label,value,onChange,placeholder='',type='text'}){return <label className="field"><span>{label}</span><input type={type} value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function Select({label,value,options=[],onChange}){return <label className="field"><span>{label}</span><select value={value||''} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{o||'—'}</option>)}</select></label>}
function TextArea({label,value,onChange,placeholder='',tall=false}){return <label className="field"><span>{label}</span><textarea className={tall?'tall':''} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
createRoot(document.getElementById('root')).render(<App/>);
