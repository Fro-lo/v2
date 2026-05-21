"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit3,
  Star,
  Shield,
  Calendar,
  Car,
  Route,
  Home,
  Building2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle,
  Flag,
} from "lucide-react"

export default function BookingPage() {
  const router = useRouter()
  const [editingFrom, setEditingFrom] = useState(false)
  const [editingTo, setEditingTo] = useState(false)
  const [fromAddress, setFromAddress] = useState({
    houseNumber: "759",
    streetName: "Pittsburgh Dr",
    city: "Delaware",
    state: "OH",
    postalCode: "43015",
  })
  const [toAddress, setToAddress] = useState({
    houseNumber: "1247",
    streetName: "Ocean Ave",
    city: "Miami Beach",
    state: "FL",
    postalCode: "33139",
  })
  const [shipFromResidential, setShipFromResidential] = useState(true)
  const [shipToResidential, setShipToResidential] = useState(true)
  const [contactOption, setContactOption] = useState("me")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [pickupDate, setPickupDate] = useState("07.25.2024")
  const [deliveryDate, setDeliveryDate] = useState("07.30.2024")
  const [vehicleInfo, setVehicleInfo] = useState("Volvo S60 2024")
  const [totalPrice, setTotalPrice] = useState("$2,200")
  const [transportType, setTransportType] = useState("Enclosed")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerNotes, setCustomerNotes] = useState("")

  const searchParams = useSearchParams()

  useEffect(() => {
    // Get pickup date from URL parameters
    const urlPickupDate = searchParams.get("pickupDate")
    if (urlPickupDate) {
      setPickupDate(urlPickupDate)
    }

    // Get delivery date from URL parameters
    const urlDeliveryDate = searchParams.get("deliveryDate")
    if (urlDeliveryDate) {
      setDeliveryDate(urlDeliveryDate)
    }

    // Get Ship From address data from URL parameters
    const fromHouseNumber = searchParams.get("fromHouseNumber")
    const fromStreetName = searchParams.get("fromStreet")
    const fromCity = searchParams.get("fromCity")
    const fromState = searchParams.get("fromState")
    const fromPostalCode = searchParams.get("fromZip")

    if (fromHouseNumber || fromStreetName || fromCity || fromState || fromPostalCode) {
      setFromAddress({
        houseNumber: fromHouseNumber || "",
        streetName: fromStreetName || "",
        city: fromCity || "",
        state: fromState || "",
        postalCode: fromPostalCode || "",
      })
    }

    // Get Ship To address data from URL parameters
    const toHouseNumber = searchParams.get("toHouseNumber")
    const toStreetName = searchParams.get("toStreet")
    const toCity = searchParams.get("toCity")
    const toState = searchParams.get("toState")
    const toPostalCode = searchParams.get("toZip")

    if (toHouseNumber || toStreetName || toCity || toState || toPostalCode) {
      setToAddress({
        houseNumber: toHouseNumber || "",
        streetName: toStreetName || "",
        city: toCity || "",
        state: toState || "",
        postalCode: toPostalCode || "",
      })
    }

    // Alternative: Handle combined address strings if they come as full addresses
    const fromFullAddress = searchParams.get("fromAddress")
    const toFullAddress = searchParams.get("toAddress")

    if (fromFullAddress) {
      // Parse the full address string (assuming format: "123 Main St, City, ST 12345")
      const addressParts = fromFullAddress.split(", ")
      if (addressParts.length >= 3) {
        const streetParts = addressParts[0].split(" ")
        const houseNumber = streetParts[0] || ""
        const streetName = streetParts.slice(1).join(" ") || ""
        const city = addressParts[1] || ""
        const stateZip = addressParts[2].split(" ")
        const state = stateZip[0] || ""
        const postalCode = stateZip[1] || ""

        setFromAddress({
          houseNumber,
          streetName,
          city,
          state,
          postalCode,
        })
      }
    }

    if (toFullAddress) {
      // Parse the full address string (assuming format: "123 Main St, City, ST 12345")
      const addressParts = toFullAddress.split(", ")
      if (addressParts.length >= 3) {
        const streetParts = addressParts[0].split(" ")
        const houseNumber = streetParts[0] || ""
        const streetName = streetParts.slice(1).join(" ") || ""
        const city = addressParts[1] || ""
        const stateZip = addressParts[2].split(" ")
        const state = stateZip[0] || ""
        const postalCode = stateZip[1] || ""

        setToAddress({
          houseNumber,
          streetName,
          city,
          state,
          postalCode,
        })
      }
    }

    // Get vehicle information from URL parameters
    const urlVehicle = searchParams.get("vehicleModel")
    if (urlVehicle) {
      setVehicleInfo(urlVehicle)
    }

    // Get total price from URL parameters
    const urlTotal = searchParams.get("finalPrice")
    if (urlTotal) {
      // Ensure the price has a $ sign
      setTotalPrice(urlTotal.startsWith("$") ? urlTotal : `$${urlTotal}`)
    }

    // Get transport type from URL parameters
    const urlTransportType = searchParams.get("vehicleTransportType")
    if (urlTransportType) {
      // Capitalize first letter for display
      setTransportType(urlTransportType.charAt(0).toUpperCase() + urlTransportType.slice(1))
    }

    // Get customer data from URL parameters
    const urlCustomerName = searchParams.get("customerName")
    if (urlCustomerName) {
      setCustomerName(urlCustomerName)
    }

    const urlCustomerEmail = searchParams.get("customerEmail")
    if (urlCustomerEmail) {
      setCustomerEmail(urlCustomerEmail)
    }

    const urlCustomerPhone = searchParams.get("customerPhone")
    if (urlCustomerPhone) {
      setCustomerPhone(urlCustomerPhone)
    }

    const urlCustomerNotes = searchParams.get("customerNotes")
    if (urlCustomerNotes) {
      setCustomerNotes(urlCustomerNotes)
    }
  }, [searchParams])

  const handleCompleteBooking = () => {
    // Validate contact information if "someone-else" is selected
    if (contactOption === "someone-else") {
      if (!contactName.trim()) {
        alert("Please enter a contact name.")
        return
      }
      if (!contactPhone || contactPhone === "+1 ") {
        alert("Please enter a phone number.")
        return
      }
    }

    // Construct URL parameters for the next page
    const params = new URLSearchParams({
      // Pass dates
      pickupDate,
      deliveryDate,
      // Pass vehicle info
      vehicleModel: vehicleInfo,
      // Pass total price
      total: totalPrice,
      // Pass transport type
      vehicleTransportType: transportType.toLowerCase(),
      // Pass Ship From address
      fromHouseNumber: fromAddress.houseNumber,
      fromStreet: fromAddress.streetName,
      fromCity: fromAddress.city,
      fromState: fromAddress.state,
      fromZip: fromAddress.postalCode,
      // Pass Ship To address
      toHouseNumber: toAddress.houseNumber,
      toStreet: toAddress.streetName,
      toCity: toAddress.city,
      toState: toAddress.state,
      toZip: toAddress.postalCode,
      // Pass address types in lowercase format
      fromAddressType: shipFromResidential ? "residential" : "business",
      toAddressType: shipToResidential ? "residential" : "business",
      // Pass contact information
      contactOption,
      contactName,
      contactPhone,
      // Pass special instructions
      specialInstructions,
      // Pass customer data
      customerName,
      customerEmail,
      customerPhone: customerPhone,
      customerNotes,
    })

    router.push(`/last-step?${params.toString()}`)
  }

  const reviews = [
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Excellent service! My car arrived exactly on time and in perfect condition. The driver was professional and kept me updated throughout the journey.",
      date: "2 weeks ago",
    },
    {
      name: "Mike Rodriguez",
      rating: 5,
      text: "Best car shipping experience I've had. Transparent pricing, no hidden fees, and great customer support. Highly recommend Vehicler!",
      date: "1 month ago",
    },
    {
      name: "Emily Chen",
      rating: 5,
      text: "Professional service from start to finish. The enclosed transport kept my luxury vehicle safe and secure. Will definitely use again.",
      date: "3 weeks ago",
    },
    {
      name: "David Thompson",
      rating: 5,
      text: "Great communication and reliable service. The pickup and delivery were seamless, and the price was very competitive.",
      date: "1 week ago",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="bg-[#6371BE] text-white relative overflow-hidden"
        style={{
          backgroundImage: `url('/vehicler-pattern-header.png')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-[#6371BE] opacity-85"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Mobile: phone row */}
          <div className="flex items-center justify-between py-0.5 lg:hidden">
            <a href="tel:+18554227872" className="flex items-center space-x-1 text-white/90 text-sm">
              <span>☎ (855) 422-7872</span>
            </a>
          </div>
          {/* Logo row */}
          <div className="h-14 pb-3 md:pb-0 md:h-20 lg:ml-16 flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/images/vehicler-logo-white.png" alt="Vehicler" className="h-8 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden">
        {/* Progress Tracker */}
        <div className="bg-[#F2F2F2] py-3">
          <div className="max-w-4xl mx-auto px-4">
            {/* Mobile stepper */}
            <div className="flex items-center justify-center md:hidden">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-[11px] font-medium text-[#262626] leading-none">Contact</span>
              </div>
              <div className="flex-1 mx-2 h-0.5 bg-green-500 max-w-[32px]" />
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-[#6371BE] rounded-full flex items-center justify-center flex-shrink-0">
                  <Flag className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-[#6371BE] leading-none">Shipment</span>
              </div>
              <div className="flex-1 mx-2 h-0.5 bg-gray-300 max-w-[32px]" />
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] text-gray-400 font-bold leading-none">3</span>
                </div>
                <span className="text-[11px] font-medium text-gray-500 leading-none">Book</span>
              </div>
            </div>
            {/* Desktop stepper */}
            <div className="hidden md:flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-sm font-medium text-[#262626]">Contact Information</span>
              </div>
              <div className="w-12 h-0.5 bg-green-500" />
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#6371BE] rounded-full flex items-center justify-center">
                  <Flag className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-[#6371BE]">Shipment Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <Flag className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-[#262626]">Book Shipment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 py-6 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto lg:px-16">
              <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column - Form Preview */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md">
                    <CardHeader className="pb-6">
                      <CardTitle
                        className="text-2xl font-bold text-gray-900"
                        style={{ fontFamily: "Oblivion Future, sans-serif" }}
                      >
                        Shipment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Ship From */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Ship From</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#6371BE] hover:text-[#081C8B]"
                            onClick={() => setEditingFrom(!editingFrom)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {editingFrom ? "Save" : "Edit"}
                          </Button>
                        </div>
                        {editingFrom ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={fromAddress.houseNumber}
                                onChange={(e) => setFromAddress({ ...fromAddress, houseNumber: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="House number"
                              />
                              <input
                                type="text"
                                value={fromAddress.streetName}
                                onChange={(e) => setFromAddress({ ...fromAddress, streetName: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="Street name"
                              />
                            </div>
                            <input
                              type="text"
                              value={fromAddress.city}
                              onChange={(e) => setFromAddress({ ...fromAddress, city: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                              placeholder="City"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={fromAddress.state}
                                onChange={(e) => setFromAddress({ ...fromAddress, state: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="State"
                              />
                              <input
                                type="text"
                                value={fromAddress.postalCode}
                                onChange={(e) => setFromAddress({ ...fromAddress, postalCode: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="Postal code"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500">
                              {fromAddress.houseNumber} {fromAddress.streetName}
                            </p>
                            <p className="text-gray-500">
                              {fromAddress.city}, {fromAddress.state} {fromAddress.postalCode}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="from-residential"
                              checked={shipFromResidential}
                              onCheckedChange={(checked) => setShipFromResidential(checked === true)}
                            />
                            <Label htmlFor="from-residential" className="flex items-center">
                              <Home className="w-4 h-4 mr-2" />
                              Residential address
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="from-business"
                              checked={!shipFromResidential}
                              onCheckedChange={(checked) => setShipFromResidential(checked !== true)}
                            />
                            <Label htmlFor="from-business" className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              Business address
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Ship To */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Ship To</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#6371BE] hover:text-[#081C8B]"
                            onClick={() => setEditingTo(!editingTo)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {editingTo ? "Save" : "Edit"}
                          </Button>
                        </div>
                        {editingTo ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={toAddress.houseNumber}
                                onChange={(e) => setToAddress({ ...toAddress, houseNumber: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="House number"
                              />
                              <input
                                type="text"
                                value={toAddress.streetName}
                                onChange={(e) => setToAddress({ ...toAddress, streetName: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="Street name"
                              />
                            </div>
                            <input
                              type="text"
                              value={toAddress.city}
                              onChange={(e) => setToAddress({ ...toAddress, city: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                              placeholder="City"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={toAddress.state}
                                onChange={(e) => setToAddress({ ...toAddress, state: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="State"
                              />
                              <input
                                type="text"
                                value={toAddress.postalCode}
                                onChange={(e) => setToAddress({ ...toAddress, postalCode: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="Postal code"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-500">
                              {toAddress.houseNumber} {toAddress.streetName}
                            </p>
                            <p className="text-gray-500">
                              {toAddress.city}, {toAddress.state} {toAddress.postalCode}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="to-residential"
                              checked={shipToResidential}
                              onCheckedChange={(checked) => setShipToResidential(checked === true)}
                            />
                            <Label htmlFor="to-residential" className="flex items-center">
                              <Home className="w-4 h-4 mr-2" />
                              Residential address
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="to-business"
                              checked={!shipToResidential}
                              onCheckedChange={(checked) => setShipToResidential(checked !== true)}
                            />
                            <Label htmlFor="to-business" className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              Business address
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-[#6371BE] my-2"></div>

                      {/* Contact Options */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Contact Preference</h3>
                        <RadioGroup value={contactOption} onValueChange={setContactOption}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="me" id="contact-me" />
                            <Label htmlFor="contact-me">Contact me</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="someone-else" id="contact-someone-else" />
                            <Label htmlFor="contact-someone-else">Contact someone else</Label>
                          </div>
                        </RadioGroup>

                        {/* Additional form when "Contact someone else" is selected */}
                        {contactOption === "someone-else" && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <div>
                              <Label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
                                Contact Name
                              </Label>
                              <input
                                type="text"
                                id="contact-name"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                                placeholder="Enter contact person's name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">
                                Phone Number
                              </Label>
                              <input
                                type="tel"
                                id="contact-phone"
                                value={contactPhone}
                                placeholder="+1 (555) 123-4567"
                                onFocus={(e) => {
                                  const target = e.target as HTMLInputElement
                                  if (!contactPhone || contactPhone === "") {
                                    setContactPhone("+1 ")
                                    setTimeout(() => {
                                      target.setSelectionRange(3, 3)
                                    }, 0)
                                  } else if (contactPhone === "+1 ") {
                                    setTimeout(() => {
                                      target.setSelectionRange(3, 3)
                                    }, 0)
                                  }
                                }}
                                onChange={(e) => {
                                  let value = e.target.value

                                  // Ensure "+1 " is always at the beginning
                                  if (!value.startsWith("+1 ")) {
                                    value = "+1 " + value.replace(/^\+1\s*/, "")
                                  }

                                  // Remove all non-digits after "+1 "
                                  const digits = value.slice(3).replace(/\D/g, "")

                                  // Apply American phone number mask +1 (XXX) XXX-XXXX
                                  let formatted = "+1 "
                                  if (digits.length > 0) {
                                    if (digits.length <= 3) {
                                      formatted += `(${digits}`
                                    } else if (digits.length <= 6) {
                                      formatted += `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                                    } else {
                                      formatted += `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
                                    }
                                  }

                                  setContactPhone(formatted)
                                }}
                                onKeyDown={(e) => {
                                  const target = e.target as HTMLInputElement
                                  const cursorPosition = target.selectionStart

                                  // Prevent deletion of "+1 " prefix
                                  if (
                                    (e.key === "Backspace" || e.key === "Delete") &&
                                    cursorPosition !== null &&
                                    cursorPosition <= 3
                                  ) {
                                    e.preventDefault()
                                    return
                                  }

                                  // Allow backspace, delete, tab, escape, enter
                                  if (
                                    [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    (e.keyCode === 65 && e.ctrlKey === true) ||
                                    (e.keyCode === 67 && e.ctrlKey === true) ||
                                    (e.keyCode === 86 && e.ctrlKey === true) ||
                                    (e.keyCode === 88 && e.ctrlKey === true)
                                  ) {
                                    return
                                  }
                                  // Ensure that it is a number and stop the keypress
                                  if (
                                    (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                                    (e.keyCode < 96 || e.keyCode > 105)
                                  ) {
                                    e.preventDefault()
                                  }
                                }}
                                maxLength={17}
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:border-[#081C8B] focus:ring-[#081C8B] focus:ring-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Special Instructions */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Special Instructions (Optional)</h3>
                        <Textarea
                          placeholder="Add any special instructions for pickup or delivery..."
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          className="min-h-[100px] textarea-custom focus:border-[#081C8B] focus:ring-[#081C8B]"
                        />
                      </div>

                      {/* Last Step Button */}
                      <Button
                        className="w-full bg-[#6371BE] hover:bg-[#081C8B] text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        size="lg"
                        onClick={handleCompleteBooking}
                        disabled={
                          contactOption === "someone-else" &&
                          (!contactName.trim() || !contactPhone || contactPhone === "+1 ")
                        }
                      >
                        Complete Booking
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="shadow-md lg:sticky lg:top-8">
                    <CardHeader className="pb-4">
                      <CardTitle
                        className="text-xl font-bold text-gray-900"
                        style={{ fontFamily: "Oblivion Future, sans-serif" }}
                      >
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Dates */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-[#6371BE] mr-2" />
                          <span className="text-sm text-gray-600">Pickup</span>
                        </div>
                        <span className="font-semibold">{pickupDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-[#6371BE] mr-2" />
                          <span className="text-sm text-gray-600">Delivery</span>
                        </div>
                        <span className="font-semibold">{deliveryDate}</span>
                      </div>

                      <div className="border-t border-dashed border-[#6371BE] my-2"></div>

                      {/* Vehicle */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Car className="w-5 h-5 text-[#6371BE] mr-2" />
                          <span className="font-semibold">Vehicle</span>
                        </div>
                        <p className="text-gray-700 ml-7">{vehicleInfo}</p>
                      </div>

                      <div className="border-t border-dashed border-[#6371BE] my-2"></div>

                      {/* Route */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Route className="w-5 h-5 text-[#6371BE] mr-2" />
                          <span className="font-semibold">Route</span>
                        </div>
                        <div className="ml-7 text-sm text-gray-600">
                          <p>
                            From: {fromAddress.city}, {fromAddress.state}
                          </p>
                          <p>
                            To: {toAddress.city}, {toAddress.state}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-[#6371BE] my-2"></div>

                      {/* Service Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Service type</span>
                          <span className="font-medium">Door to door</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Transport type</span>
                          <span className="font-medium">{transportType}</span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-gray-600">Insurance</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-[#6371BE] my-2"></div>

                      {/* Pricing */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-2xl font-bold">
                          <span>Total</span>
                          <span className="text-[#6371BE]">{totalPrice}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg">
                          <span className="text-gray-600">Due now</span>
                          <span className="font-semibold text-green-600">$0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────── Customer Feedback ─────────────────── */}
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

        {/* Footer */}
        <footer className="bg-[#262626] text-white py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            {/* Desktop: 4-column grid */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-8 mb-8">
              <div className="space-y-6">
                <Link href="/" className="hover:opacity-80 transition-opacity block">
                  <Image src="/vehicler-footer-logo.png" alt="Vehicler logo mark" width={200} height={50} priority className="w-48 h-auto" />
                </Link>
                <p className="text-gray-300 text-sm leading-relaxed">America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.</p>
                <div className="flex space-x-4">
                  {[{ Icon: Facebook, label: "Facebook" }, { Icon: Twitter, label: "Twitter" }, { Icon: Instagram, label: "Instagram" }, { Icon: Linkedin, label: "LinkedIn" }].map(({ Icon, label }) => (
                    <a key={label} href="#" aria-label={`${label} link`}><Icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" /></a>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Services</h3>
                <ul className="space-y-3 text-sm">
                  {["Open Car Transport", "Enclosed Car Transport", "Motorcycle Shipping", "Classic Car Transport"].map((t) => (
                    <li key={t}><a href="#" className="text-gray-300 hover:text-white transition-colors">{t}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-3 text-sm">
                  {[{ text: "About Us", href: "#" }, { text: "How It Works", href: "/#how-it-works" }, { text: "Reviews", href: "/#reviews" }, { text: "Careers", href: "#" }].map((l) => (
                    <li key={l.text}><a href={l.href} className="text-gray-300 hover:text-white transition-colors">{l.text}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-3 text-sm">
                  {[{ text: "Contact Us", href: "#" }, { text: "FAQ", href: "/#faq" }, { text: "Track Shipment", href: "/find-my-vehicle" }, { text: "Get Quote", href: "/#quote" }].map((l) => (
                    <li key={l.text}><a href={l.href} className="text-gray-300 hover:text-white transition-colors">{l.text}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Mobile: stacked logo + 3-col links */}
            <div className="md:hidden mb-6">
              <Link href="/" className="block mb-4">
                <Image src="/vehicler-footer-logo.png" alt="Vehicler logo mark" width={200} height={200} priority className="w-full h-auto" />
              </Link>
              <div className="h-4" />
              <p className="text-gray-300 text-sm leading-relaxed mb-4">America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.</p>
              <div className="flex space-x-4 mb-6">
                {[{ Icon: Facebook, label: "Facebook" }, { Icon: Twitter, label: "Twitter" }, { Icon: Instagram, label: "Instagram" }, { Icon: Linkedin, label: "LinkedIn" }].map(({ Icon, label }) => (
                  <a key={label} href="#" aria-label={`${label} link`}><Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" /></a>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-x-2">
                <div>
                  <h3 className="font-semibold text-white mb-1 text-xs">Services</h3>
                  <ul className="space-y-1">
                    {["Open Car Transport", "Enclosed Car Transport", "Motorcycle Shipping", "Classic Car Transport"].map((t) => (
                      <li key={t}><a href="#" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{t}</a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-xs">Company</h3>
                  <ul className="space-y-1">
                    {[{ text: "About Us", href: "#" }, { text: "How It Works", href: "/#how-it-works" }, { text: "Reviews", href: "/#reviews" }, { text: "Careers", href: "#" }].map((l) => (
                      <li key={l.text}><a href={l.href} className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{l.text}</a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-xs">Support</h3>
                  <ul className="space-y-1">
                    {[{ text: "Contact Us", href: "#" }, { text: "FAQ", href: "/#faq" }, { text: "Track Shipment", href: "/find-my-vehicle" }, { text: "Get Quote", href: "/#quote" }].map((l) => (
                      <li key={l.text}><a href={l.href} className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{l.text}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Bottom bar */}
            <div className="border-t border-gray-600 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Vehicler. All rights reserved.</p>
              <div className="flex space-x-4 md:space-x-6 text-sm">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
