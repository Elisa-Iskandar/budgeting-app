import { useState } from "react";

type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
};

const CATEGORIES = ["Food", "Transport", "Housing", "Health", "Entertainment", "Shopping", "Other"];

const initialExpenses: Expense[] = [
  { id: 1, title: "Grocery Run", category: "Food", amount: 54.2, date: "2026-03-10" },
  { id: 2, title: "Uber to work", category: "Transport", amount: 12.5, date: "2026-03-09" },
  { id: 3, title: "Netflix", category: "Entertainment", amount: 15.99, date: "2026-03-08" },
  { id: 4, title: "Electricity bill", category: "Housing", amount: 87.0, date: "2026-03-07" },
  { id: 5, title: "Gym membership", category: "Health", amount: 40.0, date: "2026-03-06" },
];

export default function History() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({ ...expense });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    setExpenses((prev) => prev.map((e) => (e.id === editForm.id ? editForm : e)));
    setEditingId(null);
    setEditForm(null);
  };

  const deleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirmId(null);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryColours: Record<string, string> = {
    Food: "#f59e0b",
    Transport: "#3b82f6",
    Housing: "#8b5cf6",
    Health: "#10b981",
    Entertainment: "#ec4899",
    Shopping: "#f97316",
    Other: "#6b7280",
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Expense History</h1>
          <p style={styles.subtitle}>{expenses.length} transactions recorded</p>
        </div>
        <div style={styles.totalBadge}>
          <span style={styles.totalLabel}>Total Spent</span>
          <span style={styles.totalAmount}>£{total.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.list}>
        {expenses.length === 0 && (
          <div style={styles.empty}>No expenses yet. Add some to get started.</div>
        )}

        {expenses.map((expense) => (
          <div key={expense.id} style={styles.card}>
            {editingId === expense.id && editForm ? (
              <div style={styles.editForm}>
                <div style={styles.editRow}>
                  <label style={styles.label}>Title</label>
                  <input
                    style={styles.input}
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div style={styles.editRow}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.input}
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.editRow}>
                  <label style={styles.label}>Amount (£)</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div style={styles.editRow}>
                  <label style={styles.label}>Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div style={styles.editActions}>
                  <button style={styles.saveBtn} onClick={saveEdit}>Save</button>
                  <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={styles.cardInner}>
                <div style={styles.cardLeft}>
                  <span
                    style={{
                      ...styles.categoryDot,
                      background: categoryColours[expense.category] ?? "#6b7280",
                    }}
                  />
                  <div>
                    <p style={styles.expenseTitle}>{expense.title}</p>
                    <p style={styles.expenseMeta}>
                      {expense.category} · {expense.date}
                    </p>
                  </div>
                </div>

                <div style={styles.cardRight}>
                  <span style={styles.amount}>£{expense.amount.toFixed(2)}</span>
                  <button style={styles.editBtn} onClick={() => startEdit(expense)}>Edit</button>
                  {deleteConfirmId === expense.id ? (
                    <div style={styles.confirmRow}>
                      <span style={styles.confirmText}>Delete?</span>
                      <button style={styles.confirmYes} onClick={() => deleteExpense(expense.id)}>Yes</button>
                      <button style={styles.cancelBtn} onClick={() => setDeleteConfirmId(null)}>No</button>
                    </div>
                  ) : (
                    <button style={styles.deleteBtn} onClick={() => setDeleteConfirmId(expense.id)}>Delete</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
    padding: "2rem",
    maxWidth: 760,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: { fontSize: "1.8rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
  subtitle: { color: "#94a3b8", margin: "0.25rem 0 0", fontSize: "0.9rem" },
  totalBadge: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "0.75rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  totalLabel: { fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  totalAmount: { fontSize: "1.4rem", fontWeight: 700, color: "#34d399" },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1rem 1.25rem" },
  cardInner: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" },
  cardLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
  categoryDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  expenseTitle: { margin: 0, fontWeight: 600, fontSize: "0.95rem" },
  expenseMeta: { margin: "0.15rem 0 0", fontSize: "0.78rem", color: "#94a3b8" },
  cardRight: { display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" },
  amount: { fontWeight: 700, fontSize: "1rem", color: "#f8fafc", marginRight: "0.5rem" },
  editBtn: { background: "#334155", border: "none", borderRadius: 7, color: "#cbd5e1", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 500 },
  deleteBtn: { background: "transparent", border: "1px solid #ef4444", borderRadius: 7, color: "#ef4444", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 500 },
  confirmRow: { display: "flex", alignItems: "center", gap: "0.4rem" },
  confirmText: { fontSize: "0.82rem", color: "#f87171" },
  confirmYes: { background: "#ef4444", border: "none", borderRadius: 7, color: "#fff", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 },
  editForm: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  editRow: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  label: { minWidth: 90, fontSize: "0.82rem", color: "#94a3b8", fontWeight: 500 },
  input: { flex: 1, background: "#0f172a", border: "1px solid #475569", borderRadius: 8, color: "#f1f5f9", padding: "0.4rem 0.75rem", fontSize: "0.9rem", minWidth: 140 },
  editActions: { display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "0.25rem" },
  saveBtn: { background: "#34d399", border: "none", borderRadius: 8, color: "#0f172a", padding: "0.4rem 1.1rem", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem" },
  cancelBtn: { background: "#334155", border: "none", borderRadius: 8, color: "#cbd5e1", padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.88rem" },
  empty: { textAlign: "center", color: "#475569", padding: "3rem 0", fontSize: "0.95rem" },
};