import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Stack } from '@mui/material';
import { PageHeader } from '@/components/layout/page-header';
import { NewRequestButton } from '@/components/requests/new-request-button';
import { RequestsView } from './requests-view';

export const metadata: Metadata = { title: 'Solicitações | Conexão Nossas Ideias' };

export default function SolicitacoesPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Consulta de solicitações"
        subtitle="Pesquise, filtre e acompanhe todas as solicitações registradas pelas áreas da cooperativa."
        actions={<NewRequestButton />}
      />
      {/* The filters are read from the URL (useSearchParams), so this part renders on the client. */}
      <Suspense>
        <RequestsView />
      </Suspense>
    </Stack>
  );
}
