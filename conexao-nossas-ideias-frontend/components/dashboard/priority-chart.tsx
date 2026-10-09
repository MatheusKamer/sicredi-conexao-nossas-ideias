'use client';

import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { REQUEST_PRIORITIES, type RequestsSummary } from '@/lib/api/types';
import { PRIORITY_LABEL } from '@/lib/requests/labels';
import { ChartCard } from './chart-card';

const CHART_HEIGHT = 248;

/**
 * Totals per priority (the API has no monthly series, see PLAN.md G8).
 * One series over three ordered categories: the x-axis labels identify the bars, so there is no
 * legend; the light→dark green ramp only reinforces the order. The palest bar has low contrast on
 * white, so every bar also carries its value.
 */
export function PriorityChart({ summary, loading }: { summary?: RequestsSummary; loading: boolean }) {
  const theme = useTheme();
  const labels = REQUEST_PRIORITIES.map((priority) => PRIORITY_LABEL[priority]);
  const tickLabelStyle = { fill: theme.palette.text.secondary, fontSize: 12 };
  const values = REQUEST_PRIORITIES.map((priority) => summary?.byPriority[priority] ?? 0);

  return (
    <ChartCard title="Distribuição por prioridade" subtitle="Total de solicitações por nível de prioridade">
      {loading ? (
        <Skeleton variant="rounded" height={CHART_HEIGHT} />
      ) : summary?.total === 0 ? (
        <Box sx={{ height: CHART_HEIGHT, display: 'grid', placeItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nenhuma solicitação registrada ainda.
          </Typography>
        </Box>
      ) : (
        <BarChart
          height={CHART_HEIGHT}
          hideLegend
          borderRadius={4}
          grid={{ horizontal: true }}
          margin={{ left: 0, right: 8, top: 24, bottom: 0 }}
          xAxis={[
            {
              scaleType: 'band',
              data: labels,
              categoryGapRatio: 0.6,
              disableTicks: true,
              tickLabelStyle,
              colorMap: {
                type: 'ordinal',
                values: labels,
                colors: REQUEST_PRIORITIES.map((priority) => theme.palette.priority[priority]),
              },
            },
          ]}
          yAxis={[
            {
              tickMinStep: 1,
              disableLine: true,
              disableTicks: true,
              width: 32,
              tickLabelStyle,
              // ~20% headroom so the value label above the tallest bar isn't clipped.
              domainLimit: (min, max) => ({ min, max: Math.ceil(Number(max) * 1.2) }),
            },
          ]}
          series={[
            {
              data: values,
              label: 'Solicitações',
              barLabel: 'value',
              barLabelPlacement: 'outside',
            },
          ]}
          sx={{
            '& .MuiChartsAxis-line': { stroke: theme.palette.outline },
            '& .MuiChartsGrid-line': { stroke: theme.palette.divider },
            '& .MuiBarChart-label': { fill: theme.palette.text.primary, fontSize: 13, fontWeight: 600 },
          }}
        />
      )}
    </ChartCard>
  );
}
