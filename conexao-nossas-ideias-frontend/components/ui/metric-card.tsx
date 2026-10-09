import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';

type MetricColor = 'primary' | 'secondary' | 'warning' | 'error';

type MetricCardProps = {
  label: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  color?: MetricColor;
  /** Optional highlighted figure + note under the value, e.g. "52,8%" + "taxa de aprovação". */
  highlight?: { icon?: React.ReactNode; value: string; note: string };
  loading?: boolean;
};

export function MetricCard({
  label,
  value,
  icon,
  color = 'primary',
  highlight,
  loading,
}: MetricCardProps) {
  // The accent green is too light for text, so "secondary" uses its dark shade.
  const foreground = color === 'secondary' ? 'secondary.dark' : `${color}.main`;

  return (
    <Card sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${color}.light`,
            color: foreground,
            '& svg': { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
      </Stack>

      <Stack spacing={0.75}>
        <Typography variant="h4" component="p">
          {loading ? <Skeleton width={72} /> : value}
        </Typography>
        {highlight && !loading && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {highlight.icon && (
              <Box sx={{ display: 'flex', color: foreground, '& svg': { fontSize: 16 } }}>
                {highlight.icon}
              </Box>
            )}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: foreground }}>
              {highlight.value}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{highlight.note}</Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
