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
