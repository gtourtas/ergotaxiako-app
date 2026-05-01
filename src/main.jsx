import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Plus, Search, MapPin, CalendarDays, ClipboardList, CheckCircle2, Clock, AlertTriangle, Settings, Trash2, Users, Wrench } from "lucide-react";
import "./style.css";

const initialProjects = [
  { id: 1, name: "Λύτρα 5", address: "Θεσσαλονίκη", stage: "Ηλεκτρολογικά", crew: "Ηλεκτρολόγος", deliveryDate: "2026-05-20", status: "Σε εξέλιξη", notes: "Ανακαίνιση διαμερίσματος. Εκκρεμεί τελικός έλεγχος παροχών.", technicalSpecs: "Πίνακας, παροχές κουζίνας, πρίζες, φωτισμός, αναμονές A/C." },
  { id: 2, name: "Μπάνιο - Βούλγαρη", address: "Περιοχή Βούλγαρη", stage: "Πλακίδια", crew: "Πλακάς", deliveryDate: "2026-05-10", status: "Επείγον", notes: "Να επιβεβαιωθεί διαθεσιμότητα υλικών και πρόγραμμα πλακά.", technicalSpecs: "Διαστάσεις πλακιδίων, τύπος αρμόστοκου, κλίσεις ντουζιέρας, θέση μπαταρίας." },
  { id: 3, name: "Κουζίνα - Τεχνικές προδιαγραφές", address: "Θεσσαλονίκη", stage: "Σχεδιασμός", crew: "Μελέτη", deliveryDate: "2026-06-01", status: "Αναμονή", notes: "Χρειάζεται τελική λίστα παροχών και επαγγελματιών.", technicalSpecs: "Παροχές ηλεκτρικών συσκευών, ύψη πριζών, φωτισμός πάγκου, αναμονές νερού." }
];

const defaultSettings = {
  statuses: ["Σε εξέλιξη", "Επείγον", "Αναμονή", "Ολοκληρωμένο"],
  stages: ["Σχεδιασμός", "Ηλεκτρολογικά", "Υδραυλικά", "Γκρεμίσματα", "Σοβάδες", "Πλακίδια", "Βαψίματα", "Παράδοση"],
  crews: ["Ηλεκτρολόγος", "Υδραυλικός", "Πλακάς", "Μπογιατζής", "Γυψοσανιδάς", "Μελέτη"]
};

const PROJECTS_KEY_V4 = "ergotaxiako-projects-v4";
const PROJECTS_KEY_V3 = "ergotaxiako-projects-v3";
const PROJECTS_KEY_V2 = "ergotaxiako-projects-v2";
const SETTINGS_KEY = "ergotaxiako-settings-v3";

function loadJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) || fallback;
  } catch {
    return fallback;
  }
}

function normalizeProject(project) {
  return { crew: "", technicalSpecs: "", ...project };
}

function loadProjects() {
  const v4 = loadJSON(PROJECTS_KEY_V4, null);
  if (Array.isArray(v4) && v4.length) return v4.map(normalizeProject);
  const v3 = loadJSON(PROJECTS_KEY_V3, null);
  if (Array.isArray(v3) && v3.length) return v3.map(normalizeProject);
  const v2 = loadJSON(PROJECTS_KEY_V2, null);
  if (Array.isArray(v2) && v2.length) return v2.map(normalizeProject);
  return initialProjects.map(normalizeProject);
}

function loadSettings() {
  const saved = loadJSON(SETTINGS_KEY, null);
  if (!saved) return defaultSettings;
  return {
    statuses: Array.isArray(saved.statuses) && saved.statuses.length ? saved.statuses : defaultSettings.statuses,
    stages: Array.isArray(saved.stages) && saved.stages.length ? saved.stages : defaultSettings.stages,
    crews: Array.isArray(saved.crews) && saved.crews.length ? saved.crews : defaultSettings.crews
  };
}

function App() {
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState(loadProjects);
  const [settings, setSettings] = useState(loadSettings);
  const [query, setQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState(() => ({
    name: "", address: "", stage: loadSettings().stages[0] || "", crew: loadSettings().crews[0] || "",
    deliveryDate: "", status: loadSettings().statuses[0] || "Σε εξέλιξη", notes: "", technicalSpecs: ""
  }));

  useEffect(() => localStorage.setItem(PROJECTS_KEY_V4, JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)), [settings]);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) return setSelectedProject(projects[0]);
    if (selectedProject) {
      const latest = projects.find((p) => p.id === selectedProject.id);
      if (latest) setSelectedProject(latest);
    }
  }, [projects, selectedProject]);

  const filteredProjects = useMemo(() => projects.filter((p) => `${p.name} ${p.address} ${p.stage} ${p.crew} ${p.status} ${p.technicalSpecs}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  const stats = useMemo(() => ({ total: projects.length, active: projects.filter((p) => p.status === "Σε εξέλιξη").length, urgent: projects.filter((p) => p.status === "Επείγον").length, waiting: projects.filter((p) => p.status === "Αναμονή").length }), [projects]);

  function addProject() {
    if (!form.name.trim()) return;
    const newProject = { ...form, id: Date.now(), deliveryDate: form.deliveryDate || "Δεν ορίστηκε" };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setForm({ name: "", address: "", stage: settings.stages[0] || "", crew: settings.crews[0] || "", deliveryDate: "", status: settings.statuses[0] || "Σε εξέλιξη", notes: "", technicalSpecs: "" });
  }

  function deleteProject(id) {
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    if (selectedProject?.id === id) setSelectedProject(next[0] || null);
  }

  return <div className="page"><div className="container">
    <header><div><p className="eyebrow">Εργοταξιακό App v4</p><h1>Έργα & Τεχνικές Προδιαγραφές</h1><p className="sub">Κάθε έργο έχει πλέον μόνιμο πεδίο τεχνικών προδιαγραφών που μπορείς να ενημερώνεις ανά πάσα στιγμή.</p></div><div className="total"><span>Σύνολο έργων</span><b>{stats.total}</b></div></header>
    <nav className="tabs"><button className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}><ClipboardList size={18}/> Έργα</button><button className={activeTab === "admin" ? "active" : ""} onClick={() => setActiveTab("admin")}><Settings size={18}/> Διαχείριση</button></nav>
    {activeTab === "projects" ? <ProjectsView projects={projects} filteredProjects={filteredProjects} query={query} setQuery={setQuery} selectedProject={selectedProject} setSelectedProject={setSelectedProject} form={form} setForm={setForm} addProject={addProject} deleteProject={deleteProject} setProjects={setProjects} settings={settings} stats={stats}/> : <AdminView settings={settings} setSettings={setSettings}/>} 
  </div></div>;
}

function ProjectsView({filteredProjects, query, setQuery, selectedProject, setSelectedProject, form, setForm, addProject, deleteProject, setProjects, settings, stats}) {
  return <>
    <section className="stats"><Stat label="Σε εξέλιξη" value={stats.active}/><Stat label="Επείγοντα" value={stats.urgent}/><Stat label="Σε αναμονή" value={stats.waiting}/><Stat label="Όλα τα έργα" value={stats.total}/></section>
    <main><section className="left"><div className="search"><Search size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Αναζήτηση έργου, διεύθυνσης, σταδίου, συνεργείου ή προδιαγραφών..."/></div><div className="grid">{filteredProjects.map((p)=><ProjectCard key={p.id} project={p} selected={selectedProject?.id===p.id} onClick={()=>setSelectedProject(p)} onDelete={()=>deleteProject(p.id)}/>)}</div></section>
    <aside><div className="card form"><h2><Plus size={20}/> Νέο έργο</h2>
      <Input label="Όνομα έργου" value={form.name} onChange={(v)=>setForm({...form,name:v})} placeholder="π.χ. Διαμέρισμα Παπάφη"/>
      <Input label="Διεύθυνση" value={form.address} onChange={(v)=>setForm({...form,address:v})} placeholder="π.χ. Βούλγαρη"/>
      <Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={(v)=>setForm({...form,stage:v})}/>
      <Select label="Συνεργείο" value={form.crew} options={settings.crews} onChange={(v)=>setForm({...form,crew:v})}/>
      <Input label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={(v)=>setForm({...form,deliveryDate:v})}/>
      <Select label="Κατάσταση" value={form.status} options={settings.statuses} onChange={(v)=>setForm({...form,status:v})}/>
      <label><span>Σημειώσεις</span><textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Σύντομες παρατηρήσεις για το έργο..."/></label>
      <label><span>Τεχνικές προδιαγραφές</span><textarea value={form.technicalSpecs} onChange={(e)=>setForm({...form,technicalSpecs:e.target.value})} placeholder="Μόνιμες πληροφορίες που πρέπει να θυμάσαι για όλη τη διάρκεια του έργου..."/></label>
      <button className="primary" onClick={addProject}>Προσθήκη έργου</button><p className="save-note">✓ Αποθηκεύεται αυτόματα στη συσκευή</p></div>
    {selectedProject && <div className="card detail"><p>Επιλεγμένο έργο</p><h2>{selectedProject.name}</h2><Info icon={MapPin} text={selectedProject.address || "Δεν έχει δοθεί διεύθυνση"}/><Info icon={ClipboardList} text={`Στάδιο: ${selectedProject.stage || "Δεν έχει οριστεί"}`}/><Info icon={Users} text={`Συνεργείο: ${selectedProject.crew || "Δεν έχει οριστεί"}`}/><Info icon={CalendarDays} text={`Παράδοση: ${selectedProject.deliveryDate}`}/><Badge status={selectedProject.status}/><p className="notes">{selectedProject.notes || "Δεν υπάρχουν σημειώσεις."}</p><TechnicalSpecsEditor project={selectedProject} setProjects={setProjects}/></div>}
    </aside></main></>;
}

function TechnicalSpecsEditor({ project, setProjects }) {
  function updateSpecs(value) {
    setProjects((current) => current.map((p) => p.id === project.id ? { ...p, technicalSpecs: value } : p));
  }
  return <div className="technical-box"><label><span>Τεχνικές προδιαγραφές</span><textarea value={project.technicalSpecs || ""} onChange={(e)=>updateSpecs(e.target.value)} placeholder="Γράψε εδώ μόνιμες τεχνικές πληροφορίες: παροχές, ύψη, υλικά, ιδιαιτερότητες, αποφάσεις πελάτη, σημεία προσοχής..."/></label><p className="save-note">✓ Αποθηκεύεται αυτόματα και μένει μαζί με το έργο</p></div>;
}

function AdminView({settings, setSettings}) {
  return <section className="admin-grid">
    <AdminList title="Καταστάσεις έργου" icon={AlertTriangle} description="Ό,τι εμφανίζεται στο πεδίο Κατάσταση." items={settings.statuses} onAdd={(item)=>setSettings({...settings, statuses:[...settings.statuses, item]})} onDelete={(item)=>setSettings({...settings, statuses:settings.statuses.filter((x)=>x!==item)})}/>
    <AdminList title="Στάδια εργασιών" icon={Wrench} description="Τα στάδια που επιλέγεις σε κάθε έργο." items={settings.stages} onAdd={(item)=>setSettings({...settings, stages:[...settings.stages, item]})} onDelete={(item)=>setSettings({...settings, stages:settings.stages.filter((x)=>x!==item)})}/>
    <AdminList title="Συνεργεία" icon={Users} description="Οι ομάδες ή επαγγελματίες που δουλεύουν στα έργα." items={settings.crews} onAdd={(item)=>setSettings({...settings, crews:[...settings.crews, item]})} onDelete={(item)=>setSettings({...settings, crews:settings.crews.filter((x)=>x!==item)})}/>
  </section>;
}

function AdminList({title, icon:Icon, description, items, onAdd, onDelete}) { const [value, setValue] = useState(""); function submit(){const cleaned=value.trim(); if(!cleaned||items.includes(cleaned))return; onAdd(cleaned); setValue("");} return <div className="card admin-card"><h2><Icon size={20}/> {title}</h2><p className="sub small">{description}</p><div className="inline-form"><input value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')submit()}} placeholder="Προσθήκη νέου στοιχείου"/><button className="primary compact" onClick={submit}>Προσθήκη</button></div><div className="chips">{items.map((item)=><span className="chip" key={item}>{item}<button onClick={()=>onDelete(item)} title="Διαγραφή"><Trash2 size={14}/></button></span>)}</div></div>; }
function Stat({label,value}){return <div className="card stat"><span>{label}</span><b>{value}</b></div>}
function ProjectCard({project,selected,onClick,onDelete}){const Icon=statusIcon(project.status);return <div className={`project ${selected?'selected':''}`} onClick={onClick}><div className="project-top"><div><h3>{project.name}</h3><p>{project.stage}</p></div><Icon size={18}/></div><Info icon={MapPin} text={project.address || "Χωρίς διεύθυνση"}/><Info icon={Users} text={project.crew || "Χωρίς συνεργείο"}/><Info icon={CalendarDays} text={`Παράδοση: ${project.deliveryDate}`}/><div className="card-actions"><Badge status={project.status}/><button className="icon-button" onClick={(e)=>{e.stopPropagation();onDelete();}} title="Διαγραφή έργου"><Trash2 size={16}/></button></div></div>}
function Input({label,value,onChange,placeholder,type="text"}){return <label><span>{label}</span><input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function Select({label,value,options,onChange}){return <label><span>{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)}>{options.map((o)=><option key={o}>{o}</option>)}</select></label>}
function Info({icon:Icon,text}){return <div className="info"><Icon size={16}/><span>{text}</span></div>}
function Badge({status}){return <span className={`badge ${safeClass(status)}`}>{status}</span>}
function safeClass(status){if(status==="Σε εξέλιξη")return "blue"; if(status==="Επείγον")return "red"; if(status==="Αναμονή")return "yellow"; if(status==="Ολοκληρωμένο")return "green"; return "gray";}
function statusIcon(status){if(status==="Σε εξέλιξη")return Clock; if(status==="Επείγον")return AlertTriangle; if(status==="Ολοκληρωμένο")return CheckCircle2; return ClipboardList;}
createRoot(document.getElementById("root")).render(<App />);
