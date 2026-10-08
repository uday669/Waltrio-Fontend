// Dashboard API functions — one per backend endpoint.
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

function toQuery(params = {}) {
  const usable = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
  );
  if (!usable.length) return "";
  return `?${new URLSearchParams(usable).toString()}`;
}

// GET /dashboard/year-summary — top metric cards & period summary
export const getDashboardYearSummary = (params = {}) =>
  api.get(`${ENDPOINTS.dashboard.yearSummary}${toQuery(params)}`, { auth: true });

// GET /dashboard/analytics-year — monthly trends for income vs expenses
export const getDashboardAnalyticsYear = (params = {}) =>
  api.get(`${ENDPOINTS.dashboard.analyticsYear}${toQuery(params)}`, { auth: true });
