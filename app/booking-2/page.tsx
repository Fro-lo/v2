"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"

const Calendar = dynamic(() => import("@/components/ui/calendar").then(m => ({ default: m.Calendar })), { ssr: false })
const Slider = dynamic(() => import("@/components/ui/slider").then(m => ({ default: m.Slider })), { ssr: false })

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarIcon,
  Shield,
  Star,
  CheckCircle,
  Filter,
  Flag,
  X,
  ChevronDown,
  Calculator,
  Loader2,
  RefreshCw,
  AlertCircle,
  Info,
  Truck,
  Package,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import Image from "next/image"
import { useZipLookup } from "@/hooks/use-zip-lookup"
import { useCarrierData } from "@/hooks/use-carrier-data"
import { VehicleTransportPricingCalculator } from "@/lib/pricing-calculator"
import { VehicleModelInput } from "@/components/vehicle-model-input"
import type { DateRange } from "react-day-picker"

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

interface SearchFormData {
  fromAddress: string
  fromStreet: string
  fromHouseNumber: string
  fromCity: string
  fromState: string
  fromZip: string
  toAddress: string
  toStreet: string
  toHouseNumber: string
  toCity: string
  toState: string
  toZip: string
  pickupStartDate: Date | undefined
  pickupEndDate: Date | undefined
  vehicleModel: string
  vehicleYear: string
  vehicleCondition: string
  vehicleCategory: string
}

export default function QuotePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  const [searchForm, setSearchForm] = useState<SearchFormData>({
    fromAddress: "",
    fromStreet: "",
    fromHouseNumber: "",
    fromCity: "",
    fromState: "",
    fromZip: "",
    toAddress: "",
    toStreet: "",
    toHouseNumber: "",
    toCity: "",
    toState: "",
    toZip: "",
    pickupStartDate: undefined,
    pickupEndDate: undefined,
    vehicleModel: "",
    vehicleYear: "",
    vehicleCondition: "Operable",
    vehicleCategory: "",
  })

  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false)
  const [showConditionDropdown, setShowConditionDropdown] = useState(false)
  const [transportRecommendation, setTransportRecommendation] = useState<{
    recommended: "open" | "enclosed"
    reason: string
  } | null>(null)
  const [filters, setFilters] = useState({
    priceRange: [100, 10000],
    minRating: 0,
    minReviews: 0,
    localCarrier: false,
    enclosedTransport: false,
  })

  const [hasSearched, setHasSearched] = useState(false)
  const [hasPerformedFirstSearch, setHasPerformedFirstSearch] = useState(false)
  const [showRequiredHints, setShowRequiredHints] = useState(false)

  const { lookupZipCode, isLoading: isZipLoading } = useZipLookup()

  const lookupZipCodeRef = useRef(lookupZipCode)
  lookupZipCodeRef.current = lookupZipCode

  const distance = useMemo(() => {
    return searchForm.fromCity && searchForm.fromState && searchForm.toCity && searchForm.toState
      ? VehicleTransportPricingCalculator.calculateDistance(
          searchForm.fromCity,
          searchForm.fromState,
          searchForm.toCity,
          searchForm.toState,
        )
      : 0
  }, [searchForm.fromCity, searchForm.fromState, searchForm.toCity, searchForm.toState])

  // Calculate minimum delivery days based on distance
  const minimumDeliveryDays = useMemo(() => {
    if (distance === 0) return 3 // Default minimum
    return Math.round(distance / 660) + 1 // Distance ÷ 660 miles + 1 day, rounded to nearest whole number
  }, [distance])

  const {
    quotes,
    isLoading: isLoadingCarriers,
    error: carrierError,
    refreshData,
    regenerateQuotes,
    lastFetch,
    isDataFresh,
  } = useCarrierData(
    searchForm.fromState,
    searchForm.toState,
    distance,
    searchForm.vehicleModel,
    searchForm.vehicleCondition,
    searchForm.pickupStartDate, // Use start date for calculations
    searchForm.pickupEndDate, // Pass end date for filtering
    searchForm.vehicleCategory,
    searchForm.fromCity,
    searchForm.toCity,
  )

  const router = useRouter()

  const handleFromZipChange = useCallback(async (zipCode: string) => {
    setSearchForm((prev) => ({ ...prev, fromZip: zipCode }))

    if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
      try {
        const result = await lookupZipCodeRef.current(zipCode)
        if (result) {
          setSearchForm((prev) => ({
            ...prev,
            fromCity: result.city,
            fromState: result.stateCode,
          }))
          console.log(`Auto-filled FROM: ${result.city}, ${result.stateCode}`)
        }
      } catch (error) {
        console.warn("Failed to lookup FROM ZIP code:", zipCode, error)
      }
    } else if (zipCode.length === 0) {
      setSearchForm((prev) => ({
        ...prev,
        fromCity: "",
        fromState: "",
      }))
    }
  }, [])

  const handleToZipChange = useCallback(async (zipCode: string) => {
    setSearchForm((prev) => ({ ...prev, toZip: zipCode }))

    if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
      try {
        const result = await lookupZipCodeRef.current(zipCode)
        if (result) {
          setSearchForm((prev) => ({
            ...prev,
            toCity: result.city,
            toState: result.stateCode,
          }))
          console.log(`Auto-filled TO: ${result.city}, ${result.stateCode}`)
        }
      } catch (error) {
        console.warn("Failed to lookup ZIP code:", zipCode, error)
      }
    } else if (zipCode.length === 0) {
      setSearchForm((prev) => ({
        ...prev,
        toCity: "",
        toState: "",
      }))
    }
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    const fromZip = urlParams.get("fromZip")
    const toZip = urlParams.get("toZip")

    console.log("URL Params - fromZip:", fromZip, "toZip:", toZip)

    const initialFormData = {
      fromStreet: urlParams.get("fromStreet") || "",
      fromHouseNumber: urlParams.get("fromHouseNumber") || "",
      fromCity: urlParams.get("fromCity") || "",
      fromState: urlParams.get("fromState") || "",
      fromZip: fromZip || "",
      toStreet: urlParams.get("toStreet") || "",
      toHouseNumber: urlParams.get("toHouseNumber") || "",
      toCity: urlParams.get("toCity") || "",
      toState: urlParams.get("toState") || "",
      toZip: toZip || "",
      vehicleModel: urlParams.get("vehicleModel") || "",
      vehicleYear: urlParams.get("vehicleYear") || "",
      vehicleCondition: urlParams.get("vehicleCondition") || "Operable",
      vehicleCategory: urlParams.get("vehicleCategory") || "",
      pickupStartDate: urlParams.get("pickupStartDate") ? new Date(urlParams.get("pickupStartDate")!) : undefined,
      pickupEndDate: urlParams.get("pickupEndDate") ? new Date(urlParams.get("pickupEndDate")!) : undefined,
    }

    setSearchForm((prev) => ({
      ...prev,
      ...initialFormData,
    }))

    const hasFullData =
      (initialFormData.fromCity || initialFormData.fromZip) &&
      (initialFormData.toCity || initialFormData.toZip) &&
      initialFormData.vehicleModel &&
      initialFormData.vehicleYear

    if (Object.values(initialFormData).some((value) => value && value !== "Operable")) {
      setHasSearched(true)
    }

    if (hasFullData) {
      setHasPerformedFirstSearch(true)
    }

    const performZipLookups = async () => {
      const updates: Partial<SearchFormData> = {}

      // Add delay to ensure ZIP lookup function is ready
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (fromZip && fromZip.length === 5 && !urlParams.get("fromCity")) {
        try {
          console.log("URL lookup FROM ZIP:", fromZip)
          const result = await lookupZipCodeRef.current(fromZip)
          console.log("URL FROM ZIP result:", result)
          if (result) {
            updates.fromCity = result.city
            updates.fromState = result.stateCode
            console.log(`Auto-filled FROM: ${result.city}, ${result.stateCode} from ZIP ${fromZip}`)
          }
        } catch (error) {
          console.error("Failed to lookup FROM ZIP:", fromZip, error)
        }
      }

      if (toZip && toZip.length === 5 && !urlParams.get("toCity")) {
        try {
          console.log("URL lookup TO ZIP:", toZip)
          const result = await lookupZipCodeRef.current(toZip)
          console.log("URL TO ZIP result:", result)
          if (result) {
            updates.toCity = result.city
            updates.toState = result.stateCode
            console.log(`Auto-filled TO: ${result.city}, ${result.stateCode} from ZIP ${toZip}`)
          }
        } catch (error) {
          console.error("Failed to lookup TO ZIP:", toZip, error)
        }
      }

      if (Object.keys(updates).length > 0) {
        console.log("Applying ZIP lookup updates:", updates)
        setSearchForm((prev) => ({
          ...prev,
          ...updates,
        }))
      }
    }

    if ((fromZip && fromZip.length === 5) || (toZip && toZip.length === 5)) {
      console.log("Performing ZIP lookup for:", { fromZip, toZip })
      performZipLookups()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters) {
        const target = event.target as Element
        const filterPanel = document.querySelector("[data-filter-panel]")
        const filterButton = document.querySelector("[data-filter-button]")

        if (filterPanel && filterButton && !filterPanel.contains(target) && !filterButton.contains(target)) {
          setShowFilters(false)
        }
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilters])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, "") // Remove all non-digits

      // Remove prefix 1 if user entered it manually
      if (value.startsWith("1")) {
        value = value.slice(1)
      }

      if (value.length > 10) {
        value = value.slice(0, 10)
      }

      let formatted = "+1"
      if (value.length > 0) {
        formatted += " (" + value.slice(0, 3)
      }
      if (value.length >= 4) {
        formatted += ") " + value.slice(3, 6)
      }
      if (value.length >= 7) {
        formatted += "-" + value.slice(6, 8)
      }
      if (value.length >= 9) {
        formatted += "-" + value.slice(8, 10)
      }

      handleInputChange("phone", formatted)
    },
    [handleInputChange],
  )

  const handlePhoneFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const input = e.target
      if (formData.phone === "") {
        setFormData((prev) => ({ ...prev, phone: "+1 (" }))
        setTimeout(() => {
          input.setSelectionRange(4, 4)
        }, 0)
      } else {
        const pos = formData.phone.length
        setTimeout(() => {
          input.setSelectionRange(pos, pos)
        }, 0)
      }
    },
    [formData.phone],
  )

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (range?.from) {
      // If no end date is selected, treat the start date as both start and end
      setSearchForm((prev) => ({
        ...prev,
        pickupStartDate: range.from,
        pickupEndDate: range.to || range.from, // Use start date as end date if no end date selected
      }))
    } else {
      setSearchForm((prev) => ({
        ...prev,
        pickupStartDate: undefined,
        pickupEndDate: undefined,
      }))
    }
  }, [])

  const handleVehicleModelChange = useCallback((value: string) => {
    setSearchForm((prev) => ({ ...prev, vehicleModel: value }))
  }, [])

  const handleVehicleYearChange = useCallback((year: string) => {
    setSearchForm((prev) => ({ ...prev, vehicleYear: year }))
  }, [])

  const handleVehicleSelect = useCallback((vehicle: any) => {
    setSearchForm((prev) => ({
      ...prev,
      vehicleCategory: vehicle.category,
      vehicleYear: vehicle.selectedYear || prev.vehicleYear,
    }))
  }, [])

  const handleTransportRecommendation = useCallback(
    (recommendation: { recommended: "open" | "enclosed"; reason: string }) => {
      setTransportRecommendation(recommendation)
    },
    [],
  )

  const handleQuoteSelection = useCallback(
    (index: number) => {
      if (selectedQuoteIndex === index) {
        setSelectedQuoteIndex(null)
      } else {
        setSelectedQuoteIndex(index)
      }
    },
    [selectedQuoteIndex],
  )

  const handleFilterChange = useCallback((filterType: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      priceRange: [600, 1200],
      minRating: 0,
      minReviews: 0,
      localCarrier: false,
      enclosedTransport: false,
    })
  }, [])

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      if (quote.price < filters.priceRange[0] || quote.price > filters.priceRange[1]) {
        return false
      }

      if (quote.rating < filters.minRating) {
        return false
      }

      if (quote.reviews < filters.minReviews) {
        return false
      }

      if (filters.localCarrier && !quote.isLocal) {
        return false
      }

      if (filters.enclosedTransport && !quote.isEnclosed) {
        return false
      }

      return true
    })
  }, [quotes, filters])

  const activeFiltersCount = useMemo(() => {
    return [
      filters.priceRange[0] !== 600 || filters.priceRange[1] !== 1200,
      filters.minRating > 0,
      filters.minReviews > 0,
      filters.localCarrier,
      filters.enclosedTransport,
    ].filter(Boolean).length
  }, [filters])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const params = new URLSearchParams()

      if (searchForm.fromAddress) params.set("fromAddress", searchForm.fromAddress)
      if (searchForm.toAddress) params.set("toAddress", searchForm.toAddress)
      if (searchForm.vehicleModel) params.set("vehicleModel", searchForm.vehicleModel)
      if (searchForm.vehicleYear) params.set("vehicleYear", searchForm.vehicleYear)
      if (searchForm.vehicleCategory) params.set("vehicleCategory", searchForm.vehicleCategory)
      if (searchForm.vehicleCondition) params.set("vehicleCondition", searchForm.vehicleCondition)

      if (searchForm.fromStreet) params.set("fromStreet", searchForm.fromStreet)
      if (searchForm.fromHouseNumber) params.set("fromHouseNumber", searchForm.fromHouseNumber)
      if (searchForm.fromCity) params.set("fromCity", searchForm.fromCity)
      if (searchForm.fromState) params.set("fromState", searchForm.fromState)
      if (searchForm.fromZip) params.set("fromZip", searchForm.fromZip)

      if (searchForm.toStreet) params.set("toStreet", searchForm.toStreet)
      if (searchForm.toHouseNumber) params.set("toHouseNumber", searchForm.toHouseNumber)
      if (searchForm.toCity) params.set("toCity", searchForm.toCity)
      if (searchForm.toState) params.set("toState", searchForm.toState)
      if (searchForm.toZip) params.set("toZip", searchForm.toZip)

      if (selectedQuoteIndex !== null) {
        const selectedQuote = filteredQuotes[selectedQuoteIndex]
        params.set(
          "selectedQuote",
          JSON.stringify({
            ...selectedQuote,
            finalPrice: selectedQuote.price, // Ensure the final calculated price is included
          }),
        )
        // Pass finalPrice as a separate URL parameter
        params.set("finalPrice", selectedQuote.price.toString())
        // Pass vehicle transport type as a separate URL parameter
        params.set("vehicleTransportType", selectedQuote.isEnclosed ? "enclosed" : "open")

        // Pass pickup and delivery dates from the selected quote instead of form
        params.set("pickupStartDate", selectedQuote.pickupRange)
        params.set("pickupEndDate", selectedQuote.deliveryRange)
      }

      if (searchForm.pickupStartDate) params.set("pickupStartDate", searchForm.pickupStartDate.toISOString())
      if (searchForm.pickupEndDate) params.set("pickupEndDate", searchForm.pickupEndDate.toISOString())

      params.set("customerName", formData.name)
      params.set("customerEmail", formData.email)
      params.set("customerPhone", formData.phone)
      if (formData.notes) params.set("customerNotes", formData.notes)

      console.log("Form submitted with data:", {
        searchForm,
        formData,
        selectedQuote: selectedQuoteIndex !== null ? filteredQuotes[selectedQuoteIndex] : null,
      })

      router.push(`/shipment-details?${params.toString()}`)
    },
    [searchForm, formData, selectedQuoteIndex, filteredQuotes, router],
  )

  const handleUpdateSearch = useCallback(() => {
    const requiredFields = [
      { field: "fromStreet", name: "Pick up from street" },
      { field: "fromCity", name: "Pick up from city" },
      { field: "toStreet", name: "Deliver to street" },
      { field: "toCity", name: "Deliver to city" },
      { field: "pickupStartDate", name: "Pickup dates" },
      { field: "vehicleModel", name: "Vehicle model" },
      { field: "vehicleYear", name: "Vehicle year" },
      { field: "vehicleCondition", name: "Vehicle condition" },
    ]

    const missingFields = requiredFields.filter(({ field }) => {
      if (field === "pickupStartDate") {
        return !searchForm[field as keyof SearchFormData]
      }
      const value = searchForm[field as keyof SearchFormData]
      return !value || (typeof value === "string" && value.trim() === "")
    })

    if (missingFields.length > 0) {
      setShowRequiredHints(true)
      setTimeout(() => setShowRequiredHints(false), 5000)
      return
    }

    setHasSearched(true)
    setHasPerformedFirstSearch(true)
    regenerateQuotes()
  }, [searchForm, regenerateQuotes])

  const getPickupAddressDisplay = useMemo(() => {
    const stateName = searchForm.fromState ? US_STATES.find((s) => s.code === searchForm.fromState)?.name : ""
    const parts = [
      searchForm.fromHouseNumber,
      searchForm.fromStreet,
      searchForm.fromCity,
      stateName,
      searchForm.fromZip,
    ].filter(Boolean)

    if (parts.length === 0) return "Enter address"
    return parts.join(", ")
  }, [searchForm.fromHouseNumber, searchForm.fromStreet, searchForm.fromCity, searchForm.fromState, searchForm.fromZip])

  const getDeliveryAddressDisplay = useMemo(() => {
    const stateName = searchForm.toState ? US_STATES.find((s) => s.code === searchForm.toState)?.name : ""
    const parts = [
      searchForm.toHouseNumber,
      searchForm.toStreet,
      searchForm.toCity,
      stateName,
      searchForm.toZip,
    ].filter(Boolean)

    if (parts.length === 0) return "Enter address"
    return parts.join(", ")
  }, [searchForm.toHouseNumber, searchForm.toStreet, searchForm.toCity, searchForm.toState, searchForm.toZip])

  const getPickupDateDisplay = useMemo(() => {
    if (!searchForm.pickupStartDate) return "../../.. - ../../.."

    const startFormatted = format(searchForm.pickupStartDate, "MM.dd.yy")

    // If both dates exist and they're the same, show only one date
    if (searchForm.pickupEndDate && searchForm.pickupStartDate.getTime() === searchForm.pickupEndDate.getTime()) {
      return startFormatted
    }

    // If both dates exist and they're different, show range
    if (searchForm.pickupEndDate) {
      return `${startFormatted} - ${format(searchForm.pickupEndDate, "MM.dd.yy")}`
    }

    // If only start date exists, show just that date (no dash)
    return startFormatted
  }, [searchForm.pickupStartDate, searchForm.pickupEndDate])

  const renderStars = useCallback((rating: number, totalStars = 5) => {
    const stars = []
    for (let i = 0; i < totalStars; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />,
      )
    }
    return stars
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div
        className="bg-[#6371BE] text-white relative overflow-visible"
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
          <div className="lg:ml-16">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img src="/images/vehicler-logo-white.png" alt="Vehicler" className="h-8 w-auto" />
              </Link>
              <div className="flex items-center space-x-2">
                {lastFetch && (
                  <div className="text-xs text-white/80">
                    Data updated: {lastFetch.toLocaleTimeString()}
                    {!isDataFresh && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500/20 rounded text-yellow-200">
                        Data may be outdated
                      </span>
                    )}
                  </div>
                )}
                {carrierError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                )}
              </div>
            </div>

            <div className="pb-6">
              <div
                className={`bg-white rounded-lg p-6 shadow-lg relative transition-all duration-500 ${
                  showRequiredHints ? "ring-4 ring-red-600 ring-opacity-75 shadow-red-600/50 shadow-2xl scale-105" : ""
                }`}
              >
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                    <div className="space-y-2 relative">
                      <Label
                        className={`text-sm font-medium ${showRequiredHints && (!searchForm.fromStreet || !searchForm.fromCity) ? "text-red-600" : "text-gray-700"}`}
                      >
                        Pick up from
                      </Label>
                      <Popover open={showAddressDropdown} onOpenChange={setShowAddressDropdown}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal bg-white focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] h-10 text-gray-700"
                          >
                            <span
                              className={`truncate ${getPickupAddressDisplay === "Enter address" ? "text-gray-500" : ""}`}
                            >
                              {getPickupAddressDisplay}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="fromHouseNumber" className="text-xs font-medium text-gray-700">
                                House number
                              </Label>
                              <input
                                id="fromHouseNumber"
                                type="text"
                                value={searchForm.fromHouseNumber || ""}
                                onChange={(e) =>
                                  setSearchForm((prev) => ({ ...prev, fromHouseNumber: e.target.value }))
                                }
                                placeholder="Enter house number"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                              />
                            </div>
                            <div>
                              <Label htmlFor="fromStreet" className="text-xs font-medium text-gray-700">
                                Street name
                              </Label>
                              <input
                                id="fromStreet"
                                type="text"
                                value={searchForm.fromStreet || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, fromStreet: e.target.value }))}
                                placeholder="Enter street name"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                              />
                            </div>
                            <div>
                              <Label htmlFor="fromZip" className="text-xs font-medium text-gray-700">
                                ZIP code
                              </Label>
                              <div className="relative">
                                <input
                                  id="fromZip"
                                  type="text"
                                  value={searchForm.fromZip || ""}
                                  onChange={(e) => handleFromZipChange(e.target.value)}
                                  placeholder="Enter ZIP code"
                                  maxLength={5}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] pr-8"
                                />
                                {isZipLoading && (
                                  <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="fromCity" className="text-xs font-medium text-gray-700">
                                City
                              </Label>
                              <input
                                id="fromCity"
                                type="text"
                                value={searchForm.fromCity || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, fromCity: e.target.value }))}
                                placeholder="Auto-filled from ZIP"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] bg-gray-50"
                                readOnly
                              />
                            </div>
                            <div>
                              <Label htmlFor="fromState" className="text-xs font-medium text-gray-700">
                                State
                              </Label>
                              <select
                                id="fromState"
                                value={searchForm.fromState || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, fromState: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] bg-gray-50"
                                disabled
                              >
                                <option value="">Auto-filled from ZIP</option>
                                {US_STATES.map((state) => (
                                  <option key={state.code} value={state.code}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="pt-2">
                              <Button
                                type="button"
                                onClick={() => setShowAddressDropdown(false)}
                                className="w-full bg-[#6371BE] hover:bg-[#081C8B] text-white"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 relative">
                      <Label
                        className={`text-sm font-medium ${showRequiredHints && (!searchForm.toStreet || !searchForm.toCity) ? "text-red-600" : "text-gray-700"}`}
                      >
                        Deliver to
                      </Label>
                      <Popover open={showDeliveryDropdown} onOpenChange={setShowDeliveryDropdown}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal bg-white focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] h-10 text-gray-700"
                          >
                            <span
                              className={`truncate ${getDeliveryAddressDisplay === "Enter address" ? "text-gray-500" : ""}`}
                            >
                              {getDeliveryAddressDisplay}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="toHouseNumber" className="text-xs font-medium text-gray-700">
                                House number
                              </Label>
                              <input
                                id="toHouseNumber"
                                type="text"
                                value={searchForm.toHouseNumber || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, toHouseNumber: e.target.value }))}
                                placeholder="Enter house number"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                              />
                            </div>
                            <div>
                              <Label htmlFor="toStreet" className="text-xs font-medium text-gray-700">
                                Street name
                              </Label>
                              <input
                                id="toStreet"
                                type="text"
                                value={searchForm.toStreet || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, toStreet: e.target.value }))}
                                placeholder="Enter street name"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                              />
                            </div>
                            <div>
                              <Label htmlFor="toZip" className="text-xs font-medium text-gray-700">
                                ZIP code
                              </Label>
                              <div className="relative">
                                <input
                                  id="toZip"
                                  type="text"
                                  value={searchForm.toZip || ""}
                                  onChange={(e) => handleToZipChange(e.target.value)}
                                  placeholder="Enter ZIP code"
                                  maxLength={5}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] pr-8"
                                />
                                {isZipLoading && (
                                  <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="toCity" className="text-xs font-medium text-gray-700">
                                City
                              </Label>
                              <input
                                id="toCity"
                                type="text"
                                value={searchForm.toCity || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, toCity: e.target.value }))}
                                placeholder="Auto-filled from ZIP"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] bg-gray-50"
                                readOnly
                              />
                            </div>
                            <div>
                              <Label htmlFor="toState" className="text-xs font-medium text-gray-700">
                                State
                              </Label>
                              <select
                                id="toState"
                                value={searchForm.toState || ""}
                                onChange={(e) => setSearchForm((prev) => ({ ...prev, toState: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] bg-gray-50"
                                disabled
                              >
                                <option value="">Auto-filled from ZIP</option>
                                {US_STATES.map((state) => (
                                  <option key={state.code} value={state.code}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="pt-2">
                              <Button
                                type="button"
                                onClick={() => setShowDeliveryDropdown(false)}
                                className="w-full bg-[#6371BE] hover:bg-[#081C8B] text-white"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-sm font-medium ${showRequiredHints && !searchForm.pickupStartDate ? "text-red-600" : "text-gray-700"}`}
                      >
                        Pickup dates
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-white focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] text-gray-700 text-sm overflow-hidden"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 shrink-0" />
                            <span className="truncate text-gray-500">{getPickupDateDisplay}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={{
                              from: searchForm.pickupStartDate,
                              to: searchForm.pickupEndDate,
                            }}
                            onSelect={handleDateRangeChange}
                            disabled={(date) => date < tomorrow}
                            numberOfMonths={1}
                            initialFocus
                            classNames={{
                              day_selected: "bg-[#6371BE] text-white hover:bg-[#081C8B] focus:bg-[#6371BE]",
                              day_range_middle: "bg-[#6371BE]/15 text-[#081C8B] rounded-none",
                              day_range_start: "bg-[#6371BE] text-white rounded-l-md",
                              day_range_end: "bg-[#6371BE] text-white rounded-r-md",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <VehicleModelInput
                        value={searchForm.vehicleModel}
                        onChange={handleVehicleModelChange}
                        year={searchForm.vehicleYear}
                        onYearChange={handleVehicleYearChange}
                        onVehicleSelect={handleVehicleSelect}
                        showRequiredHint={showRequiredHints && (!searchForm.vehicleModel || !searchForm.vehicleYear)}
                        onTransportRecommendation={handleTransportRecommendation}
                        className="text-sm"
                        enableSearch={hasSearched}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="vehicleCondition"
                        className={`text-sm font-medium ${showRequiredHints && !searchForm.vehicleCondition ? "text-red-600" : "text-gray-700"}`}
                      >
                        Vehicle condition
                      </Label>
                      <Popover open={showConditionDropdown} onOpenChange={setShowConditionDropdown}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal bg-white focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] h-10 text-gray-700 text-sm"
                          >
                            <span>{searchForm.vehicleCondition}</span>
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0">
                          <div className="py-1">
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                              onClick={() => {
                                setSearchForm((prev) => ({ ...prev, vehicleCondition: "Operable" }))
                                setShowConditionDropdown(false)
                              }}
                            >
                              Operable
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                              onClick={() => {
                                setSearchForm((prev) => ({ ...prev, vehicleCondition: "Inoperable" }))
                                setShowConditionDropdown(false)
                              }}
                            >
                              Inoperable
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 opacity-0">Action</Label>
                      <Button
                        type="button"
                        className="w-full bg-[#044BD9] hover:bg-[#081C8B] text-white h-10"
                        onClick={handleUpdateSearch}
                        disabled={isLoadingCarriers}
                      >
                        {isLoadingCarriers ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Update Search"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {transportRecommendation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Transport Recommendation</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {transportRecommendation.recommended === "enclosed" ? "🛡️" : "🚛"} {transportRecommendation.reason}
                    </p>
                  </div>
                )}

                {showRequiredHints && (
                  <div className="absolute -top-4 left-0 right-0 text-center z-20">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
                      <p className="text-sm font-semibold">
                        Please fill out all highlighted fields before updating your search!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {carrierError && (
                <div className="mt-4 bg-red-500/10 backdrop-blur-sm rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <h3 className="text-red-400 font-semibold">Unable to Load Live Data</h3>
                  </div>
                  <p className="text-red-300 text-sm mb-3">
                    We're having trouble accessing the carrier database. Using cached data for now.
                  </p>
                  <div className="text-red-200 text-xs mb-3">Error: {carrierError}</div>
                  <Button onClick={refreshData} size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F2F2F2] py-3 relative z-[1]">
        <div className="max-w-4xl mx-auto px-4">
          {/* Mobile stepper */}
          <div className="flex items-center justify-center md:hidden">
            {/* Step 1 */}
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-[#6371BE] rounded-full flex items-center justify-center flex-shrink-0">
                <Flag className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[11px] font-bold text-[#6371BE] leading-none">Contact Info</span>
            </div>
            <div className="flex-1 mx-2 h-0.5 bg-gray-300 max-w-[32px]" />
            {/* Step 2 */}
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] text-gray-400 font-bold leading-none">2</span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 leading-none">Shipment</span>
            </div>
            <div className="flex-1 mx-2 h-0.5 bg-gray-300 max-w-[32px]" />
            {/* Step 3 */}
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] text-gray-400 font-bold leading-none">3</span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 leading-none">Book</span>
            </div>
          </div>
          {/* Desktop stepper: full labels */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-6 h-6 bg-[#6371BE] rounded-full flex items-center justify-center">
                <Flag className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-[#6371BE] whitespace-nowrap">Contact Information</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 flex-shrink-0" />
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white" />
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Shipment Details</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 flex-shrink-0" />
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white" />
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Book Shipment</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:ml-16">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#262626] mb-2">
                  Available Quotes ({filteredQuotes.length})
                  {isLoadingCarriers && <Loader2 className="inline h-5 w-5 ml-2 animate-spin text-[#6371BE]" />}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-2 bg-transparent ${
                        activeFiltersCount > 0 ? "border-[#6371BE] text-[#6371BE]" : ""
                      }`}
                      onClick={() => setShowFilters(!showFilters)}
                      data-filter-button
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-[#6371BE] text-white text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>

                    {showFilters && (
                      <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg" data-filter-panel>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Filters</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Clear all
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                            </Label>
                            <Slider
                              value={filters.priceRange}
                              onValueChange={(value) => handleFilterChange("priceRange", value)}
                              max={10000}
                              min={100}
                              step={25}
                              className="w-full"
                              minStepsBetweenThumbs={1}
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}+ stars` : "Any"}
                            </Label>
                            <Slider
                              value={[filters.minRating]}
                              onValueChange={(value) => handleFilterChange("minRating", value[0])}
                              max={5}
                              min={0}
                              step={0.5}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              Minimum Reviews: {filters.minReviews > 0 ? `${filters.minReviews}+` : "Any"}
                            </Label>
                            <Slider
                              value={[filters.minReviews]}
                              onValueChange={(value) => handleFilterChange("minReviews", value[0])}
                              max={2000}
                              min={0}
                              step={100}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Service Type</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="localCarrier"
                                  checked={filters.localCarrier}
                                  onCheckedChange={(checked) => handleFilterChange("localCarrier", checked)}
                                />
                                <Label htmlFor="localCarrier" className="text-sm">
                                  Local Carrier Only
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="enclosedTransport"
                                  checked={filters.enclosedTransport}
                                  onCheckedChange={(checked) => handleFilterChange("enclosedTransport", checked)}
                                />
                                <Label htmlFor="enclosedTransport" className="text-sm">
                                  Enclosed Transport Only
                                </Label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Avg. rate</span>
                    <div className="flex">{renderStars(4)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {!hasPerformedFirstSearch ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Ready to find quotes?</h3>
                        <p className="text-sm">
                          Fill out the search form above and click "Update Search" to see available quotes from
                          carriers.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : isLoadingCarriers ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Loading carrier data...</h3>
                        <p className="text-sm">Please wait while we fetch the latest quotes from our carriers.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : filteredQuotes.length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No quotes match your criteria</h3>
                        <p className="text-sm">Try adjusting your search criteria or filters to see more results.</p>
                        <div className="flex gap-2 justify-center mt-4">
                          <Button variant="outline" onClick={clearFilters} className="bg-transparent">
                            Clear Filters
                          </Button>
                          <Button variant="outline" onClick={regenerateQuotes} className="bg-transparent">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Quotes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredQuotes.map((quote, index) => (
                    <Card
                      key={quote.id}
                      className={`border-2 transition-colors cursor-pointer ${
                        selectedQuoteIndex === index
                          ? "border-[#6371BE] ring-2 ring-[#6371BE] ring-opacity-50"
                          : selectedQuoteIndex !== null
                            ? "hover:border-[#6371BE] opacity-50 grayscale"
                            : "hover:border-[#6371BE]"
                      }`}
                      onClick={() => handleQuoteSelection(index)}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg text-[#262626]">{quote.company}</h3>
                              <Badge variant="destructive" className="bg-red-500">
                                {selectedQuoteIndex === index
                                  ? "Selected"
                                  : selectedQuoteIndex !== null
                                    ? "Available"
                                    : "Choose carrier"}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-1 mb-3">
                              <div className="flex">{renderStars(quote.rating)}</div>
                              <span className="text-sm text-gray-600">({quote.reviews} reviews)</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <div className="text-gray-600">Pickup dates</div>
                                <div className="font-medium flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span>{quote.pickupRange}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Delivery date</div>
                                <div className="font-medium flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span>{quote.deliveryRange}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                              <div>
                                <div>DOT: {quote.dotNumber}</div>
                                <div>MC: {quote.mcNumber}</div>
                              </div>
                              <div>
                                <div>{quote.yearsInBusiness} years in business</div>
                                <div>Insurance: ${quote.insuranceCoverage.toLocaleString()}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                              <div>
                                <div className="flex items-center space-x-1">
                                  <Truck className="h-3 w-3" />
                                  <span>Truck: {quote.truck}</span>
                                </div>
                                <div className="flex items-center space-x-1 mt-1">
                                  <Package className="h-3 w-3" />
                                  <span>Trailer: {quote.trailer}</span>
                                </div>
                              </div>
                              <div>
                                <div>Vehicle Type: {quote.vehicleType}</div>
                                <div>
                                  Capacity: {quote.forVehicles} ({quote.slots})
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {quote.isLocal && (
                                <Badge variant="secondary" className="bg-[#6371BE] bg-opacity-20 text-[#081C8B]">
                                  Local carrier
                                </Badge>
                              )}
                              {quote.isEnclosed && (
                                <Badge variant="secondary" className="bg-[#044BD9] bg-opacity-20 text-[#081C8B]">
                                  Enclosed transport
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {quote.trailerType}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {quote.state}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2">{quote.description}</p>
                          </div>

                          <div className="flex items-center justify-between mt-4 md:mt-0 md:ml-6 md:flex-col md:items-end">
                            <div className="text-3xl font-bold text-[#262626]">${quote.price}</div>
                            <Button
                              className={`mt-3 ${
                                selectedQuoteIndex === index
                                  ? "bg-[#044BD9] hover:bg-[#081C8B]"
                                  : selectedQuoteIndex !== null
                                    ? "bg-gray-400 hover:bg-gray-500"
                                    : "bg-[#044BD9] hover:bg-[#081C8B]"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuoteSelection(index)
                              }}
                            >
                              {selectedQuoteIndex === index
                                ? "Selected"
                                : selectedQuoteIndex !== null
                                  ? "Change selection"
                                  : "Select Quote"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-4">
                <CardHeader className="bg-gradient-to-r from-[#6371BE] to-[#081C8B] text-white">
                  <CardTitle>Complete Your Booking</CardTitle>
                  <p className="text-blue-100 text-sm">Provide your details to secure your quote</p>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          const email = e.target.value
                          const emailPattern =
                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

                          handleInputChange("email", email)

                          const emailInput = e.target as HTMLInputElement
                          if (email && !emailPattern.test(email)) {
                            emailInput.setCustomValidity("Please enter a valid email address")
                          } else {
                            emailInput.setCustomValidity("")
                          }
                        }}
                        onBlur={(e) => {
                          const email = e.target.value
                          const emailPattern =
                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

                          if (email && !emailPattern.test(email)) {
                            e.target.style.borderColor = "#ef4444"
                            e.target.style.boxShadow = "0 0 0 1px #ef4444"
                          } else {
                            e.target.style.borderColor = ""
                            e.target.style.boxShadow = ""
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = ""
                          e.target.style.boxShadow = ""
                        }}
                        placeholder="Enter your email address"
                        required
                        maxLength={254}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onFocus={handlePhoneFocus}
                        placeholder="+1 (555) 123-4567"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Any special instructions..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#044BD9] hover:bg-[#081C8B] text-white py-3"
                      disabled={selectedQuoteIndex === null}
                    >
                      {selectedQuoteIndex === null ? "Select a Quote Above" : "Book Selected Quote"}
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Insured</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Licensed</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>Top Rated</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-[#F2F2F2] py-16 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#262626] mb-12">Customer Feedback</h2>

          <div className="relative">
            <div className="flex animate-scroll space-x-6">
              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(4)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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

              <Card className="bg-white flex-shrink-0 w-80">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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
                    <div className="flex">{renderStars(4)}</div>
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
                    <div className="flex">{renderStars(5)}</div>
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

      <footer className="bg-[#262626] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-16">

          {/* Logo + description + socials */}
          <div className="mb-6">
            <Link href="/" className="block">
              <Image
                src="/vehicler-footer-logo.png"
                alt="Vehicler logo mark"
                width={200}
                height={200}
                priority
                className="w-full h-auto md:w-48 hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            <div className="h-8 md:h-4" />
            <p className="text-gray-300 text-sm leading-relaxed md:max-w-xs">
              America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.
            </p>
            <div className="flex space-x-4 mt-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={`${label} link`}>
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Three columns — always in one row */}
          <div className="grid grid-cols-3 gap-x-1 md:gap-8 mb-6">
            <div>
              <h3 className="font-semibold text-white mb-1 text-xs md:text-sm">Services</h3>
              <ul className="space-y-1">
                {[
                  { text: "Open Car Transport", href: "#" },
                  { text: "Enclosed Car Transport", href: "#" },
                  { text: "Motorcycle Shipping", href: "#" },
                  { text: "Classic Car Transport", href: "#" },
                ].map((link) => (
                  <li key={link.text}><a href={link.href} className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{link.text}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-xs md:text-sm">Company</h3>
              <ul className="space-y-1">
                {[
                  { text: "About Us", href: "#" },
                  { text: "How It Works", href: "/#how-it-works" },
                  { text: "Reviews", href: "/#reviews" },
                  { text: "Careers", href: "#" },
                ].map((link) => (
                  <li key={link.text}><a href={link.href} className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{link.text}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-xs md:text-sm">Support</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">Contact Us</a></li>
                <li><a href="/#faq" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">FAQ</a></li>
                <li><a href="/find-my-vehicle" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">Track Shipment</a></li>
                <li><a href="/#quote" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">Get Quote</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-600 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Vehicler. All rights reserved.</p>
            <div className="flex space-x-3 md:space-x-6 text-xs">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}

