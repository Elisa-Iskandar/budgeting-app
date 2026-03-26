import { useEffect, useState, useCallback } from 'react';
import { calculateMonthlyTotal, getBudget, getExpensesByMonth, getStreak } from '@/db/database';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Expense } from '../types';



type ChartEntry = { day: number; amount: number };

function buildChartData(expenses: Expense[], year: number, month: number): ChartEntry[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const totals: Record<number, number> = {};
  for (const e of expenses) {
    const day = new Date(e.date).getDate();
    totals[day] = (totals[day] ?? 0) + e.amount;
  }
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: totals[i + 1] ?? 0,
  }));
}

export default function Dashboard() {
  const [spent, setSpent] = useState<number>(0);
  const [budget, setBudgetState] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartEntry[]>([]);
  const [streak, setStreak] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const total = await calculateMonthlyTotal(year, month);
      const b = await getBudget();
      const expenses = await getExpensesByMonth(year, month);
      const s = await getStreak();
      setSpent(total);
      setBudgetState(b?.monthlyLimit ?? null);
      setChartData(buildChartData(expenses, year, month));
      setStreak(s?.currentStreak ?? 0);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchData();
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const currency = (n: number) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'GBP' }).format(n);
    } catch {
      return `£${n.toFixed(2)}`;
    }
  };

  const percent = budget && budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const barWidth = Math.max(0, Math.min(percent, 100));

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Total Spent</p>
          <p className="text-2xl font-semibold">{currency(spent)}</p>
        </div>
        <div className="rounded-2xl border p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Remaining Budget</p>
          <p className="text-2xl font-semibold">{budget != null ? currency(budget - spent) : '—'}</p>
        </div>
        <div className="rounded-2xl border p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Streak</p>
          <p className="text-2xl font-semibold">{streak} days</p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Spending Overview</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'amount']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Monthly spending</h2>

        {budget == null ? (
          <div className="rounded-md border border-dashed border-gray-300 p-4">
            <p className="text-sm">No monthly budget set. Go to Settings to add one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-sm text-muted-foreground">
                {currency(spent)} spent of {currency(budget)}
              </div>
              <div className="text-sm font-medium">
                {percent}%
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
              <div
                className={`h-4 transition-all duration-300 ${percent > 80 ? 'bg-red-500' : percent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${barWidth}%` }}
                aria-hidden
              />
            </div>

            {percent > 100 && (
              <div className="text-sm text-red-600">You are over budget by {currency(spent - budget)}</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}