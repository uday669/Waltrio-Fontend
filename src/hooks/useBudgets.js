// TanStack Query hooks for the Budgets (category caps) feature.
// GET returns the whole page; we pull the caps array out of whatever it wraps
// them in and compute cards/chart from it in the page.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBudgetCategories,
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
} from "../api/budgets.api";

const BUDGETS_KEY = ["budgets"];

// Extract the caps array from the GET /budget/category envelope.
// Handles [...], {caps:[...]}, {categories:[...]}, {data:{caps:[...]}}, etc.
export function toCaps(res) {
  const root = res?.data ?? res;
  if (Array.isArray(root)) return root;
  if (!root || typeof root !== "object") return [];
  const KEYS = ["caps", "categories", "budgets", "categoryBudgets", "items", "list", "rows", "records", "data"];
  for (const k of KEYS) if (Array.isArray(root[k])) return root[k];
  // One level deeper (e.g. { data: { caps: [...] } }).
  for (const k of KEYS) {
    if (root[k] && typeof root[k] === "object") {
      for (const kk of KEYS) if (Array.isArray(root[k][kk])) return root[k][kk];
    }
  }
  // Last resort: first array-valued property.
  for (const v of Object.values(root)) if (Array.isArray(v)) return v;
  return [];
}

// Map a backend cap to the field names the UI expects.
export function normalizeBudget(row) {
  if (!row || typeof row !== "object") return row;
  const allocated = Number(row.monthlyAmount ?? row.allocated ?? row.limit ?? row.cap ?? row.monthlyLimit ?? row.amount ?? 0) || 0;
  const spent = Number(row.spent ?? row.used ?? row.consumed ?? 0) || 0;
  return {
    ...row,
    id: row.id ?? row._id ?? row.categoryId,
    category: row.category ?? row.name ?? "Uncategorized",
    label: row.label ?? row.category ?? row.name ?? "",
    allocated,
    spent,
    alertThreshold: Number(row.alertThreshold ?? row.threshold ?? 80),
  };
}

export function useBudgetCategories(options = {}) {
  return useQuery({
    queryKey: [...BUDGETS_KEY, "list"],
    queryFn: getBudgetCategories,
    select: (res) => toCaps(res).map(normalizeBudget),
    ...options,
  });
}

// Upsert: PUT when we already have an id (update), POST otherwise (create).
export function useUpsertBudgetCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "upsert"],
    mutationFn: (payload) =>
      payload.id ? updateBudgetCategory(payload) : createBudgetCategory(payload),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      options.onSuccess?.(...args);
    },
  });
}

export function useDeleteBudgetCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "delete"],
    mutationFn: (id) => deleteBudgetCategory(id),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      options.onSuccess?.(...args);
    },
  });
}
