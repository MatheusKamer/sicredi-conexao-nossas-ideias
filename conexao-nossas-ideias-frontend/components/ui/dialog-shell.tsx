'use client';

import { useId } from 'react';
import {
  Box,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';

type DialogShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Left side of the footer, e.g. "* Campos obrigatórios". */
  footerNote?: React.ReactNode;
  /** Right side of the footer (buttons). */
  actions: React.ReactNode;
  /** While true the dialog can't be dismissed (e.g. a mutation is in flight). */
  busy?: boolean;
  /** Render the content as a <form> so Enter submits and actions can be type="submit". */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /**
   * Runs once the enter transition ends. Use it to focus the first field: `autoFocus` loses
   * to the dialog's focus trap, which moves focus to the paper on open.
   */
  onEntered?: () => void;
};

export function DialogShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footerNote,
  actions,
  busy,
  onSubmit,
  onEntered,
}: DialogShellProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();
  const subtitleId = useId();

  const handleClose = () => {
    if (!busy) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      slotProps={{ transition: { onEntered } }}
    >
      <Box
        component={onSubmit ? 'form' : 'div'}
        noValidate={onSubmit ? true : undefined}
        onSubmit={onSubmit as React.FormEventHandler<HTMLDivElement> | undefined}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            pt: 2.5,
            pr: 2,
            pb: 2,
            pl: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={0.5}>
            <Typography id={titleId} variant="h2" sx={{ color: 'primary.main' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography id={subtitleId} variant="body2" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
          <IconButton aria-label="Fechar" onClick={handleClose} disabled={busy}>
            <CloseRounded />
          </IconButton>
        </Stack>

        <Stack spacing={2.5} sx={{ px: 3, pt: 3, pb: 1, overflowY: 'auto', flex: 1 }}>
          {children}
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}
        >
          {/* Hidden on phones, where the action buttons need the whole row. */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary', fontSize: 13 }}>
            {footerNote}
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ ml: 'auto' }}>
            {actions}
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}
