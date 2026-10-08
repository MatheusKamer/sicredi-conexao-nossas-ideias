import { apiRequest } from './client';
import type {
  Area,
  CreateRequestInput,
  Paginated,
  Request,
  RequestFilters,
  RequestsSummary,
  SigninInput,
  UpdateRequestStatusInput,
  User,
} from './types';

export const authApi = {
  signin: (input: SigninInput) =>
    apiRequest<{ accessToken: string }>('/auth/signin', {
      method: 'POST',
      body: input,
      auth: false,
    }),
};

export const usersApi = {
  me: () => apiRequest<User>('/users/me'),
};

export const areasApi = {
  list: () => apiRequest<Area[]>('/areas'),
};

export const requestsApi = {
  list: (filters: RequestFilters) =>
    apiRequest<Paginated<Request>>('/requests', { query: filters }),
  summary: () => apiRequest<RequestsSummary>('/requests/summary'),
  get: (id: string) => apiRequest<Request>(`/requests/${id}`),
  create: (input: CreateRequestInput) =>
    apiRequest<Request>('/requests', { method: 'POST', body: input }),
  updateStatus: (id: string, input: UpdateRequestStatusInput) =>
    apiRequest<Request>(`/requests/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => apiRequest<void>(`/requests/${id}`, { method: 'DELETE' }),
};
