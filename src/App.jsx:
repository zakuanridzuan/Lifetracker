import { useState, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://jtjzwclpepofzqoqxviz.supabase.co",
  "sb_publishable_NqLzLXr69pijM5WGWoYtdg_l8PxOO8o"
);

const CATEGORIES = [
  "Food & Drinks","Fuel / Petrol","Touch n Go / Toll","Electric Bill",
  "House Rental","Water Bill","Internet / WiFi","Phone Bill","Groceries",
  "Grab / Transport","Medical / Pharmacy","Insurance","Loan / PTPTN",
  "Clothing","Entertainment","Subscription","Travel","Education",
  "Savings / Investment","Other"
];

const EXERCISES = ["Running","Cycling","Gym","Swimming","Yoga","HIIT","Walking","Football","Badminton","Other"];
const GOALS = ["Save RM500","Exercise 3x/week","Drink 2L water daily","Sleep 8 hours","Read 1 book","Cook at home","No takeaway week","Custom"];

const COLORS = {
  bg: "#0d0d0f",
  surface: "#16161a",
  card: "#1e1e24",
  border: "#2a2a33",
  accent: "#6c63ff",
  accentSoft: "#6c63ff22",
  green: "#22d3a5",
  red: "#ff5f6d",
  amber: "#f59e0b",
  text: "#e8e8f0",
  muted: "#6b6b80",
  zakuan: "#6c63ff",
  izyan: "#f472b6",
};

const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => `RM ${Number(n || 0).toFixed(2)}`;

function Tab({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
      background: active ? (color || COLORS.accent) : "transparent",
      color: active ? "#fff" : COLORS.muted,
      transition: "all 0.2s",
    }}>{label}</button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 16, padding: 20,
      border: `1px solid ${COLORS.border}`, ...style
    }}>{children}</div>
  );
}

function Input({ label, type = "text", value, onChange, options }) {
  const base = {
    width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
    background: COLORS.surface, color: COLORS.text, fontSize: 14, boxSizing: "border-box",
    outline: "none", marginTop: 4,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}>
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={base} />
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: COLORS.green, color: "#0d0d0f", padding: "12px 24px", borderRadius: 99,
      fontWeight: 700, fontSize: 14, zIndex: 999, boxShadow: "0 4px 24px #0006",
    }}>{msg}</div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ monthSpend: 0, zakuan: 0, izyan: 0, workouts: 0, water: 0, goals: 0 });
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

      const [exp, fit, goals] = await Promise.all([
        supabase.from("expenses").select("*").gte("date", monthStart).lte("date", monthEnd),
        supabase.from("fitness").select("*").gte("date", monthStart).lte("date", monthEnd),
        supabase.from("goals").select("*").gte("date", monthStart).lte("date", monthEnd),
      ]);

      const expenses = exp.data || [];
      const zakuan = expenses.filter(e => e.person === "Zakuan").reduce((s, e) => s + Number(e.amount), 0);
      const izyan = expenses.filter(e => e.person === "Izyan").reduce((s, e) => s + Number(e.amount), 0);

      const catMap = {};
      expenses.forEach(e => {
        if (!catMap[e.category]) catMap[e.category] = { z: 0, i: 0 };
        if (e.person === "Zakuan") catMap[e.category].z += Number(e.amount);
        else catMap[e.category].i += Number(e.amount);
      });
      const total = zakuan + izyan;
      const bd = Object.entries(catMap).map(([cat, v]) => ({
        cat, z: v.z, i: v.i, combined: v.z + v.i,
        pct: total ? Math.round(((v.z + v.i) / total) * 100) : 0
      })).sort((a, b) => b.combined - a.combined);

      const fitData = fit.data || [];
      const waterEntries = fitData.filter(f => f.water);
      const avgWater = waterEntries.length ? (waterEntries.reduce((s, f) => s + Number(f.water), 0) / waterEntries.length).toFixed(1) : 0;
      const doneGoals = (goals.data || []).filter(g => g.done === 1).length;

      setStats({ monthSpend: total, zakuan, izyan, workouts: fitData.length, water: avgWater, goals: doneGoals });
      setBreakdown(bd);
      setLoading(false);
    }
    load();
  }, []);

  const month = new Date().toLocaleString("en-MY", { month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1 }}>This Month · {month}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, marginTop: 4, letterSpacing: -1 }}>
          {loading ? "—" : fmt(stats.monthSpend)}
        </div>
        <div style={{ fontSize: 13, color: COLORS.muted }}>combined spend</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Card><Stat label="Zakuan" value={loading ? "—" : fmt(stats.zakuan)} color={COLORS.zakuan} /></Card>
        <Card><Stat label="Izyan" value={loading ? "—" : fmt(stats.izyan)} color={COLORS.izyan} /></Card>
        <Card><Stat label="Workouts" value={loading ? "—" : stats.workouts} color={COLORS.green} /></Card>
        <Card><Stat label="Avg Water" value={loading ? "—" : `${stats.water}L`} color={COLORS.amber} /></Card>
      </div>

      <Card>
        <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Expense Breakdown</div>
        {loading ? <div style={{ color: COLORS.muted, fontSize: 13 }}>Loading…</div> :
          breakdown.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 13 }}>No expenses this month yet.</div> :
          breakdown.map(b => (
            <div key={b.cat} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: COLORS.text }}>{b.cat}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{fmt(b.combined)}</span>
              </div>
              <div style={{ height: 4, background: COLORS.border, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${b.pct}%`, height: "100%", background: COLORS.accent, borderRadius: 99 }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.zakuan }}>Z: {fmt(b.z)}</span>
                <span style={{ fontSize: 11, color: COLORS.izyan }}>I: {fmt(b.i)}</span>
                <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: "auto" }}>{b.pct}%</span>
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

function AddExpense({ onSaved }) {
  const [form, setForm] = useState({ date: today(), person: "", amount: "", category: "", description: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.person || !form.amount || !form.category) return;
    setSaving(true);
    await supabase.from("expenses").insert([{ ...form, amount: Number(form.amount) }]);
    setSaving(false);
    setForm({ date: today(), person: "", amount: "", category: "", description: "" });
    onSaved("Expense saved! 💸");
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 20 }}>Add Expense</div>
      <Input label="Date" type="date" value={form.date} onChange={set("date")} />
      <Input label="Person" value={form.person} onChange={set("person")} options={["Zakuan", "Izyan"]} />
      <Input label="Amount (RM)" type="number" value={form.amount} onChange={set("amount")} />
      <Input label="Category" value={form.category} onChange={set("category")} options={CATEGORIES} />
      <Input label="Description (optional)" value={form.description} onChange={set("description")} />
      <button onClick={save} disabled={saving || !form.person || !form.amount || !form.category} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: COLORS.accent, color: "#fff", fontWeight: 800, fontSize: 16,
        opacity: saving ? 0.6 : 1,
      }}>{saving ? "Saving…" : "Save Expense"}</button>
    </div>
  );
}

function ExpenseHistory() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("expenses").select("*").order("date", { ascending: false }).limit(60)
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? rows : rows.filter(r => r.person === filter);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>History</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "Zakuan", "Izyan"].map(p => (
          <Tab key={p} label={p} active={filter === p} onClick={() => setFilter(p)}
            color={p === "Zakuan" ? COLORS.zakuan : p === "Izyan" ? COLORS.izyan : COLORS.accent} />
        ))}
      </div>
      {loading ? <div style={{ color: COLORS.muted }}>Loading…</div> :
        filtered.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 14 }}>No expenses yet.</div> :
        filtered.map(r => (
          <div key={r.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`,
          }}>
            <div>
              <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{r.category}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>{r.date} · <span style={{ color: r.person === "Zakuan" ? COLORS.zakuan : COLORS.izyan }}>{r.person}</span></div>
              {r.description && <div style={{ fontSize: 12, color: COLORS.muted }}>{r.description}</div>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>{fmt(r.amount)}</div>
          </div>
        ))
      }
    </div>
  );
}

function AddFitness({ onSaved }) {
  const [form, setForm] = useState({ date: today(), person: "", exercise: "", sets: "", reps: "", water: "", sleep: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.person) return;
    setSaving(true);
    await supabase.from("fitness").insert([{
      ...form,
      sets: form.sets ? Number(form.sets) : null,
      reps: form.reps ? Number(form.reps) : null,
      water: form.water ? Number(form.water) : null,
      sleep: form.sleep ? Number(form.sleep) : null,
    }]);
    setSaving(false);
    setForm({ date: today(), person: "", exercise: "", sets: "", reps: "", water: "", sleep: "", notes: "" });
    onSaved("Workout logged! 💪");
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 20 }}>Log Fitness</div>
      <Input label="Date" type="date" value={form.date} onChange={set("date")} />
      <Input label="Person" value={form.person} onChange={set("person")} options={["Zakuan", "Izyan"]} />
      <Input label="Exercise" value={form.exercise} onChange={set("exercise")} options={EXERCISES} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Input label="Sets" type="number" value={form.sets} onChange={set("sets")} />
        <Input label="Reps" type="number" value={form.reps} onChange={set("reps")} />
        <Input label="Water (L)" type="number" value={form.water} onChange={set("water")} />
        <Input label="Sleep (hrs)" type="number" value={form.sleep} onChange={set("sleep")} />
      </div>
      <Input label="Notes" value={form.notes} onChange={set("notes")} />
      <button onClick={save} disabled={saving || !form.person} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: COLORS.green, color: "#0d0d0f", fontWeight: 800, fontSize: 16,
        opacity: saving ? 0.6 : 1,
      }}>{saving ? "Saving…" : "Save Workout"}</button>
    </div>
  );
}

function GoalsTab({ onSaved }) {
  const [form, setForm] = useState({ date: today(), person: "", goal: "", done: 0 });
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.from("goals").select("*").order("date", { ascending: false }).limit(30)
      .then(({ data }) => setRows(data || []));
  }, [saving]);

  async function save() {
    if (!form.person || !form.goal) return;
    setSaving(true);
    await supabase.from("goals").insert([{ ...form, done: Number(form.done) }]);
    setSaving(false);
    setForm({ date: today(), person: "", goal: "", done: 0 });
    onSaved("Goal saved! 🎯");
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 20 }}>Goals</div>
      <Input label="Date" type="date" value={form.date} onChange={set("date")} />
      <Input label="Person" value={form.person} onChange={set("person")} options={["Zakuan", "Izyan"]} />
      <Input label="Goal" value={form.goal} onChange={set("goal")} options={GOALS} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: COLORS.muted }}>Completed?</label>
        <button onClick={() => set("done")(form.done === 1 ? 0 : 1)} style={{
          padding: "6px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
          background: form.done === 1 ? COLORS.green : COLORS.border,
          color: form.done === 1 ? "#0d0d0f" : COLORS.muted,
        }}>{form.done === 1 ? "✓ Yes" : "Not yet"}</button>
      </div>
      <button onClick={save} disabled={saving || !form.person || !form.goal} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: COLORS.amber, color: "#0d0d0f", fontWeight: 800, fontSize: 16,
        opacity: saving ? 0.6 : 1, marginBottom: 24,
      }}>{saving ? "Saving…" : "Save Goal"}</button>

      {rows.map(r => (
        <div key={r.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <div>
            <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{r.goal}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>{r.date} · <span style={{ color: r.person === "Zakuan" ? COLORS.zakuan : COLORS.izyan }}>{r.person}</span></div>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
            background: r.done === 1 ? COLORS.green + "33" : COLORS.border,
            color: r.done === 1 ? COLORS.green : COLORS.muted,
          }}>{r.done === 1 ? "✓ Done" : "Pending"}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [subTab, setSubTab] = useState("add");
  const [toast, setToast] = useState(null);

  const NAV = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "expenses", icon: "₿", label: "Expenses" },
    { id: "fitness", icon: "◉", label: "Fitness" },
    { id: "goals", icon: "◎", label: "Goals" },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 430, margin: "0 auto", paddingBottom: 80 }}>
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase" }}>Life Tracker</div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
            <span style={{ color: COLORS.zakuan }}>Zakuan</span>
            <span style={{ color: COLORS.muted }}> & </span>
            <span style={{ color: COLORS.izyan }}>Izyan</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.muted, textAlign: "right", paddingTop: 4 }}>
          {new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {tab === "expenses" && (
        <div style={{ display: "flex", gap: 6, padding: "16px 20px 0" }}>
          <Tab label="Add" active={subTab === "add"} onClick={() => setSubTab("add")} />
          <Tab label="History" active={subTab === "history"} onClick={() => setSubTab("history")} />
        </div>
      )}

      <div style={{ padding: "20px 20px 0" }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "expenses" && subTab === "add" && <AddExpense onSaved={setToast} />}
        {tab === "expenses" && subTab === "history" && <ExpenseHistory />}
        {tab === "fitness" && <AddFitness onSaved={setToast} />}
        {tab === "goals" && <GoalsTab onSaved={setToast} />}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 100,
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setTab(n.id); setSubTab("add"); }} style={{
            flex: 1, padding: "12px 0", border: "none", cursor: "pointer", background: "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: tab === n.id ? COLORS.accent : COLORS.muted, transition: "color 0.2s",
          }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>{n.label}</span>
          </button>
        ))}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
