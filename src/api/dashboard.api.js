function toQuery(params = {}) {
  const usable = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"
  );
  if (!usable.length) return "";
  return `?${new URLSearchParams(usable).toString()}`;
}

// GET /dashboard/overview — everything the dashboard renders.
export const getDashboardOverview = (params) =>
  api.get(`${ENDPOINTS.dashboard.overview}${toQuery(params)}`, { auth: true });

// GET /dashboard/total-balance — the Total Balance stat card.
export const getTotalBalance = () =>
  api.get(ENDPOINTS.dashboard.totalBalance, { auth: true });
