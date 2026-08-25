// Central fetch client for all API calls.
// Base URL comes from VITE_API_BASE_URL and falls back to the local server.
import { setCookie, getCookie, deleteCookie } from "../lib/cookies";

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

// JWT auth token is persisted in a cookie (7 days) so it survives reloads.
export const getToken = () => getCookie(TOKEN_KEY);
export const setToken = (token, days = 7) => setCookie(TOKEN_KEY, token, days);
export const clearToken = () => deleteCookie(TOKEN_KEY);

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
    response = await fetch(`${BASE_URL}${path}`, config);
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
