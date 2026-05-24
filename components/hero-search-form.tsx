"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronDown, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useZipLookup } from "@/hooks/use-zip-lookup"
import { VehicleModelInput } from "@/components/vehicle-model-input"
import type { DateRange } from "react-day-picker"


interface SearchFormData {
  fromStreet: string
  fromHouseNumber: string
  fromCity: string
  fromState: string
  fromZip: string
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

export function HeroSearchForm() {
  const router = useRouter()
  const { lookupZipCode, isLoading: isZipLoading } = useZipLookup()
  const lookupZipCodeRef = useRef(lookupZipCode)
  lookupZipCodeRef.current = lookupZipCode

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [searchForm, setSearchForm] = useState<SearchFormData>({
    fromStreet: "",
    fromHouseNumber: "",
    fromCity: "",
    fromState: "",
    fromZip: "",
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

  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [showDeliveryDropdown, setShowDeliveryDropdown] = useState(false)
  const [showConditionDropdown, setShowConditionDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showRequiredHints, setShowRequiredHints] = useState(false)

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
        }
      } catch {}
    } else if (zipCode.length === 0) {
      setSearchForm((prev) => ({ ...prev, fromCity: "", fromState: "" }))
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
        }
      } catch {}
    } else if (zipCode.length === 0) {
      setSearchForm((prev) => ({ ...prev, toCity: "", toState: "" }))
    }
  }, [])

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (range?.from) {
      // Auto-set a 3-day window when user picks a single date
      const autoEnd = range.to && range.to.getTime() !== range.from.getTime()
        ? range.to
        : new Date(range.from.getTime() + 2 * 24 * 60 * 60 * 1000)
      setSearchForm((prev) => ({
        ...prev,
        pickupStartDate: range.from,
        pickupEndDate: autoEnd,
      }))
    } else {
      setSearchForm((prev) => ({ ...prev, pickupStartDate: undefined, pickupEndDate: undefined }))
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

  const getPickupAddressDisplay = () => {
    const parts = [
      searchForm.fromHouseNumber,
      searchForm.fromStreet,
      searchForm.fromCity,
      searchForm.fromState,
      searchForm.fromZip,
    ].filter(Boolean)
    if (parts.length === 0) return "Enter address"
    return parts.join(", ")
  }

  const getDeliveryAddressDisplay = () => {
    const parts = [
      searchForm.toHouseNumber,
      searchForm.toStreet,
      searchForm.toCity,
      searchForm.toState,
      searchForm.toZip,
    ].filter(Boolean)
    if (parts.length === 0) return "Enter address"
    return parts.join(", ")
  }

  const getPickupDateDisplay = () => {
    if (!searchForm.pickupStartDate) return "Select date range"
    const startFormatted = format(searchForm.pickupStartDate, "MM.dd.yy")
    if (searchForm.pickupEndDate && searchForm.pickupStartDate.getTime() === searchForm.pickupEndDate.getTime()) {
      return startFormatted
    }
    if (searchForm.pickupEndDate) {
      return `${startFormatted} - ${format(searchForm.pickupEndDate, "MM.dd.yy")}`
    }
    return startFormatted
  }

  const handleSubmit = () => {
    const requiredFields = [
      { field: "fromZip", name: "Pick up ZIP code" },
      { field: "toZip", name: "Deliver to ZIP code" },
      { field: "pickupStartDate", name: "Pickup date" },
      { field: "vehicleModel", name: "Vehicle model" },
      { field: "vehicleYear", name: "Vehicle year" },
    ]

    const missingFields = requiredFields.filter(({ field }) => {
      const value = searchForm[field as keyof SearchFormData]
      return !value || (typeof value === "string" && value.trim() === "")
    })

    if (missingFields.length > 0) {
      setShowRequiredHints(true)
      setTimeout(() => setShowRequiredHints(false), 5000)
      return
    }

    const params = new URLSearchParams()
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
    if (searchForm.vehicleModel) params.set("vehicleModel", searchForm.vehicleModel)
    if (searchForm.vehicleYear) params.set("vehicleYear", searchForm.vehicleYear)
    if (searchForm.vehicleCategory) params.set("vehicleCategory", searchForm.vehicleCategory)
    if (searchForm.vehicleCondition) params.set("vehicleCondition", searchForm.vehicleCondition)
    if (searchForm.pickupStartDate) params.set("pickupStartDate", searchForm.pickupStartDate.toISOString())
    if (searchForm.pickupEndDate) params.set("pickupEndDate", searchForm.pickupEndDate.toISOString())

    router.push(`/booking-2?${params.toString()}`)
  }

  const pickupDisplay = getPickupAddressDisplay()
  const deliveryDisplay = getDeliveryAddressDisplay()

  return (
    <div className="relative">
      {showRequiredHints && (
        <div className="absolute -top-12 left-0 right-0 text-center z-20">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce inline-block">
            <p className="text-sm font-semibold">Please fill out all highlighted fields</p>
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-xl p-5 shadow-2xl transition-all duration-300 overflow-visible ${
          showRequiredHints ? "ring-4 ring-red-500 ring-opacity-75" : ""
        }`}
      >
        <p className="text-sm text-gray-500 mb-4">
          Fill in the details and get instant quotes from verified carriers.
        </p>
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* Pick up from */}
          <div className="space-y-1.5 relative">
            <Label
              className={`text-xs font-semibold uppercase tracking-wide ${
                showRequiredHints && !searchForm.fromZip ? "text-red-600" : "text-gray-500"
              }`}
            >
              Pick up from
            </Label>
            <Popover open={showAddressDropdown} onOpenChange={setShowAddressDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white border-gray-200 hover:border-[#6371BE] focus:ring-2 focus:ring-[#6371BE] h-10 text-sm text-gray-700"
                >
                  <span className={`truncate ${pickupDisplay === "Enter address" ? "text-gray-400" : ""}`}>
                    {pickupDisplay}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fromHouseNumber" className="text-xs font-medium text-gray-700">House number</Label>
                    <input
                      id="fromHouseNumber"
                      type="text"
                      value={searchForm.fromHouseNumber}
                      onChange={(e) => setSearchForm((prev) => ({ ...prev, fromHouseNumber: e.target.value }))}
                      placeholder="Enter house number"
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromStreet" className="text-xs font-medium text-gray-700">Street name</Label>
                    <input
                      id="fromStreet"
                      type="text"
                      value={searchForm.fromStreet}
                      onChange={(e) => setSearchForm((prev) => ({ ...prev, fromStreet: e.target.value }))}
                      placeholder="Enter street name"
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromZip" className="text-xs font-medium text-gray-700">
                      ZIP code <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <input
                        id="fromZip"
                        type="text"
                        value={searchForm.fromZip}
                        onChange={(e) => handleFromZipChange(e.target.value)}
                        placeholder="Enter ZIP code"
                        maxLength={5}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] pr-8"
                      />
                      {isZipLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowAddressDropdown(false)}
                    className="w-full bg-[#6371BE] hover:bg-[#081C8B] text-white"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Deliver to */}
          <div className="space-y-1.5 relative">
            <Label
              className={`text-xs font-semibold uppercase tracking-wide ${
                showRequiredHints && !searchForm.toZip ? "text-red-600" : "text-gray-500"
              }`}
            >
              Deliver to
            </Label>
            <Popover open={showDeliveryDropdown} onOpenChange={setShowDeliveryDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white border-gray-200 hover:border-[#6371BE] focus:ring-2 focus:ring-[#6371BE] h-10 text-sm text-gray-700"
                >
                  <span className={`truncate ${deliveryDisplay === "Enter address" ? "text-gray-400" : ""}`}>
                    {deliveryDisplay}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="toHouseNumber" className="text-xs font-medium text-gray-700">House number</Label>
                    <input
                      id="toHouseNumber"
                      type="text"
                      value={searchForm.toHouseNumber}
                      onChange={(e) => setSearchForm((prev) => ({ ...prev, toHouseNumber: e.target.value }))}
                      placeholder="Enter house number"
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toStreet" className="text-xs font-medium text-gray-700">Street name</Label>
                    <input
                      id="toStreet"
                      type="text"
                      value={searchForm.toStreet}
                      onChange={(e) => setSearchForm((prev) => ({ ...prev, toStreet: e.target.value }))}
                      placeholder="Enter street name"
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toZip" className="text-xs font-medium text-gray-700">
                      ZIP code <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <input
                        id="toZip"
                        type="text"
                        value={searchForm.toZip}
                        onChange={(e) => handleToZipChange(e.target.value)}
                        placeholder="Enter ZIP code"
                        maxLength={5}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] pr-8"
                      />
                      {isZipLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowDeliveryDropdown(false)}
                    className="w-full bg-[#6371BE] hover:bg-[#081C8B] text-white"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Pickup dates */}
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <Label
              className={`text-xs font-semibold uppercase tracking-wide ${
                showRequiredHints && !searchForm.pickupStartDate ? "text-red-600" : "text-gray-500"
              }`}
            >
              Pickup dates
            </Label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white border-gray-200 hover:border-[#6371BE] focus:ring-2 focus:ring-[#6371BE] h-10 text-sm text-gray-700"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  <span className={searchForm.pickupStartDate ? "text-gray-700" : "text-gray-400"}>
                    {getPickupDateDisplay()}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarUI
                  mode="range"
                  selected={{ from: searchForm.pickupStartDate, to: searchForm.pickupEndDate }}
                  onSelect={handleDateRangeChange}
                  disabled={(date) => date < tomorrow}
                  numberOfMonths={1}
                  initialFocus
                  classNames={{
                    day_selected: "bg-[#6371BE] text-white hover:bg-[#081C8B] focus:bg-[#6371BE]",
                    day_range_middle: "bg-[#6371BE]/15 text-[#081C8B] rounded-none",
                    day_range_start: "bg-[#6371BE] text-white rounded-l-md",
                    day_range_end: "bg-[#6371BE] text-white rounded-r-md",
                    day_today: "font-bold",
                  }}
                />
                <div className="p-3 border-t border-gray-100 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#6371BE] hover:bg-[#081C8B] text-white"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Vehicle model */}
          <div className="space-y-1.5 overflow-hidden">
            <Label className={`text-xs font-semibold uppercase tracking-wide ${showRequiredHints && (!searchForm.vehicleModel || !searchForm.vehicleYear) ? "text-red-600" : "text-gray-500"}`}>
              Vehicle model
            </Label>
            <VehicleModelInput
              value={searchForm.vehicleModel}
              onChange={handleVehicleModelChange}
              year={searchForm.vehicleYear}
              onYearChange={handleVehicleYearChange}
              onVehicleSelect={handleVehicleSelect}
              showRequiredHint={showRequiredHints && (!searchForm.vehicleModel || !searchForm.vehicleYear)}
              className="text-sm"
              enableSearch={true}
              hideLabel={true}
            />
          </div>

          {/* Vehicle condition */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Condition
            </Label>
            <Popover open={showConditionDropdown} onOpenChange={setShowConditionDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal bg-white border-gray-200 hover:border-[#6371BE] h-10 text-sm text-gray-700"
                >
                  <span>{searchForm.vehicleCondition}</span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="py-1">
                  {["Operable", "Inoperable"].map((cond) => (
                    <button
                      key={cond}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none"
                      onClick={() => {
                        setSearchForm((prev) => ({ ...prev, vehicleCondition: cond }))
                        setShowConditionDropdown(false)
                      }}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-transparent select-none" aria-hidden="true">placeholder</Label>
            <Button
              type="button"
              className="w-full bg-[#044BD9] hover:bg-[#081C8B] text-white h-10 text-sm font-semibold"
              onClick={handleSubmit}
            >
              Find Carriers
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
