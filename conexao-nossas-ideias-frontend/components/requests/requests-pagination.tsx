'use client';

import { useId } from 'react';
import { MenuItem, Pagination, Select, Stack, Typography } from '@mui/material';
import { PAGE_SIZES } from '@/lib/requests/use-request-filters';

type RequestsPaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const PAGE_ITEM_LABEL = {
  first: 'Ir para a primeira página',
  last: 'Ir para a última página',
  next: 'Ir para a próxima página',
  previous: 'Ir para a página anterior',
  'start-ellipsis': '',
  'end-ellipsis': '',
} as const;

const infoText = { fontSize: 13, color: 'text.secondary' } as const;

export function RequestsPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: RequestsPaginationProps) {
  const labelId = useId();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 1.5,
        bgcolor: 'background.default',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography sx={infoText}>
          Exibindo {from}–{to} de {total}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Typography id={labelId} sx={infoText}>
            Linhas por página
          </Typography>
          <Select
            size="small"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            labelId={labelId}
            sx={{ height: 32, fontSize: 13, '& .MuiSelect-select': { py: 0, pl: 1.25 } }}
          >
            {PAGE_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      <Pagination
        page={page}
        count={Math.max(totalPages, 1)}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        shape="rounded"
        siblingCount={1}
        getItemAriaLabel={(type, itemPage, selected) => {
          if (type === 'page') return selected ? `Página ${itemPage}, atual` : `Ir para a página ${itemPage}`;
          return PAGE_ITEM_LABEL[type];
        }}
        aria-label="Paginação"
        sx={{ '& .MuiPaginationItem-root': { fontSize: 13, fontWeight: 500 } }}
      />
    </Stack>
  );
}
