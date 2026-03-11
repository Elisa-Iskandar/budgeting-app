import { useEffect, useState } from 'react';
import { getBudget, setBudget } from '@/db/database';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';


export default function Settings() {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const b = await getBudget();
        if (!mounted) return;
        setValue(b?.monthlyLimit != null ? String(b.monthlyLimit) : '');
      } catch (err) {
        console.error('Failed to load budget', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setMessage(null);
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
      setMessage('Please enter a valid non-negative number');
      return;
    }
    setSaving(true);
    try {
      await setBudget(parsed);
      setMessage('Monthly budget saved');
    } catch (err) {
      console.error('Failed to save budget', err);
      setMessage('Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      <div className="space-y-2">
        <Label htmlFor="monthly-budget">Monthly budget</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="monthly-budget"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Enter monthly budget"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading || saving}
            className="flex-1"
          />
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        {message && (
          <div className="text-sm mt-2 text-muted-foreground">{message}</div>
        )}
      </div>
    </div>
  );
}