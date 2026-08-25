// TanStack Query hooks for the Income feature.
// Queries: list, summary, analytics, single.
// Mutations: create, update, delete — all invalidate the income cache.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIncomes,
  getIncomeSummary,
  getIncomeAnalytics,
  createIncome,
  getIncome,
  updateIncome,
  deleteIncome,
} from "../api/incomes.api";

// Root key so a single invalidate refreshes list + summary + analytics.
const INCOMES_KEY = ["incomes"];

// Peel common API envelopes: { data }, { result }, { incomes }, { success, data }.
export function unwrap(res) {
  if (res == null) return res;
  if (Array.isArray(res)) return res;
  if (res.data !== undefined) return res.data;
  if (res.result !== undefined) return res.result;
  if (res.incomes !== undefined) return res.incomes;
  return res;
}

// Always hand the UI an array, whatever the list endpoint wraps it in.
// Handles: [...], {data:[...]}, {data:{incomes:[...]}}, {data:{docs:[...]}}, etc.
export function toList(res) {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];

  // Named array properties we prefer, checked at any depth.
  const PREFERRED = ["incomes", "items", "docs", "rows", "results", "records", "list", "data"];
  const seen = new Set();
  const walk = (obj) => {
    if (!obj || typeof obj !== "object" || seen.has(obj)) return null;
    seen.add(obj);
    for (const key of PREFERRED) {
      if (Array.isArray(obj[key])) return obj[key];
    }
    // Fall back to the first array-valued property found.
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return value;
    }
    // Recurse into nested objects (e.g. data -> incomes).
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        const found = walk(value);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(res) || [];
}

// Map a backend income record to the field names the UI expects.
// Backend: { _id, incomeSource, amount, category, date, description, attachment, ... }
export function normalizeIncome(row) {
  if (!row || typeof row !== "object") return row;
  return {
    ...row,
    id: row.id ?? row._id ?? row.incomeId,
    source: row.source ?? row.incomeSource ?? "",
    amount: Number(row.amount) || 0,
    category: row.category ?? "Other",
    date: row.date ?? "",
    description: row.description ?? "",
    receiptImg: row.receiptImg ?? row.attachment ?? null,
    // Fields the backend doesn't send yet — sensible UI defaults.
    account: row.account ?? row.accountType ?? "—",
    status: row.status ?? "Received",
    isRecurring: row.isRecurring ?? false,
    time: row.time ?? "",
    referenceNo: row.referenceNo ?? row._id ?? "",
    notes: row.notes ?? row.description ?? "",
  };
}

export function useIncomes(params = {}, options = {}) {
  return useQuery({
    queryKey: [...INCOMES_KEY, "list", params],
    queryFn: () => getIncomes(params),
    select: (res) => toList(res).map(normalizeIncome),
    ...options,
  });
}

export function useIncomeSummary(options = {}) {
  return useQuery({
    queryKey: [...INCOMES_KEY, "summary"],
    queryFn: getIncomeSummary,
    select: unwrap,
    ...options,
  });
}

export function useIncomeAnalytics(params = {}, options = {}) {
  return useQuery({
    queryKey: [...INCOMES_KEY, "analytics", params],
    queryFn: () => getIncomeAnalytics(params),
    select: unwrap,
    ...options,
  });
}

export function useIncome(id, options = {}) {
  return useQuery({
    queryKey: [...INCOMES_KEY, "detail", id],
    queryFn: () => getIncome(id),
    select: (res) => normalizeIncome(unwrap(res)),
    enabled: !!id,
    ...options,
  });
}

export function useCreateIncome(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...INCOMES_KEY, "create"],
    mutationFn: createIncome,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: INCOMES_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useUpdateIncome(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...INCOMES_KEY, "update"],
    mutationFn: ({ id, ...payload }) => updateIncome(id, payload),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: INCOMES_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteIncome(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...INCOMES_KEY, "delete"],
    mutationFn: (id) => deleteIncome(id),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: INCOMES_KEY });
      options.onSuccess?.(...args);
    },
  });
}
