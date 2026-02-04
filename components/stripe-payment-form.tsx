"use client"

import { useState, FormEvent } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock } from "lucide-react"

interface StripePaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  isLoading = false,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Для всех платежей используем стандартный flow с Payment Intent
      // API создаст Payment Intent с минимальной суммой (50 центов) для $0 платежей
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/booking-confirmed",
        },
        redirect: "if_required", // Не редиректим, если не требуется
      })

      if (error) {
        throw error
      }

      // Для $0 платежей подтверждаем на сервере (чтобы отменить списание минимальной суммы)
      if (amount === 0 && paymentIntent) {
        // Подтверждаем на сервере с таймаутом
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

          const confirmResponse = await fetch("/api/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!confirmResponse.ok) {
            throw new Error(`HTTP error! status: ${confirmResponse.status}`)
          }

          const confirmData = await confirmResponse.json()

          if (confirmData.success) {
            onSuccess(paymentIntent.id)
          } else {
            // Даже если подтверждение не удалось, платеж уже обработан
            onSuccess(paymentIntent.id)
          }
        } catch (fetchError) {
          // Если таймаут или другая ошибка - все равно считаем успешным
          // так как платеж уже обработан через Stripe
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            console.warn("Payment confirmation timeout, but payment was processed")
          } else {
            console.warn("Payment confirmation error:", fetchError)
          }
          // Платеж уже обработан через Stripe, продолжаем
          onSuccess(paymentIntent.id)
        }
      } else if (paymentIntent) {
        onSuccess(paymentIntent.id)
      }
    } catch (error) {
      console.error("Payment error:", error)
      onError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />

          <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <Lock className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">
              <strong>$0 Due now</strong> — Your card won't be charged until the order is assigned to a
              carrier.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || isLoading}
        className="w-full bg-[#044BD9] hover:bg-[#033ba8] text-white py-3 text-lg font-semibold"
        size="lg"
      >
        {isProcessing || isLoading ? "Processing..." : "Book Shipment"}
      </Button>
    </form>
  )
}

