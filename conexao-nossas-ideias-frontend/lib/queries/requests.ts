'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { areasApi, requestsApi } from '@/lib/api/endpoints';
import type { RequestFilters, UpdateRequestStatusInput } from '@/lib/api/types';

export const queryKeys = {
  me: ['me'] as const,
  areas: ['areas'] as const,
  requests: ['requests'] as const,
  requestsList: (filters: RequestFilters) => ['requests', 'list', filters] as const,
  requestsSummary: ['requests', 'summary'] as const,
  request: (id: string) => ['requests', 'detail', id] as const,
};

export function useAreas() {
  return useQuery({
    queryKey: queryKeys.areas,
    queryFn: areasApi.list,
    staleTime: Infinity,
  });
}

export function useRequests(filters: RequestFilters) {
  return useQuery({
    queryKey: queryKeys.requestsList(filters),
    queryFn: () => requestsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRequestsSummary() {
  return useQuery({
    queryKey: queryKeys.requestsSummary,
    queryFn: requestsApi.summary,
  });
}

// Every mutation invalidates the whole ['requests'] tree: lists, summary and details.
function useInvalidateRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.requests });
}

export function useCreateRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({ mutationFn: requestsApi.create, onSuccess: invalidate });
}

export function useUpdateRequestStatus() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRequestStatusInput }) =>
      requestsApi.updateStatus(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({ mutationFn: requestsApi.remove, onSuccess: invalidate });
}
