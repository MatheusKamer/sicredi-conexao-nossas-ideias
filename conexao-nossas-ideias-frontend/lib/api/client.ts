import { clearSessionToken, getSessionToken } from '@/lib/auth/session';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1`;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages[0] ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

let unauthorizedHandler: (() => void) | null = null;

// Registered by AuthProvider so an expired/invalid token sends the user back to /signin.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type QueryValue = string | number | boolean | undefined | null;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  auth?: boolean;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function parseError(response: Response) {
  // Nest errors look like { statusCode, message: string | string[], error }.
  const payload = await response.json().catch(() => null);
  const message = payload?.message;
  const messages = Array.isArray(message) ? message : message ? [String(message)] : [];

  return new ApiError(response.status, messages);
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, query, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers();
  const token = auth ? getSessionToken() : null;

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, ['Não foi possível conectar ao servidor.']);
  }

  if (response.status === 401 && auth) {
    clearSessionToken();
    unauthorizedHandler?.();
  }

  if (!response.ok) throw await parseError(response);

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
