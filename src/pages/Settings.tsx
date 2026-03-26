import { useEffect, useState, useRef } from 'react';
import { getBudget, setBudget, deleteAllData, getAllExpenses, addExpense } from '@/db/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [exported, setExported] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);
  const [imported, setImported] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [alertThreshold, setAlertThreshold] = useState<number>(75);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const b = await getBudget();
        if (!mounted) return;
        setValue(b?.monthlyLimit != null ? String(b.monthlyLimit) : '');
        const storedThreshold = localStorage.getItem('alertThreshold');
        const storedNotifications = localStorage.getItem('notificationsEnabled');
        if (storedThreshold) setAlertThreshold(Number(storedThreshold));
        if (storedNotifications) setNotificationsEnabled(storedNotifications === 'true');
      } catch (err) {
        console.error('Failed to load budget', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
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

  const handleDeleteAllData = async () => {
    setError('');
    setSuccess(false);
    setIsDeleting(true);
    try {
      await deleteAllData();
      setSuccess(true);
      setShowDeleteConfirmation(false);
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (err) {
      setError('Failed to delete data. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };


  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const snapped = Math.round(Number(e.target.value) / 5) * 5;
    setAlertThreshold(snapped);
    localStorage.setItem('alertThreshold', snapped.toString());
  };

  const handleToggleNotifications = async () => {
    const next = !notificationsEnabled;
    if (next && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }
    setNotificationsEnabled(next);
    localStorage.setItem('notificationsEnabled', next.toString());
  };

  const exportCSV = async () => {
    setExporting(true);
    setExported(false);
    setExportError('');
    try {
      const expenses = await getAllExpenses();
      const header = "id,amount,category,date,note";
      const rows = expenses.map(e => `${e.id},${e.amount},${e.category},${e.date},"${e.note ?? ""}"`);
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expense.csv";
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error('Exporting failed', err);
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImported(false);
    setImportError('');
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const rows = lines.slice(1);
      for (const row of rows) {
        const [, amount, category, date, note] = row.split(",");
        await addExpense({
          amount: parseFloat(amount),
          category,
          date,
          note: note?.replace(/"/g, "") || undefined,
        });
      }
      setImported(true);
      setTimeout(() => setImported(false), 3000);
    } catch (err) {
      console.error('Importing failed', err);
      setImportError('Import failed. Check your CSV format and try again.');
    } finally {
      setImporting(false);
    }
  };


  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {/* Monthly budget */}
      <div className="space-y-2 mb-10">
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
        {message && <div className="text-sm mt-2 text-muted-foreground">{message}</div>}
      </div>

      {/* Alert Threshold */}
      <div className="rounded-2xl border shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-medium">Alert Threshold</Label>
          <span className="text-sm font-semibold text-blue-500">{alertThreshold}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={alertThreshold}
          onChange={handleThresholdChange}
          className="w-full accent-blue-500 mb-2"
        />
        <div className="flex justify-between text-xs text-gray-400 px-0.5">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          You will be notified when your spending reaches {alertThreshold}% of your monthly budget.
        </p>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium block">Notifications</Label>
            <p className="text-sm text-gray-400 mt-1">
              {notificationsEnabled ? 'Notifications are on' : 'Notifications are off'}
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>

      {/* Data management */}
      <div className="rounded-2xl border shadow-sm p-6">
        <Label className="text-base font-medium block mb-1">Data Management</Label>
        <p className="text-sm text-gray-400 mb-4">Export your expense history or delete all stored data.</p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={exportCSV} disabled={exporting} className="bg-green-500 hover:bg-green-600 text-white">
            {exporting ? 'Exporting...' : 'Save Data'}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={importing} className="bg-blue-500 hover:bg-blue-600 text-white">
            {importing ? 'Importing...' : 'Import Data'}
          </Button>
          <Button onClick={() => setShowDeleteConfirmation(true)} className="bg-red-500 hover:bg-red-600 text-white">
            Delete All Data
          </Button>
        </div>
        {exported && <p className="text-green-500 text-sm mt-3">Data exported successfully</p>}
        {exportError && <p className="text-red-500 text-sm mt-3">{exportError}</p>}
        {imported && <p className="text-green-500 text-sm mt-3">Data imported successfully</p>}
        {importError && <p className="text-red-500 text-sm mt-3">{importError}</p>}
        {success && <p className="text-green-500 text-sm mt-3">✓ Data deleted successfully. Reloading...</p>}
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {showDeleteConfirmation && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600 mb-3">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={handleDeleteAllData} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </Button>
              <Button onClick={() => { setShowDeleteConfirmation(false); setError(''); }} disabled={isDeleting} className="bg-gray-400 hover:bg-gray-500 text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} />
    </div>
  );
}