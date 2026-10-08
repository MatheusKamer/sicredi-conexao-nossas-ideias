import { Box, Chip } from '@mui/material';
import type { RequestStatus } from '@/lib/api/types';
import { STATUS_LABEL } from '@/lib/requests/labels';

const STATUS_COLOR: Record<RequestStatus, 'info' | 'warning' | 'primary' | 'error'> = {
  PENDING: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'primary',
  REJECTED: 'error',
};

export function StatusChip({ status }: { status: RequestStatus }) {
  const color = STATUS_COLOR[status];

  return (
    <Chip
      size="small"
      label={STATUS_LABEL[status]}
      icon={
        <Box
          component="span"
          sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: `${color}.main` }}
        />
      }
      sx={{
        height: 24,
        borderRadius: '12px',
        bgcolor: `${color}.light`,
        color: `${color}.main`,
        fontSize: 12,
        '& .MuiChip-icon': { ml: '10px', mr: '-2px' },
        '& .MuiChip-label': { pl: 1, pr: '10px' },
      }}
    />
  );
}
