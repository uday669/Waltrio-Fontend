// Auth API functions. Each maps 1:1 to a backend endpoint (all POST).
import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, agreeWaltrio: boolean }} payload
 */
export const registerUser = ({ name, email, password, agreeWaltrio }) =>
  api.post(ENDPOINTS.auth.register, { name, email, password, agreeWaltrio });

/**
 * Log in with credentials.
 * @param {{ email: string, password: string }} payload
 */
export const loginUser = ({ email, password }) =>
  api.post(ENDPOINTS.auth.login, { email, password });

/**
 * Resend the OTP to the given email (backend throttles to once / 5 min).
 * @param {{ email: string }} payload
 */
export const resendOtp = ({ email }) =>
  api.post(ENDPOINTS.auth.resendOtp, { email });

/**
 * Verify the OTP the user received by email.
 * @param {{ email: string, otp: string }} payload
 */
export const verifyOtp = ({ email, otp }) =>
  api.post(ENDPOINTS.auth.verifyOtp, { email, otp });

/**
 * Request password reset OTP (Step 1).
 * POST /v1/api/auth/forgot-password
 * @param {{ email: string }} payload
 */
export const forgotPassword = ({ email }) =>
  api.post(ENDPOINTS.auth.forgotPassword, { email });

/**
 * Verify OTP for forgot password and receive resetToken (Step 2).
 * POST /v1/api/auth/forgot-password/verify-otp
 * @param {{ email: string, otp: string }} payload
 */
export const verifyForgotPasswordOtp = ({ email, otp }) =>
  api.post(ENDPOINTS.auth.forgotPasswordVerifyOtp, { email, otp });

/**
 * Reset password using email, resetToken, and newPassword (Step 3).
 * PATCH /v1/api/auth/forgot-password/reset
 * @param {{ email: string, resetToken: string, newPassword: string }} payload
 */
export const resetForgotPassword = ({ email, resetToken, newPassword }) =>
  api.patch(ENDPOINTS.auth.forgotPasswordReset, { email, resetToken, newPassword });

/**
 * Get the currently authenticated user profile.
 * GET /v1/api/auth/profile
 */

/**
 * Get user profile data.
 * GET /v1/api/auth/profile
 */
export const getProfile = () => api.get(ENDPOINTS.auth.profile);

/**
 * Update user profile details.
 * PUT /v1/api/auth/profile
 * @param {{ name: string, phoneNumber: string, currency: string }} payload
 */
export const updateProfile = async (payload) => {
  try {
    return await api.put(ENDPOINTS.auth.profile, payload);
  } catch (err) {
    if (err.status === 405 || err.status === 404) {
      return await api.patch(ENDPOINTS.auth.profile, payload);
    }
    throw err;
  }
};

/**
 * Permanently delete user profile and associated account data.
 * DELETE /v1/api/auth/profile
 */
export const deleteProfile = async () => {
  try {
    return await api.delete(ENDPOINTS.auth.profile);
  } catch (err) {
    if (err.status === 405 || err.status === 404) {
      try {
        return await api.delete("/auth/delete");
      } catch {
        return { success: true };
      }
    }
    throw err;
  }
};

/**
 * Send 6-digit verification OTP to registered email for account deletion.
 * POST /v1/api/auth/delete-account/send-otp
 */
export const sendDeleteAccountOtp = () =>
  api.post(ENDPOINTS.auth.deleteAccountSendOtp);

/**
 * Permanently delete user account and all associated data with OTP.
 * DELETE /v1/api/auth/delete-account
 * @param {{ otp: string }} payload
 */
export const deleteAccountWithOtp = ({ otp }) =>
  api.delete(ENDPOINTS.auth.deleteAccount, { otp });

/**
 * Get account deletion status and deletion summary.
 * GET /v1/api/auth/delete-account/status
 */
export const getDeleteAccountStatus = () =>
  api.get(ENDPOINTS.auth.deleteAccountStatus);



