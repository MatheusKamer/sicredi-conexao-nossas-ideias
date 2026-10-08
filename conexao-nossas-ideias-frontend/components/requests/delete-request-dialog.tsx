'use client';

import { Alert, Button } from '@mui/material';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import type { Request } from '@/lib/api/types';
import { useDeleteRequest } from '@/lib/queries/requests';
import { DialogShell } from '@/components/ui/dialog-shell';
import { RequestSummary } from './request-summary';

type DeleteRequestDialogProps = {
  open: boolean;
  /** Kept after closing so the content doesn't disappear during the exit transition. */
  request: Request | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteRequestDialog({ open, request, onClose, onDeleted }: DeleteRequestDialogProps) {
  const deleteRequest = useDeleteRequest();

  const close = () => {
    deleteRequest.reset();
    onClose();
  };

  return (
    <DialogShell
      open={open}
      onClose={close}
      busy={deleteRequest.isPending}
      title="Excluir solicitação"
      subtitle="Esta ação não pode ser desfeita. Apenas solicitações abertas podem ser excluídas."
      actions={
        <>
          <Button variant="outlined" onClick={close} disabled={deleteRequest.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteRounded />}
            loading={deleteRequest.isPending}
            onClick={() =>
              request &&
              deleteRequest.mutate(request.id, {
                onSuccess: () => {
                  deleteRequest.reset();
                  onDeleted();
                },
              })
            }
          >
            Excluir
          </Button>
        </>
      }
    >
      {request && <RequestSummary request={request} />}
      {deleteRequest.isError && (
        <Alert severity="error">
          Não foi possível excluir a solicitação. {deleteRequest.error.message}
        </Alert>
      )}
    </DialogShell>
  );
}
