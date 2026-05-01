
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, Banknote, Building2, CalendarDays, ClipboardList, FileText,
  GanttChartSquare, Home, Layers, Link2, MapPin, MoreVertical, Package,
  Plus, Search, Settings, Trash2, Wrench, ListChecks
} from "lucide-react";
import versionInfo from "./version.json";
import "./style.css";

const STORAGE_KEY = "ergotaxiako_app_v11";

const defaultStages = [
  "Αποξηλώσεις", "Αποξήλωση μαρμάρων", "Αποκομιδή μπάζων", "Προσωρινά κουφώματα",
  "Εργοταξιακή λεκάνη", "Θέση λέβητα αερίου", "Μπούρι απορροφητήρα", "Οπές κλιματιστικών",
  "Χτίσιμο", "Ξύσιμο τοιχοποιίας", "Επιχρίσματα α", "Κιγκλιδώματα", "Ηλεκτρολόγος",
  "Επιχρίσματα β", "Σπατουλάρισμα", "Γυψοσανίδες", "Καλωδίωση", "Υδραυλικός",
  "Απορροή κλιματιστικών", "Γκρο μπετά", "Επιχρίσματα γ", "Πλακάκια δαπέδου",
  "Πλακάκια μπάνιου", "Κατωκασιά", "Μαρμαροποδιές", "Γυψοσανίδες β", "Βάψιμο 1ο",
  "Καθαριότητα (α)", "Εξ. κουφώματα", "Κουζίνα", "Ντουλάπες", "Εσ. κουφώματα",
  "Είδη υγιεινής", "Καμπίνα ντουζιέρας", "Θερμαντικά σώματα", "Διακόπτες",
  "Φωτιστικά", "Τελικό βάψιμο", "Ηλεκτρικές συσκευές", "Κλιματιστικό", "Τέντα",
  "Επίπλωση", "Διακόσμηση", "Λέβητας αερίου", "Φυσικό αέριο", "Ολοκλήρωση έργου",
  "Παράδοση έργου"
];

const defaultAccountFields = [
  { key: "provider", label: "Πάροχος", type: "text", enabled: true },
  { key: "billType", label: "Είδος λογαριασμού", type: "text", enabled: true },
  { key: "amount", label: "Ποσό πληρωμής (€)", type: "number", enabled: true },
  { key: "dueDate", label: "Εξόφληση έως", type: "date", enabled: true },
  { key: "issueDate", label: "Ημερομηνία έκδοσης", type: "date", enabled: true },
  { key: "accountNumber", label: "Α/Α λογαριασμού", type: "text", enabled: true },
  { key: "supplyNumber", label: "Αριθμός παροχής", type: "text", enabled: true },
  { key: "paymentCode", label: "Κωδικός ηλεκτρονικής πληρωμής", type: "text", enabled: true },
  { key: "status", label: "Κατάσταση πληρωμής", type: "select", enabled: true, options: ["Εκκρεμεί", "Πληρώθηκε"] },
  { key: "notes", label: "Σημειώσεις", type: "textarea", enabled: true }
];

const defaultSettings = {
  statuses: ["Σε εξέλιξη", "Επείγον", "Αναμονή", "Ολοκληρωμένο"],
  stages: defaultStages,
  crews: ["Ηλεκτρολόγος", "Υδραυλικός", "Πλακάς", "Ελαιοχρωματιστής"],
  accountFields: defaultAccountFields
};

const defaultProjects = [{
  id: 1,
  name: "Λύτρα 5",
  address: "Θεσσαλονίκη",
  stage: "Ηλεκτρολογικά",
  deliveryDate: "2026-05-20",
  status: "Σε εξέλιξη",
  notes: "Ανακαίνιση διαμερίσματος.",
  specs: "Τεχνικές προδιαγραφές έργου.",
  accounts: [],
  schedule: []
}];

function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("ergotaxiako_app_v10") ||
      localStorage.getItem("ergotaxiako_app_v9") ||
      localStorage.getItem("ergotaxiako_app_v8") ||
      localStorage.getItem("ergotaxiako_app_v7");

    if (!raw) return { projects: defaultProjects, settings: defaultSettings };

    const parsed = JSON.parse(raw);
    return {
      projects: (parsed.projects?.length ? parsed.projects : defaultProjects).map((p) => ({
        ...p,
        accounts: p.accounts || [],
        schedule: p.schedule || []
      })),
      settings: {
        statuses: parsed.settings?.statuses?.length ? parsed.settings.statuses : defaultSettings.statuses,
        stages: parsed.settings?.stages?.length ? parsed.settings.stages : defaultSettings.stages,
        crews: parsed.settings?.crews?.length ? parsed.settings.crews : defaultSettings.crews,
        accountFields: parsed.settings?.accountFields?.length ? parsed.settings.accountFields : defaultSettings.accountFields
      }
    };
  } catch {
    return { projects: defaultProjects, settings: defaultSettings };
  }
}

function dateValue(date) {
  return date ? new Date(date + "T00:00:00").getTime() : null;
}

function daysBetween(start, end) {
  const s = dateValue(start);
  const e = dateValue(end);
  if (!s || !e) return 0;
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

function isDelayed(item) {
  if (!item.endDate || item.status === "Ολοκληρώθηκε") return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  return dateValue(item.endDate) < today.getTime();
}

const statusClass = {
  "Σε εξέλιξη": "status blue",
  "Επείγον": "status red",
  "Αναμονή": "status yellow",
  "Ολοκληρωμένο": "status green"
};

function App() {
  const initial = loadState();
  const [projects, setProjects] = useState(initial.projects);
  const [settings, setSettings] = useState(initial.settings);
  const [view, setView] = useState({ type: "home" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, settings }));
  }, [projects, settings]);

  const selectedProject = projects.find((p) => p.id === view.projectId);

  function addProject(project) {
    const next = { ...project, id: Date.now(), accounts: [], schedule: [] };
    setProjects([next, ...projects]);
    setShowNewProject(false);
    setView({ type: "project", projectId: next.id, tab: "general" });
  }

  function updateProject(id, patch) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deleteProject(id) {
    setProjects(projects.filter((p) => p.id !== id));
    setView({ type: "home" });
  }

  if (view.type === "project" && selectedProject) {
    return <ProjectPage project={selectedProject} settings={settings} tab={view.tab || "general"} onBack={() => setView({ type: "home" })} onTab={(tab) => setView({ type: "project", projectId: selectedProject.id, tab })} onUpdate={(patch) => updateProject(selectedProject.id, patch)} onDelete={() => deleteProject(selectedProject.id)} />;
  }

  if (view.type === "settings") {
    return <SettingsPage settings={settings} setSettings={setSettings} route={view.section || "index"} onRoute={(section) => setView({ type: "settings", section })} onBack={() => setView({ type: "home" })} />;
  }

  return (
    <HomePage
      projects={projects}
      settings={settings}
      query={query}
      setQuery={setQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      onAdd={addProject}
      onOpen={(projectId) => setView({ type: "project", projectId, tab: "general" })}
      onSettings={() => setView({ type: "settings", section: "index" })}
      showNewProject={showNewProject}
      setShowNewProject={setShowNewProject}
    />
  );
}

function HomePage({ projects, settings, query, setQuery, statusFilter, setStatusFilter, onAdd, onOpen, onSettings, showNewProject, setShowNewProject }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    stage: settings.stages[0] || "",
    deliveryDate: "",
    status: "Σε εξέλιξη",
    notes: "",
    specs: ""
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "Σε εξέλιξη").length,
    urgent: projects.filter((p) => p.status === "Επείγον").length,
    waiting: projects.filter((p) => p.status === "Αναμονή").length
  };

  const filtered = projects
    .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
    .filter((p) => `${p.name} ${p.address} ${p.stage} ${p.status}`.toLowerCase().includes(query.toLowerCase()));

  function submit() {
    if (!form.name.trim()) return;
    onAdd({ ...form, deliveryDate: form.deliveryDate || "Δεν ορίστηκε" });
    setForm({ name: "", address: "", stage: settings.stages[0] || "", deliveryDate: "", status: "Σε εξέλιξη", notes: "", specs: "" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Εργοταξιακό App</p>
          <h1>Έργα</h1>
          <p className="subtitle">Dashboard έργων με φίλτρα, taskbar και μενού ενεργειών.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={onSettings}><Settings size={18} /> Διαχείριση</button>
          <div className="more-wrap">
            <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)}><MoreVertical size={20} /></button>
            {menuOpen && (
              <div className="more-menu">
                <button onClick={() => { setShowNewProject(true); setMenuOpen(false); }}><Plus size={16} /> Προσθήκη έργου</button>
                <button onClick={() => { setStatusFilter("all"); setMenuOpen(false); }}><ListChecks size={16} /> Όλα τα έργα</button>
                <button onClick={() => { onSettings(); setMenuOpen(false); }}><Settings size={16} /> Διαχείριση</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="taskbar">
        <button className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>Όλα</button>
        <button className={statusFilter === "Σε εξέλιξη" ? "active" : ""} onClick={() => setStatusFilter("Σε εξέλιξη")}>Σε εξέλιξη</button>
        <button className={statusFilter === "Επείγον" ? "active" : ""} onClick={() => setStatusFilter("Επείγον")}>Επείγοντα</button>
        <button className={statusFilter === "Αναμονή" ? "active" : ""} onClick={() => setStatusFilter("Αναμονή")}>Αναμονή</button>
        <button onClick={() => setShowNewProject(true)}>+ Νέο έργο</button>
      </nav>

      <section className="stats-grid">
        <StatButton label="Σε εξέλιξη" value={stats.active} active={statusFilter === "Σε εξέλιξη"} onClick={() => setStatusFilter(statusFilter === "Σε εξέλιξη" ? "all" : "Σε εξέλιξη")} />
        <StatButton label="Επείγοντα" value={stats.urgent} active={statusFilter === "Επείγον"} onClick={() => setStatusFilter(statusFilter === "Επείγον" ? "all" : "Επείγον")} />
        <StatButton label="Σε αναμονή" value={stats.waiting} active={statusFilter === "Αναμονή"} onClick={() => setStatusFilter(statusFilter === "Αναμονή" ? "all" : "Αναμονή")} />
        <StatButton label="Όλα τα έργα" value={stats.total} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
      </section>

      <main>
        <div className="search-box">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Αναζήτηση έργου..." />
        </div>

        {showNewProject && (
          <section className="detail-card new-project-panel">
            <div className="panel-head">
              <h2><Plus size={20} /> Προσθήκη έργου</h2>
              <button className="secondary-btn" onClick={() => setShowNewProject(false)}>Κλείσιμο</button>
            </div>
            <div className="two-col">
              <Field label="Όνομα έργου" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Διεύθυνση" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={(v) => setForm({ ...form, stage: v })} />
              <Field label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={(v) => setForm({ ...form, deliveryDate: v })} />
              <Select label="Κατάσταση" value={form.status} options={settings.statuses} onChange={(v) => setForm({ ...form, status: v })} />
            </div>
            <TextArea label="Σημειώσεις" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
            <button className="primary-btn" onClick={submit}>Αποθήκευση έργου</button>
          </section>
        )}

        <div className="project-grid">
          {filtered.map((project) => (
            <button className="project-card" key={project.id} onClick={() => onOpen(project.id)}>
              <div className="card-head">
                <div><h3>{project.name}</h3><p>{project.stage}</p></div>
                <Building2 size={22} />
              </div>
              <div className="mini-info"><MapPin size={15} /> {project.address || "Χωρίς διεύθυνση"}</div>
              <div className="mini-info"><CalendarDays size={15} /> Παράδοση: {project.deliveryDate}</div>
              <span className={statusClass[project.status] || "status"}>{project.status}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function ProjectPage({ project, settings, tab, onBack, onTab, onUpdate, onDelete }) {
  const tabs = [
    { id: "general", label: "Γενικά", icon: FileText },
    { id: "daily", label: "Ημερολόγιο", icon: CalendarDays },
    { id: "tasks", label: "Εκκρεμότητες", icon: ClipboardList },
    { id: "stages", label: "Στάδια εργασιών", icon: Layers },
    { id: "schedule", label: "Χρονοδιάγραμμα", icon: GanttChartSquare },
    { id: "materials", label: "Υλικά", icon: Package },
    { id: "accounts", label: "Λογαριασμοί", icon: Banknote }
  ];

  return (
    <div className="project-layout">
      <aside className="sidebar">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Πίσω στα έργα</button>
        <div className="project-title">
          <Building2 size={28} />
          <div><h2>{project.name}</h2><p>{project.address || "Χωρίς διεύθυνση"}</p></div>
        </div>
        <nav className="tab-nav">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => onTab(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="detail-main">
        <div className="detail-header">
          <div><p className="eyebrow">Σελίδα έργου</p><h1>{project.name}</h1></div>
          <button className="danger-btn" onClick={onDelete}><Trash2 size={18} /> Διαγραφή έργου</button>
        </div>

        {tab === "general" && <GeneralTab project={project} settings={settings} onUpdate={onUpdate} />}
        {tab === "daily" && <Placeholder title="Ημερολόγιο εργοταξίου" text="Εδώ θα μπουν οι ημερήσιες καταγραφές." />}
        {tab === "tasks" && <Placeholder title="Εκκρεμότητες" text="Εδώ θα μπουν οι εκκρεμότητες." />}
        {tab === "stages" && <StagesTab stages={settings.stages} />}
        {tab === "schedule" && <ScheduleTab project={project} settings={settings} onUpdate={onUpdate} />}
        {tab === "materials" && <Placeholder title="Υλικά" text="Εδώ θα μπουν υλικά, ποσότητες και προμηθευτές." />}
        {tab === "accounts" && <AccountsTab project={project} settings={settings} onUpdate={onUpdate} />}
      </main>
    </div>
  );
}

function GeneralTab({ project, settings, onUpdate }) {
  return (
    <section className="detail-card">
      <h2>Γενικά στοιχεία</h2>
      <div className="two-col">
        <Field label="Όνομα έργου" value={project.name} onChange={(v) => onUpdate({ name: v })} />
        <Field label="Διεύθυνση" value={project.address} onChange={(v) => onUpdate({ address: v })} />
        <Select label="Στάδιο" value={project.stage} options={settings.stages} onChange={(v) => onUpdate({ stage: v })} />
        <Select label="Κατάσταση" value={project.status} options={settings.statuses} onChange={(v) => onUpdate({ status: v })} />
        <Field label="Ημερομηνία παράδοσης" type="date" value={project.deliveryDate === "Δεν ορίστηκε" ? "" : project.deliveryDate} onChange={(v) => onUpdate({ deliveryDate: v })} />
      </div>
      <TextArea label="Σημειώσεις" value={project.notes || ""} onChange={(v) => onUpdate({ notes: v })} />
      <TextArea label="Τεχνικές προδιαγραφές" value={project.specs || ""} onChange={(v) => onUpdate({ specs: v })} tall />
    </section>
  );
}

function ScheduleTab({ project, settings, onUpdate }) {
  const schedule = project.schedule || [];
  const [form, setForm] = useState({
    stage: settings.stages[0] || "",
    startDate: "",
    endDate: "",
    crew: "",
    status: "Δεν ξεκίνησε",
    dependsOn: ""
  });

  const timelineMeta = useMemo(() => {
    const dates = schedule.flatMap((item) => [dateValue(item.startDate), dateValue(item.endDate)]).filter(Boolean);
    if (!dates.length) return null;
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    return { min, max, totalDays: Math.max(1, Math.round((max - min) / 86400000) + 1) };
  }, [schedule]);

  function addItem() {
    if (!form.stage || !form.startDate || !form.endDate) return;
    const dependency = schedule.find((i) => String(i.id) === String(form.dependsOn));
    const warning = dependency && dateValue(form.startDate) <= dateValue(dependency.endDate);
    onUpdate({ schedule: [...schedule, { id: Date.now(), ...form, dependencyWarning: warning }] });
    setForm({ stage: settings.stages[0] || "", startDate: "", endDate: "", crew: "", status: "Δεν ξεκίνησε", dependsOn: "" });
  }

  function updateItem(id, patch) {
    const next = schedule.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch };
      const dependency = schedule.find((i) => String(i.id) === String(updated.dependsOn));
      updated.dependencyWarning = dependency ? dateValue(updated.startDate) <= dateValue(dependency.endDate) : false;
      return updated;
    });
    onUpdate({ schedule: next });
  }

  function deleteItem(id) {
    onUpdate({
      schedule: schedule
        .filter((item) => item.id !== id)
        .map((item) => (String(item.dependsOn) === String(id) ? { ...item, dependsOn: "", dependencyWarning: false } : item))
    });
  }

  const delayedCount = schedule.filter(isDelayed).length;
  const doneCount = schedule.filter((i) => i.status === "Ολοκληρώθηκε").length;

  return (
    <section className="detail-card">
      <h2><GanttChartSquare size={22} /> Χρονοδιάγραμμα έργου</h2>
      <p className="subtitle">Gantt-style timeline με εξαρτήσεις μεταξύ σταδίων.</p>

      <div className="schedule-summary">
        <div><p>Στάδια</p><strong>{schedule.length}</strong></div>
        <div><p>Ολοκληρωμένα</p><strong>{doneCount}</strong></div>
        <div><p>Καθυστερήσεις</p><strong>{delayedCount}</strong></div>
        <div><p>Διάρκεια</p><strong>{timelineMeta?.totalDays || 0} ημ.</strong></div>
      </div>

      <div className="schedule-form">
        <Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={(v) => setForm({ ...form, stage: v })} />
        <Field label="Έναρξη" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
        <Field label="Λήξη" type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} />
        <Select label="Συνεργείο" value={form.crew} options={["", ...settings.crews]} onChange={(v) => setForm({ ...form, crew: v })} />
        <Select label="Κατάσταση" value={form.status} options={["Δεν ξεκίνησε", "Σε εξέλιξη", "Ολοκληρώθηκε", "Καθυστέρηση"]} onChange={(v) => setForm({ ...form, status: v })} />
        <Select
          label="Εξαρτάται από"
          value={form.dependsOn}
          options={["", ...schedule.map((i) => String(i.id))]}
          labels={{ "": "Καμία", ...Object.fromEntries(schedule.map((i) => [String(i.id), i.stage])) }}
          onChange={(v) => setForm({ ...form, dependsOn: v })}
        />
      </div>

      <button className="primary-btn schedule-add" onClick={addItem}>Προσθήκη στο χρονοδιάγραμμα</button>

      {schedule.length === 0 ? (
        <div className="empty-state">Δεν έχεις προσθέσει ακόμα στάδια στο χρονοδιάγραμμα.</div>
      ) : (
        <div className="gantt-wrap">
          <div className="gantt-table">
            <div className="gantt-head">Στάδιο</div>
            <div className="gantt-head">Ημερομηνίες</div>
            <div className="gantt-head">Συνεργείο</div>
            <div className="gantt-head">Κατάσταση</div>
            <div className="gantt-head">Timeline</div>

            {schedule.map((item) => {
              const duration = daysBetween(item.startDate, item.endDate);
              const delayed = isDelayed(item);
              const dependency = schedule.find((i) => String(i.id) === String(item.dependsOn));
              const left = timelineMeta ? ((dateValue(item.startDate) - timelineMeta.min) / 86400000 / timelineMeta.totalDays) * 100 : 0;
              const width = timelineMeta ? (duration / timelineMeta.totalDays) * 100 : 100;

              return (
                <React.Fragment key={item.id}>
                  <div className="gantt-cell">
                    <strong>{item.stage}</strong>
                    {dependency && <small className="dependency"><Link2 size={13} /> μετά από: {dependency.stage}</small>}
                    {item.dependencyWarning && <small className="warning">Ξεκινά πριν ολοκληρωθεί το εξαρτώμενο στάδιο.</small>}
                  </div>
                  <div className="gantt-cell">
                    <div className="date-edit">
                      <input type="date" value={item.startDate} onChange={(e) => updateItem(item.id, { startDate: e.target.value })} />
                      <input type="date" value={item.endDate} onChange={(e) => updateItem(item.id, { endDate: e.target.value })} />
                    </div>
                    <small>{duration} ημέρες</small>
                  </div>
                  <div className="gantt-cell">
                    <select value={item.crew || ""} onChange={(e) => updateItem(item.id, { crew: e.target.value })}>
                      {["", ...settings.crews].map((c) => <option key={c} value={c}>{c || "—"}</option>)}
                    </select>
                  </div>
                  <div className="gantt-cell">
                    <select value={item.status} onChange={(e) => updateItem(item.id, { status: e.target.value })}>
                      <option>Δεν ξεκίνησε</option>
                      <option>Σε εξέλιξη</option>
                      <option>Ολοκληρώθηκε</option>
                      <option>Καθυστέρηση</option>
                    </select>
                    <span className={delayed ? "badge red" : "badge gray"}>{delayed ? "Καθυστέρηση" : item.status}</span>
                  </div>
                  <div className="gantt-cell timeline-cell">
                    <div className="timeline-track">
                      <div
                        className={`timeline-bar ${delayed ? "delayed" : item.status === "Ολοκληρώθηκε" ? "done" : item.status === "Σε εξέλιξη" ? "active" : ""}`}
                        style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(5, width)}%` }}
                      >
                        {duration}η
                      </div>
                    </div>
                    <button className="icon-danger" onClick={() => deleteItem(item.id)}><Trash2 size={16} /></button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function SettingsPage({ settings, setSettings, route, onRoute, onBack }) {
  const sections = [
    { id: "accountFields", title: "Πεδία λογαριασμών" },
    { id: "crews", title: "Συνεργεία" },
    { id: "stages", title: "Στάδια εργασιών" },
    { id: "statuses", title: "Καταστάσεις έργου" }
  ].sort((a, b) => a.title.localeCompare(b.title, "el"));

  if (route !== "index") {
    const selected = sections.find((s) => s.id === route);
    return (
      <div className="app-shell">
        <header className="topbar">
          <div><p className="eyebrow">Διαχείριση</p><h1>{selected?.title}</h1></div>
          <button className="secondary-btn" onClick={() => onRoute("index")}><ArrowLeft size={18} /> Πίσω στη Διαχείριση</button>
        </header>

        {route === "statuses" && <ManageList title="Καταστάσεις έργου" items={settings.statuses} onChange={(items) => setSettings({ ...settings, statuses: items })} allowBulk />}
        {route === "stages" && <ManageList title="Στάδια εργασιών" items={settings.stages} onChange={(items) => setSettings({ ...settings, stages: items })} allowBulk />}
        {route === "crews" && <ManageList title="Συνεργεία" items={settings.crews} onChange={(items) => setSettings({ ...settings, crews: items })} allowBulk />}
        {route === "accountFields" && <AccountFieldsSettings settings={settings} setSettings={setSettings} />}
        <VersionBadge />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">Ρυθμίσεις</p><h1>Διαχείριση</h1></div>
        <button className="secondary-btn" onClick={onBack}><Home size={18} /> Πίσω</button>
      </header>

      <div className="settings-list">
        {sections.map((section) => (
          <button key={section.id} className="settings-row" onClick={() => onRoute(section.id)}>
            <span>{section.title}</span>
            <small>Άνοιγμα</small>
          </button>
        ))}
      </div>

      <VersionBadge />
    </div>
  );
}

function AccountFieldsSettings({ settings, setSettings }) {
  return (
    <section className="detail-card">
      <h2>Πεδία λογαριασμών</h2>
      <div className="field-toggle-grid">
        {settings.accountFields.map((field) => (
          <button
            key={field.key}
            className={`field-toggle ${field.enabled ? "enabled" : ""}`}
            onClick={() => setSettings({
              ...settings,
              accountFields: settings.accountFields.map((f) => f.key === field.key ? { ...f, enabled: !f.enabled } : f)
            })}
          >
            <span>{field.label}</span>
            <small>{field.enabled ? "Ενεργό" : "Ανενεργό"}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ManageList({ title, items, onChange, allowBulk }) {
  const [value, setValue] = useState("");
  const [bulk, setBulk] = useState("");

  function add() {
    if (!value.trim()) return;
    onChange([...items, value.trim()]);
    setValue("");
  }

  function addBulk() {
    const next = bulk.split("\n").map((x) => x.trim()).filter(Boolean);
    onChange(Array.from(new Set([...items, ...next])));
    setBulk("");
  }

  return (
    <section className="detail-card">
      <h2>{title}</h2>
      <div className="inline-add">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Νέα τιμή..." />
        <button className="primary-btn compact" onClick={add}>Προσθήκη</button>
      </div>
      {allowBulk && (
        <div className="bulk-box">
          <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="Μαζική προσθήκη: μία γραμμή = μία τιμή" />
          <button className="secondary-btn" onClick={addBulk}>Μαζική προσθήκη</button>
        </div>
      )}
      <div className="list-box">
        {items.map((item, index) => (
          <div className="list-row" key={`${item}-${index}`}>
            <span>{item}</span>
            <button onClick={() => onChange(items.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountsTab({ project, settings, onUpdate }) {
  const fields = settings.accountFields.filter((f) => f.enabled);
  const [form, setForm] = useState(Object.fromEntries(settings.accountFields.map((f) => [f.key, f.key === "status" ? "Εκκρεμεί" : ""])));
  const accounts = project.accounts || [];

  function addAccount() {
    if (!form.provider && !form.paymentCode && !form.amount) return;
    onUpdate({ accounts: [{ id: Date.now(), ...form, amount: Number(form.amount) || 0 }, ...accounts] });
  }

  return (
    <section className="detail-card">
      <h2><Banknote size={22} /> Λογαριασμοί</h2>
      <div className="account-form">
        {fields.map((field) => (
          field.type === "textarea" ? (
            <TextArea key={field.key} label={field.label} value={form[field.key] || ""} onChange={(v) => setForm({ ...form, [field.key]: v })} />
          ) : field.type === "select" ? (
            <Select key={field.key} label={field.label} value={form[field.key] || "Εκκρεμεί"} options={field.options} onChange={(v) => setForm({ ...form, [field.key]: v })} />
          ) : (
            <Field key={field.key} label={field.label} type={field.type} value={form[field.key] || ""} onChange={(v) => setForm({ ...form, [field.key]: v })} />
          )
        ))}
      </div>
      <button className="primary-btn" onClick={addAccount}>Προσθήκη λογαριασμού</button>
      <div className="accounts-list">
        {accounts.map((a) => (
          <div className="account-card" key={a.id}>
            <h3>{a.provider || "Λογαριασμός"} — {(Number(a.amount) || 0).toFixed(2)} €</h3>
            <p>{a.billType || "Χωρίς είδος"} · {a.dueDate || "Χωρίς ημερομηνία"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StagesTab({ stages }) {
  return (
    <section className="detail-card">
      <h2>Στάδια εργασιών</h2>
      <div className="ordered-stages">
        {stages.map((s, i) => <div className="ordered-stage" key={s}><span>{i + 1}</span><p>{s}</p></div>)}
      </div>
    </section>
  );
}

function Placeholder({ title, text }) {
  return <section className="detail-card placeholder"><Wrench size={42} /><h2>{title}</h2><p>{text}</p></section>;
}

function VersionBadge() {
  return <div className="version-badge">{versionInfo.version} · commit {versionInfo.commit} · {versionInfo.branch}</div>;
}

function StatButton({ label, value, active, onClick }) {
  return <button className={`stat-card stat-button ${active ? "active" : ""}`} onClick={onClick}><p>{label}</p><strong>{value}</strong></button>;
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return <label className="field"><span>{label}</span><input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function Select({ label, value, options = [], labels = {}, onChange }) {
  return <label className="field"><span>{label}</span><select value={value || ""} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{labels[o] || o || "—"}</option>)}</select></label>;
}

function TextArea({ label, value, onChange, placeholder = "", tall = false }) {
  return <label className="field"><span>{label}</span><textarea className={tall ? "tall" : ""} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

createRoot(document.getElementById("root")).render(<App />);
