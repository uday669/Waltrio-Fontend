// Single source of truth for every API path (appended to VITE_API_BASE_URL).
// Add new features here, then create a matching function in api/*.api.js.

export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    resendOtp: "/auth/resend-otp",
    verifyOtp: "/auth/verify-otp",
    forgotPassword: "/auth/forgot-password",
    forgotPasswordVerifyOtp: "/auth/forgot-password/verify-otp",
    profile: "/auth/profile",
    deleteAccountSendOtp: "/auth/delete-account/send-otp",
    deleteAccount: "/auth/delete-account",
    deleteAccountStatus: "/auth/delete-account/status",
  },
  profile: "/auth/profile",

  incomes: {
    list: "/incomes",
    summary: "/incomes/summary",
    velocity: "/incomes/velocity",
    revenueShare: "/incomes/revenue-share",
    create: "/incomes",
    byId: (id) => `/incomes/${id}`,
  },
  expenses: {
    list: "/expenses",
    summary: "/expenses/summary",
    spendingDistribution: "/expenses/spending-distribution",
    weeklyOutflow: "/expenses/weekly-outflow",
    create: "/expenses",
    byId: (id) => `/expenses/${id}`,
  },
  dashboard: {
    yearSummary: "/dashboard/year-summary",
    analyticsYear: "/dashboard/analytics-year",
  },
  budget: {
    // Whole budgets page (cards + chart + caps). POST/PUT here upsert a cap.
    category: "/budget/category",
    categoryById: (id) => `/budget/category/${id}`,
    copyNextMonth: "/budget/category/copy-next-month",
  },
  categories: {
    income: "/categories/income",
    expense: "/categories/expense",
    create: "/categories",
    byId: (id) => `/categories/${id}`,
  },
};


