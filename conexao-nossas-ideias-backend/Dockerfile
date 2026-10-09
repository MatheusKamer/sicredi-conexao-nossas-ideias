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

# Ajustado para refletir a porta real que você configurou no docker-compose (3001)
EXPOSE 3001

CMD ["npm", "run", "start:dev"]
