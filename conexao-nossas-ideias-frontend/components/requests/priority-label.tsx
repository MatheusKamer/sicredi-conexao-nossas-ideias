import { Stack, Typography } from '@mui/material';
import DragHandleRounded from '@mui/icons-material/DragHandleRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardDoubleArrowUpRounded from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import type { RequestPriority } from '@/lib/api/types';
import { PRIORITY_LABEL } from '@/lib/requests/labels';

const PRIORITY_ICON = {
  HIGH: KeyboardDoubleArrowUpRounded,
  MEDIUM: DragHandleRounded,
  LOW: KeyboardArrowDownRounded,
} satisfies Record<RequestPriority, unknown>;

export function PriorityLabel({ priority }: { priority: RequestPriority }) {
  const Icon = PRIORITY_ICON[priority];

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'center', color: `priorityText.${priority}` }}
    >
      <Icon sx={{ fontSize: 18 }} />
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'inherit' }}>
        {PRIORITY_LABEL[priority]}
      </Typography>
    </Stack>
  );
}
