import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { calculateMonthlyTotal, getBudget } from '@/db/database';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [spent, setSpent] = useState<number>(0);
  const [budget, setBudgetState] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // months are 1-based in helper
      const total = await calculateMonthlyTotal(year, month);
      const b = await getBudget();
      setSpent(total);
      setBudgetState(b?.monthlyLimit ?? null);
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Monthly spending</h2>

        {budget == null ? (
          <div className="rounded-md border border-dashed border-gray-300 p-4">
            <p className="mb-2">No monthly budget set.</p>
            <Link to="/settings" className="text-sm text-primary underline">Set a monthly budget in Settings</Link>
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