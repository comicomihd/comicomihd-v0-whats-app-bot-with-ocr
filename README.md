# Bot WhatsApp - Livros de Colorir Cristão

Bot inteligente para vender livros de colorir cristão pelo WhatsApp com detecção de objeções, FAQ automático e sistema de pagamento com webhook da Tribopay.

## Funcionalidades

✅ Ativação por palavras-chave específicas
✅ Saudação dinâmica (bom dia/tarde/noite)
✅ Responde apenas uma vez a cada 24h por cliente
✅ Sistema FAQ com dúvidas frequentes
✅ Menu de pacotes (Básico e Premium)
✅ Links diretos de pagamento (Tribopay)
✅ Detecção de pagamentos via webhook
✅ Solicitação de avaliações
✅ Encaminhamento de comprovantes

## Tecnologias

- **Node.js** - Runtime JavaScript
- **WhatsApp Web JS** - Integração com WhatsApp
- **Express** - Servidor para webhooks
- **TypeScript** - Linguagem tipada
- **Railway** - Deploy na nuvem

## Instalação Local

\`\`\`bash
# Clone ou baixe o repositório
cd seu-bot

# Instale dependências
npm install

# Inicie o bot
npm start
\`\`\`

Escaneie o QR Code com seu WhatsApp e pronto!

## Deploy na Railway

Veja o arquivo `GUIA-RAILWAY.md` para instruções completas.

## URLs Importantes

- **Webhook da Tribopay**: `https://seu-projeto.railway.app/api/webhook/tribopay`
- **Verificar Pagamento**: `https://seu-projeto.railway.app/api/check-payment/:phone`
- **Dashboard de Vendas**: `https://seu-projeto.railway.app/api/dashboard/sales`

## Estrutura dos Arquivos

\`\`\`
├── bot.ts              # Bot WhatsApp principal
├── webhook.ts          # Servidor de webhooks
├── package.json        # Dependências
├── tsconfig.json       # Configuração TypeScript
├── Dockerfile          # Para deploy em container
├── railway.json        # Configuração Railway
└── .gitignore          # Arquivos ignorados no Git
\`\`\`

## Suporte

Para dúvidas, verifique os logs da aplicação para mensagens de erro detalhadas.
