import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "../hooks/useAuth";
import { getToken, clearToken } from "../api/client";
import { getCurrencySymbol, formatCurrency } from "../utils/currency";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState(() => getToken());

  // Keep token state in sync if cookies/tokens change
  useEffect(() => {
    const current = getToken();
    if (current !== token) {
      setTokenState(current);
    }
  });

  // Load initial cached user from localStorage if available
  const [cachedUser, setCachedUser] = useState(() => {
    try {
      const saved = localStorage.getItem("waltrio_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Query /v1/api/auth/profile when token exists
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
    refetch: refetchUser,
  } = useProfile({ enabled: Boolean(token) });

  useEffect(() => {
    if (fetchedUser) {
      setCachedUser(fetchedUser);
      try {
        localStorage.setItem("waltrio_user", JSON.stringify(fetchedUser));
      } catch {
        // ignore
      }
    }
  }, [fetchedUser]);

  const user = fetchedUser || cachedUser;
  const email = user?.email || user?.Email || user?.Data?.email || user?.data?.email || "";
  const name = user?.name || user?.Name || user?.fullName || user?.FullName || user?.Data?.name || user?.data?.name || "";
  const currency = user?.currency || user?.Currency || user?.Data?.currency || user?.data?.currency || "INR";
  const currencySymbol = getCurrencySymbol(currency);

  const logout = () => {
    clearToken();
    setTokenState(null);
    setCachedUser(null);
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  const value = useMemo(
    () => ({
      user: user || null,
      Data: user?.Data || user || { email, name, currency },
      data: user?.data || user || { email, name, currency },
      name,
      email,
      Email: email,
      Name: name,
      currency,
      Currency: currency,
      currencySymbol,
      formatAmount: (amount, opts) => formatCurrency(amount, currency, opts),
      token,
      isAuthenticated: Boolean(token),
      isLoading: isLoading && !cachedUser,
      isError,
      error,
      logout,
      refetchUser,
    }),
    [user, email, name, currency, currencySymbol, token, isLoading, cachedUser, isError, error, queryClient, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

