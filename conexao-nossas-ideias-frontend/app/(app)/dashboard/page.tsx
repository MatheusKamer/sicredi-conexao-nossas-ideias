import type { Metadata } from 'next';
import { Stack } from '@mui/material';
import { PageHeader } from '@/components/layout/page-header';
import { NewRequestButton } from '@/components/requests/new-request-button';
import { DashboardView } from './dashboard-view';

export const metadata: Metadata = { title: 'Dashboard | Conexão Nossas Ideias' };

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Painel de Solicitações"
        subtitle="Acompanhe demandas e ideias das áreas da cooperativa em tempo real."
        actions={<NewRequestButton />}
      />
      <DashboardView />
    </Stack>
  );
}
