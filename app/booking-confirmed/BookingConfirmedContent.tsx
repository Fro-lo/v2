"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Calendar, MapPin, Car, DollarSign, Shield, Home, User, Mail, Phone, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

// ──────────────── Types ────────────────
interface BookingData {
  pickupAddress: {
    houseNumber: string
    streetName: string
    city: string
    state: string
    zipCode: string
    addressType: string
  }
  deliveryAddress: {
    houseNumber: string
    streetName: string
    city: string
    state: string
    zipCode: string
    addressType: string
  }
  pickupDate: string
  estimatedDelivery: string
  vehicle: string
  totalPrice: string
  transportType: string
  serviceType: string
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes: string
  contactName: string
  contactPhone: string
  specialInstructions: string
}

// ──────────────── Default data ────────────────
const defaultData: BookingData = {
  pickupAddress: {
    houseNumber: "123",
    streetName: "Main Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    addressType: "residential",
  },
  deliveryAddress: {
    houseNumber: "456",
    streetName: "Oak Avenue",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    addressType: "residential",
  },
  pickupDate: "January 15, 2025",
  estimatedDelivery: "January 22, 2025",
  vehicle: "2024 Volvo S60",
  totalPrice: "$2,200",
  transportType: "Enclosed",
  serviceType: "Door-to-door",
  bookingId: "#A4X2-B97",
  customerName: "John Smith",
  customerEmail: "john.smith@email.com",
  customerPhone: "(555) 123-4567",
  customerNotes: "",
  contactName: "",
  contactPhone: "",
  specialInstructions: "",
}

// ──────────────── Helpers ────────────────
const formatAddressType = (addressType: string): string => {
  return addressType === "business" ? "Business address" : "Residential address"
}

// ──────────────── Main component ────────────────
export default function BookingConfirmedContent() {
  const searchParams = useSearchParams()
  const [bookingId, setBookingId] = useState<string>("")

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const hasSavedRef = useRef(false) // Защита от повторного сохранения

  useEffect(() => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
    setBookingId(`#${randomLetters}${timestamp.slice(-3)}${randomPart}`)
  }, [])

  // Сохранение данных в Google Sheets при загрузке страницы
  useEffect(() => {
    // Предотвращаем повторное сохранение
    if (hasSavedRef.current) {
      return
    }

    const saveBookingToGoogleSheets = async () => {
      // Проверяем, что есть необходимые данные
      const hasRequiredData = 
        searchParams.get("customerName") || 
        searchParams.get("customerEmail") || 
        searchParams.get("vehicleModel")

      if (!hasRequiredData) {
        console.log("[Google Sheets] ⚠️  Страница: Недостаточно данных для сохранения")
        return
      }

      setIsSaving(true)
      setSaveError(null)

      try {
        console.log("[Google Sheets] 💾 Страница: Начало сохранения бронирования в Google Sheets")

        // Собираем все данные из URL параметров
        const bookingData = {
          customerName: searchParams.get("customerName") || "",
          customerEmail: searchParams.get("customerEmail") || "",
          customerPhone: searchParams.get("customerPhone") || "",
          customerNotes: searchParams.get("customerNotes") || "",
          vehicleModel: searchParams.get("vehicleModel") || "",
          pickupDate: searchParams.get("pickupDate") || "",
          deliveryDate: searchParams.get("deliveryDate") || "",
          fromHouseNumber: searchParams.get("fromHouseNumber") || "",
          fromStreet: searchParams.get("fromStreet") || "",
          fromCity: searchParams.get("fromCity") || "",
          fromState: searchParams.get("fromState") || "",
          fromZip: searchParams.get("fromZip") || "",
          fromAddressType: searchParams.get("fromAddressType") || "Residential",
          toHouseNumber: searchParams.get("toHouseNumber") || "",
          toStreet: searchParams.get("toStreet") || "",
          toCity: searchParams.get("toCity") || "",
          toState: searchParams.get("toState") || "",
          toZip: searchParams.get("toZip") || "",
          toAddressType: searchParams.get("toAddressType") || "Residential",
          finalPrice: searchParams.get("finalPrice") || "",
          totalPrice: searchParams.get("finalPrice") || "",
          transportType: searchParams.get("transportType") || "Open",
          serviceType: searchParams.get("serviceType") || "Door to Door",
          contactName: searchParams.get("contactName") || "",
          contactPhone: searchParams.get("contactPhone") || "",
          specialInstructions: searchParams.get("specialInstructions") || "",
          paymentIntentId: searchParams.get("paymentIntentId") || "",
        }

        console.log("[Google Sheets] 📝 Страница: Данные для сохранения:", bookingData)

        const response = await fetch("/api/submit-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        })

        const result = await response.json()

        if (result.success) {
          console.log("[Google Sheets] ✅ Страница: Бронирование успешно сохранено в Google Sheets, ID:", result.bookingId)
          // Обновляем bookingId если он был сгенерирован на сервере
          if (result.bookingId) {
            setBookingId(result.bookingId)
          }
          hasSavedRef.current = true // Помечаем, что сохранение выполнено
        } else {
          console.error("[Google Sheets] ❌ Страница: Ошибка при сохранении:", result.error)
          setSaveError(result.error || "Failed to save booking")
        }
      } catch (error) {
        console.error("[Google Sheets] ❌ Страница: Критическая ошибка при сохранении:", error)
        setSaveError(error instanceof Error ? error.message : "Failed to save booking")
      } finally {
        setIsSaving(false)
      }
    }

    // Запускаем сохранение только один раз при монтировании компонента
    saveBookingToGoogleSheets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Пустой массив зависимостей - выполняется только при монтировании

  // собираем данные из searchParams + fallback
  const getBookingData = (): BookingData => {
    const fromHouseNumber = searchParams.get("fromHouseNumber") || defaultData.pickupAddress.houseNumber
    const fromStreet = searchParams.get("fromStreet") || defaultData.pickupAddress.streetName
    const fromCity = searchParams.get("fromCity") || defaultData.pickupAddress.city
    const fromState = searchParams.get("fromState") || defaultData.pickupAddress.state
    const fromZip = searchParams.get("fromZip") || defaultData.pickupAddress.zipCode
    const fromAddressType = searchParams.get("fromAddressType") || defaultData.pickupAddress.addressType

    const toHouseNumber = searchParams.get("toHouseNumber") || defaultData.deliveryAddress.houseNumber
    const toStreet = searchParams.get("toStreet") || defaultData.deliveryAddress.streetName
    const toCity = searchParams.get("toCity") || defaultData.deliveryAddress.city
    const toState = searchParams.get("toState") || defaultData.deliveryAddress.state
    const toZip = searchParams.get("toZip") || defaultData.deliveryAddress.zipCode
    const toAddressType = searchParams.get("toAddressType") || defaultData.deliveryAddress.addressType

    return {
      ...defaultData,
      pickupAddress: { ...defaultData.pickupAddress, houseNumber: fromHouseNumber, streetName: fromStreet, city: fromCity, state: fromState, zipCode: fromZip, addressType: fromAddressType },
      deliveryAddress: { ...defaultData.deliveryAddress, houseNumber: toHouseNumber, streetName: toStreet, city: toCity, state: toState, zipCode: toZip, addressType: toAddressType },
      bookingId: bookingId || "#LOADING..."
    }
  }

  const data = getBookingData()

  // Парсим даты из URL
  const pickupDateFormatted = searchParams.get("pickupDate") || data.pickupDate
  const deliveryDateFormatted = searchParams.get("deliveryDate") || data.estimatedDelivery
  const vehicleModel = searchParams.get("vehicleModel") || data.vehicle
  const totalPrice = searchParams.get("finalPrice") || data.totalPrice
  const transportType = searchParams.get("transportType") || data.transportType
  const serviceType = searchParams.get("serviceType") || data.serviceType
  const customerName = searchParams.get("customerName") || data.customerName
  const customerEmail = searchParams.get("customerEmail") || data.customerEmail
  const customerPhone = searchParams.get("customerPhone") || data.customerPhone
  const customerNotes = searchParams.get("customerNotes") || data.customerNotes
  const contactName = searchParams.get("contactName") || data.contactName
  const contactPhone = searchParams.get("contactPhone") || data.contactPhone
  const specialInstructions = searchParams.get("specialInstructions") || data.specialInstructions

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/vehicler-logo.png"
                alt="Vehicler"
                width={150}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your booking has been successfully confirmed. We'll send you a confirmation email shortly.</p>
            <p className="text-lg font-semibold text-gray-900 mt-4">Booking ID: {data.bookingId}</p>
            {isSaving && (
              <p className="text-sm text-gray-500 mt-2">Saving to database...</p>
            )}
            {saveError && (
              <p className="text-sm text-red-500 mt-2">Warning: {saveError}</p>
            )}
          </div>

          {/* Booking Details Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pickup Details */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#044BD9]" />
                  Pickup Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">
                  {data.pickupAddress.houseNumber} {data.pickupAddress.streetName}
                </p>
                <p className="text-gray-600">
                  {data.pickupAddress.city}, {data.pickupAddress.state} {data.pickupAddress.zipCode}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  {formatAddressType(data.pickupAddress.addressType)}
                </p>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#044BD9]" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">
                  {data.deliveryAddress.houseNumber} {data.deliveryAddress.streetName}
                </p>
                <p className="text-gray-600">
                  {data.deliveryAddress.city}, {data.deliveryAddress.state} {data.deliveryAddress.zipCode}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  {formatAddressType(data.deliveryAddress.addressType)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Information */}
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#044BD9]" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup Date</p>
                    <p className="font-semibold">{pickupDateFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-semibold">{deliveryDateFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-semibold">{vehicleModel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Transport Type</p>
                    <p className="font-semibold">{transportType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-semibold">{serviceType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="font-semibold text-lg text-[#044BD9]">{totalPrice}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {(customerName || customerEmail || customerPhone) && (
            <Card className="shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#044BD9]" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customerName && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold">{customerName}</p>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600">{customerEmail}</p>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600">{customerPhone}</p>
                  </div>
                )}
                {customerNotes && (
                  <div className="flex items-start gap-3 pt-2 border-t">
                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-600">{customerNotes}</p>
                    </div>
                  </div>
                )}
                {contactName && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-semibold">{contactName}</p>
                    </div>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600">{contactPhone}</p>
                  </div>
                )}
                {specialInstructions && (
                  <div className="flex items-start gap-3 pt-2 border-t">
                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
                      <p className="text-gray-600">{specialInstructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#044BD9] hover:bg-[#033ba8] text-white"
              size="lg"
            >
              <Link href="/">Back to Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
            >
              <Link href={`/_find-my-vehicle/tracking/result/${data.bookingId.replace("#", "")}`}>
                Track Shipment
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#262626] text-white mt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div>
              <img src="/images/vehicler-footer-logo.png" alt="Vehicler" className="h-12 w-auto mb-4" />
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.
              </p>

              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-6 text-white">Services</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Open Car Transport
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Enclosed Car Transport
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Motorcycle Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Classic Car Transport
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Reviews
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Track Shipment
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Get Quote
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>&copy; 2025 Vehicler. All rights reserved.</p>
              <div className="flex space-x-8 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
