import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

/**
 * The newest build phase whose endpoints bovas-api implements (x-phase in openapi.yaml).
 * Calls from later phases keep using the mock adapter even when API_URL is set, so every
 * screen keeps working while the API is built. Keep in step with App::IMPLEMENTED_PHASE.
 */
export const API_PHASE = 6;

/** An error response from the PHP API. `fieldErrors` holds the 422 messages by field path. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  /** Sent as multipart when it's FormData, otherwise as JSON. */
  body?: unknown;
  /**
   * The bearer token. Leave it out to act as the signed-in staff member: a 401 then sends them
   * to sign in and a 403 to "no access". Pass null for public endpoints such as sign-in.
   */
  token?: string | null;
}

interface ErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

/** True when calls from this build phase go to bovas-api rather than the mock adapter. */
export function isLive(phase: number): boolean {
  return Boolean(process.env.API_URL) && phase <= API_PHASE;
}

/**
 * Answers a read from bovas-api when its phase is live, otherwise from the mock adapter in
 * ./mock, which returns the same contract shapes. Either way the page renders per request.
 */
export async function fromApi<T>(
  phase: number,
  live: () => Promise<T>,
  mock: () => Promise<T>,
): Promise<T> {
  await connection();
  return isLive(phase) ? live() : mock();
}

/** Sends a request and returns the raw response once it's known to be successful. */
async function send(path: string, { method = "GET", query, body, token }: RequestOptions): Promise<Response> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not set. Add it to .env.local to call bovas-api.");
  }

  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const actsAsSession = token === undefined;
  const bearer = actsAsSession ? await getSessionToken() : token;
  const isMultipart = body instanceof FormData;

  const headers: Record<string, string> = { Accept: "application/json" };
  // fetch sets the multipart boundary itself.
  if (body !== undefined && !isMultipart) headers["Content-Type"] = "application/json";
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : isMultipart ? body : JSON.stringify(body),
    cache: "no-store",
  });

  if (actsAsSession && response.status === 401) {
    redirect("/?reason=expired");
  }
  if (actsAsSession && response.status === 403) {
    redirect("/no-access");
  }

  if (!response.ok) {
    const error = ((await response.json().catch(() => null)) ?? {}) as ErrorBody;
    throw new ApiError(
      response.status,
      error.message ?? `The API responded with status ${response.status}.`,
      error.errors,
    );
  }

  return response;
}

/** Calls bovas-api and decodes the JSON answer. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Calls bovas-api for a file (a CSV export, a picture) and returns the response to stream on. */
export function apiDownload(path: string, options: Omit<RequestOptions, "body"> = {}): Promise<Response> {
  return send(path, options);
}

/** Resolves to null instead of throwing when the API answers with `status` (404 by default). */
export async function orNull<T>(request: Promise<T>, status = 404): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === status) return null;
    throw error;
  }
}
