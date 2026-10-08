// TanStack Query hooks for the Income feature.
// Queries: list, summary, analytics, single.
// Mutations: create, update, delete — all invalidate the income cache.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../api/client";
import {
  getIncomes,
  getIncomeSummary,
  getIncomeVelocity,
  getIncomeRevenueShare,
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
  if (res.Data !== undefined) return res.Data;
  if (res.result !== undefined) return res.result;
  if (res.incomes !== undefined) return res.incomes;
  return res;
}

// Always hand the UI an array, whatever the list endpoint wraps it in.
// Handles: [...], {data:[...]}, {data:{incomes:[...]}}, {data:{expenses:[...]}}, etc.
export function toList(res) {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];

  // Named array properties we prefer, checked at any depth.
  const PREFERRED = ["incomes", "expenses", "items", "docs", "rows", "results", "records", "list", "Data", "data"];
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
    // Recurse into nested objects (e.g. data -> incomes / expenses).
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

/**
 * Extract pagination metadata (page, limit, total, totalPages) if returned by the backend.
 */
export function extractPagination(res) {
  if (!res || typeof res !== "object") return null;

  const p = res.pagination || res.meta || res.pageInfo || res.data?.pagination || res.Data?.pagination || null;

  const total =
    p?.total ??
    p?.totalDocs ??
    p?.totalCount ??
    p?.count ??
    res.total ??
    res.totalDocs ??
    res.totalCount ??
    res.count ??
    res.data?.total ??
    res.Data?.total ??
    null;

  const page =
    p?.page ??
    p?.currentPage ??
    res.page ??
    res.currentPage ??
    res.data?.page ??
    res.Data?.page ??
    1;

  const limit =
    p?.limit ??
    p?.pageSize ??
    p?.perPage ??
    res.limit ??
    res.pageSize ??
    res.perPage ??
    res.data?.limit ??
    res.Data?.limit ??
    10;

  const totalPages =
    p?.totalPages ??
    p?.pages ??
    p?.pageCount ??
    res.totalPages ??
    res.pages ??
    (total != null ? Math.ceil(Number(total) / Number(limit)) : null);

  return {
    total: total != null ? Number(total) : null,
    totalPages: totalPages != null ? Number(totalPages) : null,
    page: Number(page),
    limit: Number(limit),
  };
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
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: [...INCOMES_KEY, "list", params],
    queryFn: () => getIncomes(params),
    select: (res) => {
      const items = toList(res).map(normalizeIncome);
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

export function useIncomeSummary(params = {}, options = {}) {
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: [...INCOMES_KEY, "summary", params],
    queryFn: () => getIncomeSummary(params),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export function useIncomeVelocity(params = {}, options = {}) {
  const token = getToken();
  const isOptionsOnly =
    params &&
    typeof params === "object" &&
    (params.enabled !== undefined || params.retry !== undefined || params.select !== undefined);
  const actualParams = isOptionsOnly ? {} : params;
  const actualOptions = isOptionsOnly ? params : options;
  const { enabled = true, ...restOptions } = actualOptions;
  return useQuery({
    queryKey: [...INCOMES_KEY, "velocity", actualParams],
    queryFn: () => getIncomeVelocity(actualParams),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export function useIncomeRevenueShare(params = {}, options = {}) {
  const token = getToken();
  const isOptionsOnly =
    params &&
    typeof params === "object" &&
    (params.enabled !== undefined || params.retry !== undefined || params.select !== undefined);
  const actualParams = isOptionsOnly ? {} : params;
  const actualOptions = isOptionsOnly ? params : options;
  const { enabled = true, ...restOptions } = actualOptions;
  return useQuery({
    queryKey: [...INCOMES_KEY, "revenue-share", actualParams],
    queryFn: () => getIncomeRevenueShare(actualParams),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

export const useIncomeAnalytics = useIncomeVelocity;

export function useIncome(id, options = {}) {
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: [...INCOMES_KEY, "detail", id],
    queryFn: () => getIncome(id),
    select: (res) => normalizeIncome(unwrap(res)),
    enabled: Boolean(token) && Boolean(id) && Boolean(enabled),
    ...restOptions,
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
