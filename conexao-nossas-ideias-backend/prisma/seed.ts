import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AreasType,
  PrismaClient,
  RequestsPriorityType,
  RequestsStatusType,
  UsersRoleType,
} from 'generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const agencyAreas = [
  'Acaiaca',
  'Agência Digital',
  'Águas de Chapecó',
  'Alpestre',
  'Ametista do Sul',
  'Bom Repouso',
  'Borda da Mata',
  'Bueno Brandão',
  'Caibi',
  'Caiçara',
  'Camanducaia',
  'Cambuí',
  'Cerro Grande',
  'Córrego do Bom Jesus',
  'Cristal do Sul',
  'Cunha Porã',
  'Cunhataí',
  'Dom Viçoso',
  'Ervália',
  'Erval Seco',
  'Escritório de Investimentos – Sul de Minas Gerais',
  'Espaço de Relacionamento Bairro São Francisco de Paula – Frederico Westphalen',
  'Estiva',
  'Extrema',
  'Flor do Sertão',
  'Frederico Westphalen – Centro',
  'Frederico Westphalen – Ipiranga',
  'Iraceminha',
  'Iraí',
  'Itajubá – Boa Vista',
  'Itajubá – Centro',
  'Itapeva',
  'Jequeri',
  'Maravilha',
  'Modelo',
  'Novo Tiradentes',
  'Palmitinho',
  'Palmitos',
  'Paraisópolis',
  'Pinhal',
  'Pinhalzinho',
  'Pinheirinho do Vale',
  'Planalto',
  'Ponte Nova',
  'Pouso Alegre',
  'Pouso Alegre – São João',
  'Rio Casca',
  'Riqueza',
  'Rodeio Bonito',
  'Santa Rita do Sapucaí',
  'São Carlos',
  'São Gonçalo do Sapucaí',
  'Saudades',
  'Seberi',
  'Senador Amaral',
  'Taquaruçu do Sul',
  'Teixeiras',
  'Tocos do Moji',
  'Vicente Dutra',
  'Vista Alegre',
];

const headquartersAreas = [
  'Pessoas e Cultura',
  'Processos e Qualidade',
  'Desenvolvimento do Cooperativismo',
  'Comunicação e Marketing',
  'Célula de Serviços Compartilhados',
  'Célula de Desenvolvimento de Negócios',
  'Infraestrutura',
  'Operações',
  'Assessoria de Segmento',
  'Business Intelligence',
];

const users = [
  {
    name: 'Theodor Amstad',
    email: 'theodor_amstad@hotmail.com',
    ldap: 'theodor_amstad',
    role: 'MANAGER' as UsersRoleType,
  },
  {
    name: 'Diana Amstad',
    email: 'diana_amstad@hotmail.com',
    ldap: 'diana_amstad',
    role: 'ASSISTANT' as UsersRoleType,
  },
];

// Demo requests covering every status. Fixed ids keep the seed idempotent; the requester and
// the area are referenced by email and name because their ids differ between databases.
const requests: {
  id: string;
  title: string;
  description: string;
  requesterEmail: string;
  areaName: string;
  priority: RequestsPriorityType;
  status: RequestsStatusType;
  createdAt: string;
  updatedAt: string;
  decisionComment: string | null;
  decidedAt: string | null;
}[] = [
  {
    id: '7b0805a7-0198-4649-9445-14a72ce8466f',
    title: 'Automatizar conciliação de crédito rural',
    description:
      'Substituir a conferência manual dos contratos de crédito rural por uma rotina automática que cruza lançamentos do core bancário com os extratos.',
    requesterEmail: 'diana_amstad@hotmail.com',
    areaName: 'Célula de Desenvolvimento de Negócios',
    priority: RequestsPriorityType.HIGH,
    status: RequestsStatusType.UNDER_REVIEW,
    createdAt: '2026-10-08T01:14:12.232Z',
    updatedAt: '2026-10-08T01:14:12.245Z',
    decisionComment: null,
    decidedAt: null,
  },
  {
    id: '6aeaf502-0368-4764-b044-b3e288627d7a',
    title: 'Portal de onboarding para novos associados',
    description:
      'Centralizar documentos e etapas de entrada de novos associados em um portal único.',
    requesterEmail: 'diana_amstad@hotmail.com',
    areaName: 'Desenvolvimento do Cooperativismo',
    priority: RequestsPriorityType.MEDIUM,
    status: RequestsStatusType.APPROVED,
    createdAt: '2026-10-08T01:14:12.256Z',
    updatedAt: '2026-10-08T01:14:12.280Z',
    decisionComment: 'Proposta alinhada ao plano de eficiência 2027.',
    decidedAt: '2026-10-08T01:14:12.279Z',
  },
  {
    id: '1c2e591d-4beb-419c-b975-20774a537b2b',
    title: 'Renovação de licenças do pacote Office',
    description: 'Renovar as licenças que vencem no próximo trimestre.',
    requesterEmail: 'theodor_amstad@hotmail.com',
    areaName: 'Bueno Brandão',
    priority: RequestsPriorityType.LOW,
    status: RequestsStatusType.PENDING,
    createdAt: '2026-10-08T01:14:12.292Z',
    updatedAt: '2026-10-08T01:14:12.292Z',
    decisionComment: null,
    decidedAt: null,
  },
  {
    id: 'd5014dcc-bf53-4d4b-8460-5b39b9faedc7',
    title: 'Campanha de educação financeira nas agências',
    description:
      'Oficinas mensais de educação financeira abertas à comunidade.',
    requesterEmail: 'diana_amstad@hotmail.com',
    areaName: 'Desenvolvimento do Cooperativismo',
    priority: RequestsPriorityType.MEDIUM,
    status: RequestsStatusType.REJECTED,
    createdAt: '2026-10-08T01:14:12.302Z',
    updatedAt: '2026-10-08T01:14:12.323Z',
    decisionComment: 'Sem orçamento disponível neste ciclo.',
    decidedAt: '2026-10-08T01:14:12.322Z',
  },
  {
    id: '8f2516cb-9c96-4ec0-b2c8-6d56b796d07e',
    title: 'Acesso VPN para equipe de auditoria interna',
    description:
      'Liberar acesso remoto via VPN para os auditores internos durante o ciclo de auditoria do 4º trimestre.',
    requesterEmail: 'theodor_amstad@hotmail.com',
    areaName: 'Processos e Qualidade',
    priority: RequestsPriorityType.HIGH,
    status: RequestsStatusType.UNDER_REVIEW,
    createdAt: '2026-10-08T01:14:12.333Z',
    updatedAt: '2026-10-09T00:19:40.364Z',
    decisionComment: null,
    decidedAt: null,
  },
  {
    id: '109d130c-78d8-43bf-9839-29eac2e28a84',
    title: 'Treinamento LGPD para colaboradores',
    description:
      'Trilha obrigatória de LGPD para todas as áreas, com certificação ao final.',
    requesterEmail: 'diana_amstad@hotmail.com',
    areaName: 'Pessoas e Cultura',
    priority: RequestsPriorityType.MEDIUM,
    status: RequestsStatusType.UNDER_REVIEW,
    createdAt: '2026-10-08T01:14:12.341Z',
    updatedAt: '2026-10-08T01:14:12.352Z',
    decisionComment: null,
    decidedAt: null,
  },
];

async function main() {
  for (const name of agencyAreas) {
    await prisma.areas.upsert({
      where: { name },
      update: {
        type: AreasType.AGENCY,
        isActive: true,
      },
      create: {
        name,
        type: AreasType.AGENCY,
      },
    });
  }

  for (const name of headquartersAreas) {
    await prisma.areas.upsert({
      where: { name },
      update: {
        type: AreasType.HEADQUARTERS,
        isActive: true,
      },
      create: {
        name,
        type: AreasType.HEADQUARTERS,
      },
    });
  }

  const password = 'Sicredi@123';
  const hashedPassword = await bcrypt.hash(password, 12);

  for (const user of users) {
    await prisma.users.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        ldap: user.ldap,
        role: user.role,
        password: hashedPassword,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        ldap: user.ldap,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  console.log(
    `${agencyAreas.length} agencies and ${headquartersAreas.length} headquarters areas seeded successfully.`,
  );

  console.log(`${users.length} users seeded successfully.`);

  for (const request of requests) {
    const {
      requesterEmail,
      areaName,
      createdAt,
      updatedAt,
      decidedAt,
      ...data
    } = request;
    const requester = await prisma.users.findUniqueOrThrow({
      where: { email: requesterEmail },
      select: { id: true },
    });
    const area = await prisma.areas.findUniqueOrThrow({
      where: { name: areaName },
      select: { id: true },
    });

    // Create-only: re-running the seed restores missing demo requests without
    // overwriting changes made through the app (status, decision, etc.).
    await prisma.requests.upsert({
      where: { id: request.id },
      update: {},
      create: {
        ...data,
        requester: requester.id,
        areaId: area.id,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        decidedAt: decidedAt ? new Date(decidedAt) : null,
      },
    });
  }

  console.log(`${requests.length} requests seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
