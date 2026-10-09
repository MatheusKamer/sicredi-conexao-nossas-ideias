'use client';

import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CancelRounded from '@mui/icons-material/CancelRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import GavelRounded from '@mui/icons-material/GavelRounded';
import type { Request } from '@/lib/api/types';
import { useUpdateRequestStatus } from '@/lib/queries/requests';
import { STATUS_LABEL } from '@/lib/requests/labels';
import { DialogShell } from '@/components/ui/dialog-shell';
import { useNotify } from '@/components/ui/feedback-provider';
import { HelperRow } from '@/components/ui/helper-row';
import { OptionCard } from '@/components/ui/option-card';
import { DialogHint, HistoryNote } from './dialog-hint';
import { RequestSummary } from './request-summary';
import { StatusChip } from './status-chip';
import { updateErrorMessage } from './update-error-message';

const COMMENT_MAX = 1000;
const DECISIONS = ['APPROVED', 'REJECTED'] as const;

// The backend requires decisionComment for APPROVED/REJECTED; the length limit comes from the design.
const schema = z.object({
  decision: z.enum(DECISIONS, { error: 'Selecione a decisão.' }),
  comment: z
    .string()
    .trim()
    .min(1, 'Explique o motivo da decisão.')
    .max(COMMENT_MAX, `Use no máximo ${COMMENT_MAX} caracteres.`),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

// No decision is preselected: it's final, so the manager has to choose it explicitly.
const DEFAULT_VALUES = { decision: undefined, comment: '' } as unknown as FormInput;

const DECISION_OPTION = {
  APPROVED: {
    label: 'Aprovar',
    description: 'A solicitação segue para execução pela área responsável.',
    icon: CheckCircleRounded,
    color: 'primary',
  },
  REJECTED: {
    label: 'Rejeitar',
    description: 'A solicitação é encerrada sem execução.',
    icon: CancelRounded,
    color: 'error',
  },
} as const;

type DecisionDialogProps = {
  open: boolean;
  /** Kept after closing so the content doesn't disappear during the exit transition. */
  request: Request | null;
  onClose: () => void;
};

/** UNDER_REVIEW → APPROVED | REJECTED, with the mandatory decision comment. */
export function DecisionDialog({ open, request, onClose }: DecisionDialogProps) {
  const notify = useNotify();
  const updateStatus = useUpdateRequestStatus();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });
  const { ref: commentRef, ...commentField } = register('comment');
  const comment = useWatch({ control, name: 'comment' });

  const { reset: resetMutation } = updateStatus;
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  const onSubmit = handleSubmit(({ decision, comment }) => {
    if (!request) return;
    updateStatus.mutate(
      { id: request.id, input: { status: decision, decisionComment: comment } },
      {
        onSuccess: () => {
          onClose();
          notify(`Decisão registrada: solicitação ${STATUS_LABEL[decision].toLowerCase()}.`);
        },
      },
    );
  });

  const busy = updateStatus.isPending;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      busy={busy}
      onSubmit={onSubmit}
      onEntered={() => setFocus('decision')}
      title="Decisão final"
      subtitle="Registre o parecer final da solicitação. Apenas o status e o comentário da decisão podem ser preenchidos."
      footerNote={<HistoryNote />}
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<GavelRounded />} loading={busy}>
            Confirmar decisão
          </Button>
        </>
      }
    >
      {updateStatus.isError && (
        <Alert severity="error">{updateErrorMessage(updateStatus.error, 'a decisão')}</Alert>
      )}

      {request && <RequestSummary request={request} />}

      <Controller
        control={control}
        name="decision"
        render={({ field, fieldState }) => (
          <FormControl component="fieldset" required error={!!fieldState.error}>
            <FormLabel
              component="legend"
              sx={{ mb: 1, fontSize: 13, fontWeight: 500, color: 'text.secondary' }}
            >
              Decisão
            </FormLabel>
            <RadioGroup
              name={field.name}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {DECISIONS.map((decision, index) => {
                  const { label, description, icon: Icon, color } = DECISION_OPTION[decision];
                  return (
                    <OptionCard
                      key={decision}
                      value={decision}
                      checked={field.value === decision}
                      color={color}
                      inputRef={index === 0 ? field.ref : undefined}
                    >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Icon sx={{ fontSize: 20, color: `${color}.main` }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{label}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {description}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          Novo status:
                        </Typography>
                        <StatusChip status={decision} />
                      </Stack>
                    </OptionCard>
                  );
                })}
              </Box>
            </RadioGroup>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <TextField
        {...commentField}
        inputRef={commentRef}
        label="Comentário da decisão"
        required
        multiline
        minRows={4}
        maxRows={10}
        error={!!errors.comment}
        helperText={
          <HelperRow
            text={
              errors.comment?.message ??
              'Explique o motivo da decisão. O comentário ficará visível nos detalhes da solicitação.'
            }
            count={comment.length}
            max={COMMENT_MAX}
          />
        }
        slotProps={{
          htmlInput: { maxLength: COMMENT_MAX },
          formHelperText: { component: 'div' },
        }}
      />

      <DialogHint severity="warning">
        A decisão final é definitiva e não poderá ser alterada após a confirmação.
      </DialogHint>
    </DialogShell>
  );
}
