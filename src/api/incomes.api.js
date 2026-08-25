// Income API functions — one per backend endpoint.
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

// Build a ?a=b query string, skipping empty/all values.
function toQuery(params = {}) {
  const usable = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
  );
  if (!usable.length) return "";
  const qs = new URLSearchParams(usable).toString();
  return `?${qs}`;
}

// GET /incomes — list all incomes (optionally filtered/paginated).
export const getIncomes = (params) =>
  api.get(`${ENDPOINTS.incomes.list}${toQuery(params)}`, { auth: true });

// GET /incomes/summary — the 4 metric cards.
export const getIncomeSummary = () =>
  api.get(ENDPOINTS.incomes.summary, { auth: true });

// GET /incomes/analytics — data for the two charts.
export const getIncomeAnalytics = (params) =>
  api.get(`${ENDPOINTS.incomes.analytics}${toQuery(params)}`, { auth: true });

// POST /incomes — create a new income.
export const createIncome = (payload) =>
  api.post(ENDPOINTS.incomes.create, payload, { auth: true });

// GET /incomes/:id — single income.
export const getIncome = (id) =>
  api.get(ENDPOINTS.incomes.byId(id), { auth: true });

// PUT /incomes/:id — update an income.
export const updateIncome = (id, payload) =>
  api.put(ENDPOINTS.incomes.byId(id), payload, { auth: true });

// DELETE /incomes/:id — remove an income.
export const deleteIncome = (id) =>
  api.delete(ENDPOINTS.incomes.byId(id), { auth: true });
