// Mirrors the backend contract (conexao-nossas-ideias-backend, /api/v1).

export const REQUEST_STATUSES = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export type UserRole = 'MANAGER' | 'ASSISTANT';
export type AreaType = 'AGENCY' | 'HEADQUARTERS';
export type SortOrder = 'asc' | 'desc';

export type User = {
  id: string;
  name: string | null;
  email: string;
  ldap: string | null;
  role: UserRole;
};

export type Area = {
  id: string;
  name: string;
  type: AreaType;
};

export type Request = {
  id: string;
  title: string;
  description: string;
  requester: string;
  areaId: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  decisionComment: string | null;
  decidedAt: string | null;
  user: { id: string; name: string | null };
  area: Area;
};

export type Paginated<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type RequestsSummary = {
  total: number;
  byStatus: Record<RequestStatus, number>;
  byPriority: Record<RequestPriority, number>;
};

export type RequestFilters = {
  search?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  areaId?: string;
  page?: number;
  limit?: number;
  order?: SortOrder;
};

export type SigninInput = { email: string; password: string };

export type CreateRequestInput = {
  title: string;
  description: string;
  areaId: string;
  priority: RequestPriority;
};

export type UpdateRequestStatusInput =
  | { status: 'UNDER_REVIEW' }
  | { status: 'APPROVED' | 'REJECTED'; decisionComment: string };
