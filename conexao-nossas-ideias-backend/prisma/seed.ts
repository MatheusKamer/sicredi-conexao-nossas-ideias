import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AreasType, PrismaClient } from 'generated/prisma/client';

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

  console.log(
    `${agencyAreas.length} agencies and ${headquartersAreas.length} headquarters areas seeded successfully.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
