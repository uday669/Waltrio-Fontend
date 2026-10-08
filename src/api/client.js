// Central fetch client for all API calls.
// Base URL comes from VITE_API_BASE_URL and falls back to the local server.
import { setCookie, getCookie, deleteCookie, clearAllCookies } from "../lib/cookies";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1/api";

// A typed error so callers/react-query can read status + server payload.
export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const TOKEN_KEY = "waltrio_token";

// JWT auth token is persisted exclusively in a cookie with 1-day expiration.
export const getToken = () => {
  return getCookie(TOKEN_KEY) || null;
};

export const setToken = (token, days = 1) => {
  if (!token) return;
  setCookie(TOKEN_KEY, token, days);
};

export const clearToken = () => {
  deleteCookie(TOKEN_KEY);
  clearAllCookies();
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("waltrio_user");
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // ignore
  }
};

// Pull a human-readable message out of whatever shape the server returns.
function parseMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return (
    data.message ||
    data.error ||
    (Array.isArray(data.errors) && data.errors[0]?.message) ||
    fallback
  );
}

/**
 * Core request helper.
 * @param {string} path   - endpoint path, e.g. "/auth/login"
 * @param {object} options
 * @param {string} [options.method="GET"]
 * @param {object} [options.body]   - auto JSON-stringified
 * @param {boolean} [options.auth] - kept for compatibility; the JWT is now
 *   attached automatically to every request when a token cookie exists.
 */
export async function request(path, { method = "GET", body, headers = {} } = {}) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // Send the JWT on every request once the user is logged in.
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    const url =
      path.startsWith("/v1/api") && BASE_URL.endsWith("/v1/api")
        ? `${BASE_URL.replace(/\/v1\/api$/, "")}${path}`
        : `${BASE_URL}${path}`;
    response = await fetch(url, config);
  } catch {
    // Network / server-down errors never reach the JSON parse below.
    throw new ApiError("Unable to reach the server. Please try again.", {
      status: 0,
    });
  }

  // Gracefully handle empty (204) and non-JSON responses.
  const raw = await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/register")) {
      clearToken();
    }
    throw new ApiError(parseMessage(data, `Request failed (${response.status})`), {
      status: response.status,
      data,
    });
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
