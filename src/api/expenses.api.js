// Expense API functions — one per backend endpoint.
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

function toQuery(params = {}) {
  const usable = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
  );
  if (!usable.length) return "";
  return `?${new URLSearchParams(usable).toString()}`;
}

// GET /expenses — list (category, status, search, page, limit params).
export const getExpenses = (params) =>
  api.get(`${ENDPOINTS.expenses.list}${toQuery(params)}`, { auth: true });

// GET /expenses/summary — the 4 metric cards.
export const getExpenseSummary = () =>
  api.get(ENDPOINTS.expenses.summary, { auth: true });

// GET /expenses/analytics — data for the two charts.
export const getExpenseAnalytics = (params) =>
  api.get(`${ENDPOINTS.expenses.analytics}${toQuery(params)}`, { auth: true });

// POST /expenses — create a new expense.
export const createExpense = (payload) =>
  api.post(ENDPOINTS.expenses.create, payload, { auth: true });

// GET /expenses/:id — single expense.
export const getExpense = (id) =>
  api.get(ENDPOINTS.expenses.byId(id), { auth: true });

// PUT /expenses/:id — update an expense.
export const updateExpense = (id, payload) =>
  api.put(ENDPOINTS.expenses.byId(id), payload, { auth: true });

// DELETE /expenses/:id — remove an expense.
export const deleteExpense = (id) =>
  api.delete(ENDPOINTS.expenses.byId(id), { auth: true });
