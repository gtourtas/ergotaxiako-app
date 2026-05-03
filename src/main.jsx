
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Banknote, Building2, CalendarDays, ClipboardList, FileText, GanttChartSquare, Home, Layers, MapPin, MoreVertical, Package, Plug, Plus, Search, Settings, Trash2, Wrench } from "lucide-react";
import { createWorker } from "tesseract.js";
import versionInfo from "./version.json";
import "./style.css";

const STORAGE_KEY="ergotaxiako_app_v29";

const stages=["Αποξηλώσεις","Ηλεκτρολόγος","Υδραυλικός","Γκρο μπετά","Πλακάκια μπάνιου","Κουζίνα","Διακόπτες","Φωτιστικά","Τελικό βάψιμο","Παράδοση έργου"];
const switchCats=["Πρίζες","Διακόπτες","DATA / TV","Πλαίσια","Πλακίδια","Ειδικά"];
const switchTemplate=[
 {id:1,category:"Πρίζες",name:"Πρίζα σούκο, Legrand Valena Life",code:"753020",qty:30,received:false,installed:false,room:"",notes:""},
 {id:2,category:"Πρίζες",name:"Πρίζα εξωτερικού χώρου / με καπάκι",code:"",qty:4,received:false,installed:false,room:"",notes:""},
 {id:3,category:"Διακόπτες",name:"Απλός διακόπτης",code:"752000",qty:20,received:false,installed:false,room:"",notes:""},
 {id:4,category:"Διακόπτες",name:"Αλέ-ρετούρ",code:"752006",qty:12,received:false,installed:false,room:"",notes:""},
 {id:5,category:"Διακόπτες",name:"Διπλός διακόπτης",code:"752008",qty:7,received:false,installed:false,room:"",notes:""},
 {id:6,category:"Διακόπτες",name:"Τριπλός διακόπτης",code:"752003",qty:2,received:false,installed:false,room:"",notes:""},
 {id:7,category:"DATA / TV",name:"Πρίζα DATA RJ45",code:"755410",qty:4,received:false,installed:false,room:"",notes:""},
 {id:8,category:"DATA / TV",name:"Πρίζα TV",code:"753060",qty:4,received:false,installed:false,room:"",notes:""},
 {id:9,category:"Πλαίσια",name:"Πλαίσιο 1 θέσης",code:"754001",qty:15,received:false,installed:false,room:"",notes:""},
 {id:10,category:"Πλαίσια",name:"Πλαίσιο 2 θέσεων",code:"754002",qty:10,received:false,installed:false,room:"",notes:""},
 {id:11,category:"Πλαίσια",name:"Πλαίσιο 3 θέσεων",code:"754003",qty:6,received:false,installed:false,room:"",notes:""},
 {id:12,category:"Πλαίσια",name:"Πλαίσιο 4 θέσεων",code:"754004",qty:4,received:false,installed:false,room:"",notes:""},
 {id:13,category:"Πλακίδια",name:"Πλακίδιο διακόπτη",code:"755020",qty:41,received:false,installed:false,room:"",notes:""},
 {id:14,category:"Πλακίδια",name:"Πλακίδιο πρίζας",code:"754950",qty:30,received:false,installed:false,room:"",notes:""},
 {id:15,category:"Πλακίδια",name:"Πλακίδιο DATA",code:"755410",qty:4,received:false,installed:false,room:"",notes:""},
 {id:16,category:"Πλακίδια",name:"Πλακίδιο TV",code:"754820",qty:4,received:false,installed:false,room:"",notes:""},
 {id:17,category:"Ειδικά",name:"Παροχές A/C",code:"",qty:4,received:false,installed:false,room:"",notes:""},
 {id:18,category:"Ειδικά",name:"Θερμοστάτης",code:"",qty:1,received:false,installed:false,room:"",notes:""},
 {id:19,category:"Ειδικά",name:"Θυροτηλέφωνο",code:"",qty:1,received:false,installed:false,room:"",notes:""}
];

const accountFields=[
 {key:"provider",label:"Πάροχος",type:"select",enabled:true,options:["ΔΕΗ","ΕΥΑΘ","Φυσικό Αέριο","Κοινόχρηστα"],ocrAliases:["Πάροχος","Προμηθευτής","Εταιρεία"]},
 {key:"billType",label:"Είδος λογαριασμού",type:"text",enabled:true,ocrAliases:["Είδος λογαριασμού","Τύπος λογαριασμού","Εκκαθαριστικός","Έναντι"]},
 {key:"invoiceType",label:"Τύπος τιμολογίου",type:"text",enabled:true,ocrAliases:["Τύπος τιμολογίου","Τιμολόγιο","Ειδικό τιμολόγιο"]},
 {key:"amount",label:"Ποσό πληρωμής (€)",type:"number",enabled:true,ocrAliases:["ΠΟΣΟ ΠΛΗΡΩΜΗΣ","Πληρωτέο ποσό","Συνολικό ποσό πληρωμής","Ποσό"]},
 {key:"dueDate",label:"Εξόφληση έως",type:"date",enabled:true,ocrAliases:["Εξόφληση έως","Πληρωμή έως","Λήξη πληρωμής","Πληρωτέο μέχρι"]},
 {key:"issueDate",label:"Ημερομηνία έκδοσης",type:"date",enabled:true,ocrAliases:["Ημ/νία Έκδοσης","Ημερομηνία Έκδοσης","Ημ. Έκδοσης","Εκδόθηκε στις"]},
 {key:"consumptionStart",label:"Έναρξη περιόδου κατανάλωσης",type:"date",enabled:true,ocrAliases:["Περίοδος Κατανάλωσης Από","Από"]},
 {key:"consumptionEnd",label:"Λήξη περιόδου κατανάλωσης",type:"date",enabled:true,ocrAliases:["Περίοδος Κατανάλωσης Έως","Έως"]},
 {key:"days",label:"Ημέρες",type:"number",enabled:true,ocrAliases:["Ημέρες","Ημέρες κατανάλωσης"]},
 {key:"consumption",label:"Κατανάλωση",type:"text",enabled:true,ocrAliases:["Κατανάλωση","kWh","Κατανάλωση Ηλεκτρικής Ενέργειας"]},
 {key:"accountNumber",label:"Α/Α λογαριασμού",type:"text",enabled:true,ocrAliases:["Α/Α Λογαριασμού","Αριθμός λογαριασμού"]},
 {key:"supplyNumber",label:"Αριθμός παροχής",type:"text",enabled:true,ocrAliases:["Αριθμός παροχής","Αρ. παροχής"]},
 {key:"paymentCode",label:"Κωδικός ηλεκτρονικής πληρωμής",type:"text",enabled:true,ocrAliases:["Κωδικός ηλεκτρονικής πληρωμής","RF","Κωδικός πληρωμής"]},
 {key:"billingCycleDays",label:"Κύκλος έκδοσης (ημέρες)",type:"number",enabled:true,ocrAliases:["Κύκλος έκδοσης","Συχνότητα έκδοσης"]},
 {key:"nextIssueDate",label:"Χειροκίνητη ημερομηνία επόμενης έκδοσης",type:"date",enabled:true,ocrAliases:["Επόμενη έκδοση","Αναμενόμενη έκδοση"]},
 {key:"status",label:"Κατάσταση πληρωμής",type:"select",enabled:true,options:["Εκκρεμεί","Πληρώθηκε"],ocrAliases:["Κατάσταση πληρωμής"]},
 {key:"notes",label:"Σημειώσεις",type:"textarea",enabled:true,ocrAliases:["Σημειώσεις","Παρατηρήσεις"]}
];



const defaultPlanSlots=[
 {id:1,name:"Αρχιτεκτονικά σχέδια"},
 {id:2,name:"Ηλεκτρολογικά σχέδια"},
 {id:3,name:"Υδραυλικά σχέδια"}
];
const defaultCompanyTools=[
 {id:1,name:"Οικοδομικός αναδευτήρας",code:"TOOL-001",category:"Ηλεκτρικά εργαλεία",status:"Αποθήκη",projectId:"",projectName:"",notes:""},
 {id:2,name:"Πιστολέτο",code:"TOOL-002",category:"Ηλεκτρικά εργαλεία",status:"Αποθήκη",projectId:"",projectName:"",notes:""}
];

const defaultWarehouseItems=[
 {id:1,name:"Πρίζα σούκο, Legrand Valena Life",category:"Πρίζες",code:"753020",unit:"τεμ",stock:30,minStock:5,location:"Κεντρική αποθήκη",notes:""},
 {id:2,name:"Απλός διακόπτης",category:"Διακόπτες",code:"752000",unit:"τεμ",stock:20,minStock:5,location:"Κεντρική αποθήκη",notes:""},
 {id:3,name:"Αλέ-ρετούρ",category:"Διακόπτες",code:"752006",unit:"τεμ",stock:12,minStock:4,location:"Κεντρική αποθήκη",notes:""},
 {id:4,name:"Πρίζα DATA RJ45",category:"DATA / TV",code:"755410",unit:"τεμ",stock:4,minStock:2,location:"Κεντρική αποθήκη",notes:""}
];
const defaultWarehouse={items:defaultWarehouseItems,deliveryNotes:[]};

const defaultSettings={warehouse:defaultWarehouse,planSlots:defaultPlanSlots,companyTools:defaultCompanyTools,statuses:["Σε εξέλιξη","Επείγον","Αναμονή","Ολοκληρωμένο"],stages,crews:["Ηλεκτρολόγος","Υδραυλικός","Πλακάς"],switchMaterialCategories:switchCats,accountFields};
const defaultProjects=[{id:1,name:"Π. Ιωακείμ 14",address:"",stage:"Ηλεκτρολόγος",deliveryDate:"Δεν ορίστηκε",status:"Σε εξέλιξη",notes:"Έργο αναφοράς για Διακοπτικό Υλικό.",specs:"Σειρά διακοπτικού υλικού: Legrand Valena Life.",accounts:[],schedule:[],switchMaterials:switchTemplate}];




function readFileAsDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function normalizeCode(value){
  return String(value || "").trim().toLowerCase();
}

function addDeliveryToProjects(projects, note){
  return projects.map(project => {
    if(String(project.id) !== String(note.projectId)) return project;
    const current = project.warehouseMaterials || [];
    return {
      ...project,
      warehouseMaterials: [note, ...current]
    };
  });
}

function getProjectWarehouseSummary(project){
  const rows = project.warehouseMaterials || [];
  const map = {};
  rows.forEach(row => {
    const key = normalizeCode(row.code) || row.itemName;
    if(!map[key]){
      map[key] = {
        code: row.code || "",
        name: row.itemName,
        qty: 0,
        unit: row.unit || "τεμ",
        notes: []
      };
    }
    map[key].qty += Number(row.qty) || 0;
    map[key].notes.push(row);
  });
  return Object.values(map);
}

function getSwitchMaterialComparison(project){
  const sent = getProjectWarehouseSummary(project);
  return (project.switchMaterials || []).map(required => {
    const requiredCode = normalizeCode(required.code);
    const matched = sent.find(s => {
      const sentCode = normalizeCode(s.code);
      if(requiredCode && sentCode && requiredCode === sentCode) return true;
      return String(s.name || "").toLowerCase().includes(String(required.name || "").toLowerCase()) ||
             String(required.name || "").toLowerCase().includes(String(s.name || "").toLowerCase());
    });
    const requiredQty = Number(required.qty) || 0;
    const sentQty = Number(matched?.qty) || 0;
    return {
      ...required,
      sentQty,
      missingQty: Math.max(0, requiredQty - sentQty),
      extraQty: Math.max(0, sentQty - requiredQty),
      status: sentQty >= requiredQty ? "complete" : sentQty > 0 ? "partial" : "missing"
    };
  });
}

function confirmDelete(message="Να γίνει οριστική διαγραφή;"){
  return window.confirm(message);
}
function makeDeliveryNumber(existing=[]){
  const next=(existing?.length||0)+1;
  return `ΔΑ-${String(next).padStart(4,"0")}`;
}

function loadState(){
 try{
  const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem("ergotaxiako_app_v28")||localStorage.getItem("ergotaxiako_app_v27")||localStorage.getItem("ergotaxiako_app_v26")||localStorage.getItem("ergotaxiako_app_v24")||localStorage.getItem("ergotaxiako_app_v23")||localStorage.getItem("ergotaxiako_app_v22")||localStorage.getItem("ergotaxiako_app_v21")||localStorage.getItem("ergotaxiako_app_v20")||localStorage.getItem("ergotaxiako_app_v19")||localStorage.getItem("ergotaxiako_app_v18")||localStorage.getItem("ergotaxiako_app_v17");
  if(!raw)return{projects:defaultProjects,settings:{...defaultSettings,warehouse:defaultWarehouse}};
  const p=JSON.parse(raw);
  const loadedProjects=(p.projects?.length?p.projects:defaultProjects).map(pr=>({...pr,accounts:pr.accounts||[],schedule:pr.schedule||[],switchMaterials:pr.switchMaterials||[],warehouseMaterials:pr.warehouseMaterials||[],plans:pr.plans||[],orderSlips:pr.orderSlips||[]}));
  if(!loadedProjects.some(p=>p.name==="Π. Ιωακείμ 14")) loadedProjects.unshift(defaultProjects[0]);
  return{projects:loadedProjects,settings:{...defaultSettings,...(p.settings||{}),warehouse:p.settings?.warehouse||defaultWarehouse,planSlots:p.settings?.planSlots||defaultPlanSlots,companyTools:p.settings?.companyTools||defaultCompanyTools,accountFields:mergeAccountFields(p.settings?.accountFields)}};
 }catch{return{projects:defaultProjects,settings:{...defaultSettings,warehouse:defaultWarehouse}}}
}
function mergeAccountFields(saved=[]){return accountFields.map(f=>{const s=saved.find(x=>x.key===f.key);return s?{...f,...s,ocrAliases:s.ocrAliases?.length?s.ocrAliases:f.ocrAliases}:f})}
function formatEuro(v){return (Number(v)||0).toLocaleString("el-GR",{minimumFractionDigits:2,maximumFractionDigits:2})+"€"}
function formatGreekDate(v){if(!v)return"";const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:v}
function normalizeProviderName(v){if(/δεη|dei/i.test(v||""))return"ΔΕΗ";if(/ευαθ/i.test(v||""))return"ΕΥΑΘ";if(/αέριο|αεριο|gas/i.test(v||""))return"Φυσικό Αέριο";if(/κοινόχρηστα|κοινοχρηστα/i.test(v||""))return"Κοινόχρηστα";return v||"Λοιποί"}
function getBillPeriod(a){const s=formatGreekDate(a.consumptionStart),e=formatGreekDate(a.consumptionEnd);return s&&e?`${s} - ${e}`:""}
function getBillKind(a){return a.billType||a.invoiceType||"Λογαριασμός"}
function addDaysIso(date,days){if(!date||!days)return"";const d=new Date(date+"T00:00:00");if(Number.isNaN(d.getTime()))return"";d.setDate(d.getDate()+Number(days));return d.toISOString().slice(0,10)}
function daysUntil(date){if(!date)return null;const t=new Date(date+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);if(Number.isNaN(t.getTime()))return null;return Math.round((t-n)/86400000)}
function getNextIssueDate(a){return a.nextIssueDate||addDaysIso(a.issueDate||a.consumptionEnd,a.billingCycleDays)}
function getBillEvents(accounts){return accounts.flatMap(a=>{const p=normalizeProviderName(a.provider),ev=[];if(a.dueDate)ev.push({id:"d"+a.id,accountId:a.id,date:a.dueDate,type:"due",provider:p,title:`Λήξη ${p}`,subtitle:formatEuro(a.amount),days:daysUntil(a.dueDate)});const ni=getNextIssueDate(a);if(ni)ev.push({id:"i"+a.id,accountId:a.id,date:ni,type:"issue",provider:p,title:`Αναμενόμενη έκδοση ${p}`,subtitle:getBillKind(a),days:daysUntil(ni)});return ev}).sort((a,b)=>a.date.localeCompare(b.date))}
function toIsoDate(v){const m=String(v||"").match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);return m?`${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`:""}
function parseByAliases(text,fields){const out={};for(const f of fields){for(const alias of f.ocrAliases||[]){const esc=alias.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");const pat=f.type==="date"?new RegExp(`${esc}[^0-9]{0,40}(\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{4})`,"i"):f.type==="number"?new RegExp(`${esc}[^0-9]{0,40}([*]?\\d+[,.]?\\d*)`,"i"):new RegExp(`${esc}[^\\n\\r:]{0,25}[:\\s]*([^\\n\\r]{2,80})`,"i");const m=text.match(pat);if(m){out[f.key]=f.type==="date"?toIsoDate(m[1]):String(m[1]).replace(",",".").replace("*","").trim();break}}}return out}
function parseGreekBillText(text,fields){const t=text||"";const out=parseByAliases(t,fields);if(/ΔΕΗ|DEI/i.test(t))out.provider="ΔΕΗ";if(/ΕΥΑΘ/i.test(t))out.provider="ΕΥΑΘ";const rf=t.match(/(RF[A-Z0-9]{10,})/i);if(rf)out.paymentCode=rf[1].toUpperCase();const amount=t.match(/([*]?\d+[,.]\d{2})\s*€/);if(amount&&!out.amount)out.amount=amount[1].replace(",",".").replace("*","");out.status=out.status||"Εκκρεμεί";return out}


function getAllProjectBillEvents(projects){
  return projects.flatMap(project =>
    getBillEvents(project.accounts || []).map(event => ({
      ...event,
      projectId: project.id,
      projectName: project.name
    }))
  ).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

function monthLabel(date){
  return date.toLocaleDateString("el-GR", { month:"long", year:"numeric" });
}

function isoFromDate(date){
  return date.toISOString().slice(0,10);
}

function getMonthDays(currentDate){
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(first);
  const firstDay = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - firstDay);
  const days = [];
  for(let i=0;i<42;i++){
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function App(){
 const init=loadState();
 const[projects,setProjects]=useState(init.projects);
 const[settings,setSettings]=useState(init.settings);
 const[view,setView]=useState({type:"home"});
 const[query,setQuery]=useState("");
 const[filter,setFilter]=useState("all");
 const[showNew,setShowNew]=useState(false);
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify({projects,settings})),[projects,settings]);
 const selected=projects.find(p=>p.id===view.projectId);
 function updateProject(id,patch){setProjects(projects.map(p=>p.id===id?{...p,...patch}:p))}
 function addProject(p){const n={...p,id:Date.now(),accounts:[],schedule:[],switchMaterials:[],warehouseMaterials:[],plans:[],orderSlips:[]};setProjects([n,...projects]);setShowNew(false);setView({type:"project",projectId:n.id,tab:"general"})}
 if(view.type==="tools")return <AppLayout projects={projects} current="tools" onHome={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} onSettings={()=>setView({type:"settings",section:"index"})}><ToolsPage settings={settings} setSettings={setSettings} projects={projects} onBack={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})}/></AppLayout>;
 if(view.type==="warehouse")return <AppLayout projects={projects} current="warehouse" onHome={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} onSettings={()=>setView({type:"settings",section:"index"})}><WarehousePage settings={settings} setSettings={setSettings} projects={projects} setProjects={setProjects} onBack={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"warehouseMaterials"})}/></AppLayout>;
 if(view.type==="calendar")return <AppLayout projects={projects} current="calendar" onHome={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} onSettings={()=>setView({type:"settings",section:"index"})}><HomeCalendarPage projects={projects} onBack={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"accounts"})}/></AppLayout>;
 if(view.type==="settings")return <AppLayout projects={projects} current="settings" onHome={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} onSettings={()=>setView({type:"settings",section:"index"})}><SettingsPage settings={settings} setSettings={setSettings} route={view.section||"index"} onRoute={s=>setView({type:"settings",section:s})} onBack={()=>setView({type:"home"})}/></AppLayout>;
 if(view.type==="project"&&selected)return <AppLayout projects={projects} activeProjectId={selected.id} current="project" onHome={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} onSettings={()=>setView({type:"settings",section:"index"})}><ProjectPage projects={projects} project={selected} settings={settings} tab={view.tab||"general"} onBack={()=>setView({type:"home"})} onProjectOpen={(projectId)=>setView({type:"project",projectId,tab:"general"})} onTab={tab=>setView({type:"project",projectId:selected.id,tab})} onUpdate={p=>updateProject(selected.id,p)} onDelete={()=>{if(confirmDelete("Να διαγραφεί οριστικά το έργο;")){setProjects(projects.filter(p=>p.id!==selected.id));setView({type:"home"})}}}/></AppLayout>;
 return <AppLayout projects={projects} current="home" onHome={()=>setView({type:"home"})} onOpenProject={(projectId)=>setView({type:"project",projectId,tab:"general"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} onSettings={()=>setView({type:"settings",section:"index"})}><HomePage projects={projects} settings={settings} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onOpen={id=>setView({type:"project",projectId:id,tab:"general"})} onSettings={()=>setView({type:"settings",section:"index"})} onCalendar={()=>setView({type:"calendar"})} onWarehouse={()=>setView({type:"warehouse"})} onTools={()=>setView({type:"tools"})} showNew={showNew} setShowNew={setShowNew} onAdd={addProject}/></AppLayout>;
}



function GlobalSidebar({projects=[],activeProjectId,onHome,onOpenProject,onCalendar,onWarehouse,onTools,onSettings,current="home"}){
  return <aside className="global-sidebar">
    <div className="global-brand" onClick={onHome}>
      <span>TREF</span>
      <small>Εργοταξιακό App</small>
    </div>

    <nav className="global-main-nav">
      <button className={current==="home"?"active":""} onClick={onHome}><Home size={17}/> Αρχική</button>
      <button className={current==="calendar"?"active":""} onClick={onCalendar}><CalendarDays size={17}/> Ημερολόγιο</button>
      <button className={current==="warehouse"?"active":""} onClick={onWarehouse}><Package size={17}/> Αποθήκη</button>
      <button className={current==="tools"?"active":""} onClick={onTools}><Wrench size={17}/> Εργαλεία</button>
      <button className={current==="settings"?"active":""} onClick={onSettings}><Settings size={17}/> Διαχείριση</button>
    </nav>

    <div className="global-projects">
      <p>Έργα</p>
      <div className="global-project-list">
        {projects.length===0 ? <span className="global-empty">Δεν υπάρχουν έργα</span> :
          projects.map(project=><button key={project.id} className={project.id===activeProjectId?"active":""} onClick={()=>onOpenProject(project.id)}>
            <Building2 size={15}/>
            <span>{project.name}</span>
          </button>)
        }
      </div>
    </div>
  </aside>
}

function AppLayout({children,projects,activeProjectId,current,onHome,onOpenProject,onCalendar,onWarehouse,onTools,onSettings}){
  return <div className="global-layout">
    <GlobalSidebar projects={projects} activeProjectId={activeProjectId} current={current} onHome={onHome} onOpenProject={onOpenProject} onCalendar={onCalendar} onWarehouse={onWarehouse} onTools={onTools} onSettings={onSettings}/>
    <main className="global-content">{children}</main>
  </div>
}

function StickyBreadcrumb({items=[], menuButton=false}){
  return <div className="sticky-breadcrumb-wrap">
    <nav className="sticky-breadcrumb">
      <div className="breadcrumb-links">
        {items.map((item,index)=><React.Fragment key={`${item.label}-${index}`}>
          <button className={index===items.length-1?"current":""} onClick={item.onClick} disabled={!item.onClick}>
            {item.label}
          </button>
          {index<items.length-1&&<span>/</span>}
        </React.Fragment>)}
      </div>
      {menuButton&&<button className="breadcrumb-menu">☰</button>}
    </nav>
  </div>
}

function HomePage({projects,settings,query,setQuery,filter,setFilter,onOpen,onSettings,onCalendar,onWarehouse,onTools,showNew,setShowNew,onAdd}){
 const[menu,setMenu]=useState(false);
 const[form,setForm]=useState({name:"",address:"",stage:settings.stages[0]||"",deliveryDate:"",status:"Σε εξέλιξη",notes:"",specs:""});
 const stats={total:projects.length,active:projects.filter(p=>p.status==="Σε εξέλιξη").length,urgent:projects.filter(p=>p.status==="Επείγον").length,waiting:projects.filter(p=>p.status==="Αναμονή").length};
 const filtered=projects.filter(p=>(filter==="all"||p.status===filter)&&`${p.name} ${p.address} ${p.stage}`.toLowerCase().includes(query.toLowerCase()));
 function submit(){if(!form.name.trim())return;onAdd({...form,deliveryDate:form.deliveryDate||"Δεν ορίστηκε"});setForm({name:"",address:"",stage:settings.stages[0]||"",deliveryDate:"",status:"Σε εξέλιξη",notes:"",specs:""})}
 return <div className="app-shell"><StickyBreadcrumb items={[{label:"TREF"}]} menuButton/><header className="topbar"><div><p className="eyebrow">Εργοταξιακό App</p><h1>Έργα</h1><p className="subtitle">Dashboard έργων με modules ανά έργο.</p></div><div className="header-actions"><button className="secondary-btn" onClick={onSettings}><Settings size={18}/> Διαχείριση</button><div className="more-wrap"><button className="icon-btn" onClick={()=>setMenu(!menu)}><MoreVertical size={20}/></button>{menu&&<div className="more-menu"><button onClick={()=>{setShowNew(true);setMenu(false)}}><Plus size={16}/> Προσθήκη έργου</button><button onClick={onSettings}><Settings size={16}/> Διαχείριση</button></div>}</div></div></header>
 <nav className="taskbar">{["all","Σε εξέλιξη","Επείγον","Αναμονή"].map(x=><button key={x} className={filter===x?"active":""} onClick={()=>setFilter(x)}>{x==="all"?"Όλα":x}</button>)}<button onClick={onCalendar}>Ημερολόγιο</button><button onClick={onWarehouse}>Αποθήκη</button><button onClick={onTools}>Εργαλεία</button></nav>
 <section className="stats-grid"><Stat label="Σε εξέλιξη" value={stats.active}/><Stat label="Επείγοντα" value={stats.urgent}/><Stat label="Σε αναμονή" value={stats.waiting}/><Stat label="Όλα τα έργα" value={stats.total}/></section>
 <section className="home-action-grid">
   <button className="home-calendar-entry" onClick={onCalendar}>
     <div>
       <span className="home-action-eyebrow">Ημερολόγιο</span>
       <strong>Υπενθυμίσεις λογαριασμών</strong>
       <p>Λήξεις πληρωμής και αναμενόμενες εκδόσεις από όλα τα έργα.</p>
     </div>
     <CalendarDays size={34}/>
   </button>
   <button className="home-calendar-entry warehouse-entry" onClick={onWarehouse}>
     <div>
       <span className="home-action-eyebrow">Αποθήκη</span>
       <strong>Κεντρική αποθήκη</strong>
       <p>Υλικά, απόθεμα και δελτία αποστολής προς έργα.</p>
     </div>
     <Package size={34}/>
   </button>
   <button className="home-calendar-entry tools-entry" onClick={onTools}>
     <div>
       <span className="home-action-eyebrow">Εργαλεία</span>
       <strong>Εταιρικά εργαλεία</strong>
       <p>Παρακολούθηση εργαλείων και σε ποιο έργο βρίσκονται.</p>
     </div>
     <Wrench size={34}/>
   </button>
 </section>
 <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Αναζήτηση έργου..."/></div>
 {showNew&&<section className="detail-card new-project-panel"><div className="panel-head"><h2><Plus size={20}/> Προσθήκη έργου</h2><button className="secondary-btn" onClick={()=>setShowNew(false)}>Κλείσιμο</button></div><div className="two-col"><Field label="Όνομα έργου" value={form.name} onChange={v=>setForm({...form,name:v})}/><Field label="Διεύθυνση" value={form.address} onChange={v=>setForm({...form,address:v})}/><Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={v=>setForm({...form,stage:v})}/><Field label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={v=>setForm({...form,deliveryDate:v})}/><Select label="Κατάσταση" value={form.status} options={settings.statuses} onChange={v=>setForm({...form,status:v})}/></div><button className="primary-btn" onClick={submit}>Αποθήκευση έργου</button></section>}
 <div className="project-grid">{filtered.map(p=><button className="project-card" key={p.id} onClick={()=>onOpen(p.id)}><div className="card-head"><div><h3>{p.name}</h3><p>{p.stage}</p></div><Building2 size={22}/></div><div className="mini-info"><MapPin size={15}/> {p.address||"Χωρίς διεύθυνση"}</div><div className="mini-info"><CalendarDays size={15}/> Παράδοση: {p.deliveryDate}</div>{p.switchMaterials?.length>0&&<div className="mini-info"><Plug size={15}/> Διακοπτικό: {p.switchMaterials.length} είδη</div>}<span className="status blue">{p.status}</span></button>)}</div></div>
}
function Stat({label,value}){return <button className="stat-card"><p>{label}</p><strong>{value}</strong></button>}



function WarehousePage({settings,setSettings,projects,setProjects,onBack,onOpenProject}){
 const warehouse=settings.warehouse||defaultWarehouse;
 const items=warehouse.items||[];
 const notes=warehouse.deliveryNotes||[];
 const[tab,setTab]=useState("items");
 const[itemForm,setItemForm]=useState({name:"",category:"",code:"",unit:"τεμ",stock:"",minStock:"",location:"Κεντρική αποθήκη",notes:""});
 const[noteForm,setNoteForm]=useState({projectId:projects[0]?.id||"",itemId:items[0]?.id||"",qty:"",notes:""});
 const lowItems=items.filter(i=>Number(i.stock)<=Number(i.minStock||0));
 const totalStock=items.reduce((s,i)=>s+(Number(i.stock)||0),0);
 function saveWarehouse(next){setSettings({...settings,warehouse:next})}
 function addItem(){
  if(!itemForm.name.trim())return;
  const item={...itemForm,id:Date.now(),stock:Number(itemForm.stock)||0,minStock:Number(itemForm.minStock)||0};
  saveWarehouse({...warehouse,items:[item,...items]});
  setItemForm({name:"",category:"",code:"",unit:"τεμ",stock:"",minStock:"",location:"Κεντρική αποθήκη",notes:""});
 }
 function updateItem(id,patch){saveWarehouse({...warehouse,items:items.map(i=>i.id===id?{...i,...patch}:i)})}
 function deleteItem(id){if(!confirmDelete("Να διαγραφεί οριστικά το υλικό από την αποθήκη;"))return;saveWarehouse({...warehouse,items:items.filter(i=>i.id!==id)})}
 function createDeliveryNote(){
  const item=items.find(i=>String(i.id)===String(noteForm.itemId));
  const project=projects.find(p=>String(p.id)===String(noteForm.projectId));
  const qty=Number(noteForm.qty)||0;
  if(!item||!project||qty<=0)return;
  if(qty>Number(item.stock||0)){
   alert("Η ποσότητα είναι μεγαλύτερη από το διαθέσιμο απόθεμα.");
   return;
  }
  const note={id:Date.now(),number:makeDeliveryNumber(notes),date:new Date().toISOString().slice(0,10),projectId:project.id,projectName:project.name,itemId:item.id,itemName:item.name,code:item.code,qty,unit:item.unit,notes:noteForm.notes};
  saveWarehouse({...warehouse,items:items.map(i=>i.id===item.id?{...i,stock:Number(i.stock||0)-qty}:i),deliveryNotes:[note,...notes]}); if(setProjects){setProjects(prev=>addDeliveryToProjects(prev,note));}
  setNoteForm({projectId:projects[0]?.id||"",itemId:items[0]?.id||"",qty:"",notes:""});
  setTab("notes");
 }
 return <div className="app-shell">
  <StickyBreadcrumb items={[{label:"TREF",onClick:onBack},{label:"Αποθήκη"}]} menuButton/>
  <header className="topbar"><div><p className="eyebrow">Κεντρική αποθήκη</p><h1>Αποθήκη</h1><p className="subtitle">Γενική αποθήκη υλικών και δελτία αποστολής προς έργα.</p></div><button className="secondary-btn" onClick={onBack}><ArrowLeft size={18}/> Πίσω στα έργα</button></header>
  <section className="warehouse-stats">
   <div><p>Υλικά</p><strong>{items.length}</strong></div>
   <div><p>Συνολικό απόθεμα</p><strong>{totalStock}</strong></div>
   <div><p>Κάτω από όριο</p><strong>{lowItems.length}</strong></div>
   <div><p>Δελτία αποστολής</p><strong>{notes.length}</strong></div>
  </section>
  <nav className="warehouse-tabs"><button className={tab==="items"?"active":""} onClick={()=>setTab("items")}>Υλικά</button><button className={tab==="send"?"active":""} onClick={()=>setTab("send")}>Δελτίο αποστολής</button><button className={tab==="notes"?"active":""} onClick={()=>setTab("notes")}>Ιστορικό</button><button className={tab==="low"?"active":""} onClick={()=>setTab("low")}>Κάτω από όριο</button></nav>
  {tab==="items"&&<section className="warehouse-grid">
    <div className="warehouse-card"><h2>Νέο υλικό</h2><div className="two-col"><Field label="Ονομασία" value={itemForm.name} onChange={v=>setItemForm({...itemForm,name:v})}/><Field label="Κατηγορία" value={itemForm.category} onChange={v=>setItemForm({...itemForm,category:v})}/><Field label="Κωδικός" value={itemForm.code} onChange={v=>setItemForm({...itemForm,code:v})}/><Field label="Μονάδα" value={itemForm.unit} onChange={v=>setItemForm({...itemForm,unit:v})}/><Field label="Απόθεμα" type="number" value={itemForm.stock} onChange={v=>setItemForm({...itemForm,stock:v})}/><Field label="Ελάχιστο όριο" type="number" value={itemForm.minStock} onChange={v=>setItemForm({...itemForm,minStock:v})}/><Field label="Τοποθεσία" value={itemForm.location} onChange={v=>setItemForm({...itemForm,location:v})}/></div><TextArea label="Παρατηρήσεις" value={itemForm.notes} onChange={v=>setItemForm({...itemForm,notes:v})}/><button className="primary-btn" onClick={addItem}>Προσθήκη υλικού</button></div>
    <div className="warehouse-card"><h2>Λίστα υλικών</h2><div className="warehouse-items">{items.map(item=><div className={`warehouse-item ${Number(item.stock)<=Number(item.minStock||0)?"low":""}`} key={item.id}><div><strong>{item.name}</strong><p>{item.category||"Χωρίς κατηγορία"} · {item.code||"χωρίς κωδικό"}</p><small>{item.location}</small></div><div className="warehouse-stock"><input type="number" value={item.stock} onChange={e=>updateItem(item.id,{stock:Number(e.target.value)||0})}/><span>{item.unit}</span></div><button className="icon-danger" onClick={()=>deleteItem(item.id)}><Trash2 size={16}/></button></div>)}</div></div>
  </section>}
  {tab==="send"&&<section className="warehouse-card"><h2>Δελτίο αποστολής προς έργο</h2><div className="two-col"><Select label="Έργο" value={noteForm.projectId} options={projects.map(p=>String(p.id))} labels={Object.fromEntries(projects.map(p=>[String(p.id),p.name]))} onChange={v=>setNoteForm({...noteForm,projectId:v})}/><Select label="Υλικό" value={noteForm.itemId} options={items.map(i=>String(i.id))} labels={Object.fromEntries(items.map(i=>[String(i.id),`${i.name} (${i.stock} ${i.unit})`]))} onChange={v=>setNoteForm({...noteForm,itemId:v})}/><Field label="Ποσότητα" type="number" value={noteForm.qty} onChange={v=>setNoteForm({...noteForm,qty:v})}/></div><TextArea label="Σημειώσεις δελτίου" value={noteForm.notes} onChange={v=>setNoteForm({...noteForm,notes:v})}/><button className="primary-btn" onClick={createDeliveryNote}>Έκδοση δελτίου & μείωση stock</button></section>}
  {tab==="notes"&&<section className="warehouse-card"><h2>Ιστορικό δελτίων αποστολής</h2><div className="delivery-list">{notes.length===0?<div className="empty-state">Δεν υπάρχουν δελτία αποστολής.</div>:notes.map(n=><button className="delivery-note" key={n.id} onClick={()=>onOpenProject(n.projectId)}><strong>{n.number} · {formatGreekDate(n.date)}</strong><span>{n.projectName}</span><p>{n.itemName} · {n.qty} {n.unit}</p></button>)}</div></section>}
  {tab==="low"&&<section className="warehouse-card"><h2>Υλικά κάτω από όριο</h2><div className="warehouse-items">{lowItems.length===0?<div className="empty-state">Δεν υπάρχουν υλικά κάτω από το όριο.</div>:lowItems.map(item=><div className="warehouse-item low" key={item.id}><div><strong>{item.name}</strong><p>Απόθεμα {item.stock} / ελάχιστο {item.minStock}</p></div></div>)}</div></section>}
 </div>
}

function HomeCalendarPage({projects,onBack,onOpenProject}){
 const[currentMonth,setCurrentMonth]=useState(new Date());
 const[selectedDate,setSelectedDate]=useState(isoFromDate(new Date()));
 const[provider,setProvider]=useState("Όλοι");
 const events=getAllProjectBillEvents(projects);
 const providers=["Όλοι",...Array.from(new Set(events.map(e=>e.provider))).sort((a,b)=>a.localeCompare(b,"el"))];
 const visibleEvents=provider==="Όλοι"?events:events.filter(e=>e.provider===provider);
 const days=getMonthDays(currentMonth);
 const eventsByDate=visibleEvents.reduce((acc,e)=>{(acc[e.date]||(acc[e.date]=[])).push(e);return acc},{});
 const selectedEvents=eventsByDate[selectedDate]||[];
 const upcoming=visibleEvents.filter(e=>e.days!==null&&e.days>=0).slice(0,8);
 function prevMonth(){setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1,1))}
 function nextMonth(){setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,1))}
 return <div className="app-shell">
   <StickyBreadcrumb items={[{label:"TREF",onClick:onBack},{label:"Ημερολόγιο"}]} menuButton/>
   <header className="topbar">
     <div><p className="eyebrow">Αρχική σελίδα</p><h1>Ημερολόγιο</h1><p className="subtitle">Υπενθυμίσεις λογαριασμών από όλα τα έργα: λήξεις πληρωμής και αναμενόμενες εκδόσεις.</p></div>
     <button className="secondary-btn" onClick={onBack}><ArrowLeft size={18}/> Πίσω στα έργα</button>
   </header>
   <section className="home-calendar-layout">
    <div className="home-calendar-card">
      <div className="home-calendar-toolbar">
        <button onClick={prevMonth}>‹</button>
        <strong>{monthLabel(currentMonth)}</strong>
        <button onClick={nextMonth}>›</button>
        <select value={provider} onChange={e=>setProvider(e.target.value)}>{providers.map(p=><option key={p}>{p}</option>)}</select>
      </div>
      <div className="calendar-weekdays">{["Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ","Κυρ"].map(d=><span key={d}>{d}</span>)}</div>
      <div className="month-grid">
        {days.map(day=>{
          const iso=isoFromDate(day);
          const list=eventsByDate[iso]||[];
          const isOther=day.getMonth()!==currentMonth.getMonth();
          const isSelected=iso===selectedDate;
          return <button key={iso} className={`month-day ${isOther?"other":""} ${isSelected?"selected":""}`} onClick={()=>setSelectedDate(iso)}>
            <span className="day-number">{day.getDate()}</span>
            <div className="day-events">
              {list.slice(0,3).map(ev=><span key={ev.id} className={`day-pill ${ev.type}`}>{ev.type==="due"?"Λήξη":"Έκδοση"} {ev.provider}</span>)}
              {list.length>3&&<span className="day-more">+{list.length-3}</span>}
            </div>
          </button>
        })}
      </div>
    </div>
    <aside className="calendar-side-panel">
      <div className="calendar-side-card">
        <h2>{formatGreekDate(selectedDate)}</h2>
        {selectedEvents.length===0?<p className="muted">Δεν υπάρχουν υπενθυμίσεις για αυτή την ημέρα.</p>:selectedEvents.map(ev=><button className={`calendar-detail-event ${ev.type}`} key={ev.id} onClick={()=>onOpenProject(ev.projectId)}>
          <strong>{ev.title}</strong>
          <span>{ev.projectName}</span>
          <small>{ev.subtitle} · {ev.days===0?"σήμερα":ev.days>0?`σε ${ev.days}ημ.`:`${Math.abs(ev.days)}ημ. πριν`}</small>
        </button>)}
      </div>
      <div className="calendar-side-card">
        <h2>Προσεχείς υπενθυμίσεις</h2>
        {upcoming.length===0?<p className="muted">Δεν υπάρχουν προσεχείς υπενθυμίσεις.</p>:upcoming.map(ev=><button className={`calendar-detail-event ${ev.type}`} key={ev.id} onClick={()=>{setSelectedDate(ev.date);onOpenProject(ev.projectId)}}>
          <strong>{formatGreekDate(ev.date)} · {ev.title}</strong>
          <span>{ev.projectName}</span>
          <small>{ev.subtitle}</small>
        </button>)}
      </div>
    </aside>
   </section>
 </div>
}

function ProjectPage({projects=[],project,settings,tab,onBack,onProjectOpen,onTab,onUpdate,onDelete}){
 const tabs=[["general","Γενικά",FileText],["accounts","Λογαριασμοί",Banknote],["switchMaterials","Διακοπτικό Υλικό",Plug],["warehouseMaterials","Υλικά από αποθήκη",Package],["plans","Σχέδια",FileText],["orderSlips","Δελτία παραγγελίας",ClipboardList],["schedule","Χρονοδιάγραμμα",GanttChartSquare],["stages","Στάδια εργασιών",Layers],["materials","Υλικά",Package]];
 return <div className="project-layout"><aside className="sidebar"><button className="back-btn" onClick={onBack}><ArrowLeft size={18}/> Πίσω στα έργα</button><div className="project-title"><Building2 size={28}/><div><h2>{project.name}</h2><p>{project.address||"Χωρίς διεύθυνση"}</p></div></div><div className="sidebar-projects"><p>Έργα</p>{projects.map(p=><button key={p.id} className={p.id===project.id?"active":""} onClick={()=>onProjectOpen&&onProjectOpen(p.id)}>{p.name}</button>)}</div><nav className="tab-nav">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>onTab(id)}><Icon size={18}/> {label}</button>)}</nav></aside><main className="detail-main"><StickyBreadcrumb items={[
  {label:"TREF",onClick:onBack},
  {label:"Έργα",onClick:onBack},
  {label:project.name,onClick:()=>onTab("general")},
  {label:tab==="general"?"Γενικά":tab==="accounts"?"Λογαριασμοί":tab==="switchMaterials"?"Διακοπτικό Υλικό":tab==="warehouseMaterials"?"Υλικά από αποθήκη":tab==="plans"?"Σχέδια":tab==="orderSlips"?"Δελτία παραγγελίας":tab==="schedule"?"Χρονοδιάγραμμα":tab==="stages"?"Στάδια εργασιών":"Υλικά"}
]} menuButton/><div className="detail-header"><div><h1>{project.name}</h1></div>{tab==="general"&&<button className="danger-btn" onClick={onDelete}><Trash2 size={18}/> Διαγραφή έργου</button>}</div>{tab==="general"&&<GeneralTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==="accounts"&&<AccountsTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==="switchMaterials"&&<SwitchMaterialsTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==="warehouseMaterials"&&<ProjectWarehouseMaterialsTab project={project}/>} {tab==="plans"&&<PlansTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==="orderSlips"&&<OrderSlipsTab project={project} settings={settings} onUpdate={onUpdate}/>} {tab==="schedule"&&<Placeholder title="Χρονοδιάγραμμα" text="Το χρονοδιάγραμμα παραμένει διαθέσιμο για επέκταση."/>} {tab==="stages"&&<StagesTab stages={settings.stages}/>} {tab==="materials"&&<Placeholder title="Υλικά" text="Εδώ θα μπουν γενικά υλικά."/>}</main></div>
}
function GeneralTab({project,settings,onUpdate}){return <section className="detail-card"><h2>Γενικά στοιχεία</h2><div className="two-col"><Field label="Όνομα έργου" value={project.name} onChange={v=>onUpdate({name:v})}/><Field label="Διεύθυνση" value={project.address} onChange={v=>onUpdate({address:v})}/><Select label="Στάδιο" value={project.stage} options={settings.stages} onChange={v=>onUpdate({stage:v})}/><Select label="Κατάσταση" value={project.status} options={settings.statuses} onChange={v=>onUpdate({status:v})}/><Field label="Ημερομηνία παράδοσης" type="date" value={project.deliveryDate==="Δεν ορίστηκε"?"":project.deliveryDate} onChange={v=>onUpdate({deliveryDate:v})}/></div><TextArea label="Σημειώσεις" value={project.notes||""} onChange={v=>onUpdate({notes:v})}/><TextArea label="Τεχνικές προδιαγραφές" value={project.specs||""} onChange={v=>onUpdate({specs:v})} tall/></section>}

function AccountsTab({project,settings,onUpdate}){
 const allFields=mergeAccountFields(settings.accountFields);const fields=allFields.filter(f=>f.enabled!==false);const initial=Object.fromEntries(allFields.map(f=>[f.key,f.key==="status"?"Εκκρεμεί":""]));
 const empty={...initial,provider:"ΔΕΗ",status:"Εκκρεμεί",billingCycleDays:initial.billingCycleDays||"30"};
 const[form,setForm]=useState(empty),[mode,setMode]=useState("list"),[selectedId,setSelectedId]=useState(null),[open,setOpen]=useState({}),[ocrStatus,setOcrStatus]=useState(""),[ocrText,setOcrText]=useState(""),[preview,setPreview]=useState(""),[attachment,setAttachment]=useState(null),[reading,setReading]=useState(false),[calProvider,setCalProvider]=useState("Όλοι");
 const accounts=project.accounts||[],selected=accounts.find(a=>a.id===selectedId);const providers=["ΔΕΗ","ΕΥΑΘ","Φυσικό Αέριο","Κοινόχρηστα"];const grouped=accounts.reduce((a,b)=>{const p=normalizeProviderName(b.provider);(a[p]||(a[p]=[])).push(b);return a},{});
 providers.forEach(p=>grouped[p]||(grouped[p]=[]));const providerNames=[...providers,...Object.keys(grouped).filter(p=>!providers.includes(p))];const total=accounts.reduce((s,a)=>s+(Number(a.amount)||0),0);
 const events=getBillEvents(accounts).filter(e=>calProvider==="Όλοι"||e.provider===calProvider);const upcoming=events.filter(e=>e.days>=0).slice(0,8),overdue=events.filter(e=>e.type==="due"&&e.days<0);
 function openBill(id){const a=accounts.find(x=>x.id===id);if(!a)return;setSelectedId(id);setForm({...empty,...a});setAttachment(a.attachment||null);setMode("view")}
 function startNew(){setForm(empty);setSelectedId(null);setOcrStatus("");setOcrText("");setPreview("");setAttachment(null);setMode("edit")}
 function save(){if(!form.provider&&!form.amount&&!form.paymentCode)return;if(selectedId){onUpdate({accounts:accounts.map(a=>a.id===selectedId?{...a,...form,attachment,amount:Number(form.amount)||0}:a)});setMode("view")}else{const n={id:Date.now(),...form,attachment,amount:Number(form.amount)||0};onUpdate({accounts:[n,...accounts]});setSelectedId(n.id);setForm({...empty,...n});setMode("view")}}
 function updateAccount(id,patch){onUpdate({accounts:accounts.map(a=>a.id===id?{...a,...patch}:a)});if(id===selectedId)setForm({...form,...patch})}
 function del(id){if(!confirmDelete("Να διαγραφεί οριστικά ο λογαριασμός;"))return;onUpdate({accounts:accounts.filter(a=>a.id!==id)});setMode("list")}
 async function upload(e){
 const file=e.target.files?.[0];
 if(!file)return;
 const dataUrl=await readFileAsDataUrl(file);
 const uploaded={name:file.name,type:file.type,size:file.size,dataUrl,uploadedAt:new Date().toISOString().slice(0,10)};
 setAttachment(uploaded);
 setPreview(dataUrl);
 setOcrText("");
 if(file.type==="application/pdf"){
   setReading(false);
   setOcrStatus("Το PDF ανέβηκε και θα αποθηκευτεί μαζί με τον λογαριασμό. Για OCR χρησιμοποίησε προς το παρόν φωτογραφία.");
   return;
 }
 setReading(true);
 setOcrStatus("Ανάγνωση φωτογραφίας...");
 try{
   const worker=await createWorker("ell+eng");
   const result=await worker.recognize(file);
   await worker.terminate();
   const text=result?.data?.text||"";
   setOcrText(text);
   setForm(p=>({...p,...parseGreekBillText(text,allFields)}));
   setOcrStatus("Ολοκληρώθηκε. Έλεγξε τα πεδία πριν αποθήκευση.");
 }catch(err){
   setOcrStatus("Δεν ολοκληρώθηκε η ανάγνωση.");
 }finally{
   setReading(false);
 }
}
 if(mode==="edit")return <section className="bill-detail-page"><div className="local-route"><button onClick={()=>setMode("list")}>Λογαριασμοί</button><span>/</span><strong>{selectedId?"Επεξεργασία λογαριασμού":"Νέος λογαριασμός"}</strong></div><div className="bill-detail-head"><div><button className="text-back-btn" onClick={()=>setMode("list")}>← Λογαριασμοί</button><h2>{selectedId?"Επεξεργασία λογαριασμού":"Νέος λογαριασμός"}</h2></div><button className="secondary-btn" onClick={()=>setMode("list")}>Άκυρο</button></div><div className="ocr-panel"><div><h3>Προσθήκη από φωτογραφία ή PDF</h3><p>Το OCR λειτουργεί σε φωτογραφίες. Τα PDF αποθηκεύονται ως συνημμένα στον λογαριασμό.</p></div><label className="upload-btn">📎 Ανέβασε φωτογραφία ή PDF<input type="file" accept="image/*,application/pdf" capture="environment" onChange={upload}/></label></div>{ocrStatus&&<div className={`ocr-status ${reading?"loading":""}`}>{ocrStatus}</div>}{attachment&&<div className="attachment-card"><div><strong>{attachment.name}</strong><p>{attachment.type==="application/pdf"?"PDF αρχείο":"Εικόνα"} · {formatGreekDate(attachment.uploadedAt)}</p></div><a href={attachment.dataUrl} target="_blank" rel="noreferrer">{attachment.type==="application/pdf"?"Άνοιγμα PDF":"Άνοιγμα αρχείου"}</a></div>}{preview&&attachment?.type!=="application/pdf"&&<img className="ocr-preview" src={preview}/>} {ocrText&&<details className="ocr-text"><summary>Προβολή OCR κειμένου</summary><pre>{ocrText}</pre></details>}<div className="bill-edit-card"><div className="account-form">{fields.map(f=>f.type==="textarea"?<TextArea key={f.key} label={f.label} value={form[f.key]||""} onChange={v=>setForm({...form,[f.key]:v})}/>:f.type==="select"?<Select key={f.key} label={f.label} value={form[f.key]||""} options={f.options||[]} onChange={v=>setForm({...form,[f.key]:v})}/>:<Field key={f.key} label={f.label} type={f.type} value={form[f.key]||""} onChange={v=>setForm({...form,[f.key]:v})}/>)}</div><button className="primary-btn" onClick={save}>Αποθήκευση λογαριασμού</button></div></section>
 if(mode==="view"&&selected)return <section className="bill-detail-page"><div className="local-route"><button onClick={()=>setMode("list")}>Λογαριασμοί</button><span>/</span><strong>{normalizeProviderName(selected.provider)}</strong></div><div className="bill-detail-head"><div><button className="text-back-btn" onClick={()=>setMode("list")}>← Λογαριασμοί</button><h2>{normalizeProviderName(selected.provider)} · {formatEuro(selected.amount)}</h2><p className="subtitle">{getBillKind(selected)} {selected.dueDate?`· Εξόφληση: ${formatGreekDate(selected.dueDate)}`:""}</p></div><div className="bill-detail-actions"><button className="secondary-btn" onClick={()=>setMode("edit")}>Επεξεργασία</button><button className="danger-btn" onClick={()=>del(selected.id)}>Διαγραφή λογαριασμού</button></div></div>{selected.attachment&&<div className="attachment-card bill-attachment"><div><strong>{selected.attachment.name}</strong><p>{selected.attachment.type==="application/pdf"?"PDF αρχείο":"Εικόνα"} · {formatGreekDate(selected.attachment.uploadedAt)}</p></div><a href={selected.attachment.dataUrl} target="_blank" rel="noreferrer">{selected.attachment.type==="application/pdf"?"Άνοιγμα PDF":"Άνοιγμα αρχείου"}</a></div>}<div className="bill-detail-card"><div className="account-details-grid bill-detail-grid">{fields.map(f=><div className="account-detail" key={f.key}><span>{f.label}</span><p>{f.key==="amount"?formatEuro(selected[f.key]):f.type==="date"?formatGreekDate(selected[f.key]):selected[f.key]||"—"}</p></div>)}</div></div></section>
 return <section className="bills-home"><div className="bills-main-card"><div className="bills-title-row"><h2>Λογαριασμοί</h2><button className="bill-plus-btn elegant" onClick={startNew}>+</button></div><div className="bill-calendar-card"><div className="bill-calendar-head"><div><h3>Ημερολόγιο λογαριασμών</h3><p>Λήξεις πληρωμής και αναμενόμενες εκδόσεις επόμενων λογαριασμών.</p></div><select value={calProvider} onChange={e=>setCalProvider(e.target.value)}>{["Όλοι",...providerNames].map(p=><option key={p}>{p}</option>)}</select></div><div className="calendar-alerts"><div className="calendar-alert overdue"><strong>{overdue.length}</strong><span>ληξιπρόθεσμα</span></div><div className="calendar-alert upcoming"><strong>{upcoming.length}</strong><span>προσεχή</span></div></div><div className="calendar-events">{events.length===0?<div className="empty-state">Δεν υπάρχουν ακόμη ημερομηνίες λογαριασμών.</div>:events.slice(0,12).map(e=><button className={`calendar-event ${e.type} ${e.days<0?"late":""}`} key={e.id} onClick={()=>openBill(e.accountId)}><span className="event-date">{formatGreekDate(e.date)}</span><span className="event-title">{e.title}</span><span className="event-subtitle">{e.subtitle}</span><span className="event-days">{e.days===0?"σήμερα":e.days>0?`σε ${e.days}ημ.`:`${Math.abs(e.days)}ημ. πριν`}</span></button>)}</div></div><div className="bill-accordion-list">{providerNames.map(p=>{const rows=grouped[p]||[],pt=rows.reduce((s,a)=>s+(Number(a.amount)||0),0);return <div className="bill-accordion" key={p}><button className="bill-accordion-head" onClick={()=>setOpen({...open,[p]:!open[p]})}><span>{open[p]?"⌄":"›"} {p}</span><strong>Σύνολο: {formatEuro(pt)}</strong></button>{open[p]&&<div className="bill-table-wrap"><table className="bill-table"><thead><tr><th>Κατηγορία Λογαριασμού</th><th>Ημερομηνία Έκδοσης</th><th>Περίοδος Κατανάλωσης Από-Έως</th><th>Είδος λογαριασμού</th><th>Ποσό</th><th>Υπόλοιπο</th><th></th></tr></thead><tbody>{rows.length===0&&<tr><td colSpan="7" className="empty-row">Δεν υπάρχουν λογαριασμοί.</td></tr>}{rows.map(a=><tr key={a.id} className="clickable-bill-row" onClick={()=>openBill(a.id)}><td>{normalizeProviderName(a.provider)}</td><td>{formatGreekDate(a.issueDate)}</td><td>{getBillPeriod(a)}</td><td>{getBillKind(a)}</td><td className="amount-cell">{formatEuro(a.amount)}</td><td className="paid-cell">{a.status==="Πληρώθηκε"?"✓":""}</td><td className="row-tools" onClick={ev=>ev.stopPropagation()}><select value={a.status||"Εκκρεμεί"} onChange={ev=>updateAccount(a.id,{status:ev.target.value})}><option>Εκκρεμεί</option><option>Πληρώθηκε</option></select><button onClick={()=>del(a.id)}>×</button></td></tr>)}<tr className="provider-total-row"><td colSpan="4"></td><td>Σύνολο: {formatEuro(pt)}</td><td></td><td></td></tr></tbody></table></div>}</div>})}</div></div><div className="bills-bottom-total rounded">Σύνολο: {formatEuro(total)}</div></section>
}



function PlansTab({project,settings,onUpdate}){
 const slots=settings.planSlots||defaultPlanSlots;
 const[slotId,setSlotId]=useState(String(slots[0]?.id||""));
 const[notes,setNotes]=useState("");
 async function uploadPlan(event){
  const file=event.target.files?.[0];
  if(!file)return;
  const dataUrl=await readFileAsDataUrl(file);
  const slot=slots.find(s=>String(s.id)===String(slotId));
  const plan={id:Date.now(),slotId:slot?.id||slotId,slotName:slot?.name||"Σχέδιο",name:file.name,type:file.type,size:file.size,dataUrl,uploadedAt:new Date().toISOString().slice(0,10),notes};
  onUpdate({plans:[plan,...(project.plans||[])]});
  setNotes("");
 }
 function deletePlan(id){
  if(!confirmDelete("Να διαγραφεί το αρχείο σχεδίου;"))return;
  onUpdate({plans:(project.plans||[]).filter(p=>p.id!==id)});
 }
 return <section className="detail-card">
  <h2><FileText size={22}/> Σχέδια</h2>
  <p className="subtitle">Ανέβασμα PDF σχεδίων ανά θέση που ορίζεται στη Διαχείριση.</p>
  <div className="upload-panel">
    <Select label="Θέση σχεδίου" value={slotId} options={slots.map(s=>String(s.id))} labels={Object.fromEntries(slots.map(s=>[String(s.id),s.name]))} onChange={setSlotId}/>
    <Field label="Παρατηρήσεις" value={notes} onChange={setNotes}/>
    <label className="upload-btn">📄 Ανέβασε PDF<input type="file" accept="application/pdf" onChange={uploadPlan}/></label>
  </div>
  <div className="plans-list">{(project.plans||[]).length===0?<div className="empty-state">Δεν υπάρχουν σχέδια.</div>:(project.plans||[]).map(plan=><div className="plan-card" key={plan.id}><div><strong>{plan.slotName}</strong><p>{plan.name} · {formatGreekDate(plan.uploadedAt)}</p><small>{plan.notes}</small></div><div className="plan-actions"><a href={plan.dataUrl} target="_blank" rel="noreferrer">Άνοιγμα</a><button className="icon-danger" onClick={()=>deletePlan(plan.id)}><Trash2 size={16}/></button></div></div>)}</div>
 </section>
}

function OrderSlipsTab({project,onUpdate}){
 const[form,setForm]=useState({work:"",supplier:"",date:new Date().toISOString().slice(0,10),amount:"",notes:""});
 async function addSlip(event){
  const file=event.target.files?.[0];
  let dataUrl="",fileName="";
  if(file){dataUrl=await readFileAsDataUrl(file);fileName=file.name}
  if(!form.work&&!file)return;
  const slip={id:Date.now(),...form,amount:Number(form.amount)||0,fileName,dataUrl};
  onUpdate({orderSlips:[slip,...(project.orderSlips||[])]});
  setForm({work:"",supplier:"",date:new Date().toISOString().slice(0,10),amount:"",notes:""});
 }
 function deleteSlip(id){
  if(!confirmDelete("Να διαγραφεί το δελτίο παραγγελίας;"))return;
  onUpdate({orderSlips:(project.orderSlips||[]).filter(s=>s.id!==id)});
 }
 return <section className="detail-card">
  <h2><ClipboardList size={22}/> Δελτία παραγγελίας</h2>
  <div className="order-form two-col"><Field label="Εργασία" value={form.work} onChange={v=>setForm({...form,work:v})}/><Field label="Προμηθευτής" value={form.supplier} onChange={v=>setForm({...form,supplier:v})}/><Field label="Ημερομηνία" type="date" value={form.date} onChange={v=>setForm({...form,date:v})}/><Field label="Ποσό" type="number" value={form.amount} onChange={v=>setForm({...form,amount:v})}/></div>
  <TextArea label="Σημειώσεις" value={form.notes} onChange={v=>setForm({...form,notes:v})}/>
  <label className="upload-btn">📄 Αποθήκευση / Ανέβασμα δελτίου<input type="file" accept="application/pdf,image/*" onChange={addSlip}/></label>
  <div className="plans-list">{(project.orderSlips||[]).length===0?<div className="empty-state">Δεν υπάρχουν δελτία παραγγελίας.</div>:(project.orderSlips||[]).map(slip=><div className="plan-card" key={slip.id}><div><strong>{slip.work||"Δελτίο παραγγελίας"}</strong><p>{slip.supplier||"Χωρίς προμηθευτή"} · {formatGreekDate(slip.date)} · {formatEuro(slip.amount)}</p><small>{slip.notes}</small></div><div className="plan-actions">{slip.dataUrl&&<a href={slip.dataUrl} target="_blank" rel="noreferrer">Άνοιγμα</a>}<button className="icon-danger" onClick={()=>deleteSlip(slip.id)}><Trash2 size={16}/></button></div></div>)}</div>
 </section>
}

function ToolsPage({settings,setSettings,projects,onBack,onOpenProject}){
 const tools=settings.companyTools||defaultCompanyTools;
 const[form,setForm]=useState({name:"",code:"",category:"",notes:""});
 const[move,setMove]=useState({toolId:String(tools[0]?.id||""),projectId:String(projects[0]?.id||"")});
 function saveTools(next){setSettings({...settings,companyTools:next})}
 function addTool(){
  if(!form.name.trim())return;
  saveTools([{id:Date.now(),...form,status:"Αποθήκη",projectId:"",projectName:""},...tools]);
  setForm({name:"",code:"",category:"",notes:""});
 }
 function moveTool(){
  const project=projects.find(p=>String(p.id)===String(move.projectId));
  saveTools(tools.map(t=>String(t.id)===String(move.toolId)?{...t,status:"Σε έργο",projectId:project?.id||"",projectName:project?.name||""}:t));
 }
 function returnTool(id){
  saveTools(tools.map(t=>t.id===id?{...t,status:"Αποθήκη",projectId:"",projectName:""}:t));
 }
 function deleteTool(id){
  if(!confirmDelete("Να διαγραφεί το εργαλείο;"))return;
  saveTools(tools.filter(t=>t.id!==id));
 }
 return <div className="app-shell">
  <StickyBreadcrumb items={[{label:"TREF",onClick:onBack},{label:"Εργαλεία"}]} menuButton/>
  <header className="topbar"><div><p className="eyebrow">Εταιρικά εργαλεία</p><h1>Εργαλεία</h1><p className="subtitle">Παρακολούθηση θέσης κάθε εργαλείου.</p></div><button className="secondary-btn" onClick={onBack}><ArrowLeft size={18}/> Πίσω</button></header>
  <section className="tools-grid">
   <div className="warehouse-card"><h2>Νέο εργαλείο</h2><Field label="Ονομασία" value={form.name} onChange={v=>setForm({...form,name:v})}/><Field label="Κωδικός" value={form.code} onChange={v=>setForm({...form,code:v})}/><Field label="Κατηγορία" value={form.category} onChange={v=>setForm({...form,category:v})}/><TextArea label="Σημειώσεις" value={form.notes} onChange={v=>setForm({...form,notes:v})}/><button className="primary-btn" onClick={addTool}>Προσθήκη εργαλείου</button></div>
   <div className="warehouse-card"><h2>Μετακίνηση σε έργο</h2><Select label="Εργαλείο" value={move.toolId} options={tools.map(t=>String(t.id))} labels={Object.fromEntries(tools.map(t=>[String(t.id),`${t.name} (${t.status})`]))} onChange={v=>setMove({...move,toolId:v})}/><Select label="Έργο" value={move.projectId} options={projects.map(p=>String(p.id))} labels={Object.fromEntries(projects.map(p=>[String(p.id),p.name]))} onChange={v=>setMove({...move,projectId:v})}/><button className="primary-btn" onClick={moveTool}>Αποστολή εργαλείου</button></div>
  </section>
  <section className="warehouse-card"><h2>Λίστα εργαλείων</h2><div className="tools-list">{tools.map(tool=><div className={`tool-card ${tool.status==="Σε έργο"?"away":""}`} key={tool.id}><div><strong>{tool.name}</strong><p>{tool.code||"χωρίς κωδικό"} · {tool.category||"χωρίς κατηγορία"}</p><small>{tool.status==="Σε έργο"?`Βρίσκεται στο έργο: ${tool.projectName}`:"Βρίσκεται στην αποθήκη"}</small></div><div className="tool-actions">{tool.projectId&&<button className="secondary-btn" onClick={()=>onOpenProject(tool.projectId)}>Έργο</button>}{tool.status==="Σε έργο"&&<button className="secondary-btn" onClick={()=>returnTool(tool.id)}>Επιστροφή</button>}<button className="icon-danger" onClick={()=>deleteTool(tool.id)}><Trash2 size={16}/></button></div></div>)}</div></section>
 </div>
}

function ProjectWarehouseMaterialsTab({project}){
  const deliveries = project.warehouseMaterials || [];
  const summary = getProjectWarehouseSummary(project);
  const comparison = getSwitchMaterialComparison(project);
  const missing = comparison.filter(item => item.missingQty > 0);
  const complete = comparison.filter(item => item.status === "complete").length;
  return <section className="detail-card project-warehouse-tab">
    <h2><Package size={22}/> Υλικά από αποθήκη</h2>
    <p className="subtitle">Αναλυτικά ανά δελτίο αποστολής και σύγκριση με το Διακοπτικό Υλικό του έργου.</p>

    <div className="project-warehouse-stats">
      <div><p>Δελτία</p><strong>{deliveries.length}</strong></div>
      <div><p>Είδη που στάλθηκαν</p><strong>{summary.length}</strong></div>
      <div><p>Καλυμμένα διακοπτικά</p><strong>{complete}</strong></div>
      <div><p>Ελλείψεις</p><strong>{missing.length}</strong></div>
    </div>

    <section className="warehouse-subsection">
      <h3>Σύνοψη υλικών στο έργο</h3>
      {summary.length===0 ? <div className="empty-state">Δεν έχουν σταλεί υλικά από αποθήκη σε αυτό το έργο.</div> :
        <div className="warehouse-summary-list">
          {summary.map(item=><div className="warehouse-summary-row" key={item.code || item.name}>
            <div><strong>{item.name}</strong><p>{item.code || "χωρίς κωδικό"}</p></div>
            <span>{item.qty} {item.unit}</span>
          </div>)}
        </div>
      }
    </section>

    <section className="warehouse-subsection">
      <h3>Σύγκριση με Διακοπτικό Υλικό</h3>
      {comparison.length===0 ? <div className="empty-state">Δεν υπάρχει λίστα διακοπτικού υλικού για σύγκριση.</div> :
        <div className="switch-comparison-list">
          {comparison.map(item=><div className={`switch-comparison-row ${item.status}`} key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p>{item.code || "χωρίς κωδικό"} · απαιτούνται {item.qty}</p>
            </div>
            <div className="comparison-numbers">
              <span>Στάλθηκαν: {item.sentQty}</span>
              <span>Λείπουν: {item.missingQty}</span>
            </div>
          </div>)}
        </div>
      }
    </section>

    <section className="warehouse-subsection">
      <h3>Αναλυτικά δελτία αποστολής</h3>
      {deliveries.length===0 ? <div className="empty-state">Δεν υπάρχουν δελτία αποστολής για αυτό το έργο.</div> :
        <div className="delivery-list">
          {deliveries.map(note=><div className="delivery-note" key={note.id}>
            <strong>{note.number} · {formatGreekDate(note.date)}</strong>
            <span>{note.itemName}</span>
            <p>{note.qty} {note.unit} {note.code ? `· ${note.code}` : ""}</p>
          </div>)}
        </div>
      }
    </section>
  </section>
}

function SwitchMaterialsTab({project,settings,onUpdate}){const materials=project.switchMaterials||[],[filter,setFilter]=useState("Όλα");const cats=["Όλα",...(settings.switchMaterialCategories||switchCats)];const visible=filter==="Όλα"?materials:materials.filter(m=>m.category===filter);const r=materials.length?Math.round(materials.filter(m=>m.received).length/materials.length*100):0,i=materials.length?Math.round(materials.filter(m=>m.installed).length/materials.length*100):0;function upd(id,patch){onUpdate({switchMaterials:materials.map(m=>m.id===id?{...m,...patch}:m)})}return <section className="detail-card"><h2><Plug size={22}/> Διακοπτικό Υλικό Έργου</h2><p className="subtitle">Σειρά υλικού: Legrand Valena Life</p><div className="progress-grid"><Progress label="% παραλαβής" value={r}/><Progress label="% τοποθέτησης" value={i}/><div className="progress-card"><p>Εκκρεμή</p><strong>{materials.filter(m=>!m.received||!m.installed).length}</strong></div></div><div className="category-chips">{cats.map(c=><button key={c} className={filter===c?"active":""} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="materials-list">{visible.map(m=><div className="material-card" key={m.id}><div className="material-top"><div><span className="material-category">{m.category}</span><h3>{m.name}</h3><p>{m.code?`Κωδικός: ${m.code}`:"Χωρίς κωδικό"} · Ποσότητα: {m.qty}</p></div></div><div className="check-row"><label className={m.received?"checked":""}><input type="checkbox" checked={m.received} onChange={e=>upd(m.id,{received:e.target.checked})}/> Παραλαβή</label><label className={m.installed?"checked":""}><input type="checkbox" checked={m.installed} onChange={e=>upd(m.id,{installed:e.target.checked})}/> Τοποθέτηση</label></div><div className="material-edit-grid"><Field label="Χώρος / δωμάτιο" value={m.room||""} onChange={v=>upd(m.id,{room:v})}/><Field label="Παρατηρήσεις" value={m.notes||""} onChange={v=>upd(m.id,{notes:v})}/></div></div>)}</div></section>}
function Progress({label,value}){return <div className="progress-card"><p>{label}</p><strong>{value}%</strong><div className="progress-track"><div style={{width:`${value}%`}}/></div></div>}
function StagesTab({stages}){return <section className="detail-card"><h2>Στάδια εργασιών</h2><div className="ordered-stages">{stages.map((s,i)=><div className="ordered-stage" key={s}><span>{i+1}</span><p>{s}</p></div>)}</div></section>}
function SettingsPage({settings,setSettings,route,onRoute,onBack}){const sections=[["accountFields","Πεδία λογαριασμών"],["planSlots","Θέσεις σχεδίων"],["switchMaterialCategories","Κατηγορίες διακοπτικού υλικού"],["crews","Συνεργεία"],["stages","Στάδια εργασιών"],["statuses","Καταστάσεις έργου"]].sort((a,b)=>a[1].localeCompare(b[1],"el"));if(route!=="index")return <div className="app-shell"><StickyBreadcrumb items={[{label:"TREF",onClick:onBack},{label:"Διαχείριση",onClick:()=>onRoute("index")},{label:sections.find(s=>s[0]===route)?.[1]||""}]} menuButton/><header className="topbar"><div><p className="eyebrow">Διαχείριση</p><h1>{sections.find(s=>s[0]===route)?.[1]}</h1></div><button className="secondary-btn" onClick={()=>onRoute("index")}><ArrowLeft size={18}/> Πίσω</button></header>{route==="accountFields"?<AccountFieldsSettings settings={settings} setSettings={setSettings}/>:<ManageList items={settings[route]||[]} onChange={items=>setSettings({...settings,[route]:items})}/>}<VersionBadge/></div>;return <div className="app-shell"><StickyBreadcrumb items={[{label:"TREF",onClick:onBack},{label:"Διαχείριση"}]} menuButton/><header className="topbar"><div><p className="eyebrow">Ρυθμίσεις</p><h1>Διαχείριση</h1></div><button className="secondary-btn" onClick={onBack}><Home size={18}/> Πίσω</button></header><div className="settings-list">{sections.map(s=><button className="settings-row" key={s[0]} onClick={()=>onRoute(s[0])}><span>{s[1]}</span><small>Άνοιγμα</small></button>)}</div><VersionBadge/></div>}
function AccountFieldsSettings({settings,setSettings}){const fields=mergeAccountFields(settings.accountFields);function upd(key,patch){setSettings({...settings,accountFields:fields.map(f=>f.key===key?{...f,...patch}:f)})}return <section className="detail-card"><h2>Πεδία λογαριασμών</h2><p className="subtitle">Σύνδεσε κάθε πεδίο με τις λέξεις που εμφανίζονται στον λογαριασμό ώστε το OCR να κάνει σωστό mapping.</p><div className="ocr-fields-list">{fields.map(f=><div className={`ocr-field-card ${f.enabled!==false?"enabled":""}`} key={f.key}><div className="ocr-field-head"><div><strong>{f.label}</strong><small>{f.type}</small></div><button onClick={()=>upd(f.key,{enabled:!(f.enabled!==false)})}>{f.enabled!==false?"Ενεργό":"Ανενεργό"}</button></div><label className="field"><span>Λέξεις / φράσεις OCR</span><textarea value={(f.ocrAliases||[]).join(", ")} onChange={e=>upd(f.key,{ocrAliases:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/></label></div>)}</div></section>}
function ManageList({items,onChange}){const[v,setV]=useState(""),[bulk,setBulk]=useState("");return <section className="detail-card"><div className="inline-add"><input value={v} onChange={e=>setV(e.target.value)} placeholder="Νέα τιμή..."/><button className="primary-btn compact" onClick={()=>{if(v.trim())onChange([...items,v.trim()]);setV("")}}>Προσθήκη</button></div><div className="bulk-box"><textarea value={bulk} onChange={e=>setBulk(e.target.value)} placeholder="Μαζική προσθήκη: μία γραμμή = μία τιμή"/><button className="secondary-btn" onClick={()=>{onChange([...items,...bulk.split("\n").map(x=>x.trim()).filter(Boolean)]);setBulk("")}}>Μαζική προσθήκη</button></div><div className="list-box">{items.map((it,i)=><div className="list-row" key={i}><span>{it}</span><button onClick={()=>{if(confirmDelete("Να διαγραφεί η τιμή;"))onChange(items.filter((_,x)=>x!==i))}}><Trash2 size={16}/></button></div>)}</div></section>}
function Placeholder({title,text}){return <section className="detail-card placeholder"><Wrench size={42}/><h2>{title}</h2><p>{text}</p></section>}
function VersionBadge(){return <div className="version-badge">{versionInfo.version} · commit {versionInfo.commit} · {versionInfo.branch}</div>}
function Field({label,value,onChange,type="text"}){return <label className="field"><span>{label}</span><input type={type} value={value??""} onChange={e=>onChange(e.target.value)}/></label>}
function Select({label,value,options=[],labels={},onChange}){return <label className="field"><span>{label}</span><select value={value||""} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{labels[o]||o||"—"}</option>)}</select></label>}
function TextArea({label,value,onChange,tall=false}){return <label className="field"><span>{label}</span><textarea className={tall?"tall":""} value={value||""} onChange={e=>onChange(e.target.value)}/></label>}
createRoot(document.getElementById("root")).render(<App/>);
