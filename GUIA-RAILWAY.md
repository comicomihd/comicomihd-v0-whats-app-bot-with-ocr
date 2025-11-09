# Guia Completo: Deploy do Bot na Railway

## O que é Railway?
Railway é uma plataforma que deixa sua aplicação rodando online 24/7. É como um computador na nuvem que fica ligado sempre!

## Passo 1: Criar Conta na Railway

1. Acesse **https://railway.app**
2. Clique em **"Sign Up"** (Criar Conta)
3. Escolha uma dessas opções:
   - Email + Senha
   - Google
   - GitHub (recomendado)

## Passo 2: Conectar com GitHub

1. Após criar conta, clique em **"New Project"**
2. Selecione **"Deploy from GitHub"**
3. Clique em **"Connect GitHub"**
4. Autorize o Railway a acessar seus repositórios
5. Selecione o repositório do seu bot

## Passo 3: Criar Repositório no GitHub (Se não tiver)

1. Acesse **https://github.com/new**
2. Nome do repositório: `whatsapp-bot-colorir`
3. Descrição: `Bot WhatsApp para vender livros de colorir cristão`
4. Deixe como **Public**
5. Clique em **"Create repository"**

## Passo 4: Fazer Upload dos Arquivos

### Opção A: Usando Git (Recomendado)

\`\`\`bash
# Abra o terminal/PowerShell na pasta do bot
cd C:\caminho\para\seu\bot

# Inicialize git
git init

# Adicione todos os arquivos
git add .

# Faça um commit
git commit -m "Initial commit"

# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/whatsapp-bot-colorir.git

# Envie para GitHub
git branch -M main
git push -u origin main
\`\`\`

### Opção B: Manualmente (Se não tem Git)

1. Acesse seu repositório no GitHub
2. Clique em **"Add file" → "Upload files"**
3. Arraste e solte seus arquivos:
   - bot.ts
   - webhook.ts
   - package.json
   - tsconfig.json
   - Dockerfile
   - railway.json
   - .gitignore

## Passo 5: Configurar no Railway

1. Na Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub"**
3. Escolha seu repositório `whatsapp-bot-colorir`
4. Clique em **"Deploy"**

A Railway automaticamente vai:
- ✅ Detectar que é Node.js
- ✅ Instalar dependências
- ✅ Compilar o TypeScript
- ✅ Iniciar o bot

## Passo 6: Configurar Variáveis de Ambiente

1. No painel do Railway, vá em **"Variables"**
2. Adicione qualquer variável que seu bot use
3. Salvar

## Passo 7: Copiar URL do Webhook

1. Seu bot estará rodando em uma URL como:
\`\`\`
https://seu-projeto.railway.app
\`\`\`

2. O webhook ficará em:
\`\`\`
https://seu-projeto.railway.app/api/webhook/tribopay
\`\`\`

3. **Registre esta URL na Tribopay** como URL de Postback!

## Passo 8: Ver Logs (Verificar se está rodando)

1. No Railway, clique em **"Deployments"**
2. Clique no último deployment
3. Veja os logs da execução
4. Procure por: ✅ "Bot de Livros de Colorir Cristão ativado com sucesso!"

## Passo 9: Usar o Bot

1. Escaneie o QR Code (aparecerá nos logs)
2. Seu bot está ONLINE 24/7!
3. Teste enviando uma mensagem com as palavras-chave

## Solução de Problemas

### "Bot não conecta ao WhatsApp"
- Verifique os logs para o QR Code
- Tente desconectar e conectar novamente

### "Webhook não funciona"
- Verifique se a URL está correta na Tribopay
- Confira se o bot está rodando (veja logs)

### "Erro ao iniciar"
- Abra os logs e procure pelo erro
- Certifique-se que todos os arquivos estão no GitHub

## Monitorar Seu Bot

### Dashboard do Railway
- Veja uso de CPU e memória
- Acompanhe os logs em tempo real
- Reinicie o bot se necessário

### Seu Bot Está Online?
Mande uma mensagem no WhatsApp com as palavras-chave:
- "quero saber mais sobre os livros de colorir"
- "olá quero saber sobre os livros de colorir"
- "tenho dúvidas sobre os livros de colorir"

**Pronto! Seu bot está vendendo 24 horas por dia! 🎉**
