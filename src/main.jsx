
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hammer,
  Home,
  Layers,
  MapPin,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  Wrench
} from "lucide-react";
import "./style.css";

const STORAGE_KEY = "ergotaxiako_app_v5";

const defaultSettings = {
  statuses: ["σε εξέλιξη", "επείγον", "αναμονή", "ολοκληρωμένο"],
  stages: [
    "αποξηλώσεις",
    "αποξήλωση μαρμάρων",
    "αποκομιδή μπάζων",
    "προσωρινά κουφώματα",
    "εργοταξιακή λεκάνη",
    "θέση λέβητα αερίου",
    "μπούρι απορροφητήρα",
    "οπές κλιματιστικών",
    "χτίσιμο",
    "ξύσιμο τοιχοποιίας",
    "επιχρίσματα α",
    "κιγκλιδώματα",
    "ηλεκτρολόγος",
    "επιχρίσματα β",
    "σπατουλάρισμα",
    "γυψοσανίδες",
    "καλωδίωση",
    "υδραυλικός",
    "απορροή κλιματιστικών",
    "γκρο μπετά",
    "επιχρίσματα γ",
    "πλακάκια δαπέδου",
    "πλακάκια μπάνιου",
    "κατωκασιά",
    "μαρμαροποδιές",
    "γυψοσανίδες β",
    "βάψιμο 1ο",
    "καθαριότητα (α)",
    "εξ. κουφώματα",
    "κουζίνα",
    "ντουλάπες",
    "εσ. κουφώματα",
    "είδη υγιεινής",
    "καμπίνα ντουζιέρας",
    "θερμαντικά σώματα",
    "διακόπτες",
    "φωτιστικά",
    "τελικό βάψιμο",
    "ηλεκτρικές συσκευές",
    "κλιματιστικό",
    "τέντα",
    "επίπλωση",
    "διακόσμηση",
    "λέβητας αερίου",
    "φυσικό αέριο",
    "ολοκλήρωση έργου",
    "παράδοση έργου"
  ],
  crews: ["ηλεκτρολόγος", "υδραυλικός", "πλακάς", "ελαιοχρωματιστής"]
};

const defaultProjects = [
  {
    id: 1,
    name: "Λύτρα 5",
    address: "Θεσσαλονίκη",
    stage: "ηλεκτρολογικά",
    deliveryDate: "2026-05-20",
    status: "σε εξέλιξη",
    crew: "ηλεκτρολόγος",
    notes: "Ανακαίνιση διαμερίσματος. Εκκρεμεί τελικός έλεγχος παροχών.",
    specs: "Τεχνικές προδιαγραφές έργου: παροχές, θέσεις, ύψη, ειδικές παρατηρήσεις."
  },
  {
    id: 2,
    name: "Μπάνιο - Βούλγαρη",
    address: "Περιοχή Βούλγαρη",
    stage: "πλακάκια μπάνιου",
    deliveryDate: "2026-05-10",
    status: "επείγον",
    crew: "πλακάς",
    notes: "Να επιβεβαιωθεί διαθεσιμότητα υλικών και πρόγραμμα πλακά.",
    specs: "Να σημειωθούν οι τελικές επιλογές πλακιδίων, ειδών υγιεινής και καμπίνας."
  },
  {
    id: 3,
    name: "Κουζίνα - Τεχνικές προδιαγραφές",
    address: "Θεσσαλονίκη",
    stage: "κουζίνα",
    deliveryDate: "2026-06-01",
    status: "αναμονή",
    crew: "",
    notes: "Χρειάζεται τελική λίστα παροχών και επαγγελματιών.",
    specs: "Παροχές κουζίνας, ύψη πριζών, θέση απορροφητήρα, συσκευές."
  }
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: defaultProjects, settings: defaultSettings };
    const parsed = JSON.parse(raw);
    return {
      projects: parsed.projects?.length ? parsed.projects : defaultProjects,
      settings: {
        statuses: parsed.settings?.statuses?.length ? parsed.settings.statuses : defaultSettings.statuses,
        stages: parsed.settings?.stages?.length ? parsed.settings.stages : defaultSettings.stages,
        crews: parsed.settings?.crews?.length ? parsed.settings.crews : defaultSettings.crews
      }
    };
  } catch {
    return { projects: defaultProjects, settings: defaultSettings };
  }
}

const statusClass = {
  "σε εξέλιξη": "status blue",
  "επείγον": "status red",
  "αναμονή": "status yellow",
  "ολοκληρωμένο": "status green"
};

function App() {
  const initial = loadState();
  const [projects, setProjects] = useState(initial.projects);
  const [settings, setSettings] = useState(initial.settings);
  const [view, setView] = useState({ type: "home" });
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, settings }));
  }, [projects, settings]);

  const selectedProject = projects.find((p) => p.id === view.projectId);

  function addProject(project) {
    const next = { ...project, id: Date.now(), specs: project.specs || "" };
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
    return (
      <ProjectPage
        project={selectedProject}
        settings={settings}
        tab={view.tab || "general"}
        onBack={() => setView({ type: "home" })}
        onTab={(tab) => setView({ type: "project", projectId: selectedProject.id, tab })}
        onUpdate={(patch) => updateProject(selectedProject.id, patch)}
        onDelete={() => deleteProject(selectedProject.id)}
      />
    );
  }

  if (view.type === "settings") {
    return (
      <SettingsPage
        settings={settings}
        setSettings={setSettings}
        onBack={() => setView({ type: "home" })}
      />
    );
  }

  return (
    <HomePage
      projects={projects}
      settings={settings}
      query={query}
      setQuery={setQuery}
      onAdd={addProject}
      onOpen={(projectId) => setView({ type: "project", projectId, tab: "general" })}
      onSettings={() => setView({ type: "settings" })}
    />
  );
}

function HomePage({ projects, settings, query, setQuery, onAdd, onOpen, onSettings }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    stage: settings.stages[0] || "",
    deliveryDate: "",
    status: settings.statuses[0] || "σε εξέλιξη",
    crew: "",
    notes: "",
    specs: ""
  });

  useEffect(() => {
    setForm((f) => ({
      ...f,
      stage: f.stage || settings.stages[0] || "",
      status: f.status || settings.statuses[0] || "σε εξέλιξη"
    }));
  }, [settings]);

  const filtered = projects.filter((p) =>
    `${p.name} ${p.address} ${p.stage} ${p.status} ${p.crew}`.toLowerCase().includes(query.toLowerCase())
  );

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "σε εξέλιξη").length,
    urgent: projects.filter((p) => p.status === "επείγον").length,
    waiting: projects.filter((p) => p.status === "αναμονή").length
  };

  function submit() {
    if (!form.name.trim()) return;
    onAdd({
      ...form,
      name: form.name.trim(),
      deliveryDate: form.deliveryDate || "δεν ορίστηκε"
    });
    setForm({
      name: "",
      address: "",
      stage: settings.stages[0] || "",
      deliveryDate: "",
      status: settings.statuses[0] || "σε εξέλιξη",
      crew: "",
      notes: "",
      specs: ""
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Εργοταξιακό App v5</p>
          <h1>Έργα</h1>
          <p className="subtitle">Κεντρικό dashboard έργων. Πάτησε σε ένα έργο για να μπεις στη σελίδα διαχείρισής του.</p>
        </div>
        <button className="secondary-btn" onClick={onSettings}><Settings size={18} /> Διαχείριση</button>
      </header>

      <section className="stats-grid">
        <Stat label="σε εξέλιξη" value={stats.active} />
        <Stat label="επείγοντα" value={stats.urgent} />
        <Stat label="σε αναμονή" value={stats.waiting} />
        <Stat label="όλα τα έργα" value={stats.total} />
      </section>

      <main className="home-grid">
        <section className="projects-area">
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="αναζήτηση έργου, διεύθυνσης, σταδίου..." />
          </div>

          <div className="project-grid">
            {filtered.map((project) => (
              <button className="project-card" key={project.id} onClick={() => onOpen(project.id)}>
                <div className="card-head">
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.stage || "χωρίς στάδιο"}</p>
                  </div>
                  <Building2 size={22} />
                </div>
                <div className="mini-info"><MapPin size={15} /> {project.address || "χωρίς διεύθυνση"}</div>
                <div className="mini-info"><CalendarDays size={15} /> Παράδοση: {project.deliveryDate}</div>
                {project.crew && <div className="mini-info"><Users size={15} /> {project.crew}</div>}
                <span className={statusClass[project.status] || "status"}>{project.status}</span>
              </button>
            ))}
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
          <TextArea label="Σημειώσεις" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="σύντομες παρατηρήσεις..." />
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
    { id: "materials", label: "Υλικά", icon: Package }
  ];

  return (
    <div className="project-layout">
      <aside className="sidebar">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Πίσω στα έργα</button>
        <div className="project-title">
          <Building2 size={28} />
          <div>
            <h2>{project.name}</h2>
            <p>{project.address || "χωρίς διεύθυνση"}</p>
          </div>
        </div>

        <div className="sidebar-meta">
          <span className={statusClass[project.status] || "status"}>{project.status}</span>
          <p><Hammer size={15} /> {project.stage || "χωρίς στάδιο"}</p>
          <p><CalendarDays size={15} /> {project.deliveryDate}</p>
          {project.crew && <p><Users size={15} /> {project.crew}</p>}
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
          <div>
            <p className="eyebrow">Σελίδα έργου</p>
            <h1>{project.name}</h1>
            <p className="subtitle">Επαγγελματική δομή με sidebar και καρτέλες για να προσθέτουμε σταδιακά όλες τις λειτουργίες.</p>
          </div>
          <button className="danger-btn" onClick={onDelete}><Trash2 size={18} /> Διαγραφή έργου</button>
        </div>

        {tab === "general" && (
          <section className="detail-card">
            <h2>Γενικά στοιχεία</h2>
            <div className="two-col">
              <Field label="Όνομα έργου" value={project.name} onChange={(v) => onUpdate({ name: v })} />
              <Field label="Διεύθυνση" value={project.address} onChange={(v) => onUpdate({ address: v })} />
              <Select label="Στάδιο" value={project.stage} options={settings.stages} onChange={(v) => onUpdate({ stage: v })} />
              <Select label="Κατάσταση" value={project.status} options={settings.statuses} onChange={(v) => onUpdate({ status: v })} />
              <Field label="Ημερομηνία παράδοσης" type="date" value={project.deliveryDate === "δεν ορίστηκε" ? "" : project.deliveryDate} onChange={(v) => onUpdate({ deliveryDate: v })} />
              <Select label="Συνεργείο" value={project.crew || ""} options={["", ...settings.crews]} onChange={(v) => onUpdate({ crew: v })} />
            </div>
            <TextArea label="Σημειώσεις" value={project.notes || ""} onChange={(v) => onUpdate({ notes: v })} />
            <TextArea label="Τεχνικές προδιαγραφές" value={project.specs || ""} onChange={(v) => onUpdate({ specs: v })} placeholder="μόνιμες τεχνικές πληροφορίες που πρέπει να θυμάμαι για όλη τη διάρκεια του έργου..." tall />
          </section>
        )}

        {tab === "daily" && <Placeholder title="Ημερολόγιο εργοταξίου" text="Εδώ θα προσθέσουμε ημερήσιες καταγραφές: τι έγινε σήμερα, ποιο συνεργείο δούλεψε, φωτογραφίες και παρατηρήσεις." />}
        {tab === "tasks" && <Placeholder title="Εκκρεμότητες" text="Εδώ θα προσθέσουμε λίστα εργασιών, προτεραιότητα, υπεύθυνο και κατάσταση ολοκλήρωσης." />}
        {tab === "stages" && (
          <section className="detail-card">
            <h2>Στάδια εργασιών</h2>
            <p className="subtitle">Προς το παρόν εμφανίζονται τα διαθέσιμα στάδια από τη Διαχείριση. Στο επόμενο βήμα μπορούν να γίνουν checklist ανά έργο.</p>
            <div className="pill-grid">
              {settings.stages.map((s) => <span className="pill" key={s}>{s}</span>)}
            </div>
          </section>
        )}
        {tab === "materials" && <Placeholder title="Υλικά" text="Εδώ θα προσθέσουμε παραγγελίες, προμηθευτές, ποσότητες, κόστος και κατάσταση παράδοσης." />}
      </main>
    </div>
  );
}

function SettingsPage({ settings, setSettings, onBack }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Διαχείριση</p>
          <h1>Ρυθμίσεις εφαρμογής</h1>
          <p className="subtitle">Πρόσθεσε καταστάσεις, στάδια εργασιών και συνεργεία.</p>
        </div>
        <button className="secondary-btn" onClick={onBack}><Home size={18} /> Πίσω</button>
      </header>

      <section className="settings-grid">
        <ManageList title="Καταστάσεις έργου" items={settings.statuses} onChange={(items) => setSettings({ ...settings, statuses: items })} />
        <ManageList title="Στάδια εργασιών" items={settings.stages} onChange={(items) => setSettings({ ...settings, stages: items })} allowBulk />
        <ManageList title="Συνεργεία" items={settings.crews} onChange={(items) => setSettings({ ...settings, crews: items })} />
      </section>
    </div>
  );
}

function ManageList({ title, items, onChange, allowBulk }) {
  const [value, setValue] = useState("");
  const [bulk, setBulk] = useState("");

  function addOne() {
    const clean = value.trim();
    if (!clean) return;
    if (!items.includes(clean)) onChange([...items, clean]);
    setValue("");
  }

  function addBulk() {
    const next = bulk.split("\n").map((x) => x.trim()).filter(Boolean);
    const merged = Array.from(new Set([...items, ...next]));
    onChange(merged);
    setBulk("");
  }

  return (
    <div className="detail-card">
      <h2>{title}</h2>
      <div className="inline-add">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="νέα τιμή..." />
        <button className="primary-btn compact" onClick={addOne}>Προσθήκη</button>
      </div>
      {allowBulk && (
        <div className="bulk-box">
          <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="μαζική εισαγωγή: μία γραμμή = ένα στάδιο" />
          <button className="secondary-btn" onClick={addBulk}>Μαζική προσθήκη</button>
        </div>
      )}
      <div className="list-box">
        {items.map((item) => (
          <div className="list-row" key={item}>
            <span>{item}</span>
            <button onClick={() => onChange(items.filter((x) => x !== item))}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title, text }) {
  return (
    <section className="detail-card placeholder">
      <Wrench size={42} />
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "", tall = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea className={tall ? "tall" : ""} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
