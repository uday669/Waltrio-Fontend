// Budget (category caps) API functions — one per backend endpoint.
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

function toQuery(params = {}) {
  const usable = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
  );
  if (!usable.length) return "";
  return `?${new URLSearchParams(usable).toString()}`;
}

// GET /budget/category — the whole page (cards + chart + caps).
export const getBudgetCategories = (params = {}) =>
  api.get(`${ENDPOINTS.budget.category}${toQuery(params)}`, { auth: true });

// POST /budget/category — create a category cap.
export const createBudgetCategory = (payload) =>
  api.post(ENDPOINTS.budget.category, payload, { auth: true });

// PATCH /budget/category/:id — update a category cap.
export const updateBudgetCategory = (id, payload) => {
  const targetId = typeof id === "object" ? (id.id || id._id) : id;
  const targetPayload = typeof id === "object" ? id : payload;
  const { id: _unused1, _id: _unused2, ...cleanPayload } = targetPayload;
  return api.patch(ENDPOINTS.budget.categoryById(targetId), cleanPayload, { auth: true });
};

// DELETE /budget/category/:id — remove a category cap.
export const deleteBudgetCategory = (id) =>
  api.delete(ENDPOINTS.budget.categoryById(id), { auth: true });

// POST /budget/category/copy-next-month — copy budget to next month.
export const copyBudgetNextMonth = (payload) =>
  api.post(ENDPOINTS.budget.copyNextMonth, payload, { auth: true });


