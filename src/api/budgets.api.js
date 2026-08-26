// Budget (category caps) API functions — one per backend endpoint.
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

// GET /budget/category — the whole page (cards + chart + caps).
export const getBudgetCategories = () =>
  api.get(ENDPOINTS.budget.category, { auth: true });

// POST /budget/category — create/update a category cap (upsert).
export const createBudgetCategory = (payload) =>
  api.post(ENDPOINTS.budget.category, payload, { auth: true });

// PUT /budget/category — same as POST (upsert).
export const updateBudgetCategory = (payload) =>
  api.put(ENDPOINTS.budget.category, payload, { auth: true });

// DELETE /budget/category/:id — remove a category cap.
export const deleteBudgetCategory = (id) =>
  api.delete(ENDPOINTS.budget.categoryById(id), { auth: true });
