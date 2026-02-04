import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Ленивая инициализация Stripe только когда нужен
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-11-17.clover",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, bookingData } = body

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment Intent ID is required" }, { status: 400 })
    }

    const stripe = getStripe()

    // Получаем Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Проверяем, это ли $0 платеж (по метаданным)
    const isZeroAmount = paymentIntent.metadata?.isZeroAmount === "true"

    // Для $0 платежей с capture_method: "manual" средства не списываются автоматически
    // Просто проверяем статус и возвращаем успех
    // Отмена/возврат средств не нужны, так как capture_method: "manual" предотвращает автоматическое списание

    // Проверяем статус платежа
    if (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture") {
      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        message: isZeroAmount
          ? "Payment method saved. No charge until carrier assignment."
          : "Payment confirmed successfully",
      })
    } else if (paymentIntent.status === "requires_payment_method") {
      // Платеж еще не выполнен, но это нормально для $0 Due now
      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        message: "Payment method saved. No charge until carrier assignment.",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          status: paymentIntent.status,
          message: `Payment status: ${paymentIntent.status}`,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

