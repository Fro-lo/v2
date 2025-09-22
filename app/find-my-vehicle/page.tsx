"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, X, Phone, RefreshCw, Database, Settings, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Only one test booking ID
const FALLBACK_BOOKING_IDS = ["TEST123"]

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showError, setShowError] = useState(false)
  const [validIds, setValidIds] = useState<string[]>(FALLBACK_BOOKING_IDS)
  const [isLoadingIds, setIsLoadingIds] = useState(true)
  const [dataSource, setDataSource] = useState<string>("fallback")
  const [apiError, setApiError] = useState<string | null>(null)
  const [setupRequired, setSetupRequired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitle(true)
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [])

  // Fetch valid booking IDs from Google Sheets
  useEffect(() => {
    async function fetchValidIds() {
      try {
        setIsLoadingIds(true)
        setApiError(null)
        setSetupRequired(false)
        console.log("Fetching valid booking IDs...")

        const response = await fetch("/api/valid-booking-ids", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Received booking IDs response:", data)

        if (data.bookingIds && Array.isArray(data.bookingIds) && data.bookingIds.length > 0) {
          setValidIds(data.bookingIds)
          setDataSource(data.source || "api")
          setSetupRequired(data.setupRequired || false)

          if (data.error) {
            setApiError(data.error)
          }

          console.log(`Loaded ${data.bookingIds.length} booking IDs from ${data.source}`)
        } else {
          console.warn("No valid booking IDs received, using fallback")
          setValidIds(FALLBACK_BOOKING_IDS)
          setDataSource("fallback")
          setSetupRequired(true)
        }
      } catch (error) {
        console.error("Error fetching valid booking IDs:", error)
        setValidIds(FALLBACK_BOOKING_IDS)
        setDataSource("fallback")
        setApiError(error instanceof Error ? error.message : "Failed to fetch booking IDs")
        setSetupRequired(true)
      } finally {
        setIsLoadingIds(false)
      }
    }

    fetchValidIds()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedNumber = trackingNumber.trim()

    if (trimmedNumber) {
      // Always allow TEST123, and check if the tracking ID exists in our valid IDs list (case-insensitive)
      const isValidId =
        trimmedNumber.toUpperCase() === "TEST123" ||
        validIds.some((id) => id.toUpperCase() === trimmedNumber.toUpperCase())

      if (isValidId) {
        setShowError(false)
        router.push(`/tracking/result/${encodeURIComponent(trimmedNumber)}`)
      } else {
        setShowError(true)
      }
    }
  }

  const clearInput = () => {
    setTrackingNumber("")
    setShowError(false)
  }

  const handlePleaseClick = () => {
    setShowSubtitle(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingNumber(e.target.value)
    if (showError) {
      setShowError(false)
    }
  }

  const refreshBookingIds = async () => {
    setIsLoadingIds(true)
    setApiError(null)
    setSetupRequired(false)
    try {
      const response = await fetch("/api/valid-booking-ids")
      const data = await response.json()
      if (data.bookingIds && Array.isArray(data.bookingIds)) {
        setValidIds(data.bookingIds)
        setDataSource(data.source || "api")
        setSetupRequired(data.setupRequired || false)
        if (data.error) {
          setApiError(data.error)
        }
      }
    } catch (error) {
      console.error("Error refreshing booking IDs:", error)
      setApiError(error instanceof Error ? error.message : "Failed to refresh")
      setSetupRequired(true)
    } finally {
      setIsLoadingIds(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#044BD9] text-white overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ml-4 sm:ml-8 lg:ml-16">
            <Link href="/">
              <img
                src="/images/vehicler-logo-white.png"
                alt="Vehicler"
                className="h-6 sm:h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Background Pattern */}
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

      {/* Main Content - Perfectly Centered */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading">
            Find my vehicle
            <span
              className={`cursor-pointer transition-opacity duration-300 ${showSubtitle ? "opacity-100" : "opacity-20"}`}
              onClick={handlePleaseClick}
            >
              , please
            </span>
          </h1>
          {showSubtitle && (
            <p className="text-white/80 text-lg md:text-xl mb-12 font-body animate-fade-in">
              sure, enter your booking ID
            </p>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>

              <input
                type="text"
                value={trackingNumber}
                onChange={handleInputChange}
                placeholder="Enter booking ID"
                className={`w-full p-3 pl-16 pr-16 text-lg rounded-full border-0 shadow-lg focus:shadow-xl focus:ring-4 focus:ring-white/20 focus:outline-none transition-all duration-200 font-body placeholder:text-gray-400 text-black ${
                  showError ? "ring-2 ring-red-500" : ""
                }`}
              />

              {trackingNumber && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center hover:bg-gray-100 rounded-r-full transition-colors duration-200"
                >
                  <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {showError && (
            <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-heading">Booking ID Not Found</h3>
              <p className="text-white/80 mb-4 font-body">
                We couldn't find a shipment with that booking ID. Please double-check your booking ID or contact our
                customer service team for assistance.
              </p>
              <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-6 py-3 mb-4">
                <Phone className="h-5 w-5" />
                <span className="font-semibold text-lg">(855) 422-7872</span>
              </div>
              <p className="text-sm text-white/60 font-body">
                Customer service is available Monday-Friday, 8 AM - 6 PM EST
              </p>
            </div>
          )}

          {/* Google Sheets Status */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Database className="h-4 w-4 text-white/60" />
              <p className="text-sm text-white/60 font-body">
                {dataSource === "google_sheets"
                  ? `Live data: ${validIds.length} booking IDs loaded`
                  : isLoadingIds
                    ? "Connecting to booking database..."
                    : "Booking database unavailable"}
              </p>
              <button
                onClick={refreshBookingIds}
                disabled={isLoadingIds}
                className="text-white/60 hover:text-white/80 transition-colors disabled:opacity-50"
                title="Refresh booking IDs"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingIds ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Show API Setup Required */}
            {setupRequired && apiError && (
              <div className="mb-3 p-4 bg-orange-500/20 backdrop-blur-sm rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-orange-300" />
                  <p className="text-sm text-orange-100 font-body font-semibold">Google Sheets API Setup Required</p>
                </div>
                <p className="text-xs text-orange-200/80 font-body mb-3">{apiError}</p>

                <div className="text-xs text-orange-200/90 font-body space-y-1">
                  <p className="font-semibold">To enable live booking data:</p>
                  <div className="pl-2 space-y-1">
                    <p>
                      1. Go to{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/sheets.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-orange-100 inline-flex items-center gap-1"
                      >
                        Google Cloud Console <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <p>2. Enable the "Google Sheets API"</p>
                    <p>3. Add your API key as GOOGLE_SHEETS_API_KEY environment variable</p>
                    <p>4. Make sure your API key has Sheets API permissions</p>
                    <p>5. Refresh this page</p>
                  </div>
                </div>
              </div>
            )}

            {/* Always show TEST123 */}
            <div className="text-center">
              <p className="text-xs text-white/40 mb-2 font-body">
                {dataSource === "google_sheets"
                  ? `Available booking IDs (${validIds.length}):`
                  : "Test booking ID available:"}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setTrackingNumber("TEST123")}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-body transition-colors"
                >
                  TEST123
                </button>
                {dataSource === "google_sheets" &&
                  validIds
                    .filter((id) => id !== "TEST123")
                    .slice(0, 7)
                    .map((id) => (
                      <button
                        key={id}
                        onClick={() => setTrackingNumber(id)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-body transition-colors"
                      >
                        {id}
                      </button>
                    ))}
              </div>
            </div>

            {/* Show success status when Google Sheets is working */}
            {dataSource === "google_sheets" && (
              <div className="text-center mt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-green-200 font-body">Connected to live booking database</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
