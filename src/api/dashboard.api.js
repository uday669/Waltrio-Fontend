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

// GET /dashboard/overview — overview data without mandatory filter
export const getDashboardOverview = (params) => {
  const query = params ? toQuery(params) : "";
  return api.get(`${ENDPOINTS.dashboard.overview}${query}`, { auth: true });
};

// GET /dashboard/total-balance — the Total Balance stat card
export const getTotalBalance = () =>
  api.get(ENDPOINTS.dashboard.totalBalance, { auth: true });
