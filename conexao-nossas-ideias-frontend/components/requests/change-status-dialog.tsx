'use client';

import { useEffect, useRef } from 'react';
import { Alert, Box, Button, FormControl, FormLabel, RadioGroup, Stack, Typography } from '@mui/material';
import CheckRounded from '@mui/icons-material/CheckRounded';
import type { Request } from '@/lib/api/types';
import { useUpdateRequestStatus } from '@/lib/queries/requests';
import { DialogShell } from '@/components/ui/dialog-shell';
import { useNotify } from '@/components/ui/feedback-provider';
import { OptionCard } from '@/components/ui/option-card';
import { DialogHint, HistoryNote } from './dialog-hint';
import { RequestSummary } from './request-summary';
import { StatusChip } from './status-chip';
import { updateErrorMessage } from './update-error-message';

type ChangeStatusDialogProps = {
  open: boolean;
  /** Kept after closing so the content doesn't disappear during the exit transition. */
  request: Request | null;
  onClose: () => void;
};

const optionText = { fontSize: 13, color: 'text.secondary' } as const;

/**
 * PENDING → UNDER_REVIEW. "Em análise" is the only valid target at this stage
 * (approval/rejection happen in DecisionDialog), so it is preselected and the
 * current status is shown for context but can't be picked.
 */
export function ChangeStatusDialog({ open, request, onClose }: ChangeStatusDialogProps) {
  const notify = useNotify();
  const updateStatus = useUpdateRequestStatus();
  const targetRef = useRef<HTMLInputElement>(null);

  const { reset: resetMutation } = updateStatus;
  useEffect(() => {
    if (open) resetMutation();
  }, [open, resetMutation]);

  const busy = updateStatus.isPending;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      busy={busy}
      onEntered={() => targetRef.current?.focus()}
      onSubmit={(event) => {
        event.preventDefault();
        if (!request) return;
        updateStatus.mutate(
          { id: request.id, input: { status: 'UNDER_REVIEW' } },
          {
            onSuccess: () => {
              onClose();
              notify('Status atualizado para Em análise.');
            },
          },
        );
      }}
      title="Alterar status"
      subtitle="Atualize o andamento da solicitação. Os demais dados não podem ser editados nesta etapa."
      footerNote={<HistoryNote />}
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<CheckRounded />} loading={busy}>
            Atualizar status
          </Button>
        </>
      }
    >
      {updateStatus.isError && (
        <Alert severity="error">{updateErrorMessage(updateStatus.error, 'o status')}</Alert>
      )}

      {request && <RequestSummary request={request} />}

      <FormControl component="fieldset" required>
        <FormLabel
          component="legend"
          sx={{ mb: 1, fontSize: 13, fontWeight: 500, color: 'text.secondary' }}
        >
          Novo status
        </FormLabel>
        <RadioGroup name="status" value="UNDER_REVIEW">
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
          >
            <OptionCard value="PENDING" checked={false} disabled>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}
              >
                <StatusChip status="PENDING" />
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>
                  Status atual
                </Typography>
              </Stack>
              <Typography sx={optionText}>Registrada e aguardando início da análise.</Typography>
            </OptionCard>
            <OptionCard value="UNDER_REVIEW" checked inputRef={targetRef}>
              <Box>
                <StatusChip status="UNDER_REVIEW" />
              </Box>
              <Typography sx={optionText}>Em avaliação pelo comitê da área responsável.</Typography>
            </OptionCard>
          </Box>
        </RadioGroup>
      </FormControl>

      <DialogHint>
        Aprovação ou rejeição são registradas na etapa de Decisão final, após a análise.
      </DialogHint>
    </DialogShell>
  );
}
