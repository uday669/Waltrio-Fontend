// TanStack Query hooks for the auth flow.
// Each hook wraps one endpoint as a mutation so pages get
// { mutate, isPending, isError, error, data } out of the box.
import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  loginUser,
  resendOtp,
  verifyOtp,
} from "../api/auth.api";
import { setToken } from "../api/client";

// A JWT is three base64url segments separated by dots.
const looksLikeJwt = (v) =>
  typeof v === "string" && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(v);

// Deep-search the login response for the auth token, wherever the backend
// puts it: top-level, under data/result/user, named token/accessToken/jwt, etc.
const TOKEN_KEYS = ["token", "accessToken", "access_token", "jwt", "authToken", "idToken"];
function extractToken(payload) {
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

export const useRegister = (options = {}) =>
  useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: registerUser,
    ...options,
  });

export const useLogin = ({ onSuccess, ...options } = {}) =>
  useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: loginUser,
    onSuccess: (data, ...rest) => {
      const token = extractToken(data);
      if (token) {
        setToken(token);
      } else {
        // Helps diagnose "token not sent" — check what login actually returned.
        console.warn("[auth] No JWT found in login response:", data);
      }
      onSuccess?.(data, ...rest);
    },
    ...options,
  });

export const useResendOtp = (options = {}) =>
  useMutation({
    mutationKey: ["auth", "resend-otp"],
    mutationFn: resendOtp,
    ...options,
  });

export const useVerifyOtp = (options = {}) =>
  useMutation({
    mutationKey: ["auth", "verify-otp"],
    mutationFn: verifyOtp,
    ...options,
  });
