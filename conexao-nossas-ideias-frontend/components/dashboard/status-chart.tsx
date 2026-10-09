'use client';

import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { RequestsSummary } from '@/lib/api/types';
import { formatPercent } from '@/lib/format';
import { ChartCard } from './chart-card';

const SIZE = 148;

/** Donut with the design's three groups; the legend doubles as the data table (value + share). */
export function StatusChart({ summary, loading }: { summary?: RequestsSummary; loading: boolean }) {
  const theme = useTheme();
  const total = summary?.total ?? 0;
  const slices = summary
    ? [
        { id: 'approved', label: 'Aprovadas', value: summary.byStatus.APPROVED, color: theme.palette.primary.main },
        {
          id: 'open',
          label: 'Em aberto',
          value: summary.byStatus.PENDING + summary.byStatus.UNDER_REVIEW,
          color: theme.palette.secondary.main,
        },
        { id: 'rejected', label: 'Rejeitadas', value: summary.byStatus.REJECTED, color: theme.palette.error.main },
      ]
    : [];

  return (
    <ChartCard title="Status das solicitações" subtitle="Distribuição atual de todas as solicitações">
      <Stack
        direction={{ xs: 'column', sm: 'row', lg: 'column', xl: 'row' }}
        spacing={2.5}
        sx={{ alignItems: 'center', flex: 1 }}
      >
        <Box sx={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
          {loading ? (
            <Skeleton variant="circular" width={SIZE} height={SIZE} />
          ) : (
            <PieChart
              width={SIZE}
              height={SIZE}
              hideLegend
              margin={0}
              series={[
                {
                  // An empty ring still reads as "nothing yet" instead of collapsing the layout.
                  data: total === 0 ? [{ id: 'empty', value: 1, color: theme.palette.divider }] : slices,
                  innerRadius: 52,
                  outerRadius: SIZE / 2,
                  paddingAngle: total === 0 ? 0 : 1.5,
                  cornerRadius: 2,
                  valueFormatter: (item) =>
                    total === 0 ? '' : `${item.value} · ${formatPercent(item.value / total)}`,
                },
              ]}
            />
          )}
          {!loading && (
            <Stack
              sx={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h4" component="p" sx={{ fontSize: 26 }}>
                {total}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {total === 1 ? 'solicitação' : 'solicitações'}
              </Typography>
            </Stack>
          )}
        </Box>

        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, width: '100%', minWidth: 0 }}>
          {(loading ? [{ id: 'a' }, { id: 'b' }, { id: 'c' }] : slices).map((slice, index, all) => (
            <Stack
              component="li"
              key={slice.id}
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: 'center',
                py: 1.25,
                borderBottom: index < all.length - 1 ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              {'label' in slice ? (
                <>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {slice.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {slice.value}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', minWidth: 48, textAlign: 'right' }}>
                    {total === 0 ? '—' : formatPercent(slice.value / total)}
                  </Typography>
                </>
              ) : (
                <Skeleton width="100%" />
              )}
            </Stack>
          ))}
        </Box>
      </Stack>
    </ChartCard>
  );
}
