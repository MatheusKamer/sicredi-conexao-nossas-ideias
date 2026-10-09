'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import CheckRounded from '@mui/icons-material/CheckRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import { ApiError } from '@/lib/api/client';
import { REQUEST_PRIORITIES, type Area, type RequestPriority } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAreas, useCreateRequest } from '@/lib/queries/requests';
import { AREA_TYPE_LABEL, PRIORITY_LABEL } from '@/lib/requests/labels';
import { DialogShell } from '@/components/ui/dialog-shell';
import { useNotify } from '@/components/ui/feedback-provider';
import { HelperRow } from '@/components/ui/helper-row';
import { DialogHint } from './dialog-hint';

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;

// The backend (CreateRequestDto) only requires non-empty values; the length limits come from the design.
const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Informe o título da solicitação.')
    .max(TITLE_MAX, `Use no máximo ${TITLE_MAX} caracteres.`),
  description: z
    .string()
    .trim()
    .min(1, 'Descreva a solicitação.')
    .max(DESCRIPTION_MAX, `Use no máximo ${DESCRIPTION_MAX} caracteres.`),
  areaId: z.string().min(1, 'Selecione o departamento.'),
  priority: z.enum(REQUEST_PRIORITIES),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = { title: '', description: '', areaId: '', priority: 'MEDIUM' };

const PRIORITY_HINT: Record<RequestPriority, string> = {
  LOW: 'melhoria desejável, sem impacto imediato na operação. Prazo de análise: até 10 dias úteis.',
  MEDIUM: 'impacto em processos internos, sem prazo regulatório. Prazo de análise: até 5 dias úteis.',
  HIGH: 'impacto direto em associados, risco operacional ou prazo regulatório. Prazo de análise: até 2 dias úteis.',
};

// "Sede" first, then the agencies; alphabetical inside each group (groupBy needs them contiguous).
const AREA_TYPE_ORDER = { HEADQUARTERS: 0, AGENCY: 1 } as const;

function sortAreas(areas: Area[]) {
  return [...areas].sort(
    (a, b) =>
      AREA_TYPE_ORDER[a.type] - AREA_TYPE_ORDER[b.type] || a.name.localeCompare(b.name, 'pt-BR'),
  );
}

function submitErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 0) return error.message;
  if (error instanceof ApiError && error.status === 400) {
    return 'Alguns dados não foram aceitos pelo servidor. Revise os campos e tente novamente.';
  }
  return 'Não foi possível salvar a solicitação. Tente novamente em instantes.';
}

type NewRequestDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function NewRequestDialog({ open, onClose }: NewRequestDialogProps) {
  const { user } = useAuth();
  const notify = useNotify();
  const areas = useAreas();
  const createRequest = useCreateRequest();
  const areaOptions = useMemo(() => sortAreas(areas.data ?? []), [areas.data]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });
  const { ref: titleRef, ...titleField } = register('title');
  const { ref: descriptionRef, ...descriptionField } = register('description');

  const [title, description, priority] = useWatch({
    control,
    name: ['title', 'description', 'priority'],
  });

  // Every opening starts from a clean form (closing keeps the values visible during the exit transition).
  const { reset: resetMutation } = createRequest;
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  const onSubmit = handleSubmit((values) =>
    createRequest.mutate(values, {
      onSuccess: () => {
        onClose();
        notify('Solicitação registrada com sucesso.');
      },
    }),
  );

  const busy = createRequest.isPending;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      busy={busy}
      onSubmit={onSubmit}
      onEntered={() => setFocus('title')}
      title="Nova Solicitação"
      subtitle="Registre uma demanda ou ideia para avaliação do comitê da sua área."
      footerNote="* Campos obrigatórios"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<CheckRounded />} loading={busy}>
            Salvar
          </Button>
        </>
      }
    >
      {createRequest.isError && (
        <Alert severity="error">{submitErrorMessage(createRequest.error)}</Alert>
      )}

      <TextField
        {...titleField}
        inputRef={titleRef}
        label="Título da solicitação"
        required
        error={!!errors.title}
        helperText={
          <HelperRow
            text={errors.title?.message ?? 'Descreva a demanda em uma frase objetiva.'}
            count={title.length}
            max={TITLE_MAX}
          />
        }
        slotProps={{
          htmlInput: { maxLength: TITLE_MAX },
          formHelperText: { component: 'div' },
        }}
      />

      <TextField
        {...descriptionField}
        inputRef={descriptionRef}
        label="Descrição"
        required
        multiline
        minRows={4}
        maxRows={10}
        error={!!errors.description}
        helperText={
          <HelperRow
            text={
              errors.description?.message ??
              'Inclua contexto, impacto esperado e prazos, se houver.'
            }
            count={description.length}
            max={DESCRIPTION_MAX}
          />
        }
        slotProps={{
          htmlInput: { maxLength: DESCRIPTION_MAX },
          formHelperText: { component: 'div' },
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <TextField
          label="Solicitante"
          value={user?.name ?? user?.email ?? ''}
          disabled
          helperText="Preenchido com seu usuário."
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <LockRounded fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'background.default',
                '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                // Read-only, but the value itself should stay legible.
                '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'inherit', color: 'text.primary' },
              },
            },
          }}
        />

        <Controller
          control={control}
          name="areaId"
          render={({ field, fieldState }) => (
            <Autocomplete
              options={areaOptions}
              groupBy={(area) => AREA_TYPE_LABEL[area.type]}
              getOptionLabel={(area) => area.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={areaOptions.find((area) => area.id === field.value) ?? null}
              onChange={(_, area) => field.onChange(area?.id ?? '')}
              onBlur={field.onBlur}
              loading={areas.isPending}
              loadingText="Carregando departamentos…"
              noOptionsText="Nenhum departamento encontrado"
              openText="Abrir"
              closeText="Fechar"
              clearText="Limpar"
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={field.ref}
                  label="Departamento"
                  required
                  placeholder="Buscar agência ou área"
                  error={!!fieldState.error || areas.isError}
                  helperText={
                    fieldState.error?.message ??
                    (areas.isError ? 'Não foi possível carregar os departamentos.' : undefined)
                  }
                />
              )}
            />
          )}
        />
      </Box>

      <FormControl component="fieldset" required>
        <FormLabel
          component="legend"
          sx={{ mb: 0.75, fontSize: 13, fontWeight: 500, color: 'text.secondary' }}
        >
          Nível de prioridade
        </FormLabel>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <RadioGroup row {...field} sx={{ gap: 2 }}>
              {REQUEST_PRIORITIES.map((value) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  label={PRIORITY_LABEL[value]}
                  control={<Radio sx={{ color: 'outline' }} />}
                  sx={{
                    mr: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 15,
                      fontWeight: field.value === value ? 500 : 400,
                    },
                  }}
                />
              ))}
            </RadioGroup>
          )}
        />
        <Box aria-live="polite" sx={{ mt: 0.75 }}>
          <DialogHint>
            <Box component="strong" sx={{ fontWeight: 600 }}>
              {PRIORITY_LABEL[priority]}:
            </Box>{' '}
            {PRIORITY_HINT[priority]}
          </DialogHint>
        </Box>
      </FormControl>
    </DialogShell>
  );
}
