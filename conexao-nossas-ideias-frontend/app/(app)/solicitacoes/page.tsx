import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = { title: 'Solicitações | Conexão Nossas Ideias' };

// Placeholder: the listing, filters and pagination are built in step 5 of docs/PLAN.md.
export default function SolicitacoesPage() {
  return (
    <PageHeader
      title="Consulta de solicitações"
      subtitle="Pesquise, filtre e acompanhe todas as solicitações registradas pelas áreas da cooperativa."
    />
  );
}
