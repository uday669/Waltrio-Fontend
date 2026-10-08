import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../api/client";
import {
  getExpenses,
  getExpenseSummary,
  getExpenseSpendingDistribution,
  getExpenseWeeklyOutflow,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenses.api";
import { unwrap, toList, extractPagination } from "./useIncomes";

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
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: [...EXPENSES_KEY, "list", params],
    queryFn: () => getExpenses(params),
    select: (res) => {
      const items = toList(res).map(normalizeExpense);
      const pagination = extractPagination(res);
      if (pagination && pagination.total != null) {
        items.total = pagination.total;
        items.totalPages = pagination.totalPages;
        items.page = pagination.page;
        items.limit = pagination.limit;
        items.pagination = pagination;
      }
      return items;
    },
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export function useExpenseSummary(params = {}, options = {}) {
  const token = getToken();
  const isOptionsOnly =
    params &&
    typeof params === "object" &&
    (params.enabled !== undefined || params.retry !== undefined || params.select !== undefined);
  const actualParams = isOptionsOnly ? {} : params;
  const actualOptions = isOptionsOnly ? params : options;
  const { enabled = true, ...restOptions } = actualOptions;
  return useQuery({
    queryKey: [...EXPENSES_KEY, "summary", actualParams],
    queryFn: () => getExpenseSummary(actualParams),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export function useExpenseSpendingDistribution(params = {}, options = {}) {
  const token = getToken();
  const isOptionsOnly =
    params &&
    typeof params === "object" &&
    (params.enabled !== undefined || params.retry !== undefined || params.select !== undefined);
  const actualParams = isOptionsOnly ? {} : params;
  const actualOptions = isOptionsOnly ? params : options;
  const { enabled = true, ...restOptions } = actualOptions;
  return useQuery({
    queryKey: [...EXPENSES_KEY, "spending-distribution", actualParams],
    queryFn: () => getExpenseSpendingDistribution(actualParams),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export function useExpenseWeeklyOutflow(params = {}, options = {}) {
  const token = getToken();
  const isOptionsOnly =
    params &&
    typeof params === "object" &&
    (params.enabled !== undefined || params.retry !== undefined || params.select !== undefined);
  const actualParams = isOptionsOnly ? {} : params;
  const actualOptions = isOptionsOnly ? params : options;
  const { enabled = true, ...restOptions } = actualOptions;
  return useQuery({
    queryKey: [...EXPENSES_KEY, "weekly-outflow", actualParams],
    queryFn: () => getExpenseWeeklyOutflow(actualParams),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export const useExpenseAnalytics = useExpenseSpendingDistribution;

export function useExpense(id, options = {}) {
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: [...EXPENSES_KEY, "detail", id],
    queryFn: () => getExpense(id),
    select: (res) => normalizeExpense(unwrap(res)),
    enabled: Boolean(token) && Boolean(id) && Boolean(enabled),
    ...restOptions,
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
