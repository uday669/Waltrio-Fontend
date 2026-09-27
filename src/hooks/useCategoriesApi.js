import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIncomeCategories,
  getExpenseCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories.api";

export const CATEGORIES_KEY = ["categories"];

// Helper to extract any array from response data envelopes
export function extractRawArray(res) {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];

  // Direct array properties
  const PREFERRED = [
    "categories",
    "incomeCategories",
    "expenseCategories",
    "income",
    "expense",
    "incomes",
    "expenses",
    "data",
    "items",
    "docs",
    "rows",
    "results",
    "records",
    "list",
  ];

  for (const key of PREFERRED) {
    if (Array.isArray(res[key])) return res[key];
  }

  // Nested in data
  if (res.data && typeof res.data === "object") {
    return extractRawArray(res.data);
  }

  // First array value anywhere
  for (const val of Object.values(res)) {
    if (Array.isArray(val)) return val;
  }

  return [];
}

// Map backend category format to normalized UI category object
export function normalizeCategory(row, defaultType = "expense") {
  if (!row) return null;

  // Handle if backend returns category as a simple string, e.g. "Salary"
  if (typeof row === "string") {
    const rawType = (defaultType || "expense").toString().trim().toLowerCase();
    const isIncome = rawType === "income";
    return {
      id: row,
      _id: row,
      name: row,
      categoryName: row,
      color: isIncome ? "#10b981" : "#4f46e5",
      themeColor: isIncome ? "#10b981" : "#4f46e5",
      bg: isIncome ? "#ecfdf5" : "#eef2ff",
      iconKey: isIncome ? "FiDollarSign" : "FiTag",
      categoryIcon: isIncome ? "FiDollarSign" : "FiTag",
      type: isIncome ? "income" : "expense",
      description: "",
    };
  }

  if (typeof row !== "object") return null;

  const rawType = (
    row.type ||
    row.categoryType ||
    row.category_type ||
    defaultType ||
    "expense"
  )
    .toString()
    .trim()
    .toLowerCase();

  const isIncome = rawType === "income";
  const type = isIncome ? "income" : "expense";

  const name = (
    row.categoryName ??
    row.category_name ??
    row.name ??
    row.title ??
    row.label ??
    row.value ??
    ""
  ).toString().trim();

  const id = row._id ?? row.id ?? row.categoryId ?? row._ID ?? name;
  const color =
    row.themeColor ??
    row.theme_color ??
    row.color ??
    (isIncome ? "#10b981" : "#4f46e5");
  const bg =
    row.bg ||
    row.bgColor ||
    row.bg_color ||
    (isIncome ? "#ecfdf5" : "#eef2ff");
  const iconKey =
    row.categoryIcon ??
    row.category_icon ??
    row.iconKey ??
    row.icon_key ??
    row.icon ??
    (isIncome ? "FiDollarSign" : "FiTag");
  const description = row.description ?? row.desc ?? "";

  return {
    ...row,
    id,
    _id: id,
    name,
    categoryName: name,
    color,
    themeColor: color,
    bg,
    iconKey,
    categoryIcon: iconKey,
    type,
    description,
  };
}

// Convert UI category object to payload expected by POST /categories
export function toCreateCategoryPayload(data) {
  const type = (data.type || "expense").toString().trim().toLowerCase();
  const categoryName = (data.categoryName || data.name || "").trim();
  const themeColor =
    data.themeColor || data.color || (type === "income" ? "#10b981" : "#4f46e5");
  const categoryIcon =
    data.categoryIcon || data.iconKey || (type === "income" ? "FiDollarSign" : "FiTag");
  const description = data.description || "";

  return {
    categoryName,
    name: categoryName,
    description,
    themeColor,
    color: themeColor,
    categoryIcon,
    iconKey: categoryIcon,
    type,
  };
}

// Convert UI category object to payload expected by PUT / PATCH /categories/:id
export function toUpdateCategoryPayload(data) {
  const categoryName = (data.categoryName || data.name || "").trim();
  const themeColor = data.themeColor || data.color;
  const categoryIcon = data.categoryIcon || data.iconKey;
  const description = data.description ?? "";
  const type = data.type ? data.type.toString().trim().toLowerCase() : undefined;

  const payload = {
    categoryName,
    name: categoryName,
    description,
  };
  if (themeColor) {
    payload.themeColor = themeColor;
    payload.color = themeColor;
  }
  if (categoryIcon) {
    payload.categoryIcon = categoryIcon;
    payload.iconKey = categoryIcon;
  }
  if (type) {
    payload.type = type;
  }
  return payload;
}

// Parse category list for a given type (income or expense)
export function parseCategoryList(res, categoryType = "expense") {
  if (!res) return [];
  const rawList = extractRawArray(res);
  return rawList.map((c) => normalizeCategory(c, categoryType)).filter(Boolean);
}

// GET income categories (/v1/api/categories/income)
export function useIncomeCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, "income"],
    queryFn: getIncomeCategories,
    select: (res) => parseCategoryList(res, "income"),
    ...options,
  });
}

// GET expense categories (/v1/api/categories/expense)
export function useExpenseCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, "expense"],
    queryFn: getExpenseCategories,
    select: (res) => parseCategoryList(res, "expense"),
    ...options,
  });
}

// Mutations: Add Category (POST /categories)
export function useCreateCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...CATEGORIES_KEY, "create"],
    mutationFn: (data) => createCategory(toCreateCategoryPayload(data)),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      options.onSuccess?.(...args);
    },
  });
}

// Mutations: Update Category (PUT / PATCH /categories/:id)
export function useUpdateCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...CATEGORIES_KEY, "update"],
    mutationFn: ({ id, _id, ...data }) =>
      updateCategory(id || _id, toUpdateCategoryPayload(data)),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      options.onSuccess?.(...args);
    },
  });
}

// Mutations: Delete Category (DELETE /categories/:id)
export function useDeleteCategory(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [...CATEGORIES_KEY, "delete"],
    mutationFn: (id) => deleteCategory(id),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      options.onSuccess?.(...args);
    },
  });
}
