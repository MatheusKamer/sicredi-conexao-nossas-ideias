'use client';

import {
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import type { Request, SortOrder } from '@/lib/api/types';
import { formatDate, formatRelative, formatRequestCode, formatTime } from '@/lib/format';
import { PriorityLabel } from './priority-label';
import { StatusChip } from './status-chip';

type RequestsTableProps = {
  rows: Request[] | undefined;
  /** "compact" (dashboard): relative "Atualizado" column, no actions. "full" (Solicitações): "Criado em" + actions. */
  variant: 'compact' | 'full';
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  /** Sort by creation date ("full" only). */
  order?: SortOrder;
  onToggleOrder?: () => void;
  renderActions?: (request: Request) => React.ReactNode;
};

const firstCell = { pl: 3 };
const lastCell = { pr: 3 };

export function RequestsTable({
  rows,
  variant,
  loading,
  skeletonRows = 5,
  emptyState,
  order = 'desc',
  onToggleOrder,
  renderActions,
}: RequestsTableProps) {
  const isFull = variant === 'full';
  const columnCount = isFull && renderActions ? 7 : 6;

  return (
    <TableContainer>
      <Table sx={{ minWidth: 880, '& td': { py: 1.75 }, '& th': { py: 1.25 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={firstCell}>Solicitação</TableCell>
            <TableCell sx={{ width: 140 }}>Departamento</TableCell>
            <TableCell sx={{ width: 170 }}>Solicitante</TableCell>
            <TableCell sx={{ width: 120 }}>Prioridade</TableCell>
            <TableCell sx={{ width: 130 }}>Status</TableCell>
            <TableCell sx={{ width: 120, ...(renderActions ? {} : lastCell) }}>
              {isFull ? (
                <TableSortLabel
                  active
                  direction={order}
                  onClick={onToggleOrder}
                  disabled={!onToggleOrder}
                >
                  Criado em
                </TableSortLabel>
              ) : (
                'Atualizado'
              )}
            </TableCell>
            {isFull && renderActions && (
              <TableCell aria-label="Ações" sx={{ width: 64, ...lastCell }} />
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading &&
            Array.from({ length: skeletonRows }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: columnCount }, (_, cell) => (
                  <TableCell key={cell} sx={cell === 0 ? firstCell : undefined}>
                    <Skeleton width={cell === 0 ? '70%' : '60%'} />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading && rows?.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnCount} sx={{ py: 6, textAlign: 'center' }}>
                {emptyState ?? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nenhuma solicitação encontrada.
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            rows?.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell sx={firstCell}>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {request.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {formatRequestCode(request.id)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{request.area.name}</TableCell>
                <TableCell>{request.user.name ?? '—'}</TableCell>
                <TableCell>
                  <PriorityLabel priority={request.priority} />
                </TableCell>
                <TableCell>
                  <StatusChip status={request.status} />
                </TableCell>
                <TableCell sx={renderActions ? undefined : lastCell}>
                  {isFull ? (
                    <Stack spacing={0.25}>
                      <Typography variant="body2">{formatDate(request.createdAt)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatTime(request.createdAt)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {formatRelative(request.updatedAt)}
                    </Typography>
                  )}
                </TableCell>
                {isFull && renderActions && (
                  <TableCell sx={{ ...lastCell, textAlign: 'right' }}>
                    {renderActions(request)}
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
