import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Expense, Budget, Category, Streak } from '../types';

interface BudgetingDB extends DBSchema {
  expenses: {
    key: number;
    value: Expense;
  };
  budget: {
    key: number;
    value: Budget;
  };
  categories: {
    key: string;
    value: Category;
  };
  streak: {
    key: number;
    value: Streak;
  };
}

const DB_NAME = 'budgeting-app';
const DB_VERSION = 2;

export const initDB = () => {
  return openDB<BudgetingDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('budget')) {
        db.createObjectStore('budget', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('streak')) {
        db.createObjectStore('streak', { keyPath: 'id' });
      }
    }
  });
};

//expense functions

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<void> => {
  const db = await initDB();
  await db.add('expenses', expense as Expense);
};

export const getAllExpenses = async (): Promise<Expense[]> => {
  const db = await initDB();
  return db.getAll('expenses');
};

export const getExpensesByMonth = async (year: number, month: number): Promise<Expense[]> => {
  const all = await getAllExpenses();
  return all.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
};

export const updateExpense = async (expense: Expense): Promise<void> => {
  const db = await initDB();
  await db.put('expenses', expense);
};

export const deleteExpense = async (id: number): Promise<void> => {
  const db = await initDB();
  return db.delete('expenses', id);
};


//budget functions

export const getBudget = async (): Promise<Budget | undefined> => {
  const db = await initDB();
  return db.get('budget', 1);
};

export const setBudget = async (monthlyLimit: number): Promise<void> => {
  const db = await initDB();
  await db.put('budget', { id: 1, monthlyLimit });
};


//category functions

export const getAllCategories = async (): Promise<Category[]> => {
  const db = await initDB();
  return db.getAll('categories');
};

export const addCategory = async (category: Category): Promise<void> => {
  const db = await initDB();
  await db.put('categories', category);
};

export const deleteCategory = async (name: string): Promise<void> => {
  const db = await initDB();
  await db.delete('categories', name);
};

export const seedDefaultCategories = async (): Promise<void> => {
  const existing = await getAllCategories();
  if (existing.length > 0) return; // don't re-seed if already set up

  const defaults: Category[] = [
    { name: 'Food' },
    { name: 'Transport' },
    { name: 'Shopping' },
    { name: 'Entertainment' },
    { name: 'Rent' },
    { name: 'Other' },
  ];

  for (const cat of defaults) {
    await addCategory(cat);
  }
};

// streak functions

export const getStreak = async (): Promise<Streak | undefined> => {
  const db = await initDB();
  return db.get('streak', 1);
};

export const updateStreak = async (): Promise<void> => {
  const db = await initDB();
  const allExpenses = await getAllExpenses();
  const uniqueDates = [...new Set(allExpenses.map(e => e.date))].sort();

  if (uniqueDates.length === 0) return;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
    const curr = new Date(uniqueDates[i] + 'T00:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  const lastDate = uniqueDates[uniqueDates.length - 1];
  await db.put('streak', { id: 1, currentStreak: streak, lastLoggedDate: lastDate });
};

// utility functions

export const deleteAllData = async (): Promise<void> => {
  const db = await initDB();
  await db.clear('expenses');
  await db.clear('budget');
  await db.clear('categories');
  await db.clear('streak');
};

export const checkBudgetAlert = async (): Promise<void> => {
  const budget = await getBudget();
  if (!budget || budget.monthlyLimit === 0) return;

  const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
  if (!notificationsEnabled) return;

  const threshold = Number(localStorage.getItem('alertThreshold') ?? 75);
  const now = new Date();
  const total = await calculateMonthlyTotal(now.getFullYear(), now.getMonth() + 1);
  const percent = Math.round((total / budget.monthlyLimit) * 100);

  if (percent >= threshold && Notification.permission === 'granted') {
    new Notification('Budget Alert', {
      body: `You have used ${percent}% of your monthly budget.`,
    });
  }
};

export const calculateMonthlyTotal = async (year: number, month: number): Promise<number> => {
  const expenses = await getExpensesByMonth(year, month);
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

export const calculateCategoryTotal = async (category: string, year: number, month: number): Promise<number> => {
  const expenses = await getExpensesByMonth(year, month);
  return expenses
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
};