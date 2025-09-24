"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Calendar, MapPin, Car, DollarSign, Shield, Home, User, Mail, Phone, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

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

  useEffect(() => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
    setBookingId(`#${randomLetters}${timestamp.slice(-3)}${randomPart}`)
  }, [])

  // собираем данные из searchParams + fallback
  const getBookingData = (): BookingData => {
    const fromHouseNumber = searchParams.get("fromHouseNumber") || defaultData.pickupAddress.houseNumber
    const fromStreet = searchParams.get("fromStreet") || defaultData.pickupAddress.streetName
    const fromCity = searchParams.get("fromCity") || defaultData.pickupAddress.city
    const fromState = searchParams.get("fromState") || defaultData.pickupAddress.state
    const fromZip = searchParams.get("fromZip") || defaultData.pickupAddress.zipCode

    const toHouseNumber = searchParams.get("toHouseNumber") || defaultData.deliveryAddress.houseNumber
    const toStreet = searchParams.get("toStreet") || defaultData.deliveryAddress.streetName
    const toCity = searchParams.get("toCity") || defaultData.deliveryAddress.city
    const toState = searchParams.get("toState") || defaultData.deliveryAddress.state
    const toZip = searchParams.get("toZip") || defaultData.deliveryAddress.zipCode

    return {
      ...defaultData,
      pickupAddress: { ...defaultData.pickupAddress, houseNumber: fromHouseNumber, streetName: fromStreet, city: fromCity, state: fromState, zipCode: fromZip },
      deliveryAddress: { ...defaultData.deliveryAddress, houseNumber: toHouseNumber, streetName: toStreet, city: toCity, state: toState, zipCode: toZip },
      bookingId: bookingId || "#LOADING..."
    }
  }

  const data = getBookingData()

  // дальше идёт твоя разметка (Card, Footer и т.д.)
  // (я её не менял, только убрал props)
  return (
    <div className="min-h-screen bg-white">
      {/* ... оставляем всю твою разметку как есть */}
      {/* Booking details, footer, кнопки — без изменений */}
    </div>
  )
}
