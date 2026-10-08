// TanStack Query hooks for the Budgets (category caps) feature.
// GET returns the whole page; we pull the caps array out of whatever it wraps
// them in and compute cards/chart from it in the page.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../api/client";
import {
  getBudgetCategories,
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  copyBudgetNextMonth,
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
  const remaining = Number(row.remaining ?? (allocated - spent)) || 0;
  const usedPercentage = Number(row.usedPercentage ?? (allocated > 0 ? (spent / allocated) * 100 : 0)) || 0;
  const alertThreshold = Number(row.alertThreshold ?? row.threshold ?? 80);

  return {
    ...row,
    id: row.id ?? row._id ?? row.categoryId,
    _id: row._id ?? row.id ?? row.categoryId,
    category: row.category ?? row.name ?? "Uncategorized",
    label: row.label ?? row.category ?? row.name ?? "",
    allocated,
    monthlyAmount: allocated,
    spent,
    remaining,
    usedPercentage,
    alertThreshold,
    overLimit: Boolean(row.overLimit ?? (spent > allocated)),
    alertTriggered: Boolean(row.alertTriggered ?? (usedPercentage >= alertThreshold)),
    month: row.month,
    year: row.year,
  };
}

export function useBudgetCategories(params = {}, options = {}) {
  const token = getToken();
  const isOptionsOnly =
    params &&
    typeof params === "object" &&
    (params.enabled !== undefined || params.retry !== undefined || params.select !== undefined);
  const actualParams = isOptionsOnly ? {} : params;
  const actualOptions = isOptionsOnly ? params : options;
  const { enabled = true, ...restOptions } = actualOptions;

  return useQuery({
    queryKey: [...BUDGETS_KEY, "list", actualParams],
    queryFn: () => getBudgetCategories(actualParams),
    select: (res) => {
      const root = res?.data ?? res ?? {};
      const rawList = toCaps(res);
      const items = rawList.map(normalizeBudget);
      items.cards = root.cards || null;
      items.chart = root.chart || null;
      items.period = root.period || null;
      items.budgets = items;
      return items;
    },
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

// Create a category budget: POST /v1/api/budget/category
export function useCreateBudgetCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "create"],
    mutationFn: (payload) => createBudgetCategory(payload),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      options.onSuccess?.(...args);
    },
  });
}

// Update a category budget: PATCH /v1/api/budget/category/:id
export function useUpdateBudgetCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "update"],
    mutationFn: (payload) => {
      const targetId = payload.id || payload._id;
      return updateBudgetCategory(targetId, payload);
    },
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      options.onSuccess?.(...args);
    },
  });
}

// Upsert helper: uses update when id is provided, create otherwise.
export function useUpsertBudgetCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "upsert"],
    mutationFn: (payload) => {
      const targetId = payload.id || payload._id;
      return targetId ? updateBudgetCategory(targetId, payload) : createBudgetCategory(payload);
    },
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      options.onSuccess?.(...args);
    },
  });
}

// Delete a category budget: DELETE /v1/api/budget/category/:id
export function useDeleteBudgetCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "delete"],
    mutationFn: (id) => deleteBudgetCategory(id),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      options.onSuccess?.(...args);
    },
  });
}

// Copy a category budget to next month: POST /v1/api/budget/category/copy-next-month
export function useCopyBudgetNextMonth(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...BUDGETS_KEY, "copy-next-month"],
    mutationFn: (payload) => copyBudgetNextMonth(payload),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      options.onSuccess?.(...args);
    },
  });
}
