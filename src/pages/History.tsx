import { useEffect, useState } from 'react';
import type { Expense } from '../types';
import { getAllExpenses, deleteExpense, updateExpense, getAllCategories, seedDefaultCategories } from '../db/database';
import type { Category } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Check, X } from 'lucide-react';

export default function History() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

  const load = async () => {
    const all = await getAllExpenses();
    // most recent first
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(all);
    await seedDefaultCategories();
    const cats = await getAllCategories();
    const filtered = cats.filter(c => c.name !== 'Other');
    setCategories(filtered);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id!);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDate(expense.date);
    setEditNote(expense.note ?? '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (expense: Expense) => {
    await updateExpense({
      ...expense,
      amount: Number(editAmount),
      category: editCategory,
      date: editDate,
      note: editNote.trim() || undefined,
    });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8">
      <h2 className="text-2xl font-normal text-center mb-8">History</h2>

      {expenses.length === 0 && (
        <p className="text-center text-gray-400">No expenses logged yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {expenses.map(expense => (
          <div key={expense.id} className="rounded-2xl border shadow-sm p-4">

            {editingId === expense.id ? (
              // ── EDIT MODE ──
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center border rounded-md px-3 flex-1">
                    <span className="text-gray-400 mr-1 text-sm">£</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 p-0"
                    />
                  </div>
                </div>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Note (optional)"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" onClick={() => saveEdit(expense)}>
                    <Check className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // ── VIEW MODE ──
              <div className="flex items-center gap-3">
                {/* Edit button */}
                <button
                  onClick={() => startEdit(expense)}
                  className="text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Date and category */}
                <div className="flex-1">
                  <p className="text-sm font-medium">{expense.date}</p>
                  <p className="text-xs text-gray-400">{expense.category}</p>
                </div>

                {/* Amount */}
                <p className="text-sm font-semibold">£{expense.amount.toFixed(2)}</p>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(expense.id!)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
