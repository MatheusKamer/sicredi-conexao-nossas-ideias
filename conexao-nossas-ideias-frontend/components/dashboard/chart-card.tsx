import { Card, Stack, Typography } from '@mui/material';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

/** Dashboard card anatomy: title 18/600 + subtitle 13, optional action on the right, then the body. */
export function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack spacing={0.5}>
          <Typography variant="h3" component="h2">
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{subtitle}</Typography>
          )}
        </Stack>
        {action}
      </Stack>
      {children}
    </Card>
  );
}
