
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown, ArrowLeft, ArrowUp, Banknote, Building2, CalendarDays,
  ClipboardList, Eye, EyeOff, FileText, Hammer, Home, Layers, MapPin,
  Package, Plus, Search, Settings, Trash2, Users, Wrench
} from "lucide-react";
import "./style.css";

const APP_VERSION = "v9";
const APP_COMMIT = "b68d857";
const STORAGE_KEY = "ergotaxiako_app_v9";

function titleCaseFirst(text) {
  if (!text) return "";
  return text.charAt(0).toLocaleUpperCase("el-GR") + text.slice(1);
}

const defaultAccountFields = [
  { key: "provider", label: "Πάροχος", type: "text", enabled: true },
  { key: "billType", label: "Είδος λογαριασμού", type: "text", enabled: true },
  { key: "invoiceType", label: "Τύπος τιμολογίου", type: "text", enabled: true },
  { key: "amount", label: "Ποσό πληρωμής (€)", type: "number", enabled: true },
  { key: "dueDate", label: "Εξόφληση έως", type: "date", enabled: true },
  { key: "issueDate", label: "Ημερομηνία έκδοσης", type: "date", enabled: true },
  { key: "consumptionStart", label: "Έναρξη περιόδου κατανάλωσης", type: "date", enabled: true },
  { key: "consumptionEnd", label: "Λήξη περιόδου κατανάλωσης", type: "date", enabled: true },
  { key: "days", label: "Ημέρες", type: "number", enabled: true },
  { key: "consumption", label: "Κατανάλωση", type: "text", enabled: true },
  { key: "accountNumber", label: "Α/Α λογαριασμού", type: "text", enabled: true },
  { key: "supplyNumber", label: "Αριθμός παροχής", type: "text", enabled: true },
  { key: "paymentCode", label: "Κωδικός ηλεκτρονικής πληρωμής", type: "text", enabled: true },
  { key: "propertyAddress", label: "Διεύθυνση ακινήτου", type: "text", enabled: true },
  { key: "customerName", label: "Όνομα πελάτη / υπόχρεου", type: "text", enabled: true },
  { key: "status", label: "Κατάσταση πληρωμής", type: "select", enabled: true, options: ["Εκκρεμεί", "Πληρώθηκε"] },
  { key: "notes", label: "Σημειώσεις", type: "textarea", enabled: true }
];

const defaultSettings = {
  statuses: ["Σε εξέλιξη", "Επείγον", "Αναμονή", "Ολοκληρωμένο"],
  stages: [
    "Αποξηλώσεις","Αποξήλωση μαρμάρων","Αποκομιδή μπάζων","Προσωρινά κουφώματα",
    "Εργοταξιακή λεκάνη","Θέση λέβητα αερίου","Μπούρι απορροφητήρα","Οπές κλιματιστικών",
    "Χτίσιμο","Ξύσιμο τοιχοποιίας","Επιχρίσματα α","Κιγκλιδώματα","Ηλεκτρολόγος",
    "Επιχρίσματα β","Σπατουλάρισμα","Γυψοσανίδες","Καλωδίωση","Υδραυλικός",
    "Απορροή κλιματιστικών","Γκρο μπετά","Επιχρίσματα γ","Πλακάκια δαπέδου",
    "Πλακάκια μπάνιου","Κατωκασιά","Μαρμαροποδιές","Γυψοσανίδες β","Βάψιμο 1ο",
    "Καθαριότητα (α)","Εξ. κουφώματα","Κουζίνα","Ντουλάπες","Εσ. κουφώματα",
    "Είδη υγιεινής","Καμπίνα ντουζιέρας","Θερμαντικά σώματα","Διακόπτες","Φωτιστικά",
    "Τελικό βάψιμο","Ηλεκτρικές συσκευές","Κλιματιστικό","Τέντα","Επίπλωση",
    "Διακόσμηση","Λέβητας αερίου","Φυσικό αέριο","Ολοκλήρωση έργου","Παράδοση έργου"
  ],
  crews: ["Ηλεκτρολόγος", "Υδραυλικός", "Πλακάς", "Ελαιοχρωματιστής"],
  accountFields: defaultAccountFields
};

const defaultProjects = [
  {
    id: 1, name: "Λύτρα 5", address: "Θεσσαλονίκη", stage: "Ηλεκτρολογικά",
    deliveryDate: "2026-05-20", status: "Σε εξέλιξη", crew: "Ηλεκτρολόγος",
    notes: "Ανακαίνιση διαμερίσματος. Εκκρεμεί τελικός έλεγχος παροχών.",
    specs: "Τεχνικές προδιαγραφές έργου: παροχές, θέσεις, ύψη, ειδικές παρατηρήσεις.",
    accounts: []
  },
  {
    id: 2, name: "Μπάνιο - Βούλγαρη", address: "Περιοχή Βούλγαρη", stage: "Πλακάκια μπάνιου",
    deliveryDate: "2026-05-10", status: "Επείγον", crew: "Πλακάς",
    notes: "Να επιβεβαιωθεί διαθεσιμότητα υλικών και πρόγραμμα πλακά.",
    specs: "Να σημειωθούν οι τελικές επιλογές πλακιδίων, ειδών υγιεινής και καμπίνας.",
    accounts: []
  },
  {
    id: 3, name: "Κουζίνα - Τεχνικές προδιαγραφές", address: "Θεσσαλονίκη", stage: "Κουζίνα",
    deliveryDate: "2026-06-01", status: "Αναμονή", crew: "",
    notes: "Χρειάζεται τελική λίστα παροχών και επαγγελματιών.",
    specs: "Παροχές κουζίνας, ύψη πριζών, θέση απορροφητήρα, συσκευές.",
    accounts: []
  }
];

function mergeAccountFields(fields) {
  const saved = fields || [];
  return defaultAccountFields.map((field) => {
    const existing = saved.find((f) => f.key === field.key);
    return existing ? { ...field, enabled: existing.enabled !== false } : field;
  });
}

function normalizeLoadedSettings(settings) {
  return {
    statuses: (settings?.statuses?.length ? settings.statuses : defaultSettings.statuses).map(titleCaseFirst),
    stages: (settings?.stages?.length ? settings.stages : defaultSettings.stages).map(titleCaseFirst),
    crews: (settings?.crews?.length ? settings.crews : defaultSettings.crews).map(titleCaseFirst),
    accountFields: mergeAccountFields(settings?.accountFields)
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const older = !raw && (localStorage.getItem("ergotaxiako_app_v6") || localStorage.getItem("ergotaxiako_app_v5"));
    const source = raw || older;
    if (!source) return { projects: defaultProjects, settings: defaultSettings };
    const parsed = JSON.parse(source);
    return {
      projects: (parsed.projects?.length ? parsed.projects : defaultProjects).map((p) => ({
        ...p,
        status: titleCaseFirst(p.status),
        stage: titleCaseFirst(p.stage),
        crew: titleCaseFirst(p.crew),
        accounts: p.accounts || []
      })),
      settings: normalizeLoadedSettings(parsed.settings)
    };
  } catch {
    return { projects: defaultProjects, settings: defaultSettings };
  }
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, settings }));
  }, [projects, settings]);

  const selectedProject = projects.find((p) => p.id === view.projectId);

  function addProject(project) {
    const next = { ...project, id: Date.now(), specs: project.specs || "", accounts: [] };
    setProjects((prev) => [next, ...prev]);
    setView({ type: "project", projectId: next.id, tab: "general" });
  }

  function updateProject(id, patch) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deleteProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setView({ type: "home" });
  }

  if (view.type === "project" && selectedProject) {
    return <ProjectPage project={selectedProject} settings={settings} tab={view.tab || "general"} onBack={() => setView({ type: "home" })} onTab={(tab) => setView({ type: "project", projectId: selectedProject.id, tab })} onUpdate={(patch) => updateProject(selectedProject.id, patch)} onDelete={() => deleteProject(selectedProject.id)} />;
  }

  if (view.type === "settings") {
    return <SettingsPage settings={settings} setSettings={setSettings} onBack={() => setView({ type: "home" })} />;
  }

  return <HomePage projects={projects} settings={settings} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onAdd={addProject} onOpen={(projectId) => setView({ type: "project", projectId, tab: "general" })} onSettings={() => setView({ type: "settings" })} />;
}

function HomePage({ projects, settings, query, setQuery, statusFilter, setStatusFilter, onAdd, onOpen, onSettings }) {
  const [form, setForm] = useState({
    name: "", address: "", stage: settings.stages[0] || "", deliveryDate: "",
    status: settings.statuses[0] || "Σε εξέλιξη", crew: "", notes: "", specs: ""
  });

  useEffect(() => {
    setForm((f) => ({ ...f, stage: f.stage || settings.stages[0] || "", status: f.status || settings.statuses[0] || "Σε εξέλιξη" }));
  }, [settings]);

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "Σε εξέλιξη").length,
    urgent: projects.filter((p) => p.status === "Επείγον").length,
    waiting: projects.filter((p) => p.status === "Αναμονή").length
  };

  const filtered = projects
    .filter((p) => statusFilter === "all" ? true : p.status === statusFilter)
    .filter((p) => `${p.name} ${p.address} ${p.stage} ${p.status} ${p.crew}`.toLowerCase().includes(query.toLowerCase()));

  function submit() {
    if (!form.name.trim()) return;
    onAdd({ ...form, name: form.name.trim(), deliveryDate: form.deliveryDate || "Δεν ορίστηκε" });
    setForm({ name: "", address: "", stage: settings.stages[0] || "", deliveryDate: "", status: settings.statuses[0] || "Σε εξέλιξη", crew: "", notes: "", specs: "" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Εργοταξιακό App v9</p>
          <h1>Έργα</h1>
          <p className="subtitle">Κεντρικό dashboard έργων. Πάτησε σε ένα έργο για να μπεις στη σελίδα διαχείρισής του.</p>
        </div>
        <div className="top-actions"><VersionBadge /><button className="secondary-btn" onClick={onSettings}><Settings size={18} /> Διαχείριση</button></div>
      </header>

      <section className="stats-grid">
        <StatButton label="Σε εξέλιξη" value={stats.active} active={statusFilter === "Σε εξέλιξη"} onClick={() => setStatusFilter(statusFilter === "Σε εξέλιξη" ? "all" : "Σε εξέλιξη")} />
        <StatButton label="Επείγοντα" value={stats.urgent} active={statusFilter === "Επείγον"} onClick={() => setStatusFilter(statusFilter === "Επείγον" ? "all" : "Επείγον")} />
        <StatButton label="Σε αναμονή" value={stats.waiting} active={statusFilter === "Αναμονή"} onClick={() => setStatusFilter(statusFilter === "Αναμονή" ? "all" : "Αναμονή")} />
        <StatButton label="Όλα τα έργα" value={stats.total} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
      </section>

      {statusFilter !== "all" && <div className="filter-note">Εμφανίζονται μόνο έργα με κατάσταση: <strong>{statusFilter}</strong><button onClick={() => setStatusFilter("all")}>Καθαρισμός φίλτρου</button></div>}

      <main className="home-grid">
        <section className="projects-area">
          <div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Αναζήτηση έργου, διεύθυνσης, σταδίου..." /></div>
          <div className="project-grid">
            {filtered.map((project) => (
              <button className="project-card" key={project.id} onClick={() => onOpen(project.id)}>
                <div className="card-head"><div><h3>{project.name}</h3><p>{project.stage || "Χωρίς στάδιο"}</p></div><Building2 size={22} /></div>
                <div className="mini-info"><MapPin size={15} /> {project.address || "Χωρίς διεύθυνση"}</div>
                <div className="mini-info"><CalendarDays size={15} /> Παράδοση: {project.deliveryDate}</div>
                {project.crew && <div className="mini-info"><Users size={15} /> {project.crew}</div>}
                <span className={statusClass[project.status] || "status"}>{project.status}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="empty-state">Δεν βρέθηκαν έργα με τα τρέχοντα φίλτρα.</div>}
          </div>
        </section>

        <aside className="form-card">
          <h2><Plus size={20} /> Νέο έργο</h2>
          <Field label="Όνομα έργου" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="π.χ. Διαμέρισμα Παπάφη" />
          <Field label="Διεύθυνση" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="π.χ. Βούλγαρη" />
          <Select label="Στάδιο" value={form.stage} options={settings.stages} onChange={(v) => setForm({ ...form, stage: v })} />
          <Field label="Ημερομηνία παράδοσης" type="date" value={form.deliveryDate} onChange={(v) => setForm({ ...form, deliveryDate: v })} />
          <Select label="Κατάσταση" value={form.status} options={settings.statuses} onChange={(v) => setForm({ ...form, status: v })} />
          <Select label="Συνεργείο" value={form.crew} options={["", ...settings.crews]} onChange={(v) => setForm({ ...form, crew: v })} />
          <TextArea label="Σημειώσεις" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Σύντομες παρατηρήσεις..." />
          <button className="primary-btn" onClick={submit}>Προσθήκη έργου</button>
        </aside>
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
    { id: "materials", label: "Υλικά", icon: Package },
    { id: "accounts", label: "Λογαριασμοί", icon: Banknote }
  ];

  return (
    <div className="project-layout">
      <aside className="sidebar">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Πίσω στα έργα</button>
        <div className="project-title"><Building2 size={28} /><div><h2>{project.name}</h2><p>{project.address || "Χωρίς διεύθυνση"}</p></div></div>
        <div className="sidebar-meta">
          <span className={statusClass[project.status] || "status"}>{project.status}</span>
          <p><Hammer size={15} /> {project.stage || "Χωρίς στάδιο"}</p>
          <p><CalendarDays size={15} /> {project.deliveryDate}</p>
          {project.crew && <p><Users size={15} /> {project.crew}</p>}
        </div>
        <nav className="tab-nav">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => onTab(id)}><Icon size={18} /> {label}</button>)}
        </nav>
      </aside>

      <main className="detail-main">
        <div className="detail-header">
          <div><p className="eyebrow">Σελίδα έργου</p><h1>{project.name}</h1><p className="subtitle">Επαγγελματική δομή με sidebar και καρτέλες για όλες τις λειτουργίες.</p></div>
          <div className="top-actions"><VersionBadge /><button className="danger-btn" onClick={onDelete}><Trash2 size={18} /> Διαγραφή έργου</button></div>
        </div>

        {tab === "general" && (
          <section className="detail-card">
            <h2>Γενικά στοιχεία</h2>
            <div className="two-col">
              <Field label="Όνομα έργου" value={project.name} onChange={(v) => onUpdate({ name: v })} />
              <Field label="Διεύθυνση" value={project.address} onChange={(v) => onUpdate({ address: v })} />
              <Select label="Στάδιο" value={project.stage} options={settings.stages} onChange={(v) => onUpdate({ stage: v })} />
              <Select label="Κατάσταση" value={project.status} options={settings.statuses} onChange={(v) => onUpdate({ status: v })} />
              <Field label="Ημερομηνία παράδοσης" type="date" value={project.deliveryDate === "Δεν ορίστηκε" ? "" : project.deliveryDate} onChange={(v) => onUpdate({ deliveryDate: v })} />
              <Select label="Συνεργείο" value={project.crew || ""} options={["", ...settings.crews]} onChange={(v) => onUpdate({ crew: v })} />
            </div>
            <TextArea label="Σημειώσεις" value={project.notes || ""} onChange={(v) => onUpdate({ notes: v })} />
            <TextArea label="Τεχνικές προδιαγραφές" value={project.specs || ""} onChange={(v) => onUpdate({ specs: v })} placeholder="Μόνιμες τεχνικές πληροφορίες που πρέπει να θυμάμαι για όλη τη διάρκεια του έργου..." tall />
          </section>
        )}

        {tab === "daily" && <Placeholder title="Ημερολόγιο εργοταξίου" text="Εδώ θα προσθέσουμε ημερήσιες καταγραφές: τι έγινε σήμερα, ποιο συνεργείο δούλεψε, φωτογραφίες και παρατηρήσεις." />}
        {tab === "tasks" && <Placeholder title="Εκκρεμότητες" text="Εδώ θα προσθέσουμε λίστα εργασιών, προτεραιότητα, υπεύθυνο και κατάσταση ολοκλήρωσης." />}
        {tab === "stages" && <StagesTab stages={settings.stages} />}
        {tab === "materials" && <Placeholder title="Υλικά" text="Εδώ θα προσθέσουμε παραγγελίες, προμηθευτές, ποσότητες, κόστος και κατάσταση παράδοσης." />}
        {tab === "accounts" && <AccountsTab project={project} settings={settings} onUpdate={onUpdate} />}
      </main>
    </div>
  );
}

function StagesTab({ stages }) {
  return (
    <section className="detail-card">
      <h2>Στάδια εργασιών</h2>
      <p className="subtitle">Εμφανίζονται με τη σειρά που έχεις ορίσει στη Διαχείριση.</p>
      <div className="ordered-stages">
        {stages.map((s, idx) => <div className="ordered-stage" key={`${s}-${idx}`}><span>{idx + 1}</span><p>{s}</p></div>)}
      </div>
    </section>
  );
}

function AccountsTab({ project, settings, onUpdate }) {
  const activeFields = settings.accountFields.filter((f) => f.enabled);
  const initialForm = Object.fromEntries(settings.accountFields.map((f) => [f.key, f.key === "status" ? "Εκκρεμεί" : ""]));
  const [form, setForm] = useState(initialForm);
  const accounts = project.accounts || [];

  const total = accounts.reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0);
  const paid = accounts.filter((acc) => acc.status === "Πληρώθηκε").reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0);
  const pending = total - paid;

  function addAccount() {
    const hasProvider = (form.provider || "").trim();
    const hasPaymentCode = (form.paymentCode || "").trim();
    const hasAmount = Number(form.amount) > 0;
    if (!hasProvider && !hasPaymentCode && !hasAmount) return;

    const next = { id: Date.now(), ...form, amount: Number(form.amount) || 0 };
    onUpdate({ accounts: [next, ...accounts] });
    setForm(initialForm);
  }

  function updateAccount(id, patch) {
    onUpdate({ accounts: accounts.map((a) => a.id === id ? { ...a, ...patch } : a) });
  }

  function deleteAccount(id) {
    onUpdate({ accounts: accounts.filter((a) => a.id !== id) });
  }

  const summaryFields = ["provider", "billType", "paymentCode", "dueDate"];

  return (
    <section className="detail-card">
      <h2><Banknote size={22} /> Λογαριασμοί</h2>
      <div className="account-summary">
        <div><p>Σύνολο</p><strong>{total.toFixed(2)} €</strong></div>
        <div><p>Πληρωμένα</p><strong>{paid.toFixed(2)} €</strong></div>
        <div><p>Εκκρεμούν</p><strong>{pending.toFixed(2)} €</strong></div>
      </div>

      <div className="accounts-note">
        Τα πεδία της φόρμας ρυθμίζονται από: <strong>Διαχείριση → Πεδία λογαριασμών</strong>
      </div>

      <div className="account-form">
        {activeFields.map((field) => (
          <DynamicField
            key={field.key}
            field={field}
            value={form[field.key] || ""}
            onChange={(value) => setForm({ ...form, [field.key]: value })}
          />
        ))}
      </div>

      <button className="primary-btn account-add" onClick={addAccount}>Προσθήκη λογαριασμού</button>

      <div className="accounts-list">
        {accounts.map((acc) => (
          <div className="account-card" key={acc.id}>
            <div className="account-card-head">
              <div>
                <h3>{acc.provider || acc.billType || "Λογαριασμός"}</h3>
                <p>{acc.billType || "Χωρίς είδος"} · {acc.dueDate ? `Εξόφληση: ${acc.dueDate}` : "Χωρίς ημερομηνία"}</p>
              </div>
              <div className="account-amount">{(Number(acc.amount) || 0).toFixed(2)} €</div>
            </div>
            <div className="account-details-grid">
              {activeFields.filter((f) => f.key !== "amount").map((field) => (
                <div key={field.key} className="account-detail">
                  <span>{field.label}</span>
                  <p>{acc[field.key] || "—"}</p>
                </div>
              ))}
            </div>
            <div className="account-actions">
              <select value={acc.status || "Εκκρεμεί"} onChange={(e) => updateAccount(acc.id, { status: e.target.value })}>
                <option>Εκκρεμεί</option>
                <option>Πληρώθηκε</option>
              </select>
              <button className="icon-danger" onClick={() => deleteAccount(acc.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <div className="empty-state">Δεν έχουν προστεθεί λογαριασμοί για αυτό το έργο.</div>}
      </div>
    </section>
  );
}

function DynamicField({ field, value, onChange }) {
  if (field.type === "textarea") return <TextArea label={field.label} value={value} onChange={onChange} />;
  if (field.type === "select") return <Select label={field.label} value={value || "Εκκρεμεί"} options={field.options || []} onChange={onChange} />;
  return <Field label={field.label} type={field.type} value={value} onChange={onChange} />;
}

function SettingsPage({ settings, setSettings, onBack }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Διαχείριση</p>
          <h1>Ρυθμίσεις εφαρμογής</h1>
          <p className="subtitle">Πρόσθεσε καταστάσεις, στάδια εργασιών, συνεργεία και ενεργοποίησε/απενεργοποίησε πεδία λογαριασμών.</p>
        </div>
        <div className="top-actions"><VersionBadge /><button className="secondary-btn" onClick={onBack}><Home size={18} /> Πίσω</button></div>
      </header>

      <section className="settings-grid">
        <ManageList title="Καταστάσεις έργου" items={settings.statuses} onChange={(items) => setSettings({ ...settings, statuses: items })} />
        <ManageList title="Στάδια εργασιών" items={settings.stages} onChange={(items) => setSettings({ ...settings, stages: items })} allowBulk allowReorder />
        <ManageList title="Συνεργεία" items={settings.crews} onChange={(items) => setSettings({ ...settings, crews: items })} />
      </section>

      <section className="detail-card full-width-card">
        <h2>Πεδία λογαριασμών</h2>
        <p className="subtitle">Ενεργοποίησε όσα πεδία θέλεις να εμφανίζονται στη φόρμα και στις καταχωρήσεις λογαριασμών.</p>
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
              {field.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
              <span>{field.label}</span>
              <small>{field.enabled ? "Ενεργό" : "Ανενεργό"}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ManageList({ title, items, onChange, allowBulk, allowReorder }) {
  const [value, setValue] = useState("");
  const [bulk, setBulk] = useState("");

  function addOne() {
    const clean = titleCaseFirst(value.trim());
    if (!clean) return;
    if (!items.includes(clean)) onChange([...items, clean]);
    setValue("");
  }

  function addBulk() {
    const next = bulk.split("\n").map((x) => titleCaseFirst(x.trim())).filter(Boolean);
    const merged = Array.from(new Set([...items, ...next]));
    onChange(merged);
    setBulk("");
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div className="detail-card">
      <h2>{title}</h2>
      <div className="inline-add">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Νέα τιμή..." />
        <button className="primary-btn compact" onClick={addOne}>Προσθήκη</button>
      </div>
      {allowBulk && <div className="bulk-box"><textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="Μαζική εισαγωγή: μία γραμμή = ένα στάδιο" /><button className="secondary-btn" onClick={addBulk}>Μαζική προσθήκη</button></div>}
      <div className="list-box">
        {items.map((item, index) => (
          <div className="list-row" key={`${item}-${index}`}>
            <span>{item}</span>
            <div className="row-actions">
              {allowReorder && <><button title="Πάνω" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp size={16} /></button><button title="Κάτω" onClick={() => move(index, 1)} disabled={index === items.length - 1}><ArrowDown size={16} /></button></>}
              <button title="Διαγραφή" onClick={() => onChange(items.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title, text }) {
  return <section className="detail-card placeholder"><Wrench size={42} /><h2>{title}</h2><p>{text}</p></section>;
}

function StatButton({ label, value, active, onClick }) {
  return <button className={`stat-card stat-button ${active ? "active" : ""}`} onClick={onClick}><p>{label}</p><strong>{value}</strong></button>;
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return <label className="field"><span>{label}</span><input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function Select({ label, value, options, onChange }) {
  return <label className="field"><span>{label}</span><select value={value || ""} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}</select></label>;
}

function TextArea({ label, value, onChange, placeholder = "", tall = false }) {
  return <label className="field"><span>{label}</span><textarea className={tall ? "tall" : ""} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}


function VersionBadge() {
  return (
    <div className="version-badge" title="Τρέχουσα έκδοση εφαρμογής">
      <strong>{APP_VERSION}</strong>
      <span>commit {APP_COMMIT}</span>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
