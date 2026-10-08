'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';
import type { Request } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRequests, useRequestsSummary } from '@/lib/queries/requests';
import { useRequestFilters } from '@/lib/requests/use-request-filters';
import { DeleteRequestDialog } from '@/components/requests/delete-request-dialog';
import { RequestDetailsDialog } from '@/components/requests/request-details-dialog';
import {
  RequestRowActions,
  type RequestAction,
} from '@/components/requests/request-row-actions';
import { RequestsFilters } from '@/components/requests/requests-filters';
import { RequestsPagination } from '@/components/requests/requests-pagination';
import { RequestsTable } from '@/components/requests/requests-table';

// `request` is kept when a dialog closes so its content stays put during the exit transition.
type DialogState = { action: RequestAction | null; request: Request | null };

export function RequestsView() {
  const { isManager } = useAuth();
  const { filters, setFilters, clearFilters, hasActiveFilters } = useRequestFilters();
  const requests = useRequests(filters);
  const summary = useRequestsSummary();
  const [dialog, setDialog] = useState<DialogState>({ action: null, request: null });
  const [toast, setToast] = useState<string | null>(null);

  const meta = requests.data?.meta;

  // Deleting the last row of the last page (or a stale ?page= link) leaves us past the end.
  useEffect(() => {
    if (meta && meta.totalPages > 0 && filters.page > meta.totalPages) {
      setFilters({ page: meta.totalPages });
    }
  }, [meta, filters.page, setFilters]);

  const closeDialog = () => setDialog((current) => ({ ...current, action: null }));

  return (
    <Stack spacing={3}>
      <RequestsFilters
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        summary={summary.data}
        total={meta?.total}
      />

      {requests.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => requests.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar as solicitações. {requests.error.message}
        </Alert>
      )}

      <Card sx={{ position: 'relative' }}>
        {requests.isFetching && !requests.isPending && (
          <LinearProgress
            aria-label="Atualizando solicitações"
            sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 1 }}
          />
        )}

        <RequestsTable
          variant="full"
          rows={requests.data?.data ?? (requests.isError ? [] : undefined)}
          loading={requests.isPending && !requests.isError}
          skeletonRows={filters.limit}
          order={filters.order}
          onToggleOrder={() => setFilters({ order: filters.order === 'desc' ? 'asc' : 'desc' })}
          renderActions={(request) => (
            <RequestRowActions
              request={request}
              isManager={isManager}
              onAction={(action, target) => setDialog({ action, request: target })}
            />
          )}
          emptyState={
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <SearchOffRounded sx={{ fontSize: 40, color: 'outline' }} />
              <Typography sx={{ fontWeight: 600 }}>Nenhuma solicitação encontrada</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {hasActiveFilters
                  ? 'Ajuste a busca ou os filtros para ver outros resultados.'
                  : 'Ainda não há solicitações registradas.'}
              </Typography>
              {hasActiveFilters && (
                <Button color="primary" onClick={clearFilters} sx={{ mt: 1 }}>
                  Limpar filtros
                </Button>
              )}
            </Stack>
          }
        />

        {meta && meta.total > 0 && (
          <RequestsPagination
            page={Math.min(filters.page, Math.max(meta.totalPages, 1))}
            limit={filters.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={(page) => setFilters({ page })}
            onLimitChange={(limit) => setFilters({ limit })}
          />
        )}
      </Card>

      {/* "Alterar status" and "Decisão final" dialogs are plugged in at step 7 (docs/PLAN.md §6.2–6.3). */}
      <DeleteRequestDialog
        open={dialog.action === 'delete'}
        request={dialog.request}
        onClose={closeDialog}
        onDeleted={() => {
          closeDialog();
          setToast('Solicitação excluída.');
        }}
      />
      <RequestDetailsDialog
        open={dialog.action === 'details'}
        request={dialog.request}
        onClose={closeDialog}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== 'clickaway' && setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
