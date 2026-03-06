import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Expense, Budget, Category } from '../types';

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
}

const DB_NAME = 'budgeting-app';
const DB_VERSION = 1;

export const initDB = () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
      db.createObjectStore('budget', { keyPath: 'id' });
      db.createObjectStore('categories', { keyPath: 'name' });
      db.createObjectStore('streak', { keyPath: 'id' });
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

//utility

export const deleteAllData = async (): Promise<void> => {
  const db = await initDB();
  await db.clear('expenses');
  await db.clear('budget');
  await db.clear('categories');
  await db.clear('streak');
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