'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FilterAltOffRounded from '@mui/icons-material/FilterAltOffRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  type RequestStatus,
  type RequestsSummary,
} from '@/lib/api/types';
import { PRIORITY_LABEL, STATUS_LABEL } from '@/lib/requests/labels';
import type { RequestListFilters } from '@/lib/requests/use-request-filters';

const SEARCH_DEBOUNCE_MS = 300;

// Plural labels for the quick-status pills ("Abertas", not "Aberta").
const QUICK_STATUSES: { status?: RequestStatus; label: string }[] = [
  { label: 'Todas' },
  { status: 'PENDING', label: 'Abertas' },
  { status: 'UNDER_REVIEW', label: 'Em análise' },
  { status: 'APPROVED', label: 'Aprovadas' },
  { status: 'REJECTED', label: 'Rejeitadas' },
];

const ALL = '';
const fieldProps = { slotProps: { inputLabel: { shrink: true } } } as const;
const selectProps = {
  select: true,
  slotProps: { inputLabel: { shrink: true }, select: { displayEmpty: true } },
} as const;

/** Keeps its own input value and writes it to the URL after a pause in typing. */
function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [input, setInput] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // The URL changed from outside (top-bar search, "Limpar filtros"): show the new value.
  // Ignore changes that only trimmed what the user is still typing.
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== input.trim()) setInput(value);
  }

  useEffect(() => {
    const search = input.trim();
    if (search === value) return;
    const timeout = setTimeout(() => onChange(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [input, value, onChange]);

  return (
    <TextField
      label="Buscar"
      placeholder="Título ou descrição"
      value={input}
      onChange={(event) => setInput(event.target.value)}
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: { maxLength: 100, type: 'search' },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SearchRounded sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function QuickStatusPill({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number | undefined;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        gap: 0.75,
        px: 1.5,
        py: '5px',
        borderRadius: 4,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.main' : 'background.paper',
        color: selected ? 'primary.contrastText' : 'text.primary',
        transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
        '&:hover': { borderColor: selected ? 'primary.dark' : 'outline' },
        '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
        {label}
      </Typography>
      {count === undefined ? (
        <Skeleton width={16} sx={{ fontSize: 12 }} />
      ) : (
        <Typography
          component="span"
          sx={{ fontSize: 12, fontWeight: 600, color: selected ? 'primary.light' : 'text.secondary' }}
        >
          {count}
        </Typography>
      )}
    </ButtonBase>
  );
}

type RequestsFiltersProps = {
  filters: RequestListFilters;
  onChange: (patch: Partial<RequestListFilters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  /** Global totals: the pills ignore the other filters (MVP decision). */
  summary: RequestsSummary | undefined;
  /** Number of requests matching the current filters; undefined while loading. */
  total: number | undefined;
};

export function RequestsFilters({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
  summary,
  total,
}: RequestsFiltersProps) {
  return (
    <Card sx={{ px: 3, pt: 3, pb: 2.25 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'minmax(0, 1.6fr) repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <SearchField value={filters.search} onChange={(search) => onChange({ search })} />

        <TextField
          {...selectProps}
          label="Status"
          value={filters.status ?? ALL}
          onChange={(event) =>
            onChange({ status: (event.target.value || undefined) as RequestStatus | undefined })
          }
        >
          <MenuItem value={ALL}>Todos os status</MenuItem>
          {REQUEST_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {STATUS_LABEL[status]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          {...selectProps}
          label="Prioridade"
          value={filters.priority ?? ALL}
          onChange={(event) =>
            onChange({
              priority: (event.target.value || undefined) as RequestListFilters['priority'],
            })
          }
        >
          <MenuItem value={ALL}>Todas as prioridades</MenuItem>
          {REQUEST_PRIORITIES.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {PRIORITY_LABEL[priority]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          {...fieldProps}
          select
          label="Ordenar por data"
          value={filters.order}
          onChange={(event) => onChange({ order: event.target.value as RequestListFilters['order'] })}
        >
          <MenuItem value="desc">Mais recentes primeiro</MenuItem>
          <MenuItem value="asc">Mais antigos primeiro</MenuItem>
        </TextField>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          mt: 2.5,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <Stack
          direction="row"
          useFlexGap
          role="group"
          aria-label="Status rápido"
          sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
        >
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Status rápido:</Typography>
          {QUICK_STATUSES.map(({ status, label }) => (
            <QuickStatusPill
              key={label}
              label={label}
              count={summary && (status ? summary.byStatus[status] : summary.total)}
              selected={filters.status === status}
              onClick={() => onChange({ status })}
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5, whiteSpace: 'nowrap' }}
        >
          <Typography role="status" sx={{ fontSize: 13, color: 'text.secondary' }}>
            {total === undefined
              ? 'Carregando…'
              : `${total} ${total === 1 ? 'solicitação encontrada' : 'solicitações encontradas'}`}
          </Typography>
          <Button
            color="primary"
            size="small"
            startIcon={<FilterAltOffRounded />}
            onClick={onClear}
            disabled={!hasActiveFilters}
            sx={{ px: 1, py: 0.75, fontSize: 14 }}
          >
            Limpar filtros
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
