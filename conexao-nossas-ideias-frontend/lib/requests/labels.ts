import type { AreaType, RequestPriority, RequestStatus, UserRole } from '@/lib/api/types';

export const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Aberta',
  UNDER_REVIEW: 'Em análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
};

export const PRIORITY_LABEL: Record<RequestPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export const AREA_TYPE_LABEL: Record<AreaType, string> = {
  AGENCY: 'Agências',
  HEADQUARTERS: 'Sede',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  MANAGER: 'Gestor',
  ASSISTANT: 'Assistente',
};
