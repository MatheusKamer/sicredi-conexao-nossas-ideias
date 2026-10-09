'use client';

import Link from 'next/link';
import { Alert, Box, Button, Card, Stack, Typography } from '@mui/material';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import BlockRounded from '@mui/icons-material/BlockRounded';
import InboxRounded from '@mui/icons-material/InboxRounded';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';
import TaskAltRounded from '@mui/icons-material/TaskAltRounded';
import type { RequestsSummary } from '@/lib/api/types';
import { formatPercent } from '@/lib/format';
import { useRequests, useRequestsSummary } from '@/lib/queries/requests';
import { PriorityChart } from '@/components/dashboard/priority-chart';
import { StatusChart } from '@/components/dashboard/status-chart';
import { RequestsTable } from '@/components/requests/requests-table';
import { MetricCard } from '@/components/ui/metric-card';

const RECENT_FILTERS = { page: 1, limit: 5, order: 'desc' } as const;

/** Share of the total, or undefined when there is nothing to divide by. */
function share(summary: RequestsSummary | undefined, count: number) {
  return summary && summary.total > 0 ? formatPercent(count / summary.total) : undefined;
}

export function DashboardView() {
  const summary = useRequestsSummary();
  const recent = useRequests(RECENT_FILTERS);

  const data = summary.data;
  const byStatus = data?.byStatus;
  const open = byStatus ? byStatus.PENDING + byStatus.UNDER_REVIEW : undefined;
  const decided = byStatus ? byStatus.APPROVED + byStatus.REJECTED : 0;
  const loadingSummary = summary.isPending && !summary.isError;

  // The API has no history, so the cards show shares of the current totals instead of the
  // design's "vs. mês anterior" deltas (PLAN.md G8).
  const highlight = (value: string | undefined, note: string) =>
    value === undefined ? undefined : { value, note };

  return (
    <Stack spacing={3}>
      {summary.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => summary.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar os indicadores. {summary.error.message}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
        }}
      >
        <MetricCard
          label="Total de solicitações"
          value={data?.total}
          icon={<InboxRounded />}
          loading={loadingSummary}
          highlight={highlight(share(data, decided), 'já decididas')}
        />
        <MetricCard
          label="Em aberto"
          value={open}
          icon={<PendingActionsRounded />}
          color="warning"
          loading={loadingSummary}
          highlight={byStatus && highlight(String(byStatus.UNDER_REVIEW), 'em análise')}
        />
        <MetricCard
          label="Aprovadas"
          value={byStatus?.APPROVED}
          icon={<TaskAltRounded />}
          color="secondary"
          loading={loadingSummary}
          highlight={highlight(share(data, byStatus?.APPROVED ?? 0), 'taxa de aprovação')}
        />
        <MetricCard
          label="Rejeitadas"
          value={byStatus?.REJECTED}
          icon={<BlockRounded />}
          color="error"
          loading={loadingSummary}
          highlight={highlight(share(data, byStatus?.REJECTED ?? 0), 'taxa de rejeição')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.74fr) minmax(0, 1fr)' },
        }}
      >
        <PriorityChart summary={data} loading={loadingSummary} />
        <StatusChart summary={data} loading={loadingSummary} />
      </Box>

      <Card>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5 }}
        >
          <Typography variant="h3" component="h2">
            Solicitações recentes
          </Typography>
          <Button
            component={Link}
            href="/solicitacoes"
            color="primary"
            size="small"
            endIcon={<ArrowForwardRounded />}
            sx={{ px: 1, py: 0.75, fontSize: 14 }}
          >
            Ver todas
          </Button>
        </Stack>
        {recent.isError ? (
          <Alert
            severity="error"
            sx={{ mx: 3, mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => recent.refetch()}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível carregar as solicitações recentes.
          </Alert>
        ) : (
          <RequestsTable
            variant="compact"
            rows={recent.data?.data}
            loading={recent.isPending}
            skeletonRows={RECENT_FILTERS.limit}
            emptyState={
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nenhuma solicitação registrada ainda. Use “Nova solicitação” para começar.
              </Typography>
            }
          />
        )}
      </Card>
    </Stack>
  );
}
