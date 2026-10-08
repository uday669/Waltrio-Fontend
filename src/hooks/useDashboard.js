// TanStack Query hooks for dashboard year-summary and analytics-year.
import { useQuery } from "@tanstack/react-query";
import { getToken } from "../api/client";
import { getDashboardYearSummary, getDashboardAnalyticsYear } from "../api/dashboard.api";

// Unwrap { success, data } -> data.
const unwrap = (res) => res?.data ?? res ?? null;

// GET /dashboard/year-summary
export function useDashboardYearSummary(params = {}, options = {}) {
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: ["dashboard", "year-summary", params],
    queryFn: () => getDashboardYearSummary(params),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}

// GET /dashboard/analytics-year
export function useDashboardAnalyticsYear(params = {}, options = {}) {
  const token = getToken();
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: ["dashboard", "analytics-year", params],
    queryFn: () => getDashboardAnalyticsYear(params),
    select: unwrap,
    enabled: Boolean(token) && Boolean(enabled),
    ...restOptions,
  });
}
