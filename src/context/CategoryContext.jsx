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
  // Query 1: GET /v1/api/categories/income
  const {
    data: incomeCategories = [],
    isLoading: isIncomeLoading,
    isError: isIncomeError,
    refetch: refetchIncome,
  } = useIncomeCategoriesQuery({ retry: 1 });

  // Query 2: GET /v1/api/categories/expense
  const {
    data: expenseCategories = [],
    isLoading: isExpenseLoading,
    isError: isExpenseError,
    refetch: refetchExpense,
  } = useExpenseCategoriesQuery({ retry: 1 });

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

  // Helper to resolve icon, color, bg for a given category name & type from API data
  const getCategoryMeta = (categoryName, type = "expense") => {
    const isInc = (type || "").toString().toLowerCase() === "income";
    const list = isInc ? incomeCategories : expenseCategories;
    const target = (categoryName || "").toString().toLowerCase().trim();

    const found =
      list.find((c) => (c.name || c.categoryName)?.toString().toLowerCase().trim() === target) ||
      allCategories.find((c) => (c.name || c.categoryName)?.toString().toLowerCase().trim() === target);

    if (found) {
      const iconKey = found.iconKey || found.categoryIcon;
      return {
        ...found,
        name: found.name || found.categoryName,
        color: found.color || found.themeColor || (isInc ? "#10b981" : "#4f46e5"),
        bg: found.bg || (isInc ? "#ecfdf5" : "#eef2ff"),
        icon: ICON_MAP[iconKey] || (isInc ? <FiDollarSign size={16} /> : <FiTag size={16} />),
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
