'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import { NewRequestDialog } from './new-request-dialog';

/** "Nova solicitação" page action with its dialog, shared by the Dashboard and Solicitações headers. */
export function NewRequestButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddRounded />}
        onClick={() => setOpen(true)}
        sx={{ px: 2.25 }}
      >
        Nova solicitação
      </Button>
      <NewRequestDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
