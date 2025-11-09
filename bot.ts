const qrcode = require("qrcode-terminal")
const { Client, Buttons, List, MessageMedia } = require("whatsapp-web.js")
const fs = require("fs")
const path = require("path")
const axios = require("axios")

const client = new Client()

// Arquivo para armazenar clientes já atendidos
const clientsFile = path.join(__dirname, "clients.json")

// Função para carregar dados de clientes
const loadClients = () => {
  try {
    if (fs.existsSync(clientsFile)) {
      const data = fs.readFileSync(clientsFile, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.log("Criando novo arquivo de clientes")
  }
  return {}
}

// Função para salvar dados de clientes
const saveClients = (clients) => {
  fs.writeFileSync(clientsFile, JSON.stringify(clients, null, 2))
}

// Função para verificar se pode responder ao cliente (24 horas)
const canRespond = (clientId) => {
  // Reativando 24-hour limit check
  const clients = loadClients()
  if (!clients[clientId]) {
    return true
  }

  const lastResponseTime = clients[clientId]
  const currentTime = Date.now()
  const timeDifference = currentTime - lastResponseTime

  return timeDifference >= 24 * 60 * 60 * 1000 // 24 horas em milissegundos
}

// Reactivando função para atualizar o tempo de resposta do cliente
const updateClientResponseTime = (clientId) => {
  const clients = loadClients()
  clients[clientId] = Date.now()
  saveClients(clients)
}

// Função para obter saudação baseada na hora
const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return "☀️ Bom dia"
  } else if (hour >= 12 && hour < 18) {
    return "🌤️ Boa tarde"
  } else {
    return "🌙 Boa noite"
  }
}

// Função de delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

// QR Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  console.log("✅ Bot de Livros de Colorir Cristão ativado com sucesso!")
})

// Palavras-chave para ativar o bot
const keywordPatterns = [
  /quero saber mais sobre os livros de colorir/i,
  /olá quero saber sobre os livros de colorir/i,
  /tenho d[uú]vidas sobre os livros de colorir/i,
]

// Mapeamento de objeções comuns e respostas persuasivas
const objectionHandlers = {
  price: {
    patterns: [/muito caro|caro|preço alto|não tenho dinheiro|apertado|parcelado|desconto/i],
    response:
      `💎 *INVESTIMENTO INTELIGENTE NA EDUCAÇÃO ESPIRITUAL*\n\n` +
      `Entendo sua preocupação com o preço, mas veja só:\n\n` +
      `✅ Um livro de R$ 29,90 = menos que um café por dia\n` +
      `✅ Horas de paz espiritual para toda a FAMÍLIA\n` +
      `✅ Presente perfeito que ninguém esquece\n` +
      `✅ Combos com até 30% OFF para economizar\n` +
      `✅ Frete grátis acima de R$ 100\n\n` +
      `🎁 OFERTA EXCLUSIVA: Compre 2 e ganhe 10% de desconto AGORA!\n\n` +
      `Qual livro te interessou? Vamos fechar essa bênção! 🙏`,
  },
  time: {
    patterns: [/não tenho tempo|ocupado|muito ocupado|depois|deixo para depois/i],
    response:
      `⏰ *TEMPO PARA RELAXAR E CONECTAR COM DEUS*\n\n` +
      `Justamente por ser ocupado(a), você PRECISA disso!\n\n` +
      `🎯 Apenas 30 minutos por dia de colorir = \n` +
      `✨ Reduz estresse em 67%\n` +
      `✨ Melhora foco e criatividade\n` +
      `✨ Conecta você com Deus\n` +
      `✨ Desliga de telefone e redes sociais\n\n` +
      `É EXATAMENTE O QUE VOCÊ PRECISA! 🙏\n\n` +
      `Quanto você economizaria deixando de scrollar redes sociais?\n\n` +
      `Vamos lá, escolha um livro agora! ⏱️`,
  },
  effectiveness: {
    patterns: [/funciona|realmente funciona|coloring book não cura|não vai mudar nada|duvido/i],
    response:
      `✅ *COMPROVADO CIENTIFICAMENTE*\n\n` +
      `Você sabe que colorir terapêutico é recomendado por psicólogos?\n\n` +
      `🧠 BENEFÍCIOS COMPROVADOS:\n` +
      `✓ Reduz ansiedade e depressão\n` +
      `✓ Melhora concentração por horas\n` +
      `✓ Aumenta capacidade meditativa\n` +
      `✓ Fortalece fé e conexão com Deus\n` +
      `✓ Terapia holística reconhecida\n\n` +
      `📊 99% dos nossos clientes relatam MELHORA REAL!\n\n` +
      `Não é coincidência - é CIÊNCIA + FÉ! 🙏\n\n` +
      `Veja você mesmo! Qual livro quer começar?`,
  },
  relevance: {
    patterns: [/não sou cristão|ateu|não acredito|religião|evangélico|católico/i],
    response:
      `🤝 *PARA TODOS OS QUE BUSCAM PAZ*\n\n` +
      `Sabe, nossos livros não são apenas para evangélicos!\n\n` +
      `💙 VALORES CRISTÃOS UNIVERSAIS:\n` +
      `✓ Paz interior (qualquer fé aprecia)\n` +
      `✓ Mensagens de amor e esperança\n` +
      `✓ Meditação contemplativa\n` +
      `✓ Arte linda e inspiradora\n` +
      `✓ Bem-estar emocional garantido\n\n` +
      `Muitos clientes NÃO religiosos amam nossos livros porque:\n` +
      `- São belíssimos artisticamente ✨\n` +
      `- Trazem paz e tranquilidade 🧘\n` +
      `- Mensagens humanitárias profundas ❤️\n\n` +
      `Quer experimentar a transformação? Qual tema te atrai?`,
  },
  decision: {
    patterns: [/deixa eu pensar|vou pensar|depois eu vejo|vou decidir depois|não sei|indeciso/i],
    response:
      `🚀 *AÇÃO É O SEGREDO!*\n\n` +
      `Sabe qual é a diferença entre sonho e realidade?\n` +
      `👉 A DECISÃO e a AÇÃO! 💪\n\n` +
      `⚠️ CUIDADO COM ISSO:\n` +
      `"Depois" geralmente nunca chega...\n` +
      `Você vai:\n` +
      `❌ Esquecer essa conversa\n` +
      `❌ Perder a motivação\n` +
      `❌ Continuar estressado(a)\n` +
      `❌ Estar na mesma situação daqui 1 mês\n\n` +
      `🎯 O QUE FAZER AGORA:\n` +
      `✅ Escolher UM livro (apenas 1!)\n` +
      `✅ Mandar foto do PIX\n` +
      `✅ Receber em 7-15 dias\n` +
      `✅ Transformar sua vida\n\n` +
      `🔥 PROMOÇÃO VÁLIDA APENAS HOJE!\n\n` +
      `Qual livro? 1, 2, 3 ou 4? Diga AGORA! 🎁`,
  },
  quality: {
    patterns: [/qualidade|barato|chinês|cópia|fake|verdadeiro|original/i],
    response:
      `🏆 *QUALIDADE PREMIUM GARANTIDA*\n\n` +
      `Sabemos que existem cópias ruins por aí...\n` +
      `NÃO SOMOS ESSAS! 🙅\n\n` +
      `✅ GARANTIA DE QUALIDADE:\n` +
      `🎨 Papel 150g premium (não sangra)\n` +
      `✏️ Ilustrações profissionais (artistas renomados)\n` +
      `📖 Encadernação perfeita e durável\n` +
      `✨ Cores vibrantes e inspiradoras\n` +
      `🛡️ Garantia de satisfação 100%\n\n` +
      `💬 PROVA SOCIAL:\n` +
      `⭐⭐⭐⭐⭐ 4,9/5 em avaliações\n` +
      `👥 +5.000 clientes felizes\n` +
      `📸 Veja as fotos dos clientes no nosso Instagram\n\n` +
      `Se não ficar satisfeito, devolvemos 100% do valor!\n\n` +
      `Quer conhecer qual é a qualidade? Qual livro? 📚`,
  },
}

const userState = {}

const faqQuestions = [
  {
    id: "1",
    question: "É confiável? Vou receber mesmo?",
    response:
      `✅ *SIM, É 100% CONFIÁVEL!* 🛡️\n\n` +
      `Sim, é 100% confiável! Já são mais de 500 famílias satisfeitas.\n` +
      `Oferecemos garantia de 7 dias. Se não gostar, devolvemos sem perguntas! 💯`,
  },
  {
    id: "2",
    question: "E se não receber o email com os livros?",
    response:
      `⚠️ *EMAIL NÃO CHEGOU?* 📧\n\n` +
      `Se não receber em até 10 minutos, tire print do comprovante e me envie aqui!\n` +
      `Resolvemos imediatamente! 🚀`,
  },
  {
    id: "3",
    question: "Posso imprimir quantas vezes quiser?",
    response:
      `🖨️ *SIM! IMPRIMA QUANTAS VEZES QUISER!* 🖨️\n\n` +
      `Com o acesso vitalício, você pode imprimir quantas vezes precisar,\n` +
      `para quantas crianças tiver em casa ou na sua escola bíblica! 🔓`,
  },
  {
    id: "4",
    question: "Qual a diferença entre Básico e Premium?",
    response:
      `🔍 *DIFERENÇA ENTRE OS PACOTES* 🔍\n\n` +
      `📦 *PACOTE BÁSICO - R$ 10,00* (27 livros)\n` +
      `✅ 27 livros de colorir em PDF\n` +
      `✅ Temas bíblicos variados\n` +
      `🔓 Acesso vitalício\n` +
      `✅ Garantia de 7 dias\n` +
      `✅ Suporte por WhatsApp\n\n` +
      `💎 *PACOTE PREMIUM - R$ 17,00* (+500 pessoas já escolheram!)\n` +
      `✅ TUDO DO BÁSICO +\n` +
      `✨ Bônus 1: Stickers personalizados\n` +
      `✨ Bônus 2: Capas e contra-capas\n` +
      `✨ Bônus 3: Páginas separadas\n` +
      `✨ Bônus 4: +3 Livros EXTRAS (30 no total)`,
  },
]

// Função para enviar status online
const sendOnlineStatus = async (chat) => {
  try {
    await chat.sendStatePaused()
    await delay(3000)
  } catch (error) {
    console.log("Status online não suportado neste dispositivo")
  }
}

// Função para detectar e responder FAQ
const detectAndAnswerFAQ = async (msg, chat) => {
  let faqAnswered = false
  for (const [key, value] of Object.entries(objectionHandlers)) {
    if (value.patterns.some((pattern) => pattern.test(msg.body))) {
      await client.sendMessage(msg.from, value.response)
      faqAnswered = true
      break
    }
  }
  return faqAnswered
}

// Função para verificar pagamento via webhook
const checkPaymentStatus = async (phoneNumber) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/check-payment/${phoneNumber}`)
    return response.data
  } catch (error) {
    console.log("[v0] Erro ao verificar pagamento:", error)
    return { hasPaid: false }
  }
}

client.on("message", async (msg) => {
  try {
    const chat = await msg.getChat()
    if (chat.isGroup) {
      return
    }

    const containsKeyword = keywordPatterns.some((pattern) => pattern.test(msg.body))

    if (containsKeyword) {
      const clientId = msg.from

      if (!canRespond(clientId)) {
        await client.sendMessage(
          msg.from,
          `Olá! 👋\n\n` +
            `Você já foi atendido por nós nas últimas 24 horas.\n\n` +
            `Para receber um novo atendimento, aguarde até amanhã! ⏰`,
        )
        return
      }

      updateClientResponseTime(clientId)

      const contact = await msg.getContact()
      const name = contact.pushname.split(" ")[0]
      const greeting = getGreeting()

      userState[clientId] = "viewing_faq"

      await sendOnlineStatus(chat)

      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)
      await client.sendMessage(
        msg.from,
        `${greeting}, ${name}! 🙏\n\n` +
          `Que benção você estar aqui! 💫\n\n` +
          `Você acabou de acessar a maior coleção de LIVROS DE COLORIR CRISTÃO do Brasil!\n\n` +
          `✨ +500 famílias satisfeitas\n` +
          `⭐ 4,9/5 em avaliações\n` +
          `🎁 Promoção ESPECIAL apenas para hoje\n\n` +
          `Deixa eu tirar suas dúvidas primeiro! 👇`,
      )

      await delay(3000)
      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)

      let faqMessage = `❓ *DÚVIDAS FREQUENTES:*\n\n`
      faqQuestions.forEach((faq) => {
        faqMessage += `${faq.id}️⃣ ${faq.question}\n`
      })
      faqMessage += `\n5️⃣ *IR PARA O MENU DE PACOTES* 📚\n\n`
      faqMessage += `Responda o número da sua dúvida (1-5)! 👇`

      await client.sendMessage(msg.from, faqMessage)
    }

    if (userState[msg.from] === "viewing_faq" && msg.body.match(/^[1-5]$/)) {
      const chat = await msg.getChat()
      const option = msg.body.trim()

      await sendOnlineStatus(chat)

      if (option === "5") {
        userState[msg.from] = "viewing_menu"
        await delay(5000)
        await chat.sendStateTyping()
        await delay(5000)
        await client.sendMessage(
          msg.from,
          `📚 *ESCOLHA SEU PACOTE AGORA!*\n\n` +
            `1️⃣ *PACOTE BÁSICO - R$ 10,00*\n` +
            `✅ 27 livros de colorir em PDF\n` +
            `✅ Temas bíblicos variados\n` +
            `🔓 Acesso vitalício\n` +
            `✅ Garantia de 7 dias\n` +
            `✅ Suporte por WhatsApp\n\n` +
            `2️⃣ *PACOTE PREMIUM - R$ 17,00* (+500 pessoas já escolheram!)\n` +
            `✅ TUDO DO PACOTE BÁSICO +\n` +
            `✨ Bônus 1: Stickers personalizados\n` +
            `✨ Bônus 2: Capas e contra-capas personalizadas\n` +
            `✨ Bônus 3: Páginas separadas\n` +
            `✨ Bônus 4: +3 Versículos (30 livros total)\n\n` +
            `Qual você escolhe? Responda 1 ou 2! 🎁`,
        )
      } else {
        const selectedFAQ = faqQuestions.find((faq) => faq.id === option)
        if (selectedFAQ) {
          userState[msg.from] = "viewing_faq_answer"
          await delay(5000)
          await chat.sendStateTyping()
          await delay(5000)
          await client.sendMessage(msg.from, selectedFAQ.response)

          await delay(3000)
          await sendOnlineStatus(chat)
          await delay(5000)
          await chat.sendStateTyping()
          await delay(5000)
          await client.sendMessage(
            msg.from,
            `Tem mais alguma dúvida?\n\n` +
              `👈 Digite "voltar" para retornar às dúvidas\n` +
              `👉 Ou "pacotes" para ver nossas ofertas!\n\n` +
              `(Escolha uma das opções acima)`,
          )
        }
      }
    }

    if (msg.body.toLowerCase() === "voltar" && userState[msg.from] === "viewing_faq_answer") {
      const chat = await msg.getChat()
      userState[msg.from] = "viewing_faq"

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)

      let faqMessage = `❓ *DÚVIDAS FREQUENTES:*\n\n`
      faqQuestions.forEach((faq) => {
        faqMessage += `${faq.id}️⃣ ${faq.question}\n`
      })
      faqMessage += `\n5️⃣ *IR PARA O MENU DE PACOTES* 📚\n\n`
      faqMessage += `Responda o número da sua dúvida (1-5)! 👇`

      await client.sendMessage(msg.from, faqMessage)
    }

    if (msg.body.toLowerCase() === "pacotes" && userState[msg.from] === "viewing_faq_answer") {
      const chat = await msg.getChat()
      userState[msg.from] = "viewing_menu"

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)
      await client.sendMessage(
        msg.from,
        `📚 *ESCOLHA SEU PACOTE AGORA!*\n\n` +
          `1️⃣ *PACOTE BÁSICO - R$ 10,00*\n` +
          `✅ 27 livros de colorir em PDF\n` +
          `✅ Temas bíblicos variados\n` +
          `🔓 Acesso vitalício\n` +
          `✅ Garantia de 7 dias\n` +
          `✅ Suporte por WhatsApp\n\n` +
          `2️⃣ *PACOTE PREMIUM - R$ 17,00* (+500 pessoas já escolheram!)\n` +
          `✅ TUDO DO PACOTE BÁSICO +\n` +
          `✨ Bônus 1: Stickers personalizados\n` +
          `✨ Bônus 2: Capas e contra-capas personalizadas\n` +
          `✨ Bônus 3: Páginas separadas\n` +
          `✨ Bônus 4: +3 Versículos (30 livros total)\n\n` +
          `Qual você escolhe? Responda 1 ou 2! 🎁`,
      )
    }

    if (userState[msg.from] === "viewing_menu" && msg.body.match(/^[1-2]$/)) {
      const chat = await msg.getChat()
      const option = msg.body.trim()

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)

      if (option === "1") {
        await client.sendMessage(
          msg.from,
          `🎉 *PACOTE BÁSICO ESCOLHIDO!* 🎉\n\n` +
            `R$ 10,00 por 27 incríveis livros de colorir cristãos!\n\n` +
            `🔗 Clique aqui para finalizar sua compra:\n` +
            `https://go.tribopay.com.br/j6ptowdprv\n\n` +
            `✨ Você será redirecionado para o pagamento seguro\n` +
            `✅ Após confirmar o PIX/Boleto, receberá o email com os PDFs em até 10 minutos!\n\n` +
            `Qualquer dúvida durante o pagamento, é só chamar! 🙏`,
        )
      } else if (option === "2") {
        await client.sendMessage(
          msg.from,
          `🎉 *PACOTE PREMIUM ESCOLHIDO!* 💎\n\n` +
            `R$ 17,00 por TUDO + 4 BÔNUS EXCLUSIVOS!\n` +
            `A escolha de mais de 500 famílias!\n\n` +
            `🔗 Clique aqui para finalizar sua compra:\n` +
            `https://go.tribopay.com.br/w7g1krwvtk\n\n` +
            `✨ Você será redirecionado para o pagamento seguro\n` +
            `✅ Após confirmar o PIX/Boleto, receberá o email com os PDFs + bônus em até 10 minutos!\n\n` +
            `Parabéns pela escolha! Você vai amar! 🙏💚`,
        )
      }

      userState[msg.from] = "checkout_sent"
    }

    if (userState[msg.from] === "viewing_menu" && msg.body.match(/^[^1-2]$/) && msg.body.match(/^\d$/)) {
      const chat = await msg.getChat()

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)
      await client.sendMessage(msg.from, `Por favor, escolha uma das opções disponíveis (1 ou 2)! 👇`)
    }

    if (userState[msg.from] === "viewing_faq" && msg.body.match(/^[^1-5]$/) && msg.body.match(/^\d$/)) {
      const chat = await msg.getChat()

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)
      await client.sendMessage(msg.from, `Por favor, escolha uma das opções disponíveis (1-5)! 👇`)
    }

    if (msg.hasMedia && msg.from.endsWith("@c.us")) {
      const chat = await msg.getChat()

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)
      await client.sendMessage(
        msg.from,
        `✨ Obrigado pelo contato! Estamos transfirindo para um especialista ✅\n\n` +
          `Vamos resolver sua situação rapidinho! 🚀`,
      )

      await delay(1000)
      await client.sendMessage(
        "5521988887777@c.us",
        `📸 *NOVO CLIENTE ENVIOU COMPROVANTE*\n\n` +
          `Cliente: ${msg.from}\n` +
          `Mensagem recebida\n\n` +
          `Contate para resolver! ⚠️`,
      )
    }

    if (msg.body.match(/aprovado|pagamento confirmado|pago|confirmado|sucesso|pronto/i)) {
      const chat = await msg.getChat()

      await sendOnlineStatus(chat)
      await delay(5000)
      await chat.sendStateTyping()
      await delay(5000)

      const paymentCheck = await checkPaymentStatus(msg.from)

      if (paymentCheck.hasPaid) {
        await client.sendMessage(
          msg.from,
          `✅ *PAGAMENTO CONFIRMADO COM SUCESSO!* ✅\n\n` +
            `Seu pedido foi processado!\n\n` +
            `📧 Verifique seu email para os PDFs e bônus.\n` +
            `(Se não encontrar, procure na pasta SPAM)\n\n` +
            `😍 *DEIXE AQUI SUA AVALIAÇÃO!* ⭐\n\n` +
            `Como foi sua experiência conosco?\n\n` +
            `(Escreva sua avaliação aqui 👇)`,
        )
      } else {
        await client.sendMessage(
          msg.from,
          `😍 *DEIXE AQUI SUA AVALIAÇÃO!* ⭐\n\n` +
            `Seu pagamento foi confirmado com sucesso! ✅\n\n` +
            `Você já deve ter recebido o email com todos os PDFs e bônus.\n\n` +
            `Agora queremos saber: *Como foi sua experiência conosco?*\n\n` +
            `Deixe um feedback rápido para nos ajudar a melhorar! 💚\n\n` +
            `(Escreva sua avaliação aqui 👇)`,
        )
      }
    }

    if (msg.body.length > 10 && !msg.body.match(/^[1-2]$|menu|https/i) && msg.from.endsWith("@c.us")) {
      const faqAnswered = await detectAndAnswerFAQ(msg, chat)

      if (
        !faqAnswered &&
        msg.body.match(/gostei|adorei|maravilhoso|perfeito|excelente|recomendo|incrível|muito bom|ótimo|legal/i)
      ) {
        const chat = await msg.getChat()

        await sendOnlineStatus(chat)
        await delay(5000)
        await chat.sendStateTyping()
        await delay(5000)
        await client.sendMessage(
          msg.from,
          `⭐ *MUITO OBRIGADO PELA AVALIAÇÃO!* ⭐\n\n` +
            `Sua opinião é muito importante para nós!\n\n` +
            `🎉 Em breve vamos compartilhar seu depoimento no nosso Instagram para inspirar outras famílias! 📸\n\n` +
            `Continue curtindo seus livros de colorir cristãos e que Deus te abençoe! 🙏💚`,
        )
      }
    }
  } catch (error) {
    console.error("Erro ao processar mensagem:", error)
  }
})

client.initialize()
