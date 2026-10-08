'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  type RequestPriority,
  type RequestStatus,
  type SortOrder,
} from '@/lib/api/types';

export const PAGE_SIZES = [10, 25, 50] as const;

export type RequestListFilters = {
  search: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  order: SortOrder;
  page: number;
  limit: number;
};

const DEFAULTS = { search: '', order: 'desc', page: 1, limit: PAGE_SIZES[0] } as const;

function oneOf<T extends string>(values: readonly T[], value: string | null): T | undefined {
  return values.find((candidate) => candidate === value);
}

function positiveInt(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parse(params: URLSearchParams): RequestListFilters {
  const limit = positiveInt(params.get('limit'));

  return {
    search: params.get('search')?.trim() ?? DEFAULTS.search,
    status: oneOf(REQUEST_STATUSES, params.get('status')),
    priority: oneOf(REQUEST_PRIORITIES, params.get('priority')),
    order: params.get('order') === 'asc' ? 'asc' : DEFAULTS.order,
    page: positiveInt(params.get('page')) ?? DEFAULTS.page,
    limit: PAGE_SIZES.find((size) => size === limit) ?? DEFAULTS.limit,
  };
}

/**
 * The Solicitações filters live in the URL (`?search=&status=&priority=&order=&page=&limit=`),
 * so they survive reloads, can be shared, and the top-bar search can link straight into them.
 * Default values are left out of the URL. Any change that doesn't set `page` goes back to page 1.
 */
export function useRequestFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => parse(searchParams), [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<RequestListFilters>) => {
      const next = new URLSearchParams(searchParams.toString());
      if (!('page' in patch)) next.delete('page');

      for (const [key, value] of Object.entries(patch)) {
        const isDefault = value === undefined || value === DEFAULTS[key as keyof typeof DEFAULTS];
        if (isDefault) next.delete(key);
        else next.set(key, String(value));
      }

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  /** Resets search, status, priority and order; keeps the page size. */
  const clearFilters = useCallback(
    () => setFilters({ search: '', status: undefined, priority: undefined, order: 'desc' }),
    [setFilters],
  );

  const hasActiveFilters =
    filters.search !== '' || !!filters.status || !!filters.priority || filters.order !== 'desc';

  return { filters, setFilters, clearFilters, hasActiveFilters };
}
