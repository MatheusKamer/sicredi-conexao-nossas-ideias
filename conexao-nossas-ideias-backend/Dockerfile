FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências e gera o cliente do Prisma
RUN npm install
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Compila o projeto NestJS
RUN npm run build

# Ajustado para refletir a porta real que você configurou no docker-compose (3001)
EXPOSE 3001

# Executa as migrations e inicia apontando para o caminho correto gerado pelo NodeNext (dist/src/main)
# CMD npx prisma migrate deploy && node dist/src/main.js

CMD ["npm", "run", "start:dev"]
