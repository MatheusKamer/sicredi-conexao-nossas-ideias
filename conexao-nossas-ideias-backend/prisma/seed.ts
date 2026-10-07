import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AreasType,
  PrismaClient,
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
