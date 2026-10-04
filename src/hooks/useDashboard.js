// TanStack Query hooks for dashboard year-summary and analytics-year.
import { useQuery } from "@tanstack/react-query";
import { getDashboardYearSummary, getDashboardAnalyticsYear } from "../api/dashboard.api";

// Unwrap { success, data } -> data.
const unwrap = (res) => res?.data ?? res ?? null;

// GET /dashboard/year-summary
export function useDashboardYearSummary(params = {}, options = {}) {
  return useQuery({
    queryKey: ["dashboard", "year-summary", params],
    queryFn: () => getDashboardYearSummary(params),
    select: unwrap,
    ...options,
  });
}

// GET /dashboard/analytics-year
export function useDashboardAnalyticsYear(params = {}, options = {}) {
  return useQuery({
    queryKey: ["dashboard", "analytics-year", params],
    queryFn: () => getDashboardAnalyticsYear(params),
    select: unwrap,
    ...options,
  });
}
