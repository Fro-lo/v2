import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Ленивая инициализация Stripe только когда нужен
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  console.log("[v0] STRIPE_SECRET_KEY present:", !!secretKey)
  console.log("[v0] STRIPE_SECRET_KEY prefix:", secretKey ? secretKey.substring(0, 7) : "undefined")
  console.log("[v0] All env keys with STRIPE:", Object.keys(process.env).filter(k => k.includes("STRIPE")))
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-03-31.basil",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "usd", metadata = {} } = body

    // Разрешаем сумму 0 для случаев "Due now $0" (карта сохраняется, но деньги не списываются)
    if (amount === undefined || amount === null || amount < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const stripe = getStripe()

    // Для $0 платежей используем Payment Intent с минимальной суммой (50 центов)
    // PaymentElement лучше работает с Payment Intent, чем с Setup Intent
    // В реальности средства не будут списаны, так как это только для сохранения карты
    const actualAmount = amount === 0 ? 50 : Math.round(amount * 100) // Минимум 50 центов для $0

    // Создаем Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: actualAmount,
      currency,
      metadata: {
        ...metadata,
        originalAmount: amount.toString(), // Сохраняем оригинальную сумму
        isZeroAmount: (amount === 0).toString(), // Флаг что это $0 платеж
      },
      capture_method: amount === 0 ? "manual" : "automatic", // Для $0 не списываем автоматически
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      type: "payment_intent",
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

