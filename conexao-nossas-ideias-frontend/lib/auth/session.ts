// Shared by proxy.ts (server) and the browser, so no "use client" here.
export const SESSION_COOKIE = 'cni_session';

const FALLBACK_MAX_AGE_SECONDS = 30 * 60;

const listeners = new Set<() => void>();

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function tokenMaxAge(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const secondsLeft = Math.floor(payload.exp - Date.now() / 1000);
    return secondsLeft > 0 ? secondsLeft : 0;
  } catch {
    return FALLBACK_MAX_AGE_SECONDS;
  }
}

export function getSessionToken() {
  if (typeof document === 'undefined') return null;

  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));

  return entry ? decodeURIComponent(entry.split('=')[1]) : null;
}

export function setSessionToken(token: string) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${tokenMaxAge(token)}; samesite=lax`;
  notify();
}

export function clearSessionToken() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
  notify();
}
