// Single source of truth for every API path (appended to VITE_API_BASE_URL).
// Add new features here, then create a matching function in api/*.api.js.

export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    resendOtp: "/auth/resend-otp",
    verifyOtp: "/auth/verify-otp",
  },
  incomes: {
    list: "/incomes",
    summary: "/incomes/summary",
    analytics: "/incomes/analytics",
    create: "/incomes",
    byId: (id) => `/incomes/${id}`,
  },
};
