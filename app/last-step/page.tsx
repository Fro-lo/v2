"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StripePaymentForm } from "@/components/stripe-payment-form"

import {
  CheckCircle,
  Flag,
  CreditCard,
  Star,
  MapPin,
  Calendar,
  Car,
  DollarSign,
  Shield,
  Home,
  Lock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Check,
} from "lucide-react"

// Инициализируем Stripe (ключ будет загружен из переменных окружения)
let stripePromise: ReturnType<typeof loadStripe> | null = null

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (publishableKey) {
      stripePromise = loadStripe(publishableKey)
    }
  }
  return stripePromise
}

export default function BookingPage() {
  const [selectedPayment, setSelectedPayment] = useState("credit-card")
  const [selectedSplitOption, setSelectedSplitOption] = useState("")
  const [customSplit, setCustomSplit] = useState({ now: "", delivery: "" })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Ship From address components - from /shipment-details page
  const shipFromHouseNumber = searchParams.get("fromHouseNumber") || ""
  const shipFromStreetName = searchParams.get("fromStreet") || ""
  const shipFromCity = searchParams.get("fromCity") || ""
  const shipFromState = searchParams.get("fromState") || ""
  const shipFromPostalCode = searchParams.get("fromZip") || ""

  // Ship To address components - from /shipment-details page
  const shipToHouseNumber = searchParams.get("toHouseNumber") || ""
  const shipToStreetName = searchParams.get("toStreet") || ""
  const shipToCity = searchParams.get("toCity") || ""
  const shipToState = searchParams.get("toState") || ""
  const shipToPostalCode = searchParams.get("toZip") || ""

  // Address type parameters - from /shipment-details page
  const shipFromAddressType = searchParams.get("fromAddressType") || ""
  const shipToAddressType = searchParams.get("toAddressType") || ""

  // Customer information parameters - from /shipment-details page
  const customerName = searchParams.get("customerName") || ""
  const customerEmail = searchParams.get("customerEmail") || ""
  const customerPhone = searchParams.get("customerPhone") || ""
  const customerNotes = searchParams.get("customerNotes") || ""

  // Contact information parameters - from /shipment-details page
  const contactName = searchParams.get("contactName") || ""
  const contactPhone = searchParams.get("contactPhone") || ""
  const specialInstructions = searchParams.get("specialInstructions") || ""

  // Date parameters - from /shipment-details page
  const pickupDate = searchParams.get("pickupDate") || ""
  const deliveryDate = searchParams.get("deliveryDate") || ""

  // Vehicle parameter - from /shipment-details page
  const vehicleModel = searchParams.get("vehicleModel") || ""

  // Vehicle transport type parameter - from /shipment-details page
  const vehicleTransportType = searchParams.get("vehicleTransportType") || "enclosed"

  // Price parameter - from /shipment-details page
  const totalPrice = searchParams.get("total") || "2200"
  const priceAmount = parseFloat(totalPrice.replace("$", "").replace(",", "")) || 0

  // Construct full addresses
  const shipFrom = `${shipFromHouseNumber} ${shipFromStreetName}, ${shipFromCity}, ${shipFromState} ${shipFromPostalCode}`
  const shipTo = `${shipToHouseNumber} ${shipToStreetName}, ${shipToCity}, ${shipToState} ${shipToPostalCode}`

  // Создаем Payment Intent при загрузке страницы для Credit Card
  useEffect(() => {
    if (selectedPayment === "credit-card" && !clientSecret) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 секунд таймаут

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 0, // $0 Due now
          currency: "usd",
          metadata: {
            pickupDate,
            deliveryDate,
            vehicleModel,
            totalPrice,
          },
        }),
        signal: controller.signal,
      })
        .then((res) => {
          clearTimeout(timeoutId)
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.error || `HTTP error! status: ${res.status}`)
            })
          }
          return res.json()
        })
        .then((data) => {
          console.log("Payment Intent created:", data)
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
            setPaymentError(null)
          } else {
            throw new Error("No clientSecret in response")
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          if (error.name === "AbortError") {
            setPaymentError("Request timeout. Please try again.")
          } else {
            console.error("Error creating payment intent:", error)
            setPaymentError(error.message || "Failed to initialize payment. Please try again.")
          }
        })
    }
  }, [selectedPayment, clientSecret, pickupDate, deliveryDate, vehicleModel, totalPrice])

  const splitOptions = [
    { id: "50-50", label: "50% now, 50% on delivery", popular: true },
    { id: "25-75", label: "25% now, 75% on delivery", popular: false },
    { id: "custom", label: "Custom split", popular: false },
  ]

const handleSplitOptionSelect = (optionId: string) => {
  setSelectedSplitOption(optionId)
  if (optionId !== "custom") {
    setCustomSplit({ now: "", delivery: "" })
  }
}

const handleCustomSplitChange = (field: "now" | "delivery", value: string) => {
  const numValue = Number.parseInt(value) || 0
  if (numValue >= 0 && numValue <= 100) {
    const otherField = field === "now" ? "delivery" : "now"
    const otherValue = 100 - numValue

    // Исправленный вариант с prev
    setCustomSplit(prev => ({
      ...prev, // сохраняем остальные поля
      [field]: value,
      [otherField]: otherValue.toString(),
    }))
  }
}

  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Construct URL with all booking data
    const bookingData = new URLSearchParams({
      pickupDate,
      deliveryDate,
      vehicleModel,
      fromHouseNumber: shipFromHouseNumber,
      fromStreet: shipFromStreetName,
      fromCity: shipFromCity,
      fromState: shipFromState,
      fromZip: shipFromPostalCode,
      toHouseNumber: shipToHouseNumber,
      toStreet: shipToStreetName,
      toCity: shipToCity,
      toState: shipToState,
      toZip: shipToPostalCode,
      finalPrice: totalPrice,
      serviceType: "Door to Door",
      transportType: vehicleTransportType === "open" ? "Open" : "Enclosed",
      insurance: "Included",
      paymentMethod: "Credit Card",
      fromAddressType: shipFromAddressType,
      toAddressType: shipToAddressType,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      contactName,
      contactPhone,
      specialInstructions,
    })

    router.push(`/booking-confirmed?${bookingData.toString()}`)
  }

  const handleStripePaymentSuccess = (paymentIntentId: string) => {
    // Construct URL with all booking data including payment intent ID
    const bookingData = new URLSearchParams({
      pickupDate,
      deliveryDate,
      vehicleModel,
      fromHouseNumber: shipFromHouseNumber,
      fromStreet: shipFromStreetName,
      fromCity: shipFromCity,
      fromState: shipFromState,
      fromZip: shipFromPostalCode,
      toHouseNumber: shipToHouseNumber,
      toStreet: shipToStreetName,
      toCity: shipToCity,
      toState: shipToState,
      toZip: shipToPostalCode,
      finalPrice: totalPrice,
      serviceType: "Door to Door",
      transportType: vehicleTransportType === "open" ? "Open" : "Enclosed",
      insurance: "Included",
      paymentMethod: "Credit Card",
      paymentIntentId,
      fromAddressType: shipFromAddressType,
      toAddressType: shipToAddressType,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      contactName,
      contactPhone,
      specialInstructions,
    })

    router.push(`/booking-confirmed?${bookingData.toString()}`)
  }

  const handleStripePaymentError = (error: string) => {
    setPaymentError(error)
    console.error("Stripe payment error:", error)
  }

  // Input validation handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16)
    // Add space every 4 digits
    const formattedValue = value.replace(/(.{4})/g, "$1 ").trim()
    e.target.value = formattedValue
  }

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, "").toUpperCase()
    e.target.value = value
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4)
    }
    e.target.value = value.slice(0, 5)
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
    e.target.value = value
  }

  // Custom validation messages in English
  const setEnglishValidationMessages = (input: HTMLInputElement, fieldName: string) => {
    if (input.validity.valueMissing) {
      input.setCustomValidity(`Please enter your ${fieldName.toLowerCase()}`)
    } else {
      input.setCustomValidity("")
    }
  }

  const handleInputValidation = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    setEnglishValidationMessages(e.target, fieldName)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Vehicler Style with Pattern */}
      <header
        className="bg-[#6371BE] text-white relative overflow-hidden"
        style={{
          backgroundImage: `url('/images/vehicler-pattern.png')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-[#6371BE] opacity-85"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="ml-16">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/vehicler-logo-white.png"
                  alt="Vehicler"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
              <div className="flex items-center space-x-2"></div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────── Progress Tracker ─────────────────── */}
      <div className="bg-[#F2F2F2] py-4">
        <div className="max-w-4xl mx-auto px-4 pl-16">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium text-[#262626]">Contact Information</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium text-[#262626]">Shipment Details</span>
            </div>
            <div className="w-12 h-0.5 bg-[#6371BE]" />
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#6371BE] rounded-full flex items-center justify-center">
                <Flag className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-[#6371BE]">Book Shipment</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────── Main Content ─────────────────── */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* ───────── Left column – Payment ───────── */}
            <div>
              <h2
                className="text-3xl font-bold text-[#262626] mb-8"
                style={{ fontFamily: "Oblivion Future, sans-serif" }}
              >
                Last step!
              </h2>

              <Tabs value={selectedPayment} onValueChange={setSelectedPayment} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="credit-card" className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  <TabsTrigger value="split">Split Payment</TabsTrigger>
                </TabsList>

                {/* Credit-card tab */}
                <TabsContent value="credit-card" className="space-y-6">
                  {paymentError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{paymentError}</p>
                    </div>
                  )}
                  {clientSecret ? (
                    (() => {
                      const stripeInstance = getStripe()
                      if (!stripeInstance) {
                        return (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                            <p className="text-sm text-red-700">
                              Stripe не инициализирован. Проверьте NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                            </p>
                          </div>
                        )
                      }
                      return (
                        <Elements
                          stripe={stripeInstance}
                          options={{
                            clientSecret,
                            appearance: {
                              theme: "stripe",
                              variables: {
                                colorPrimary: "#044BD9",
                                colorBackground: "#ffffff",
                                colorText: "#262626",
                                colorDanger: "#df1b41",
                                fontFamily: "system-ui, sans-serif",
                                spacingUnit: "4px",
                                borderRadius: "8px",
                              },
                            },
                          }}
                        >
                          <StripePaymentForm
                            amount={0}
                            onSuccess={handleStripePaymentSuccess}
                            onError={handleStripePaymentError}
                          />
                        </Elements>
                      )
                    })()
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Loading payment form...</p>
                    </div>
                  )}
                </TabsContent>

                {/* PayPal tab */}
                <TabsContent value="paypal">
                  <Card>
                    <CardContent className="p-6 text-center space-y-6">
                      <div className="flex justify-center">
                        <Image
                          src="/images/paypal-logo.png"
                          alt="PayPal Logo"
                          width={120}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <p className="text-gray-600">You'll be redirected to PayPal to complete your payment securely.</p>
                      <Button
                        className="w-full bg-[#003087] hover:bg-[#012169] text-white"
                        onClick={() => {
                          const bookingData = new URLSearchParams({
                            pickupDate,
                            deliveryDate,
                            vehicleModel,
                            fromHouseNumber: shipFromHouseNumber,
                            fromStreet: shipFromStreetName,
                            fromCity: shipFromCity,
                            fromState: shipFromState,
                            fromZip: shipFromPostalCode,
                            toHouseNumber: shipToHouseNumber,
                            toStreet: shipToStreetName,
                            toCity: shipToCity,
                            toState: shipToState,
                            toZip: shipToPostalCode,
                            finalPrice: totalPrice,
                            serviceType: "Door to Door",
                            transportType: vehicleTransportType === "open" ? "Open" : "Enclosed",
                            insurance: "Included",
                            paymentMethod: "PayPal",
                            fromAddressType: shipFromAddressType,
                            toAddressType: shipToAddressType,
                            customerName,
                            customerEmail,
                            customerPhone,
                            customerNotes,
                            contactName,
                            contactPhone,
                            specialInstructions,
                          })
                          router.push(`/booking-confirmed?${bookingData.toString()}`)
                        }}
                      >
                        Continue with PayPal
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Split-payment tab */}
                <TabsContent value="split">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Split Payment Options</h3>
                        <p className="text-gray-600 mb-4">
                          Choose how you'd like to split the payment for your shipment.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {splitOptions.map((option) => (
                          <div
                            key={option.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedSplitOption === option.id
                                ? "border-[#6371BE] bg-[#6371BE]/5 ring-2 ring-[#6371BE]/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleSplitOptionSelect(option.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedSplitOption === option.id
                                      ? "border-[#6371BE] bg-[#6371BE]"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedSplitOption === option.id && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-medium">{option.label}</span>
                              </div>
                              {option.popular && <Badge variant="secondary">Popular</Badge>}
                            </div>

                            {/* Custom split inputs */}
                            {option.id === "custom" && selectedSplitOption === "custom" && (
                              <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="split-now">Pay Now (%)</Label>
                                  <Input
                                    id="split-now"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={customSplit.now}
                                    onChange={(e) => handleCustomSplitChange("now", e.target.value)}
                                    placeholder="50"
                                    className="p-3 focus:ring-[#081C8B] focus:border-[#081C8B] focus-visible:ring-[#081C8B]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="split-delivery">On Delivery (%)</Label>
                                  <Input
                                    id="split-delivery"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={customSplit.delivery}
                                    onChange={(e) => handleCustomSplitChange("delivery", e.target.value)}
                                    placeholder="50"
                                    className="p-3 focus:ring-[#081C8B] focus:border-[#081C8B] focus-visible:ring-[#081C8B]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {selectedSplitOption && (
                        <div className="pt-4">
                          <Button
                            className="w-full bg-[#044BD9] hover:bg-[#033ba8] text-white py-3 text-lg font-semibold"
                            size="lg"
                            onClick={() => {
                              const bookingData = new URLSearchParams({
                                pickupDate,
                                deliveryDate,
                                vehicleModel,
                                fromHouseNumber: shipFromHouseNumber,
                                fromStreet: shipFromStreetName,
                                fromCity: shipFromCity,
                                fromState: shipFromState,
                                fromZip: shipFromPostalCode,
                                toHouseNumber: shipToHouseNumber,
                                toStreet: shipToStreetName,
                                toCity: shipToCity,
                                toState: shipToState,
                                toZip: shipToPostalCode,
                                finalPrice: totalPrice,
                                serviceType: "Door to Door",
                                transportType: vehicleTransportType === "open" ? "Open" : "Enclosed",
                                insurance: "Included",
                                paymentMethod: "Split Payment",
                                splitOption: selectedSplitOption,
                                fromAddressType: shipFromAddressType,
                                toAddressType: shipToAddressType,
                                customerName,
                                customerEmail,
                                customerPhone,
                                customerNotes,
                                contactName,
                                contactPhone,
                                specialInstructions,
                              })
                              router.push(`/booking-confirmed?${bookingData.toString()}`)
                            }}
                          >
                            Confirm Split Payment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* ───────── Right column – Summary ───────── */}
            <div>
              <Card className="sticky top-8 shadow-md">
                <CardHeader className="pb-6">
                  <CardTitle
                    className="text-2xl font-bold text-[#262626]"
                    style={{ fontFamily: "Oblivion Future, sans-serif" }}
                  >
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* key-value pairs */}
                  <div className="space-y-4">
                    {[
                      {
                        label: "Pickup Date",
                        icon: Calendar,
                        value: pickupDate,
                      },
                      {
                        label: "Delivery Date",
                        icon: Calendar,
                        value: deliveryDate,
                      },
                      { label: "Vehicle", icon: Car, value: vehicleModel },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <item.icon className="w-4 h-4 text-[#6371BE]" />
                            <span className="text-sm text-gray-600">{item.label}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                        <div className="border-t border-dashed border-[#6371BE] my-2" />
                      </div>
                    ))}

                    {/* Prices */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-[#6371BE]" />
                        <span className="text-sm text-gray-600">Final Price</span>
                      </div>
                      <span className="font-bold text-lg text-[#262626]">{totalPrice}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Due Now</span>
                      </div>
                      <span className="font-bold text-lg text-green-600">$0</span>
                    </div>

                    <div className="border-t border-dashed border-[#6371BE] my-2" />

                    {/* Addresses */}
                    {[
                      {
                        label: "Ship From",
                        value: shipFrom,
                        addressType: shipFromAddressType,
                      },
                      {
                        label: "Ship To",
                        value: shipTo,
                        addressType: shipToAddressType,
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-[#6371BE] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">{item.label}</p>
                          <p className="font-medium text-sm">{item.value}</p>
                          {item.addressType && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.addressType === "residential" ? "Residential address" : "Business address"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-dashed border-[#6371BE] my-2" />

                    {/* Extra details */}
                    {[
                      { label: "Insurance", value: "Included", icon: Shield, green: true },
                      { label: "Service Type", value: "Door to Door", icon: Home },
                      {
                        label: "Transport Type",
                        value: vehicleTransportType === "open" ? "Open" : "Enclosed",
                        icon: Car,
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <item.icon className="w-4 h-4 text-[#6371BE]" />
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className={`font-medium ${item.green ? "text-green-600" : "text-gray-800"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Feedback Section - Full Width with Endless Carousel */}
      <div className="bg-[#F2F2F2] py-16 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-center text-[#262626] mb-12"
            style={{ fontFamily: "Oblivion Future, sans-serif" }}
          >
            Customer Feedback
          </h2>
          {/* Endless Carousel */}
          <div className="relative">
            <div className="flex animate-scroll space-x-6">
              {/* First set of testimonials */}
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Excellent service! My car arrived exactly on time and in perfect condition."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Sarah Johnson</span>
                    <span>Dec 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Professional team, competitive pricing, and great communication throughout."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Mike Chen</span>
                    <span>Nov 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Hassle-free booking process and reliable delivery. Highly recommend!"
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Emily Rodriguez</span>
                    <span>Nov 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Best car shipping experience I've had. Will definitely use again."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">David Thompson</span>
                    <span>Oct 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Great value for money. The driver was courteous and kept me updated throughout the journey."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Jessica Martinez</span>
                    <span>Oct 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Smooth process from start to finish. My classic car was handled with extreme care."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Robert Wilson</span>
                    <span>Sep 2024</span>
                  </div>
                </CardContent>
              </Card>
              {/* Duplicate set for seamless loop */}
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Excellent service! My car arrived exactly on time and in perfect condition."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Sarah Johnson</span>
                    <span>Dec 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Professional team, competitive pricing, and great communication throughout."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Mike Chen</span>
                    <span>Nov 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Hassle-free booking process and reliable delivery. Highly recommend!"
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Emily Rodriguez</span>
                    <span>Nov 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Best car shipping experience I've had. Will definitely use again."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">David Thompson</span>
                    <span>Oct 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Great value for money. The driver was courteous and kept me updated throughout the journey."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Jessica Martinez</span>
                    <span>Oct 2024</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    "Smooth process from start to finish. My classic car was handled with extreme care."
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Robert Wilson</span>
                    <span>Sep 2024</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────── Footer ─────────────────── */}
      <footer className="bg-[#262626] text-white py-12">
        <div className="max-w-6xl mx-auto px-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo + description */}
            <div className="space-y-6">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/vehicler-footer-logo.png"
                  alt="Vehicler logo mark"
                  width={160}
                  height={40}
                  priority
                />
              </Link>

              <p className="text-gray-300 text-sm leading-relaxed">
                America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.
              </p>

              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon) => (
                  <a key={Icon.displayName} href="#" aria-label={`${Icon.displayName} link`}>
                    <Icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <FooterColumn
              title="Services"
              links={["Open Car Transport", "Enclosed Car Transport", "Motorcycle Shipping", "Classic Car Transport"]}
            />

            {/* Company */}
            <FooterColumn
              title="Company"
              links={[
                { text: "About Us", href: "#" },
                { text: "How It Works", href: "/#how-it-works" },
                { text: "Reviews", href: "/#reviews" },
                { text: "Careers", href: "#" },
              ]}
            />

            {/* Support */}
            <FooterColumn
              title="Support"
              links={[
                { text: "Contact Us", href: "#" },
                { text: "FAQ", href: "/#faq" },
                { text: "Track Shipment", href: "/find-my-vehicle" },
                { text: "Get Quote", href: "/#quote" },
              ]}
            />
          </div>

          {/* bottom row */}
          <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Vehicler. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─────────────────── Reusable footer column component ─────────────────── */
interface FooterColumnProps {
  title: string
  links: Array<{ text: string; href: string }> | string[]
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => {
          const linkText = typeof link === "string" ? link : link.text
          const linkHref = typeof link === "string" ? "#" : link.href

          return (
            <li key={linkText}>
              <Link href={linkHref} className="text-gray-300 hover:text-white transition-colors">
                {linkText}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
