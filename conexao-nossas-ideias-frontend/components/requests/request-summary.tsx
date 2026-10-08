import { Box, Stack, Typography } from '@mui/material';
import LockRounded from '@mui/icons-material/LockRounded';
import type { Request } from '@/lib/api/types';
import { formatDate, formatRequestCode } from '@/lib/format';
import { PriorityLabel } from './priority-label';

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      {typeof children === 'string' ? (
        <Typography variant="body2" noWrap title={children} sx={{ fontWeight: 500 }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Stack>
  );
}

/** Read-only request card used at the top of the status and decision dialogs. */
export function RequestSummary({ request }: { request: Request }) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {formatRequestCode(request.id)} · Solicitação
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            px: 1,
            py: '2px',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: '12px',
            color: 'text.secondary',
          }}
        >
          <LockRounded sx={{ fontSize: 12 }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            Somente leitura
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={0.5}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{request.title}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'pre-line' }}>
          {request.description}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
          pt: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Meta label="Departamento">{request.area.name}</Meta>
        <Meta label="Solicitante">{request.user.name ?? '—'}</Meta>
        <Meta label="Prioridade">
          <PriorityLabel priority={request.priority} />
        </Meta>
        <Meta label="Criado em">{formatDate(request.createdAt)}</Meta>
      </Box>
    </Stack>
  );
}
