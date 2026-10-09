import { Stack, Typography } from '@mui/material';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';

/** Tinted note under the dialog fields: neutral ("info") or "warning". */
export function DialogHint({
  severity = 'info',
  children,
}: {
  severity?: 'info' | 'warning';
  children: React.ReactNode;
}) {
  const warning = severity === 'warning';
  const Icon = warning ? WarningRounded : InfoRounded;
  const color = warning ? 'warning.main' : 'text.secondary';

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        bgcolor: warning ? 'warning.light' : 'background.default',
      }}
    >
      <Icon sx={{ fontSize: 18, mt: '1px', color }} />
      <Typography sx={{ fontSize: 13, color }}>{children}</Typography>
    </Stack>
  );
}

/** Footer note shared by the status and decision dialogs. */
export function HistoryNote() {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <HistoryRounded sx={{ fontSize: 18 }} />
      <span>Registrada no histórico</span>
    </Stack>
  );
}
