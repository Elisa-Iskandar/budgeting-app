import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { addExpense, getAllCategories, seedDefaultCategories } from '../db/database';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddExpense() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      await seedDefaultCategories();
      const cats = await getAllCategories();
      setCategories(cats);
    };
    loadCategories();

    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!date) {
      setError('Please select a date');
      return;
    }

    await addExpense({
      amount: Number(amount),
      category,
      date,
      note: note.trim() || undefined,
    });

    setAmount('');
    setCategory('');
    setNote('');
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setSuccess(true);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white">
      <h2 className="text-center text-2xl font-normal mb-10">Expense Form</h2>

      {/* Date */}
      <div className="flex items-center gap-6 mb-7">
        <Label className="w-24 text-base">Date</Label>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Amount */}
      <div className="flex items-center gap-6 mb-7">
        <Label className="w-24 text-base">Amount:</Label>
        <div className="flex-1 flex items-center border rounded-md px-3 py-1">
          <span className="text-muted-foreground mr-2">£</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 p-0"
          />
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center gap-6 mb-7">
        <Label className="w-24 text-base">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Note */}
      <div className="flex items-start gap-6 mb-9">
        <Label className="w-24 text-base pt-2">Note:</Label>
        <Textarea
          placeholder="Add any additional details (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={5}
          className="flex-1"
        />
      </div>

      {/* Error / Success */}
      {error && <p className="text-red-500 text-center mb-3">{error}</p>}
      {success && <p className="text-green-500 text-center mb-3">Expense saved!</p>}

      {/* Submit */}
      <div className="text-center">
        <Button onClick={handleSubmit}>Save Expense</Button>
      </div>
    </div>
  );
}