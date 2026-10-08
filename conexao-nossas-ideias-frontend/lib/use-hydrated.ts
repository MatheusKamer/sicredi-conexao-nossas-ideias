'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards.
 *
 * Data here is fetched on the client only (the session lives in a client cookie). A subtree
 * that hydrates late (e.g. inside <Suspense>) can find queries already cached by components
 * that hydrated earlier, and render something the server never did. Gating it on this hook
 * keeps the first client render identical to the server's.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
