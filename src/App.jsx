import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  bg: "#0d0d0f", surface: "#16161a", card: "#1e1e24", border: "#2a2a33",
  accent: "#6c63ff", green: "#22d3a5", red: "#ff5f6d", amber: "#f59e0b",
  text: "#e8e8f0", muted: "#6b6b80", zakuan: "#6c63ff", izyan: "#f472b6",
};

const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => `RM ${Number(n || 0).toFixed(2)}`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Tab({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
      background: active ? (color || COLORS.accent) : "transparent",
      color: active ? "#fff" : COLORS.muted, transition: "all 0.2s",
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

function MonthSelector({ year, month, onChange }) {
  function prev() {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  }
  function next() {
    const now = new Date();
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  }
  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <button onClick={prev} style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text,
        borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 16,
      }}>‹</button>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{MONTHS[month]} {year}</div>
      <button onClick={next} style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        color: isCurrentMonth ? COLORS.muted : COLORS.text,
        borderRadius: 8, padding: "6px 14px", cursor: isCurrentMonth ? "default" : "pointer", fontSize: 16,
        opacity: isCurrentMonth ? 0.3 : 1,
      }}>›</button>
    </div>
  );
}

function Dashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dashTab, setDashTab] = useState("expenses");
  const [expenses, setExpenses] = useState([]);
  const [fitness, setFitness] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const monthStr = String(month + 1).padStart(2, "0");
      const start = `${year}-${monthStr}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

      const [exp, fit, gls] = await Promise.all([
        supabase.from("expenses").select("*").gte("date", start).lte("date", end),
        supabase.from("fitness").select("*").gte("date", start).lte("date", end),
        supabase.from("goals").select("*").gte("date", start).lte("date", end),
      ]);
      setExpenses(exp.data || []);
      setFitness(fit.data || []);
      setGoals(gls.data || []);
      setLoading(false);
    }
    load();
  }, [year, month]);

  const zakuanTotal = expenses.filter(e => e.person === "Zakuan").reduce((s, e) => s + Number(e.amount), 0);
  const izyanTotal = expenses.filter(e => e.person === "Izyan").reduce((s, e) => s + Number(e.amount), 0);
  const total = zakuanTotal + izyanTotal;

  const catMap = {};
  expenses.forEach(e => {
    if (!catMap[e.category]) catMap[e.category] = { z: 0, i: 0 };
    if (e.person === "Zakuan") catMap[e.category].z += Number(e.amount);
    else catMap[e.category].i += Number(e.amount);
  });
  const breakdown = Object.entries(catMap).map(([cat, v]) => ({
    cat, z: v.z, i: v.i, combined: v.z + v.i,
    pct: total ? Math.round(((v.z + v.i) / total) * 100) : 0
  })).sort((a, b) => b.combined - a.combined);

  const waterEntries = fitness.filter(f => f.water);
  const avgWater = waterEntries.length ? (waterEntries.reduce((s, f) => s + Number(f.water), 0) / waterEntries.length).toFixed(1) : 0;
  const sleepEntries = fitness.filter(f => f.sleep);
  const avgSleep = sleepEntries.length ? (sleepEntries.reduce((s, f) => s + Number(f.sleep), 0) / sleepEntries.length).toFixed(1) : 0;
  const doneGoals = goals.filter(g => g.done === 1).length;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, letterSpacing: -1 }}>
          {loading ? "—" : fmt(total)}
        </div>
        <div style={{ fontSize: 13, color: COLORS.muted }}>combined spend</div>
      </div>

      <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Card><div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.zakuan }}>{loading ? "—" : fmt(zakuanTotal)}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Zakuan</div>
        </div></Card>
        <Card><div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.izyan }}>{loading ? "—" : fmt(izyanTotal)}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Izyan</div>
        </div></Card>
        <Card><div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.green }}>{loading ? "—" : fitness.length}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Workouts</div>
        </div></Card>
        <Card><div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber }}>{loading ? "—" : `${doneGoals} / ${goals.length}`}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Goals Done</div>
        </div></Card>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <Tab label="Expenses" active={dashTab === "expenses"} onClick={() => setDashTab("expenses")} />
        <Tab label="Fitness" active={dashTab === "fitness"} onClick={() => setDashTab("fitness")} color={COLORS.green} />
        <Tab label="Goals" active={dashTab === "goals"} onClick={() => setDashTab("goals")} color={COLORS.amber} />
      </div>

      {dashTab === "expenses" && (
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Breakdown</div>
          {loading ? <div style={{ color: COLORS.muted, fontSize: 13 }}>Loading…</div> :
            breakdown.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 13 }}>No expenses this month.</div> :
            breakdown.map(b => (
              <div key={b.cat} style={{ marginBottom: 14 }}>
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
      )}

      {dashTab === "fitness" && (
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Fitness Log</div>
          {loading ? <div style={{ color: COLORS.muted, fontSize: 13 }}>Loading…</div> :
            fitness.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 13 }}>No workouts this month.</div> : (
            <>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.green }}>{fitness.length}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Workouts</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber }}>{avgWater}L</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Avg Water</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>{avgSleep}h</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Avg Sleep</div>
                </div>
              </div>
              {fitness.map(f => (
                <div key={f.id} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{f.exercise || "Workout"}</span>
                    <span style={{ fontSize: 12, color: f.person === "Zakuan" ? COLORS.zakuan : COLORS.izyan }}>{f.person}</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                    {f.date}{f.sets ? ` · ${f.sets} sets` : ""}{f.reps ? ` × ${f.reps} reps` : ""}{f.water ? ` · 💧${f.water}L` : ""}{f.sleep ? ` · 😴${f.sleep}h` : ""}
                  </div>
                  {f.notes && <div style={{ fontSize: 12, color: COLORS.muted }}>{f.notes}</div>}
                </div>
              ))}
            </>
          )}
        </Card>
      )}

      {dashTab === "goals" && (
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Goals</div>
          {loading ? <div style={{ color: COLORS.muted, fontSize: 13 }}>Loading…</div> :
            goals.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 13 }}>No goals this month.</div> :
            goals.map(g => (
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{g.goal}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{g.date} · <span style={{ color: g.person === "Zakuan" ? COLORS.zakuan : COLORS.izyan }}>{g.person}</span></div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                  background: g.done === 1 ? COLORS.green + "33" : COLORS.border,
                  color: g.done === 1 ? COLORS.green : COLORS.muted,
                }}>{g.done === 1 ? "✓ Done" : "Pending"}</div>
              </div>
            ))
          }
        </Card>
      )}
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
        background: COLORS.accent, color: "#fff", fontWeight: 800, fontSize: 16, opacity: saving ? 0.6 : 1,
      }}>{saving ? "Saving…" : "Save Expense"}</button>
    </div>
  );
}

function ExpenseHistory() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("expenses").select("*").order("date", { ascending: false }).limit(100)
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
        background: COLORS.green, color: "#0d0d0f", fontWeight: 800, fontSize: 16, opacity: saving ? 0.6 : 1,
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
