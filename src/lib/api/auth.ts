import "server-only";
import { ApiError, apiRequest, isLive } from "./client";
import * as mock from "./mock/auth";
import type { LoginRequest, LoginResponse, Message, ResetPasswordRequest, User } from "./types";

/** The build phase that introduced sign-in (x-phase in openapi.yaml). */
const PHASE = 2;

/** `POST /api/auth/login`. Throws ApiError with the API's message on 401, 403, 422 and 429. */
export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return isLive(PHASE)
    ? apiRequest("/api/auth/login", { method: "POST", body: credentials, token: null })
    : mock.login(credentials);
}

/** `POST /api/auth/logout` — revokes the token. */
export function logout(token: string): Promise<void> {
  return isLive(PHASE)
    ? apiRequest("/api/auth/logout", { method: "POST", token })
    : Promise.resolve();
}

/** `GET /api/me`, or null when the token is unknown, expired, revoked or deactivated. */
export async function getMe(token: string): Promise<User | null> {
  if (!isLive(PHASE)) {
    return mock.getMe(token);
  }

  try {
    return await apiRequest<User>("/api/me", { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** `POST /api/auth/forgot-password`. Returns the confirmation, which is the same whether or not the account exists. */
export async function requestPasswordReset(email: string): Promise<string> {
  if (!isLive(PHASE)) {
    return mock.requestPasswordReset(email);
  }

  const { message } = await apiRequest<Message>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    token: null,
  });
  return message;
}

/** `POST /api/auth/reset-password`. Throws ApiError (422) when the link is invalid or expired. */
export function resetPassword(input: ResetPasswordRequest): Promise<void> {
  return isLive(PHASE)
    ? apiRequest("/api/auth/reset-password", { method: "POST", body: input, token: null })
    : mock.resetPassword(input);
}

/** True while sign-in is served by the mock adapter (no API_URL). */
export function usesDemoSignIn(): boolean {
  return !isLive(PHASE);
}
