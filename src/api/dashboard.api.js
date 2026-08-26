// Dashboard API functions.
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

// GET /dashboard/overview — everything the dashboard renders.
export const getDashboardOverview = () =>
  api.get(ENDPOINTS.dashboard.overview, { auth: true });

// GET /dashboard/total-balance — the Total Balance stat card.
export const getTotalBalance = () =>
  api.get(ENDPOINTS.dashboard.totalBalance, { auth: true });
