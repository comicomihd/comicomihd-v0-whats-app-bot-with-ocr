import express from "express"
import fs from "fs"
import path from "path"

const app = express()
app.use(express.json())

// Arquivo para armazenar pagamentos
const paymentsFile = path.join(__dirname, "payments.json")

// Carregar pagamentos
const loadPayments = () => {
  try {
    if (fs.existsSync(paymentsFile)) {
      const data = fs.readFileSync(paymentsFile, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.log("[v0] Criando novo arquivo de pagamentos")
  }
  return {}
}

// Salvar pagamentos
const savePayments = (payments: any) => {
  fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2))
}

// Webhook da Tribopay
app.post("/api/webhook/tribopay", (req, res) => {
  try {
    const { id, status, amount, customer_email, customer_phone, customer_name, product_id, created_at, updated_at } =
      req.body

    console.log("[v0] Webhook recebido da Tribopay:", {
      id,
      status,
      amount,
      customer_phone,
    })

    // Salvar o pagamento no arquivo
    const payments = loadPayments()
    const phoneKey = customer_phone?.replace(/\D/g, "") || customer_email

    if (!payments[phoneKey]) {
      payments[phoneKey] = []
    }

    // Adicionar novo pagamento
    payments[phoneKey].push({
      transaction_id: id,
      status: status,
      amount: amount,
      email: customer_email,
      phone: customer_phone,
      name: customer_name,
      product_id: product_id,
      package: product_id === "j6ptowdprv" ? "BÁSICO" : "PREMIUM",
      created_at: created_at,
      updated_at: updated_at,
      timestamp: Date.now(),
    })

    savePayments(payments)

    // Responder com sucesso para a Tribopay
    res.json({ success: true, message: "Pagamento registrado com sucesso" })

    // Processar conforme o status
    if (status === "APPROVED" || status === "paid") {
      console.log(`[v0] Pagamento APROVADO de ${customer_phone}`)
    } else if (status === "CANCELED" || status === "cancelled") {
      console.log(`[v0] Pagamento CANCELADO de ${customer_phone}`)
    } else if (status === "REJECTED" || status === "refused") {
      console.log(`[v0] Pagamento RECUSADO de ${customer_phone}`)
    } else if (status === "PENDING" || status === "pending") {
      console.log(`[v0] Pagamento AGUARDANDO de ${customer_phone}`)
    }
  } catch (error) {
    console.error("[v0] Erro ao processar webhook:", error)
    res.status(500).json({ error: "Erro ao processar webhook" })
  }
})

// Endpoint para verificar se cliente pagou
app.get("/api/check-payment/:phone", (req, res) => {
  try {
    const phone = req.params.phone.replace(/\D/g, "")
    const payments = loadPayments()

    const clientPayments = payments[phone] || []
    const approvedPayments = clientPayments.filter((p: any) => p.status === "APPROVED" || p.status === "paid")

    if (approvedPayments.length > 0) {
      res.json({
        hasPaid: true,
        lastPayment: approvedPayments[approvedPayments.length - 1],
      })
    } else {
      res.json({
        hasPaid: false,
        message: "Nenhum pagamento aprovado encontrado",
      })
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar pagamento" })
  }
})

// Endpoint para listar todos os pagamentos de um cliente
app.get("/api/payments/:phone", (req, res) => {
  try {
    const phone = req.params.phone.replace(/\D/g, "")
    const payments = loadPayments()

    const clientPayments = payments[phone] || []
    res.json({
      phone: phone,
      payments: clientPayments,
      total: clientPayments.length,
    })
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar pagamentos" })
  }
})

// Endpoint para dashboard de vendas
app.get("/api/dashboard/sales", (req, res) => {
  try {
    const payments = loadPayments()

    let totalSales = 0
    let approvedCount = 0
    const packageStats = { BÁSICO: 0, PREMIUM: 0 }
    const statusCount = {
      APPROVED: 0,
      CANCELED: 0,
      REJECTED: 0,
      PENDING: 0,
      CHARGEBACK: 0,
      OTHER: 0,
    }

    Object.values(payments).forEach((clientPayments: any) => {
      clientPayments.forEach((payment: any) => {
        if (payment.status === "APPROVED" || payment.status === "paid") {
          totalSales += payment.amount || 0
          approvedCount++
          packageStats[payment.package as keyof typeof packageStats]++
        }

        // Contar status
        if (payment.status === "APPROVED" || payment.status === "paid") {
          statusCount.APPROVED++
        } else if (payment.status === "CANCELED") {
          statusCount.CANCELED++
        } else if (payment.status === "REJECTED") {
          statusCount.REJECTED++
        } else if (payment.status === "PENDING") {
          statusCount.PENDING++
        } else if (payment.status === "CHARGEBACK") {
          statusCount.CHARGEBACK++
        } else {
          statusCount.OTHER++
        }
      })
    })

    res.json({
      totalSales: totalSales.toFixed(2),
      approvedPayments: approvedCount,
      packageStats: packageStats,
      statusCount: statusCount,
      totalClients: Object.keys(payments).length,
    })
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter dashboard" })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Webhook server rodando em http://localhost:${PORT}`)
  console.log(`📍 Webhook URL: http://localhost:${PORT}/api/webhook/tribopay`)
})
