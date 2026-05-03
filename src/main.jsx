import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Banknote, Building2, CalendarDays, ClipboardList, FileText, GanttChartSquare, Home, Layers, Link2, MapPin, MoreVertical, Package, Plug, Plus, Search, Settings, Trash2, Wrench, ListChecks } from "lucide-react";
import versionInfo from "./version.json";
import { createWorker } from "tesseract.js";
import "./style.css";

const STORAGE_KEY = "ergotaxiako_app_v17";
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
function load(){try{const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem("ergotaxiako_app_v16")||localStorage.getItem("ergotaxiako_app_v15")||localStorage.getItem("ergotaxiako_app_v14")||localStorage.getItem("ergotaxiako_app_v13")||localStorage.getItem("ergotaxiako_app_v12")||localStorage.getItem("ergotaxiako_app_v11")||localStorage.getItem("ergotaxiako_app_v10"); if(!raw)return{projects:defaultProjects,settings:defaultSettings}; const p=JSON.parse(raw); const projects=(p.projects?.length?p.projects:defaultProjects).map(pr=>({...pr,accounts:pr.accounts||[],schedule:pr.schedule||[],switchMaterials:pr.switchMaterials||(pr.name==="Π. Ιωακείμ 14"?switchTemplate:[])})); if(!projects.some(x=>x.name==="Π. Ιωακείμ 14"))projects.unshift(defaultProjects[0]); return {projects,settings:{...defaultSettings,...(p.settings||{}),switchMaterialCategories:p.settings?.switchMaterialCategories||switchCats, accountFields:p.settings?.accountFields||accountFields}}}catch{return{projects:defaultProjects,settings:defaultSettings}}}
function dval(d){return d?new Date(d+"T00:00:00").getTime():null} function days(a,b){const x=dval(a),y=dval(b);return x&&y?Math.max(1,Math.round((y-x)/86400000)+1):0} function delayed(i){if(!i.endDate||i.status==="Ολοκληρώθηκε")return false; const t=new Date();t.setHours(0,0,0,0);return dval(i.endDate)<t.getTime()}
function App(){const init=load();const[projects,setProjects]=useState(init.projects);const[settings,setSettings]=useState(init.settings);const[view,setView]=useState({type:"home"});const[query,setQuery]=useState("");const[statusFilter,setStatusFilter]=useState("all");const[showNew,setShowNew]=useState(false);useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify({projects,settings})),[projects,settings]);const project=projects.find(p=>p.id===view.projectId);function update(id,patch){setProjects(projects.map(p=>p.id===id?{...p,...patch}:p))}function addProject(p){const n={...p,id:Date.now(),accounts:[],schedule:[],switchMaterials:[]};setProjects([n,...projects]);setShowNew(false);setView({type:"project",projectId:n.id,tab:"general"})}if(view.type==="project"&&project)return <ProjectPage project={project} settings={settings} tab={view.tab||"general"} onBack={()=>setView({type:"home"})} onTab={tab=>setView({type:"project",projectId:project.id,tab})} onUpdate={patch=>update(project.id,patch)} onDelete={()=>{setProjects(projects.filter(p=>p.id!==project.id));setView({type:"home"})}}/>;if(view.type==="settings")return <SettingsPage settings={settings} setSettings={setSettings} route={view.section||"index"} onRoute={section=>setView({type:"settings",section})} onBack={()=>setView({type:"home"})}/>;return <HomePage {...{projects,settings,query,setQuery,statusFilter,setStatusFilter,showNew,setShowNew,addProject}} onOpen={id=>setView({type:"project",projectId:id,tab:"general"})} onSettings={()=>setView({type:"settings",section:"index"})}/>}
function HomePage({projects,settings,query,setQuery,statusFilter,setStatusFilter,showNew,setShowNew,addProject,onOpen,onSettings}){const[menu,setMenu]=useState(false);const[form,setForm]=useState({name:"",address:"",stage:settings.stages[0]||"",deliveryDate:"",status:"Σε εξέλιξη",notes:"",specs:""});const stats={total:projects.length,active:projects.filter(p=>p.status==="Σε εξέλιξη").length,urgent:projects.filter(p=>p.status==="Επείγον").length,waiting:projects.filter(p=>p.status==="Αναμονή").length};const filtered=projects.filter(p=>(statusFilter==="all"||p.status===statusFilter)&&`${p.name} ${p.address} ${p.stage}`.toLowerCase().includes(query.toLowerCase()));return <div className="app-shell"><header className="topbar"><div><p className="eyebrow">Εργοταξιακό App</p><h1>Έργα</h1><p className="subtitle">Dashboard έργων με modules ανά έργο.</p></div><div className="header-actions"><button className="secondary-btn" onClick={onSettings}><Settings size={18}/> Διαχείριση</button><div className="more-wrap"><button className="icon-btn" onClick={()=>setMenu(!menu)}><MoreVertical size={20}/></button>{menu&&<div className="more-menu"><button onClick={()=>{setShowNew(true);setMenu(false)}}><Plus size={16}/> Προσθήκη έργου</button><button onClick={()=>{setStatusFilter("all");setMenu(false)}}><ListChecks size={16}/> Όλα τα έργα</button><button onClick={onSettings}><Settings size={16}/> Διαχείριση</button></div>}</div></div></header><nav className="taskbar">{["all","Σε εξέλιξη","Επείγον","Αναμονή"].map(x=><button key={x} className={statusFilter===x?"active":""} onClick={()=>setStatusFilter(x)}>{x==="all"?"Όλα":x}</button>)}</nav><section className="stats-grid"><Stat label="Σε εξέλιξη" value={stats.active}/><Stat label="Επείγοντα" value={stats.urgent}/><Stat label="Σε αναμονή" value={stats.waiting}/><Stat label="Όλα τα έργα" value={stats.total}/></section><main><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Αναζήτηση έργου..."/></div>{showNew&&<section className="detail-card new-project-panel"><div className="panel-head"><h2><Plus size={20}/> Προσθήκη έργου</h2><button className="secondary-btn" onClick={()=>setShowNew(false)}>Κλείσιμο</button></div><div className="two-col"><Field label="Όνομα έργου" value={form.name} onChange={v=>setForm({...form,name:v})}/><Field label="Διεύθυνση" value={form.address} onChange={v=>setForm({...form,address:v})}/><Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={v=>setForm({...form,stage:v})}/><Field label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={v=>setForm({...form,deliveryDate:v})}/><Select label="Κατάσταση" value={form.status} options={settings.statuses} onChange={v=>setForm({...form,status:v})}/></div><TextArea label="Σημειώσεις" value={form.notes} onChange={v=>setForm({...form,notes:v})}/><button className="primary-btn" onClick={()=>form.name.trim()&&addProject({...form,deliveryDate:form.deliveryDate||"Δεν ορίστηκε"})}>Αποθήκευση έργου</button></section>}<div className="project-grid">{filtered.map(p=><button className="project-card" key={p.id} onClick={()=>onOpen(p.id)}><div className="card-head"><div><h3>{p.name}</h3><p>{p.stage}</p></div><Building2 size={22}/></div><div className="mini-info"><MapPin size={15}/> {p.address||"Χωρίς διεύθυνση"}</div><div className="mini-info"><CalendarDays size={15}/> Παράδοση: {p.deliveryDate}</div>{p.switchMaterials?.length>0&&<div className="mini-info"><Plug size={15}/> Διακοπτικό: {p.switchMaterials.length} είδη</div>}<span className="status blue">{p.status}</span></button>)}</div></main></div>}
function ProjectPage({project,settings,tab,onBack,onTab,onUpdate,onDelete}){const tabs=[['general','Γενικά',FileText],['daily','Ημερολόγιο',CalendarDays],['tasks','Εκκρεμότητες',ClipboardList],['stages','Στάδια εργασιών',Layers],['schedule','Χρονοδιάγραμμα',GanttChartSquare],['switch','Διακοπτικό Υλικό',Plug],['materials','Υλικά',Package],['accounts','Λογαριασμοί',Banknote]];return <div className="project-layout"><aside className="sidebar"><button className="back-btn" onClick={onBack}><ArrowLeft size={18}/> Πίσω στα έργα</button><div className="project-title"><Building2 size={28}/><div><h2>{project.name}</h2><p>{project.address||"Χωρίς διεύθυνση"}</p></div></div><nav className="tab-nav">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>onTab(id)}><Icon size={18}/> {label}</button>)}</nav></aside><main className="detail-main"><div className="detail-header"><div><p className="eyebrow">Σελίδα έργου</p><h1>{project.name}</h1></div><button className="danger-btn" onClick={onDelete}><Trash2 size={18}/> Διαγραφή έργου</button></div>{tab==='general'&&<GeneralTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==='switch'&&<SwitchTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==='schedule'&&<ScheduleTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==='stages'&&<StagesTab stages={settings.stages}/>} {tab==='accounts'&&<AccountsTab project={project} settings={settings} onUpdate={onUpdate}/>} {['daily','tasks','materials'].includes(tab)&&<Placeholder title={tabs.find(t=>t[0]===tab)[1]} text="Θα επεκταθεί σε επόμενο βήμα."/>}</main></div>}

function GeneralTab({project,settings,onUpdate}){
  return <section className="detail-card">
    <h2>Γενικά στοιχεία</h2>
    <div className="two-col">
      <Field label="Όνομα έργου" value={project.name||""} onChange={v=>onUpdate({name:v})}/>
      <Field label="Διεύθυνση" value={project.address||""} onChange={v=>onUpdate({address:v})}/>
      <Select label="Στάδιο" value={project.stage||""} options={settings.stages||[]} onChange={v=>onUpdate({stage:v})}/>
      <Select label="Κατάσταση" value={project.status||""} options={settings.statuses||[]} onChange={v=>onUpdate({status:v})}/>
      <Field label="Ημερομηνία παράδοσης" type="date" value={project.deliveryDate==="Δεν ορίστηκε"?"":project.deliveryDate||""} onChange={v=>onUpdate({deliveryDate:v||"Δεν ορίστηκε"})}/>
    </div>
    <TextArea label="Σημειώσεις" value={project.notes||""} onChange={v=>onUpdate({notes:v})}/>
    <TextArea label="Τεχνικές προδιαγραφές" value={project.specs||""} onChange={v=>onUpdate({specs:v})} tall/>
  </section>
}

function Progress({label,value}){
  return <div className="progress-card"><p>{label}</p><strong>{value}%</strong><div className="progress-track"><div style={{width:`${value}%`}}/></div></div>
}

function ScheduleTab({project,settings,onUpdate}){
  const schedule=project.schedule||[];
  const[form,setForm]=useState({stage:settings.stages?.[0]||"",startDate:"",endDate:"",crew:"",status:"Δεν ξεκίνησε",dependsOn:""});
  const meta=useMemo(()=>{const dates=schedule.flatMap(i=>[dval(i.startDate),dval(i.endDate)]).filter(Boolean);if(!dates.length)return null;const min=Math.min(...dates),max=Math.max(...dates);return{min,max,totalDays:Math.max(1,Math.round((max-min)/86400000)+1)}},[schedule]);
  function add(){if(!form.stage||!form.startDate||!form.endDate)return;const dep=schedule.find(i=>String(i.id)===String(form.dependsOn));const warn=dep&&dval(form.startDate)<=dval(dep.endDate);onUpdate({schedule:[...schedule,{id:Date.now(),...form,dependencyWarning:warn}]});setForm({stage:settings.stages?.[0]||"",startDate:"",endDate:"",crew:"",status:"Δεν ξεκίνησε",dependsOn:""})}
  function update(id,patch){onUpdate({schedule:schedule.map(item=>{if(item.id!==id)return item;const up={...item,...patch};const dep=schedule.find(i=>String(i.id)===String(up.dependsOn));up.dependencyWarning=dep?dval(up.startDate)<=dval(dep.endDate):false;return up})})}
  function del(id){onUpdate({schedule:schedule.filter(i=>i.id!==id).map(i=>String(i.dependsOn)===String(id)?{...i,dependsOn:"",dependencyWarning:false}:i)})}
  const done=schedule.filter(i=>i.status==="Ολοκληρώθηκε").length;
  const late=schedule.filter(delayed).length;
  return <section className="detail-card"><h2><GanttChartSquare size={22}/> Χρονοδιάγραμμα έργου</h2>
    <div className="schedule-summary"><div><p>Στάδια</p><strong>{schedule.length}</strong></div><div><p>Ολοκληρωμένα</p><strong>{done}</strong></div><div><p>Καθυστερήσεις</p><strong>{late}</strong></div><div><p>Διάρκεια</p><strong>{meta?.totalDays||0} ημ.</strong></div></div>
    <div className="schedule-form"><Select label="Στάδιο" value={form.stage} options={settings.stages||[]} onChange={v=>setForm({...form,stage:v})}/><Field label="Έναρξη" type="date" value={form.startDate} onChange={v=>setForm({...form,startDate:v})}/><Field label="Λήξη" type="date" value={form.endDate} onChange={v=>setForm({...form,endDate:v})}/><Select label="Συνεργείο" value={form.crew} options={["",...(settings.crews||[])]} onChange={v=>setForm({...form,crew:v})}/><Select label="Κατάσταση" value={form.status} options={["Δεν ξεκίνησε","Σε εξέλιξη","Ολοκληρώθηκε","Καθυστέρηση"]} onChange={v=>setForm({...form,status:v})}/><Select label="Εξαρτάται από" value={form.dependsOn} options={["",...schedule.map(i=>String(i.id))]} onChange={v=>setForm({...form,dependsOn:v})}/></div>
    <button className="primary-btn schedule-add" onClick={add}>Προσθήκη στο χρονοδιάγραμμα</button>
    {schedule.length===0?<div className="empty-state">Δεν έχεις προσθέσει ακόμα στάδια στο χρονοδιάγραμμα.</div>:<div className="gantt-wrap"><div className="gantt-table"><div className="gantt-head">Στάδιο</div><div className="gantt-head">Ημερομηνίες</div><div className="gantt-head">Συνεργείο</div><div className="gantt-head">Κατάσταση</div><div className="gantt-head">Timeline</div>{schedule.map(item=>{const duration=days(item.startDate,item.endDate);const late=delayed(item);const dep=schedule.find(i=>String(i.id)===String(item.dependsOn));const left=meta?((dval(item.startDate)-meta.min)/86400000/meta.totalDays)*100:0;const width=meta?(duration/meta.totalDays)*100:100;return <React.Fragment key={item.id}><div className="gantt-cell"><strong>{item.stage}</strong>{dep&&<small className="dependency"><Link2 size={13}/> μετά από: {dep.stage}</small>}{item.dependencyWarning&&<small className="warning">Ξεκινά πριν ολοκληρωθεί το εξαρτώμενο στάδιο.</small>}</div><div className="gantt-cell"><div className="date-edit"><input type="date" value={item.startDate} onChange={e=>update(item.id,{startDate:e.target.value})}/><input type="date" value={item.endDate} onChange={e=>update(item.id,{endDate:e.target.value})}/></div><small>{duration} ημέρες</small></div><div className="gantt-cell"><select value={item.crew||""} onChange={e=>update(item.id,{crew:e.target.value})}>{["",...(settings.crews||[])].map(c=><option key={c} value={c}>{c||"—"}</option>)}</select></div><div className="gantt-cell"><select value={item.status} onChange={e=>update(item.id,{status:e.target.value})}><option>Δεν ξεκίνησε</option><option>Σε εξέλιξη</option><option>Ολοκληρώθηκε</option><option>Καθυστέρηση</option></select><span className={late?"badge red":"badge gray"}>{late?"Καθυστέρηση":item.status}</span></div><div className="gantt-cell timeline-cell"><div className="timeline-track"><div className={`timeline-bar ${late?"delayed":item.status==="Ολοκληρώθηκε"?"done":item.status==="Σε εξέλιξη"?"active":""}`} style={{left:`${Math.max(0,left)}%`,width:`${Math.max(5,width)}%`}}>{duration}η</div></div><button className="icon-danger" onClick={()=>del(item.id)}><Trash2 size={16}/></button></div></React.Fragment>})}</div></div>}
  </section>
}

function AccountFieldsSettings({settings,setSettings}){
  const fields=settings.accountFields||accountFields;
  return <section className="detail-card"><h2>Πεδία λογαριασμών</h2><div className="field-toggle-grid">{fields.map(field=><button key={field.key} className={`field-toggle ${field.enabled!==false?"enabled":""}`} onClick={()=>setSettings({...settings,accountFields:fields.map(f=>f.key===field.key?{...f,enabled:!(f.enabled!==false)}:f)})}><span>{field.label}</span><small>{field.enabled!==false?"Ενεργό":"Ανενεργό"}</small></button>)}</div></section>
}

function SettingsPage({settings,setSettings,route,onRoute,onBack}){
  const sections=[{id:"accountFields",title:"Πεδία λογαριασμών"},{id:"switchMaterialCategories",title:"Κατηγορίες διακοπτικού υλικού"},{id:"crews",title:"Συνεργεία"},{id:"stages",title:"Στάδια εργασιών"},{id:"statuses",title:"Καταστάσεις έργου"}].sort((a,b)=>a.title.localeCompare(b.title,"el"));
  if(route!=="index")return <div className="app-shell"><header className="topbar"><div><p className="eyebrow">Διαχείριση</p><h1>{sections.find(s=>s.id===route)?.title}</h1></div><button className="secondary-btn" onClick={()=>onRoute("index")}><ArrowLeft size={18}/> Πίσω στη Διαχείριση</button></header>{route==="statuses"&&<ManageList title="Καταστάσεις έργου" items={settings.statuses||[]} onChange={items=>setSettings({...settings,statuses:items})}/>} {route==="stages"&&<ManageList title="Στάδια εργασιών" items={settings.stages||[]} onChange={items=>setSettings({...settings,stages:items})}/>} {route==="crews"&&<ManageList title="Συνεργεία" items={settings.crews||[]} onChange={items=>setSettings({...settings,crews:items})}/>} {route==="switchMaterialCategories"&&<ManageList title="Κατηγορίες διακοπτικού υλικού" items={settings.switchMaterialCategories||[]} onChange={items=>setSettings({...settings,switchMaterialCategories:items})}/>} {route==="accountFields"&&<AccountFieldsSettings settings={settings} setSettings={setSettings}/>}<VersionBadge/></div>;
  return <div className="app-shell"><header className="topbar"><div><p className="eyebrow">Ρυθμίσεις</p><h1>Διαχείριση</h1></div><button className="secondary-btn" onClick={onBack}><Home size={18}/> Πίσω</button></header><div className="settings-list">{sections.map(s=><button key={s.id} className="settings-row" onClick={()=>onRoute(s.id)}><span>{s.title}</span><small>Άνοιγμα</small></button>)}</div><VersionBadge/></div>
}

function ManageList({title,items,onChange}){
  const[value,setValue]=useState("");const[bulk,setBulk]=useState("");
  return <section className="detail-card"><h2>{title}</h2><div className="inline-add"><input value={value} onChange={e=>setValue(e.target.value)} placeholder="Νέα τιμή..."/><button className="primary-btn compact" onClick={()=>{if(value.trim()){onChange([...items,value.trim()]);setValue("")}}}>Προσθήκη</button></div><div className="bulk-box"><textarea value={bulk} onChange={e=>setBulk(e.target.value)} placeholder="Μαζική προσθήκη: μία γραμμή = μία τιμή"/><button className="secondary-btn" onClick={()=>{const next=bulk.split("\n").map(x=>x.trim()).filter(Boolean);onChange(Array.from(new Set([...items,...next])));setBulk("")}}>Μαζική προσθήκη</button></div><div className="list-box">{items.map((item,index)=><div className="list-row" key={`${item}-${index}`}><span>{item}</span><button onClick={()=>onChange(items.filter((_,i)=>i!==index))}><Trash2 size={16}/></button></div>)}</div></section>
}

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


function formatEuro(value){
  const num = Number(value) || 0;
  return num.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
}

function formatGreekDate(value){
  if(!value) return "";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(m) return `${m[3]}/${m[2]}/${m[1]}`;
  return value;
}

function normalizeProviderName(value){
  const v = (value || "").trim();
  if(/δεη|dei/i.test(v)) return "ΔΕΗ";
  if(/ευαθ/i.test(v)) return "ΕΥΑΘ";
  if(/αεριο|αέριο|gas/i.test(v)) return "Φυσικό Αέριο";
  return v || "Λοιποί";
}

function getBillPeriod(acc){
  const start = formatGreekDate(acc.consumptionStart);
  const end = formatGreekDate(acc.consumptionEnd);
  if(start && end) return `${start} - ${end}`;
  return acc.period || "";
}

function getBillKind(acc){
  return acc.billType || acc.invoiceType || "Λογαριασμός";
}

function AccountsTab({project,settings,onUpdate}){
  const fields=(settings.accountFields||accountFields||[]).filter(f=>f.enabled!==false);
  const initial=Object.fromEntries((settings.accountFields||accountFields||[]).map(f=>[f.key,f.key==="status"?"Εκκρεμεί":""]));
  const[form,setForm]=useState({...initial,provider:"ΔΕΗ",status:"Εκκρεμεί"});
  const[openGroups,setOpenGroups]=useState({});
  const[showAdd,setShowAdd]=useState(false);
  const accounts=project.accounts||[];

  const providersOrder=["ΔΕΗ","ΕΥΑΘ","Φυσικό Αέριο"];
  const grouped=accounts.reduce((acc,bill)=>{
    const provider=normalizeProviderName(bill.provider);
    if(!acc[provider]) acc[provider]=[];
    acc[provider].push(bill);
    return acc;
  },{});
  providersOrder.forEach(p=>{ if(!grouped[p]) grouped[p]=[]; });

  const providerNames=[
    ...providersOrder,
    ...Object.keys(grouped).filter(p=>!providersOrder.includes(p)).sort((a,b)=>a.localeCompare(b,"el"))
  ];

  const grandTotal=accounts.reduce((sum,b)=>sum+(Number(b.amount)||0),0);

  function providerTotal(provider){
    return (grouped[provider]||[]).reduce((sum,b)=>sum+(Number(b.amount)||0),0);
  }

  function isOpen(provider){
    return openGroups[provider]===true;
  }

  function addAccount(){
    if(!form.provider&&!form.paymentCode&&!form.amount)return;
    onUpdate({accounts:[{id:Date.now(),...form,amount:Number(form.amount)||0},...accounts]});
    setForm({...initial,provider:"ΔΕΗ",status:"Εκκρεμεί"});
    setShowAdd(false);
  }

  function updateAccount(id,patch){
    onUpdate({accounts:accounts.map(a=>a.id===id?{...a,...patch}:a)});
  }

  function deleteAccount(id){
    onUpdate({accounts:accounts.filter(a=>a.id!==id)});
  }

  return <section className="bills-home">
    <div className="bills-main-card">
      <div className="bills-title-row">
        <h2>Λογαριασμοί</h2>
        <button className="bill-plus-btn" onClick={()=>setShowAdd(!showAdd)}>⊕</button>
      </div>

      {showAdd&&<div className="bill-add-inline">
        <div className="account-form">
          {fields.map(field=>field.type==="textarea"
            ? <TextArea key={field.key} label={field.label} value={form[field.key]||""} onChange={v=>setForm({...form,[field.key]:v})}/>
            : field.type==="select"
              ? <Select key={field.key} label={field.label} value={form[field.key]||"Εκκρεμεί"} options={field.options||[]} onChange={v=>setForm({...form,[field.key]:v})}/>
              : <Field key={field.key} label={field.label} type={field.type} value={form[field.key]||""} onChange={v=>setForm({...form,[field.key]:v})}/>
          )}
        </div>
        <button className="primary-btn account-add" onClick={addAccount}>Αποθήκευση λογαριασμού</button>
      </div>}

      <div className="bill-accordion-list">
        {providerNames.map(provider=>{
          const rows=grouped[provider]||[];
          const total=providerTotal(provider);
          return <div className="bill-accordion" key={provider}>
            <button className="bill-accordion-head" onClick={()=>setOpenGroups({...openGroups,[provider]:!isOpen(provider)})}>
              <span>{isOpen(provider) ? "⌄" : "›"} {provider}</span>
              <strong>Σύνολο: {formatEuro(total)}</strong>
            </button>

            {isOpen(provider)&&<div className="bill-table-wrap">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Κατηγορία Λογαριασμού</th>
                    <th>Ημερομηνία Έκδοσης</th>
                    <th>Περίοδος Κατανάλωσης Από-Έως</th>
                    <th>Είδος λογαριασμού</th>
                    <th>Ποσό</th>
                    <th>Υπόλοιπο</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length===0&&<tr><td colSpan="7" className="empty-row">Δεν υπάρχουν λογαριασμοί.</td></tr>}
                  {rows.map(acc=><tr key={acc.id}>
                    <td>{normalizeProviderName(acc.provider)}</td>
                    <td>{formatGreekDate(acc.issueDate)}</td>
                    <td>{getBillPeriod(acc)}</td>
                    <td>{getBillKind(acc)}</td>
                    <td className="amount-cell">{formatEuro(acc.amount)}</td>
                    <td className="paid-cell">{acc.status==="Πληρώθηκε" ? "✓" : ""}</td>
                    <td className="row-tools">
                      <select value={acc.status||"Εκκρεμεί"} onChange={e=>updateAccount(acc.id,{status:e.target.value})}>
                        <option>Εκκρεμεί</option>
                        <option>Πληρώθηκε</option>
                      </select>
                      <button onClick={()=>deleteAccount(acc.id)} title="Διαγραφή">×</button>
                    </td>
                  </tr>)}
                  <tr className="provider-total-row">
                    <td colSpan="4"></td>
                    <td>Σύνολο: {formatEuro(total)}</td>
                    <td className="paid-cell">{rows.length>0 && rows.every(r=>r.status==="Πληρώθηκε") ? "✓" : ""}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>}
          </div>
        })}
      </div>
    </div>

    <div className="bills-bottom-total">Σύνολο: {formatEuro(grandTotal)}</div>
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
