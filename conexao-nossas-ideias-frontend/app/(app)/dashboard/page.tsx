import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = { title: 'Dashboard | Conexão Nossas Ideias' };

// Placeholder: the dashboard content is built in step 8 of docs/PLAN.md.
export default function DashboardPage() {
  return (
    <PageHeader
      title="Painel de Solicitações"
      subtitle="Acompanhe demandas e ideias das áreas da cooperativa em tempo real."
    />
  );
}
