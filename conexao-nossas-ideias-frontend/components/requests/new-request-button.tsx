'use client';

import { Button } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';

/**
 * "Nova solicitação" page action, shared by the Dashboard and Solicitações headers.
 * Step 6 (docs/PLAN.md §6.1) adds the NewRequestDialog it opens.
 */
export function NewRequestButton() {
  return (
    <Button variant="contained" startIcon={<AddRounded />} sx={{ px: 2.25 }}>
      Nova solicitação
    </Button>
  );
}
