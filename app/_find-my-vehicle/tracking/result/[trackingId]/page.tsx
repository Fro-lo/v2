"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Database,
  RefreshCw,
  Info,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import TrackingMap from "@/components/tracking-map"

interface TrackingResultPageProps {
  params: {
    trackingId: string
  }
}

interface BookingDetails {
  id: string
  status: string
  estimatedDelivery: string
  currentLocation: string
  pickupLocation: string
  deliveryLocation: string
  vehicleInfo: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes: string
  pickupAddressType: string
  deliveryAddressType: string
  pickupDate: string
  transportType: string
  totalPrice: string
  contactName: string
  contactPhone: string
  specialInstructions: string
  submissionTime: string
  rawData?: string[]
  timeline: Array<{
    status: string
    date: string
    time: string
    completed: boolean
    icon: string
  }>
}

const iconMap = {
  CheckCircle,
  Package,
  Truck,
}

export default function TrackingResultPage({ params }: TrackingResultPageProps) {
  const { trackingId } = params
  const [bookingData, setBookingData] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>("loading")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/booking-details/${encodeURIComponent(trackingId)}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.booking) {
          setBookingData(data.booking)
          setDataSource(data.source || "api")
          setDebugInfo(data.debug)
        } else {
          setError(data.error || "Booking not found")
          setDataSource(data.source || "error")
          setDebugInfo(data.debug)
        }
      } catch (err) {
        console.error("Error fetching booking details:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch booking details")
        setDataSource("error")
      } finally {
        setIsLoading(false)
      }
    }

    if (trackingId) {
      fetchBookingDetails()
    }
  }, [trackingId])

  const refreshBookingData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/booking-details/${encodeURIComponent(trackingId)}`)
      const data = await response.json()
      if (data.booking) {
        setBookingData(data.booking)
        setDataSource(data.source || "api")
        setDebugInfo(data.debug)
      } else {
        setError(data.error || "Booking not found")
        setDebugInfo(data.debug)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#044BD9] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-body">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error && !bookingData) {
    return (
      <div className="min-h-screen bg-[#044BD9] flex items-center justify-center">
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-300" />
          <h1 className="text-2xl font-bold mb-2 font-heading">Booking Not Found</h1>
          <p className="text-white/80 mb-6 font-body">{error}</p>

          {/* Debug Information */}
          {debugInfo && (
            <div className="mb-6">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                <Info className="h-4 w-4" />
                {showDebug ? "Hide" : "Show"} Debug Info
              </button>

              {showDebug && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg text-left text-sm font-mono">
                  <div className="space-y-2">
                    <div>
                      <strong>Sheet Used:</strong> {debugInfo.sheetUsed}
                    </div>
                    <div>
                      <strong>Headers Found:</strong> {JSON.stringify(debugInfo.headers)}
                    </div>
                    <div>
                      <strong>Searched For:</strong> {debugInfo.searchedFor}
                    </div>
                    <div>
                      <strong>Total Rows:</strong> {debugInfo.totalRows}
                    </div>
                    {debugInfo.sampleRows && (
                      <div>
                        <strong>Sample Rows:</strong> {JSON.stringify(debugInfo.sampleRows, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link
            href="/find-my-vehicle"
            className="inline-flex items-center gap-2 bg-white text-[#044BD9] px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-lg font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return null
  }

  return (
    <div
      className="min-h-screen bg-[#044BD9] relative"
      style={{
        backgroundImage: "url('/images/Pattern-91.png')",
        backgroundSize: "400px 400px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="absolute inset-0 bg-[#044BD9] opacity-95"></div>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/Pattern-91.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "300px 300px",
          backgroundPosition: "center",
          opacity: 0.05,
        }}
      />
      <div className="relative z-10">
        {/* Header */}
        <header className="py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="ml-4 sm:ml-8 lg:ml-16 flex justify-between items-center">
              <Link href="/">
                <img
                  src="/images/vehicler-logo-white.png"
                  alt="Vehicler"
                  className="h-6 sm:h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <Link
                href="/find-my-vehicle"
                className="inline-flex items-center gap-1 sm:gap-2 bg-white text-[#044BD9] px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-lg font-body text-xs sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Track Another Shipment</span>
                <span className="xs:hidden">Track Another Shipment</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Progress Tracker */}
        <section className="pt-8 sm:pt-12 pb-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:pl-16">
            <div className="text-center mb-0">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 font-heading">
                Tracking Details for ID {trackingId}
              </h1>

              {/* Data Source Indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Database className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/60 font-body">
                  {dataSource === "google_sheets"
                    ? `Live data from Google Sheets${debugInfo?.sheetUsed ? ` (${debugInfo.sheetUsed})` : ""}`
                    : dataSource === "mock"
                      ? "Demo data (Google Sheets unavailable)"
                      : "Loading..."}
                </span>
                <button
                  onClick={refreshBookingData}
                  disabled={isLoading}
                  className="text-white/60 hover:text-white/80 transition-colors disabled:opacity-50"
                  title="Refresh booking data"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
                {debugInfo && (
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-white/60 hover:text-white/80 transition-colors"
                    title="Toggle debug info"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Debug Information */}
              {showDebug && debugInfo && (
                <div className="mb-4 p-3 bg-white/10 rounded-lg text-left text-xs font-mono max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                    <div>
                      <div>
                        <strong>Sheet:</strong> {debugInfo.sheetUsed}
                      </div>
                      <div>
                        <strong>Headers Found:</strong>
                      </div>
                      <div className="pl-2 text-xs">{JSON.stringify(debugInfo.headers, null, 1)}</div>
                    </div>
                    <div>
                      <div>
                        <strong>Column Mapping:</strong>
                      </div>
                      <div className="pl-2 text-xs">{JSON.stringify(debugInfo.columnMapping, null, 1)}</div>
                      {debugInfo.rawRowData && (
                        <div className="mt-2">
                          <div>
                            <strong>Raw Data:</strong>
                          </div>
                          <div className="pl-2 text-xs break-all">{JSON.stringify(debugInfo.rawRowData)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <main className="pt-4 pb-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Map (2/3 width) */}
              <div className="lg:col-span-2">
                <TrackingMap currentLocation={bookingData.currentLocation} trackingId={trackingId} />
              </div>

              {/* Right Column - Delivery Information (1/3 width) */}
              <div className="lg:col-span-1 space-y-4">
                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-xl">
                  <div className="p-4">
                    <div className="text-center pb-4">
                      <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full mb-3">
                        <Truck className="h-5 w-5 text-[#044BD9]" />
                        <span className="text-[#044BD9] font-semibold text-base font-body">{bookingData.status}</span>
                      </div>
                      <p className="text-gray-600 text-base font-body">
                        Estimated delivery: <span className="font-semibold">{bookingData.estimatedDelivery}</span>
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {bookingData.timeline.map((item, index) => {
                        const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Truck
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                item.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3
                                  className={`font-semibold font-body text-sm ${item.completed ? "text-gray-900" : "text-gray-500"}`}
                                >
                                  {item.status}
                                </h3>
                                <span
                                  className={`text-xs font-body ${item.completed ? "text-gray-600" : "text-gray-400"}`}
                                >
                                  {item.date}
                                </span>
                              </div>
                              <p className={`text-xs font-body ${item.completed ? "text-gray-500" : "text-gray-400"}`}>
                                {item.time}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="bg-white rounded-2xl shadow-xl">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 font-heading">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-body">Name:</span>
                        <span className="font-semibold font-body">{bookingData.customerName}</span>
                      </div>
                      {bookingData.customerEmail !== "N/A" && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-body">{bookingData.customerEmail}</span>
                        </div>
                      )}
                      {bookingData.customerPhone !== "N/A" && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="font-body">{bookingData.customerPhone}</span>
                        </div>
                      )}
                      {bookingData.customerNotes && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-500 font-body text-xs">Notes:</span>
                          <p className="text-gray-700 font-body text-sm">{bookingData.customerNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transport Details Card */}
                <div className="bg-white rounded-2xl shadow-xl">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 font-heading">Transport Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-body">Transport Type:</span>
                        <span className="font-semibold font-body">{bookingData.transportType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-body">Total Price:</span>
                        <span className="font-semibold font-body text-green-600">{bookingData.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-body">Pickup Date:</span>
                        <span className="font-semibold font-body">{bookingData.pickupDate}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500 font-body">
                              From ({bookingData.pickupAddressType}):
                            </div>
                            <div className="font-semibold font-body text-sm">{bookingData.pickupLocation}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500 font-body">
                              To ({bookingData.deliveryAddressType}):
                            </div>
                            <div className="font-semibold font-body text-sm">{bookingData.deliveryLocation}</div>
                          </div>
                        </div>
                      </div>
                      {bookingData.specialInstructions && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-500 font-body text-xs">Special Instructions:</span>
                          <p className="text-gray-700 font-body text-sm">{bookingData.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
