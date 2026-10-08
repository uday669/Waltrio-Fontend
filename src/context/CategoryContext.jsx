import React, { createContext, useContext, useMemo } from "react";
import {
  FiBriefcase,
  FiDollarSign,
  FiTrendingUp,
  FiHome,
  FiCoffee,
  FiShoppingBag,
  FiZap,
  FiShield,
  FiActivity,
  FiBook,
  FiGift,
  FiGlobe,
  FiPieChart,
  FiCpu,
  FiTruck,
  FiHeart,
  FiTag,
  FiLayers,
  FiSmartphone,
  FiAward,
  FiFileText,
  FiMusic,
  FiSmile,
  FiCamera,
} from "react-icons/fi";
import {
  useIncomeCategoriesQuery,
  useExpenseCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useCategoriesApi";
import { useAuth } from "./AuthContext";

// Icon Map helper to render icon components by key name
export const ICON_MAP = {
  FiBriefcase: <FiBriefcase size={16} />,
  FiDollarSign: <FiDollarSign size={16} />,
  FiTrendingUp: <FiTrendingUp size={16} />,
  FiHome: <FiHome size={16} />,
  FiCoffee: <FiCoffee size={16} />,
  FiShoppingBag: <FiShoppingBag size={16} />,
  FiZap: <FiZap size={16} />,
  FiShield: <FiShield size={16} />,
  FiActivity: <FiActivity size={16} />,
  FiBook: <FiBook size={16} />,
  FiGift: <FiGift size={16} />,
  FiGlobe: <FiGlobe size={16} />,
  FiPieChart: <FiPieChart size={16} />,
  FiCpu: <FiCpu size={16} />,
  FiTruck: <FiTruck size={16} />,
  FiHeart: <FiHeart size={16} />,
  FiTag: <FiTag size={16} />,
  FiLayers: <FiLayers size={16} />,
  FiSmartphone: <FiSmartphone size={16} />,
  FiAward: <FiAward size={16} />,
  FiFileText: <FiFileText size={16} />,
  FiMusic: <FiMusic size={16} />,
  FiSmile: <FiSmile size={16} />,
  FiCamera: <FiCamera size={16} />,
};

// Available Icon Options for Category Creator
export const AVAILABLE_ICONS = [
  { key: "FiBriefcase", label: "Briefcase / Work", icon: <FiBriefcase size={18} /> },
  { key: "FiDollarSign", label: "Dollar / Finance", icon: <FiDollarSign size={18} /> },
  { key: "FiTrendingUp", label: "Trending / Investment", icon: <FiTrendingUp size={18} /> },
  { key: "FiHome", label: "Home / Housing", icon: <FiHome size={18} /> },
  { key: "FiCoffee", label: "Coffee / Food", icon: <FiCoffee size={18} /> },
  { key: "FiShoppingBag", label: "Shopping / Retail", icon: <FiShoppingBag size={18} /> },
  { key: "FiZap", label: "Zap / Utilities", icon: <FiZap size={18} /> },
  { key: "FiShield", label: "Shield / Healthcare", icon: <FiShield size={18} /> },
  { key: "FiActivity", label: "Activity / Fitness", icon: <FiActivity size={18} /> },
  { key: "FiBook", label: "Book / Education", icon: <FiBook size={18} /> },
  { key: "FiGift", label: "Gift / Bonus", icon: <FiGift size={18} /> },
  { key: "FiGlobe", label: "Globe / Travel", icon: <FiGlobe size={18} /> },
  { key: "FiCpu", label: "Tech / Digital", icon: <FiCpu size={18} /> },
  { key: "FiTruck", label: "Vehicle / Transport", icon: <FiTruck size={18} /> },
  { key: "FiHeart", label: "Heart / Wellness", icon: <FiHeart size={18} /> },
  { key: "FiSmartphone", label: "Mobile / Subscriptions", icon: <FiSmartphone size={18} /> },
  { key: "FiMusic", label: "Music / Entertainment", icon: <FiMusic size={18} /> },
  { key: "FiPieChart", label: "Pie Chart / General", icon: <FiPieChart size={18} /> },
];

// Curated Preset Palette Colors
export const PRESET_COLORS = [
  { name: "Emerald", color: "#10b981", bg: "#ecfdf5" },
  { name: "Indigo", color: "#4f46e5", bg: "#eef2ff" },
  { name: "Violet", color: "#8b5cf6", bg: "#f5f3ff" },
  { name: "Amber", color: "#f59e0b", bg: "#fffbeb" },
  { name: "Rose", color: "#f43f5e", bg: "#fff1f2" },
  { name: "Cyan", color: "#06b6d4", bg: "#ecfeff" },
  { name: "Pink", color: "#ec4899", bg: "#fdf2f8" },
  { name: "Teal", color: "#14b8a6", bg: "#f0fdfa" },
  { name: "Slate", color: "#64748b", bg: "#f1f5f9" },
  { name: "Orange", color: "#ea580c", bg: "#fff7ed" },
];

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const isAuth = Boolean(isAuthenticated || token);

  // Query 1: GET /v1/api/categories/income
  const {
    data: incomeCategories = [],
    isLoading: isIncomeLoading,
    isError: isIncomeError,
    refetch: refetchIncome,
  } = useIncomeCategoriesQuery({ enabled: isAuth, retry: 1 });

  // Query 2: GET /v1/api/categories/expense
  const {
    data: expenseCategories = [],
    isLoading: isExpenseLoading,
    isError: isExpenseError,
    refetch: refetchExpense,
  } = useExpenseCategoriesQuery({ enabled: isAuth, retry: 1 });

  // API Mutations
  const { mutateAsync: createCategoryMut, isPending: creating } = useCreateCategory();
  const { mutateAsync: updateCategoryMut, isPending: updating } = useUpdateCategory();
  const { mutateAsync: deleteCategoryMut, isPending: deleting } = useDeleteCategory();

  // All combined categories
  const allCategories = useMemo(() => {
    return [...expenseCategories, ...incomeCategories];
  }, [expenseCategories, incomeCategories]);

  const isLoading = isIncomeLoading || isExpenseLoading;
  const isError = isIncomeError && isExpenseError;

  const refetch = () => {
    refetchIncome();
    refetchExpense();
  };

  // Add Category -> POST /categories
  const addCategory = async (categoryData) => {
    return await createCategoryMut(categoryData);
  };

  // Update Category -> PUT / PATCH /categories/:id
  const updateCategory = async (id, updatedData) => {
    return await updateCategoryMut({ id, ...updatedData });
  };

  // Delete Category -> DELETE /categories/:id
  const deleteCategory = async (id) => {
    return await deleteCategoryMut(id);
  };

const DEFAULT_INCOME_META = {
  salary: { icon: <FiBriefcase size={16} />, iconKey: "FiBriefcase", color: "#10b981", bg: "#ecfdf5" },
  freelance: { icon: <FiLayers size={16} />, iconKey: "FiLayers", color: "#06b6d4", bg: "#ecfeff" },
  freelancing: { icon: <FiLayers size={16} />, iconKey: "FiLayers", color: "#06b6d4", bg: "#ecfeff" },
  investment: { icon: <FiTrendingUp size={16} />, iconKey: "FiTrendingUp", color: "#8b5cf6", bg: "#f5f3ff" },
  investments: { icon: <FiTrendingUp size={16} />, iconKey: "FiTrendingUp", color: "#8b5cf6", bg: "#f5f3ff" },
  business: { icon: <FiDollarSign size={16} />, iconKey: "FiDollarSign", color: "#4f46e5", bg: "#eef2ff" },
  rental: { icon: <FiHome size={16} />, iconKey: "FiHome", color: "#f59e0b", bg: "#fffbeb" },
  bonus: { icon: <FiGift size={16} />, iconKey: "FiGift", color: "#ec4899", bg: "#fdf2f8" },
  dividends: { icon: <FiPieChart size={16} />, iconKey: "FiPieChart", color: "#14b8a6", bg: "#f0fdfa" },
  commission: { icon: <FiAward size={16} />, iconKey: "FiAward", color: "#f97316", bg: "#fff7ed" },
  sidehustle: { icon: <FiSmartphone size={16} />, iconKey: "FiSmartphone", color: "#8b5cf6", bg: "#f5f3ff" },
};

const DEFAULT_EXPENSE_META = {
  food: { icon: <FiCoffee size={16} />, iconKey: "FiCoffee", color: "#f59e0b", bg: "#fffbeb" },
  dining: { icon: <FiCoffee size={16} />, iconKey: "FiCoffee", color: "#f59e0b", bg: "#fffbeb" },
  "food & dining": { icon: <FiCoffee size={16} />, iconKey: "FiCoffee", color: "#f59e0b", bg: "#fffbeb" },
  groceries: { icon: <FiShoppingBag size={16} />, iconKey: "FiShoppingBag", color: "#ec4899", bg: "#fdf2f8" },
  housing: { icon: <FiHome size={16} />, iconKey: "FiHome", color: "#4f46e5", bg: "#eef2ff" },
  rent: { icon: <FiHome size={16} />, iconKey: "FiHome", color: "#4f46e5", bg: "#eef2ff" },
  utilities: { icon: <FiZap size={16} />, iconKey: "FiZap", color: "#06b6d4", bg: "#ecfeff" },
  bills: { icon: <FiFileText size={16} />, iconKey: "FiFileText", color: "#06b6d4", bg: "#ecfeff" },
  shopping: { icon: <FiShoppingBag size={16} />, iconKey: "FiShoppingBag", color: "#ec4899", bg: "#fdf2f8" },
  health: { icon: <FiActivity size={16} />, iconKey: "FiActivity", color: "#ef4444", bg: "#fef2f2" },
  healthcare: { icon: <FiShield size={16} />, iconKey: "FiShield", color: "#ef4444", bg: "#fef2f2" },
  education: { icon: <FiBook size={16} />, iconKey: "FiBook", color: "#8b5cf6", bg: "#f5f3ff" },
  entertainment: { icon: <FiMusic size={16} />, iconKey: "FiMusic", color: "#ec4899", bg: "#fdf2f8" },
  travel: { icon: <FiGlobe size={16} />, iconKey: "FiGlobe", color: "#14b8a6", bg: "#f0fdfa" },
  transport: { icon: <FiTruck size={16} />, iconKey: "FiTruck", color: "#ea580c", bg: "#fff7ed" },
  tech: { icon: <FiCpu size={16} />, iconKey: "FiCpu", color: "#3b82f6", bg: "#eff6ff" },
};

  // Helper to resolve icon, color, bg for a given category name & type from API data
  const getCategoryMeta = (categoryName, type = "expense") => {
    const isInc = (type || "").toString().toLowerCase() === "income";
    const list = isInc ? incomeCategories : expenseCategories;
    const target = (categoryName || "").toString().toLowerCase().trim();

    const found =
      list.find((c) => (c.name || c.categoryName)?.toString().toLowerCase().trim() === target) ||
      allCategories.find((c) => (c.name || c.categoryName)?.toString().toLowerCase().trim() === target);

    const defaultMap = isInc ? DEFAULT_INCOME_META : DEFAULT_EXPENSE_META;
    const smartFallback = defaultMap[target] || Object.entries(defaultMap).find(([k]) => target.includes(k))?.[1];

    if (found) {
      const iconKey = found.iconKey || found.categoryIcon;
      const iconComp = ICON_MAP[iconKey] || smartFallback?.icon || (isInc ? <FiDollarSign size={16} /> : <FiTag size={16} />);
      return {
        ...found,
        name: found.name || found.categoryName,
        color: found.color || found.themeColor || smartFallback?.color || (isInc ? "#10b981" : "#4f46e5"),
        bg: found.bg || smartFallback?.bg || (isInc ? "#ecfdf5" : "#eef2ff"),
        icon: iconComp,
      };
    }

    if (smartFallback) {
      return {
        name: categoryName || "Other",
        color: smartFallback.color,
        bg: smartFallback.bg,
        icon: smartFallback.icon,
        iconKey: smartFallback.iconKey,
        type: isInc ? "income" : "expense",
      };
    }

    // Fallback default
    return {
      name: categoryName || "Other",
      color: isInc ? "#10b981" : "#4f46e5",
      bg: isInc ? "#ecfdf5" : "#eef2ff",
      icon: isInc ? <FiDollarSign size={16} /> : <FiPieChart size={16} />,
      iconKey: isInc ? "FiDollarSign" : "FiPieChart",
      type: isInc ? "income" : "expense",
    };
  };

  return (
    <CategoryContext.Provider
      value={{
        incomeCategories,
        expenseCategories,
        allCategories,
        isLoading,
        isError,
        refetch,
        refetchIncome,
        refetchExpense,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryMeta,
        creating,
        updating,
        deleting,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
