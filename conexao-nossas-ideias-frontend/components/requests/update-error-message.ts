import { ApiError } from '@/lib/api/client';

/** pt-BR message for a failed PATCH /requests/:id. `subject` completes "Não foi possível atualizar …". */
export function updateErrorMessage(error: unknown, subject: string) {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message;
    if (error.status === 404) return 'Esta solicitação não existe mais. Atualize a lista e tente novamente.';
  }
  return `Não foi possível atualizar ${subject}. Tente novamente em instantes.`;
}
