"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Calendar, MapPin, Car, DollarSign, Shield, Home, User, Mail, Phone, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

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

interface BookingConfirmedProps {
  bookingData?: BookingData
}

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

const formatAddressType = (addressType: string): string => {
  return addressType === "business" ? "Business address" : "Residential address"
}

function BookingConfirmedContent({ bookingData }: BookingConfirmedProps) {
  const searchParams = useSearchParams()

  // Replace this section:
  // Generate a unique booking ID
  // const generateBookingId = useMemo(() => {
  //   const timestamp = Date.now().toString(36).toUpperCase()
  //   const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  //   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  //   const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
  //   return `#${randomLetters}${timestamp.slice(-3)}${randomPart}`
  // }, [])

  // With this:
  const [bookingId, setBookingId] = useState<string>("")

  // Add useEffect to generate booking ID on client side only
  useEffect(() => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
    setBookingId(`#${randomLetters}${timestamp.slice(-3)}${randomPart}`)
  }, [])

  // Always try to get data from URL params first, then fall back to defaults
  const getBookingData = (): BookingData => {
    // Ship From address - reading from /last-step
    const fromHouseNumber = searchParams.get("fromHouseNumber") || defaultData.pickupAddress.houseNumber
    const fromStreet = searchParams.get("fromStreet") || defaultData.pickupAddress.streetName
    const fromCity = searchParams.get("fromCity") || defaultData.pickupAddress.city
    const fromState = searchParams.get("fromState") || defaultData.pickupAddress.state
    const fromZip = searchParams.get("fromZip") || defaultData.pickupAddress.zipCode

    // Ship To address - reading from /last-step
    const toHouseNumber = searchParams.get("toHouseNumber") || defaultData.deliveryAddress.houseNumber
    const toStreet = searchParams.get("toStreet") || defaultData.deliveryAddress.streetName
    const toCity = searchParams.get("toCity") || defaultData.deliveryAddress.city
    const toState = searchParams.get("toState") || defaultData.deliveryAddress.state
    const toZip = searchParams.get("toZip") || defaultData.deliveryAddress.zipCode

    // Address types - reading from /last-step
    const fromAddressType = searchParams.get("fromAddressType") || "residential"
    const toAddressType = searchParams.get("toAddressType") || "residential"

    // Dates - reading from /last-step
    const pickupDate = searchParams.get("pickupDate") || defaultData.pickupDate
    const deliveryDate = searchParams.get("deliveryDate") || defaultData.estimatedDelivery

    // Vehicle - reading from /last-step
    const vehicle = searchParams.get("vehicleModel") || defaultData.vehicle

    // Price - reading from /last-step
    const totalPrice = searchParams.get("finalPrice") || defaultData.totalPrice

    // Transport Type - reading from /last-step (now using transportType parameter)
    const transportType = searchParams.get("transportType") || defaultData.transportType

    // Customer information - reading from /last-step
    const customerName = searchParams.get("customerName") || defaultData.customerName
    const customerEmail = searchParams.get("customerEmail") || defaultData.customerEmail
    const customerPhone = searchParams.get("customerPhone") || defaultData.customerPhone
    const customerNotes = searchParams.get("customerNotes") || defaultData.customerNotes

    // Contact information from shipment-details page
    const contactName = searchParams.get("contactName") || defaultData.contactName
    const contactPhone = searchParams.get("contactPhone") || defaultData.contactPhone
    const specialInstructions = searchParams.get("specialInstructions") || defaultData.specialInstructions

    return {
      pickupAddress: {
        houseNumber: fromHouseNumber,
        streetName: fromStreet,
        city: fromCity,
        state: fromState,
        zipCode: fromZip,
        addressType: fromAddressType,
      },
      deliveryAddress: {
        houseNumber: toHouseNumber,
        streetName: toStreet,
        city: toCity,
        state: toState,
        zipCode: toZip,
        addressType: toAddressType,
      },
      pickupDate: pickupDate,
      estimatedDelivery: deliveryDate,
      vehicle: vehicle,
      totalPrice: totalPrice,
      transportType: transportType,
      serviceType: defaultData.serviceType,
      bookingId: bookingId || "#LOADING...",
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      customerNotes: customerNotes,
      contactName: contactName,
      contactPhone: contactPhone,
      specialInstructions: specialInstructions,
    }
  }

  // Use the combined data (URL params + defaults)
  const data = bookingData || getBookingData()

  // Submit data to Google Sheets when component mounts
  useEffect(() => {
    const submitToGoogleSheets = async () => {
      console.log("=== Starting Google Sheets submission ===")
      console.log("URL params:", Object.fromEntries(searchParams.entries()))

      try {
        // First test if API route exists
        console.log("Testing API route with GET request...")
        const testResponse = await fetch("/api/submit-booking", {
          method: "GET",
        })

        console.log("GET test - Status:", testResponse.status)
        console.log("GET test - OK:", testResponse.ok)

        const testText = await testResponse.text()
        console.log("GET test - Response:", testText)

        // Check if we got HTML (404 page) instead of JSON
        if (testText.includes("<!DOCTYPE") || testText.includes("<html")) {
          console.error("❌ API route not found - got HTML response (likely 404)")
          console.error("Make sure the file is at: app/api/submit-booking/route.ts")
          return
        }

        // Try to parse the test response
        try {
          const testData = JSON.parse(testText)
          console.log("✅ API route exists and working:", testData)

          // Check if we have the Google Sheets token
          if (!testData.hasToken) {
            console.error("❌ Missing GOOGLE_SHEETS_ACCESS_TOKEN environment variable")
            console.error("Please set the environment variable and restart the server")
            return
          }
        } catch (parseError) {
          console.error("❌ API route returned non-JSON:", testText)
          return
        }

        // Now try the actual POST request
        const sheetData = {
          bookingId: data.bookingId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerNotes: data.customerNotes,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          specialInstructions: data.specialInstructions,
          pickupAddress: `${data.pickupAddress.houseNumber} ${data.pickupAddress.streetName}, ${data.pickupAddress.city}, ${data.pickupAddress.state} ${data.pickupAddress.zipCode}`,
          pickupAddressType: data.pickupAddress.addressType,
          deliveryAddress: `${data.deliveryAddress.houseNumber} ${data.deliveryAddress.streetName}, ${data.deliveryAddress.city}, ${data.deliveryAddress.state} ${data.deliveryAddress.zipCode}`,
          deliveryAddressType: data.deliveryAddress.addressType,
          pickupDate: data.pickupDate,
          estimatedDelivery: data.estimatedDelivery,
          vehicle: data.vehicle,
          totalPrice: data.totalPrice,
          transportType: data.transportType,
          serviceType: data.serviceType,
          submissionTime: new Date().toISOString(),
        }

        console.log("Making POST request with data:", sheetData)

        const response = await fetch("/api/submit-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sheetData),
        })

        console.log("POST Response status:", response.status)
        console.log("POST Response ok:", response.ok)
        console.log("POST Response headers:", Object.fromEntries(response.headers.entries()))

        const responseText = await response.text()
        console.log("POST Raw response text:", responseText)

        // Check if we got HTML again
        if (responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
          console.error("❌ POST request also returned HTML - API route issue")
          return
        }

        let responseData
        try {
          responseData = JSON.parse(responseText)
          console.log("POST Parsed response data:", responseData)
        } catch (parseError) {
          console.error("❌ Failed to parse POST response as JSON:", parseError)
          console.error("Raw response was:", responseText)
          return
        }

        if (response.ok) {
          console.log("✅ SUCCESS: Data submitted to Google Sheets!")
          console.log("Response details:", responseData)
        } else {
          console.error("❌ API returned error status:", response.status)
          console.error("Error response data:", responseData)
          console.error("Error details:")
          console.error("- success:", responseData?.success)
          console.error("- error:", responseData?.error)
          console.error("- details:", responseData?.details)
          console.error("- hasToken:", responseData?.hasToken)
        }
      } catch (error) {
        console.error("❌ Error in submitToGoogleSheets:", error)
        console.error("Error type:", typeof error)
        console.error("Error message:", error?.message)
        console.error("Error stack:", error?.stack)
      }
    }

    // Only submit if we have actual URL parameters (not just defaults)
    if (searchParams.toString()) {
      submitToGoogleSheets()
    } else {
      console.log("No URL parameters found - skipping Google Sheets submission")
    }
  }, [data, searchParams])

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
                <img src="/images/vehicler-logo-white.png" alt="Vehicler" className="h-8 w-auto" />
              </Link>
              <div className="flex items-center space-x-2"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="bg-[#F2F2F2] relative overflow-hidden">
        {/* H-pattern background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url('/images/h-pattern.png')`,
            backgroundSize: "60px 60px",
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
          }}
        />

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Block */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold text-[#262626] mb-4"
              style={{ fontFamily: "Oblivion Future, sans-serif" }}
            >
              Booking Confirmed!
            </h1>
            <div className="space-y-2" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              <p className="text-xl text-[#262626]">Your vehicle shipment has been successfully scheduled.</p>
              <p className="text-lg text-gray-600">We've sent a confirmation email with all the details.</p>
            </div>
          </div>

          {/* Booking Summary Card */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-[#6371BE] to-[#044BD9] text-white pl-12 pr-6 py-6">
              <CardTitle className="text-2xl" style={{ fontFamily: "Oblivion Future, sans-serif" }}>
                Your Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-12 pr-6 py-6" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              {/* Customer Information Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3
                  className="text-xl font-semibold text-[#262626] mb-4"
                  style={{ fontFamily: "Oblivion Future, sans-serif" }}
                >
                  Customer Information
                </h3>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Main Customer Info - Left Columns */}
                  <div className="lg:col-span-2">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Full Name Column */}
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-3 text-base">Full Name</h4>
                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600">{data.customerName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Email Address Column */}
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-3 text-base">Email Address</h4>
                        <div className="flex items-start space-x-3">
                          <Mail className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600">{data.customerEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <div className="flex items-start space-x-3">
                          <Phone className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-[#262626] mb-1">Phone Number</h5>
                            <p className="text-gray-600">{data.customerPhone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      {data.customerNotes && (
                        <div>
                          <div className="flex items-start space-x-3">
                            <FileText className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold text-[#262626] mb-1">Additional Notes</h5>
                              <p className="text-gray-600">{data.customerNotes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Details Sticky Note - Right Column */}
                  {(data.contactName || data.contactPhone || data.specialInstructions) && (
                    <div className="lg:col-span-1 -mt-1 relative">
                      {/* Corporate pin - stays fixed */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="w-6 h-6 bg-[#6371BE] rounded-full shadow-lg border-2 border-white relative">
                          <div className="absolute inset-1 bg-gradient-to-br from-[#6371BE] to-[#044BD9] rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-30"></div>
                        </div>
                      </div>

                      {/* Sticky note - rotates on hover */}
                      <div className="bg-gradient-to-br from-[#FFE4B5] to-[#FFF8DC] border-2 border-[#DEB887] rounded-lg shadow-lg p-4 relative transform rotate-1 hover:rotate-0 transition-transform duration-200">
                        {/* Header */}
                        <h4 className="font-bold text-[#8B4513] mb-3 text-center text-base border-b border-[#8B4513] pb-1">
                          Contact Details
                        </h4>

                        {/* Content */}
                        <div className="space-y-3">
                          {data.contactName && (
                            <div className="flex items-start space-x-2">
                              <User className="w-4 h-4 text-[#654321] mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[#654321] uppercase tracking-wide mb-1">
                                  Contact Person
                                </p>
                                <p className="text-sm text-[#8B4513] font-medium">{data.contactName}</p>
                              </div>
                            </div>
                          )}

                          {data.contactPhone && (
                            <div className="flex items-start space-x-2">
                              <Phone className="w-4 h-4 text-[#654321] mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[#654321] uppercase tracking-wide mb-1">
                                  Contact Phone
                                </p>
                                <p className="text-sm text-[#8B4513] font-medium">{data.contactPhone}</p>
                              </div>
                            </div>
                          )}

                          {data.specialInstructions && (
                            <div className="flex items-start space-x-2">
                              <FileText className="w-4 h-4 text-[#654321] mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[#654321] uppercase tracking-wide mb-1">
                                  Special Instructions
                                </p>
                                <p className="text-sm text-[#8B4513] leading-relaxed">{data.specialInstructions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipment Details Section */}
              <div className="mb-6">
                <h3
                  className="text-xl font-semibold text-[#262626] mb-4"
                  style={{ fontFamily: "Oblivion Future, sans-serif" }}
                >
                  Shipment Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Ship from</h4>
                        <p className="text-gray-600">
                          {data.pickupAddress.houseNumber} {data.pickupAddress.streetName}
                          <br />
                          {data.pickupAddress.city}, {data.pickupAddress.state} {data.pickupAddress.zipCode}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 italic">
                          {formatAddressType(data.pickupAddress.addressType)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-[#044BD9] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Ship to</h4>
                        <p className="text-gray-600">
                          {data.deliveryAddress.houseNumber} {data.deliveryAddress.streetName}
                          <br />
                          {data.deliveryAddress.city}, {data.deliveryAddress.state} {data.deliveryAddress.zipCode}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 italic">
                          {formatAddressType(data.deliveryAddress.addressType)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Pickup Date</h4>
                        <p className="text-gray-600">{data.pickupDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-[#044BD9] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Delivery date</h4>
                        <p className="text-gray-600">{data.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Car className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Vehicle</h4>
                        <p className="text-gray-600">{data.vehicle}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Total Price</h4>
                        <p className="text-2xl font-bold text-green-600">{data.totalPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Transport Type</h4>
                        <p className="text-gray-600">{data.transportType}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-[#6371BE] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-[#262626] mb-1">Service Type</h4>
                        <p className="text-gray-600">{data.serviceType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking ID */}
              <div className="pt-6 border-t border-gray-200 -ml-6">
                <div className="bg-[#F2F2F2] rounded-lg p-4">
                  <h4 className="font-semibold text-[#262626] mb-1 ml-6">Booking ID</h4>
                  <p className="text-lg font-mono text-[#6371BE] font-bold ml-6">{data.bookingId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Section */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-[#262626]" style={{ fontFamily: "Oblivion Future, sans-serif" }}>
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#6371BE] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#262626] mb-1">Carrier Assignment</h3>
                    <p className="text-gray-600">
                      Our dispatch team will assign a qualified carrier to your shipment within 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#6371BE] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#262626] mb-1">Pickup Notification</h3>
                    <p className="text-gray-600">
                      You'll receive a notification with the exact pickup time and carrier contact information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#044BD9] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#262626] mb-1">Track Your Shipment</h3>
                    <p className="text-gray-600">
                      Monitor your vehicle's journey through your account dashboard (coming soon).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#6371BE] hover:bg-[#5562a8] text-white px-8 py-3 text-lg"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-[#6371BE] text-[#6371BE] hover:bg-[#6371BE] hover:text-white px-8 py-3 text-lg bg-transparent"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              <Link href="/booking-2">
                <Truck className="w-5 h-5 mr-2" />
                Book Another Shipment
              </Link>
            </Button>
          </div>
        </main>
      </div>
      {/* ─────────────────── Footer ─────────────────── */}
      <footer className="bg-[#262626] text-white py-12" style={{ fontFamily: "Inter Tight, sans-serif" }}>
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
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: "Inter Tight, sans-serif" }}>
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
                "About Us",
                { text: "How It Works", href: "/#how-it-works" },
                { text: "Reviews", href: "/#reviews" },
                "Careers",
              ]}
            />
            {/* Support */}
            <FooterColumn
              title="Support"
              links={[
                "Contact Us",
                { text: "FAQ", href: "/#faq" },
                { text: "Track Shipment", href: "/find-my-vehicle" },
                { text: "Get Quote", href: "/#quote" },
              ]}
            />
          </div>
          {/* bottom row */}
          <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter Tight, sans-serif" }}>
              © 2025 Vehicler. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  style={{ fontFamily: "Inter Tight, sans-serif" }}
                >
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

export default function BookingConfirmed({ bookingData }: BookingConfirmedProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingConfirmedContent bookingData={bookingData} />
    </Suspense>
  )
}

/* ─────────────────── Reusable footer column component ─────────────────── */
interface FooterColumnProps {
  title: string
  links: (string | { text: string; href: string })[]
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-4" style={{ fontFamily: "Inter Tight, sans-serif" }}>
        {title}
      </h3>
      <ul className="space-y-3 text-sm">
        {links.map((link, index) => (
          <li key={index}>
            {typeof link === "string" ? (
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors text-sm"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                {link}
              </a>
            ) : (
              <a
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                {link.text}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
