// TanStack Query hooks for the Expenses feature.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  getExpenseSummary,
  getExpenseAnalytics,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenses.api";
import { unwrap, toList } from "./useIncomes";

const EXPENSES_KEY = ["expenses"];

// Map a backend expense record to the field names the UI expects.
// Backend: { _id, merchant, note, category, account, method, amount, date, status, attachment }
export function normalizeExpense(row) {
  if (!row || typeof row !== "object") return row;
  return {
    ...row,
    id: row.id ?? row._id ?? row.expenseId,
    merchant: row.merchant ?? "",
    description: row.description ?? row.note ?? "",
    category: row.category ?? "Other",
    account: row.account ?? "—",
    paymentMethod: row.paymentMethod ?? row.method ?? "",
    amount: Number(row.amount) || 0,
    date: row.date ?? "",
    status: row.status ?? "Paid",
    receiptImg: row.receiptImg ?? row.attachment ?? null,
    notes: row.notes ?? row.note ?? "",
    time: row.time ?? "",
    tags: row.tags ?? "",
  };
}

export function useExpenses(params = {}, options = {}) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, "list", params],
    queryFn: () => getExpenses(params),
    select: (res) => toList(res).map(normalizeExpense),
    ...options,
  });
}

export function useExpenseSummary(options = {}) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, "summary"],
    queryFn: getExpenseSummary,
    select: unwrap,
    ...options,
  });
}

export function useExpenseAnalytics(params = {}, options = {}) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, "analytics", params],
    queryFn: () => getExpenseAnalytics(params),
    select: unwrap,
    ...options,
  });
}

export function useExpense(id, options = {}) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, "detail", id],
    queryFn: () => getExpense(id),
    select: (res) => normalizeExpense(unwrap(res)),
    enabled: !!id,
    ...options,
  });
}

export function useCreateExpense(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...EXPENSES_KEY, "create"],
    mutationFn: createExpense,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateExpense(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...EXPENSES_KEY, "update"],
    mutationFn: ({ id, ...payload }) => updateExpense(id, payload),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteExpense(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...EXPENSES_KEY, "delete"],
    mutationFn: (id) => deleteExpense(id),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      options.onSuccess?.(...args);
    },
  });
}
