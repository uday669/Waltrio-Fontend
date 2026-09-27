// Category API functions — strictly two GET endpoints: /categories/income and /categories/expense
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

// GET /v1/api/categories/income — list income categories
export const getIncomeCategories = () =>
  api.get(ENDPOINTS.categories.income, { auth: true });

// GET /v1/api/categories/expense — list expense categories
export const getExpenseCategories = () =>
  api.get(ENDPOINTS.categories.expense, { auth: true });

// POST /v1/api/categories — create a category
// Payload: { categoryName, description, themeColor, categoryIcon, type }
export const createCategory = (payload) =>
  api.post(ENDPOINTS.categories.create, payload, { auth: true });

// GET /v1/api/categories/:id — get category details
export const getCategory = (id) =>
  api.get(ENDPOINTS.categories.byId(id), { auth: true });

// PUT / PATCH /v1/api/categories/:id — update a category
export const updateCategory = (id, payload) =>
  api
    .put(ENDPOINTS.categories.byId(id), payload, { auth: true })
    .catch(() =>
      api.patch(ENDPOINTS.categories.byId(id), payload, { auth: true })
    );

// DELETE /v1/api/categories/:id — delete a category
export const deleteCategory = (id) =>
  api.delete(ENDPOINTS.categories.byId(id), { auth: true });
