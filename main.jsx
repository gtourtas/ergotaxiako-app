import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Plus, Search, MapPin, CalendarDays, ClipboardList, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import "./style.css";

const initialProjects = [
  { id: 1, name: "Λύτρα 5", address: "Θεσσαλονίκη", stage: "Ηλεκτρολογικά", deliveryDate: "2026-05-20", status: "Σε εξέλιξη", notes: "Ανακαίνιση διαμερίσματος. Εκκρεμεί τελικός έλεγχος παροχών." },
  { id: 2, name: "Μπάνιο - Βούλγαρη", address: "Περιοχή Βούλγαρη", stage: "Πλακίδια", deliveryDate: "2026-05-10", status: "Επείγον", notes: "Να επιβεβαιωθεί διαθεσιμότητα υλικών και πρόγραμμα πλακά." },
  { id: 3, name: "Κουζίνα - Τεχνικές προδιαγραφές", address: "Θεσσαλονίκη", stage: "Σχεδιασμός", deliveryDate: "2026-06-01", status: "Αναμονή", notes: "Χρειάζεται τελική λίστα παροχών και επαγγελματιών." }
];

const statusIcons = { "Σε εξέλιξη": Clock, "Επείγον": AlertTriangle, "Αναμονή": ClipboardList, "Ολοκληρωμένο": CheckCircle2 };

function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(initialProjects[0]);
  const [form, setForm] = useState({ name: "", address: "", stage: "", deliveryDate: "", status: "Σε εξέλιξη", notes: "" });

  const filteredProjects = useMemo(() => projects.filter((p) => `${p.name} ${p.address} ${p.stage} ${p.status}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  const stats = useMemo(() => ({ total: projects.length, active: projects.filter((p) => p.status === "Σε εξέλιξη").length, urgent: projects.filter((p) => p.status === "Επείγον").length, waiting: projects.filter((p) => p.status === "Αναμονή").length }), [projects]);

  function addProject() {
    if (!form.name.trim()) return;
    const newProject = { ...form, id: Date.now(), deliveryDate: form.deliveryDate || "Δεν ορίστηκε" };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setForm({ name: "", address: "", stage: "", deliveryDate: "", status: "Σε εξέλιξη", notes: "" });
  }

  return <div className="page"><div className="container">
    <header><div><p className="eyebrow">Εργοταξιακό App v1</p><h1>Έργα</h1><p className="sub">Απλή πρώτη έκδοση για καταχώρηση, αναζήτηση και παρακολούθηση έργων.</p></div><div className="total"><span>Σύνολο έργων</span><b>{stats.total}</b></div></header>
    <section className="stats"><Stat label="Σε εξέλιξη" value={stats.active}/><Stat label="Επείγοντα" value={stats.urgent}/><Stat label="Σε αναμονή" value={stats.waiting}/><Stat label="Όλα τα έργα" value={stats.total}/></section>
    <main><section className="left"><div className="search"><Search size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Αναζήτηση έργου, διεύθυνσης, σταδίου..."/></div><div className="grid">{filteredProjects.map((p)=><ProjectCard key={p.id} project={p} selected={selectedProject?.id===p.id} onClick={()=>setSelectedProject(p)}/>)}</div></section>
    <aside><div className="card form"><h2><Plus size={20}/> Νέο έργο</h2><Input label="Όνομα έργου" value={form.name} onChange={(v)=>setForm({...form,name:v})} placeholder="π.χ. Διαμέρισμα Παπάφη"/><Input label="Διεύθυνση" value={form.address} onChange={(v)=>setForm({...form,address:v})} placeholder="π.χ. Βούλγαρη"/><Input label="Στάδιο" value={form.stage} onChange={(v)=>setForm({...form,stage:v})} placeholder="π.χ. Υδραυλικά"/><Input label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={(v)=>setForm({...form,deliveryDate:v})}/><label><span>Κατάσταση</span><select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option>Σε εξέλιξη</option><option>Επείγον</option><option>Αναμονή</option><option>Ολοκληρωμένο</option></select></label><label><span>Σημειώσεις</span><textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Σύντομες παρατηρήσεις για το έργο..."/></label><button onClick={addProject}>Προσθήκη έργου</button></div>
    {selectedProject && <div className="card detail"><p>Επιλεγμένο έργο</p><h2>{selectedProject.name}</h2><Info icon={MapPin} text={selectedProject.address || "Δεν έχει δοθεί διεύθυνση"}/><Info icon={ClipboardList} text={`Στάδιο: ${selectedProject.stage || "Δεν έχει οριστεί"}`}/><Info icon={CalendarDays} text={`Παράδοση: ${selectedProject.deliveryDate}`}/><Badge status={selectedProject.status}/><p className="notes">{selectedProject.notes || "Δεν υπάρχουν σημειώσεις."}</p></div>}
    </aside></main></div></div>;
}
function Stat({label,value}){return <div className="card stat"><span>{label}</span><b>{value}</b></div>}
function ProjectCard({project,selected,onClick}){const Icon=statusIcons[project.status]||ClipboardList;return <button className={`project ${selected?'selected':''}`} onClick={onClick}><div><h3>{project.name}</h3><p>{project.stage}</p></div><Icon size={18}/><Info icon={MapPin} text={project.address || "Χωρίς διεύθυνση"}/><Info icon={CalendarDays} text={`Παράδοση: ${project.deliveryDate}`}/><Badge status={project.status}/></button>}
function Input({label,value,onChange,placeholder,type="text"}){return <label><span>{label}</span><input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function Info({icon:Icon,text}){return <div className="info"><Icon size={16}/><span>{text}</span></div>}
function Badge({status}){return <span className={`badge ${status.replaceAll(' ','-')}`}>{status}</span>}

createRoot(document.getElementById("root")).render(<App />);
