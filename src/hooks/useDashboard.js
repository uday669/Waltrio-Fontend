// TanStack Query hook for the dashboard overview.
import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview, getTotalBalance } from "../api/dashboard.api";

// Unwrap { success, data } -> data.
const unwrap = (res) => res?.data ?? res ?? null;

export function useDashboardOverview(params = {}, options = {}) {
  return useQuery({
    queryKey: ["dashboard", "overview", params],
    queryFn: () => getDashboardOverview(params),
    select: unwrap,
    ...options,
  });
}

// GET /dashboard/total-balance — powers the Total Balance stat card.
export function useTotalBalance(options = {}) {
  return useQuery({
    queryKey: ["dashboard", "total-balance"],
    queryFn: getTotalBalance,
    select: unwrap,
    ...options,
  });
}
