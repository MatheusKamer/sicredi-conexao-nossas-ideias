'use client';

import { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import GavelRounded from '@mui/icons-material/GavelRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import SyncAltRounded from '@mui/icons-material/SyncAltRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import type { Request } from '@/lib/api/types';
import { formatRequestCode } from '@/lib/format';

export type RequestAction = 'change-status' | 'decide' | 'delete' | 'details';

const ACTIONS: Record<RequestAction, { label: string; icon: typeof DeleteRounded; danger?: boolean }> = {
  'change-status': { label: 'Alterar status', icon: SyncAltRounded },
  decide: { label: 'Decisão final', icon: GavelRounded },
  details: { label: 'Ver detalhes', icon: VisibilityRounded },
  delete: { label: 'Excluir', icon: DeleteRounded, danger: true },
};

/**
 * Only the actions valid for the request's status (and the user's role) are offered.
 * The status flow is enforced here, in the frontend: the API accepts any transition.
 */
export function availableActions(request: Request, isManager: boolean): RequestAction[] {
  switch (request.status) {
    case 'PENDING':
      return isManager ? ['change-status', 'delete'] : ['delete'];
    case 'UNDER_REVIEW':
      return isManager ? ['decide'] : [];
    case 'APPROVED':
    case 'REJECTED':
      return ['details'];
  }
}

type RequestRowActionsProps = {
  request: Request;
  isManager: boolean;
  onAction: (action: RequestAction, request: Request) => void;
};

export function RequestRowActions({ request, isManager, onAction }: RequestRowActionsProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const actions = availableActions(request, isManager);

  if (actions.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Ações da solicitação ${formatRequestCode(request.id)}`}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ borderRadius: 1, color: 'text.secondary', ...(anchor && { bgcolor: 'divider' }) }}
      >
        <MoreVertRounded fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        {actions.map((action) => {
          const { label, icon: Icon, danger } = ACTIONS[action];
          return (
            <MenuItem
              key={action}
              onClick={() => {
                setAnchor(null);
                onAction(action, request);
              }}
              sx={danger ? { color: 'error.main' } : undefined}
            >
              <ListItemIcon sx={danger ? { color: 'error.main' } : undefined}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { sx: { fontSize: 14 } } }}>{label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
