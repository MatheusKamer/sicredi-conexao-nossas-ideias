import { Stack, Typography } from '@mui/material';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h1">{title}</Typography>
        {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
