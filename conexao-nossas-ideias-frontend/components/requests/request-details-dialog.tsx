'use client';

import { Button, Stack, Typography } from '@mui/material';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import type { Request } from '@/lib/api/types';
import { formatDate, formatTime } from '@/lib/format';
import { DialogShell } from '@/components/ui/dialog-shell';
import { RequestSummary } from './request-summary';
import { StatusChip } from './status-chip';

type RequestDetailsDialogProps = {
  open: boolean;
  /** Kept after closing so the content doesn't disappear during the exit transition. */
  request: Request | null;
  onClose: () => void;
};

/** Read-only view of a decided (approved/rejected) request, including the final decision. */
export function RequestDetailsDialog({ open, request, onClose }: RequestDetailsDialogProps) {
  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title="Detalhes da solicitação"
      subtitle="Solicitação encerrada. A decisão final não pode ser alterada."
      footerNote={
        request?.decidedAt && (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <HistoryRounded sx={{ fontSize: 18 }} />
            <span>
              Decidida em {formatDate(request.decidedAt)} às {formatTime(request.decidedAt)}
            </span>
          </Stack>
        )
      }
      actions={
        <Button variant="outlined" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {request && (
        <>
          <RequestSummary request={request} />
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Decisão final
              </Typography>
              <StatusChip status={request.status} />
            </Stack>
            <Typography
              variant="body2"
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                whiteSpace: 'pre-line',
                color: request.decisionComment ? 'text.primary' : 'text.secondary',
              }}
            >
              {request.decisionComment || 'Nenhum comentário registrado.'}
            </Typography>
          </Stack>
        </>
      )}
    </DialogShell>
  );
}
