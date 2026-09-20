// TanStack Query hooks for the auth flow.
// Each hook wraps one endpoint so components get
// { mutate / data, isPending / isLoading, isError, error } out of the box.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerUser,
  loginUser,
  resendOtp,
  verifyOtp,
  getMe,
} from "../api/auth.api";
import { getToken, setToken } from "../api/client";

// A JWT is three base64url segments separated by dots.
const looksLikeJwt = (v) =>
  typeof v === "string" && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(v);

// Deep-search the login response for the auth token, wherever the backend
// puts it: top-level, under data/result/user, named token/accessToken/jwt, etc.
const TOKEN_KEYS = ["token", "accessToken", "access_token", "jwt", "authToken", "idToken"];
export function extractToken(payload) {
  if (!payload || typeof payload !== "object") return null;
  const seen = new Set();
  const walk = (obj) => {
    if (!obj || typeof obj !== "object" || seen.has(obj)) return null;
    seen.add(obj);
    // Prefer explicitly-named token fields.
    for (const key of TOKEN_KEYS) {
      if (typeof obj[key] === "string" && obj[key]) return obj[key];
    }
    // Otherwise, any JWT-looking string value.
    for (const value of Object.values(obj)) {
      if (looksLikeJwt(value)) return value;
    }
    // Recurse into nested objects.
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        const found = walk(value);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(payload);
}

/**
 * Extract user object (name, email, id, etc.) from whatever shape /v1/api/auth/me returns.
 * Supports { Data: { email } }, { data: { email } }, { user: { email } }, etc.
 */
export function extractUserData(payload) {
  if (!payload || typeof payload !== "object") return null;

  // Unwrap nested structures with case-insensitivity support:
  let raw =
    payload.Data?.user ||
    payload.data?.user ||
    payload.Data?.User ||
    payload.data?.User ||
    payload.Data?.data ||
    payload.data?.Data ||
    payload.Data ||
    payload.data ||
    payload.user ||
    payload.User ||
    payload.result ||
    payload.Result ||
    payload;

  if (Array.isArray(raw)) {
    raw = raw[0];
  }

  if (!raw || typeof raw !== "object") return null;

  // If raw contains nested user or Data object
  if (raw.Data && typeof raw.Data === "object" && !Array.isArray(raw.Data)) {
    raw = { ...raw, ...raw.Data };
  }
  if (raw.user && typeof raw.user === "object" && !Array.isArray(raw.user)) {
    raw = { ...raw, ...raw.user };
  }
  if (raw.User && typeof raw.User === "object" && !Array.isArray(raw.User)) {
    raw = { ...raw, ...raw.User };
  }

  const email =
    raw.email ||
    raw.Email ||
    raw.EMAIL ||
    raw.userEmail ||
    raw.user_email ||
    raw.mail ||
    raw.Mail ||
    "";

  const name =
    raw.name ||
    raw.Name ||
    raw.fullName ||
    raw.FullName ||
    raw.userName ||
    raw.username ||
    raw.UserName ||
    raw.firstName ||
    raw.FirstName ||
    (raw.firstName ? `${raw.firstName} ${raw.lastName || ""}`.trim() : "") ||
    (email ? email.split("@")[0] : "") ||
    "";

  const userData = {
    ...raw,
    name,
    email,
    Email: email,
    Name: name,
    Data: {
      ...raw,
      name,
      email,
      Email: email,
      Name: name,
    },
    data: {
      ...raw,
      name,
      email,
      Email: email,
      Name: name,
    },
  };

  // Cache user data in localStorage
  try {
    localStorage.setItem("waltrio_user", JSON.stringify(userData));
  } catch {
    // ignore
  }

  return userData;
}


export const useRegister = (options = {}) =>
  useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: registerUser,
    ...options,
  });

export const useLogin = ({ onSuccess, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: loginUser,
    onSuccess: (data, ...rest) => {
      const token = extractToken(data);
      if (token) {
        setToken(token);
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      } else {
        // Helps diagnose "token not sent" — check what login actually returned.
        console.warn("[auth] No JWT found in login response:", data);
      }
      onSuccess?.(data, ...rest);
    },
    ...options,
  });
};

export const useResendOtp = (options = {}) =>
  useMutation({
    mutationKey: ["auth", "resend-otp"],
    mutationFn: resendOtp,
    ...options,
  });

export const useVerifyOtp = ({ onSuccess, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "verify-otp"],
    mutationFn: verifyOtp,
    onSuccess: (data, ...rest) => {
      const token = extractToken(data);
      if (token) {
        setToken(token);
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      onSuccess?.(data, ...rest);
    },
    ...options,
  });
};

/**
 * Fetch current authenticated user via GET /v1/api/auth/me.
 */
export const useMe = (options = {}) => {
  const token = getToken();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    select: (data) => extractUserData(data),
    ...options,
  });
};

