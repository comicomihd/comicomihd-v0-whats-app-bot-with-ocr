FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código-fonte
COPY bot.ts webhook.ts tsconfig.json ./

# Compilar TypeScript
RUN npm run build

# Criar pasta para dados persistentes
RUN mkdir -p /app/data

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]
