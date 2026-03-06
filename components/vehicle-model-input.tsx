"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useGoogleSheetsVehicles } from "@/hooks/use-google-sheets-vehicles"
import type { GoogleSheetsVehicleModel } from "@/lib/google-sheets-vehicle-data"
import { Search, Info, Zap, Star, RefreshCw, AlertCircle, ChevronRight, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface VehicleModelInputProps {
  value: string
  onChange: (value: string) => void
  year?: string
  onYearChange?: (year: string) => void
  placeholder?: string
  className?: string
  showRequiredHint?: boolean
  onTransportRecommendation?: (recommendation: { recommended: "open" | "enclosed"; reason: string }) => void
  onVehicleSelect?: (vehicle: GoogleSheetsVehicleModel & { selectedYear?: string }) => void
  enableSearch?: boolean
}

export function VehicleModelInput({
  value,
  onChange,
  year = "",
  onYearChange,
  placeholder = "e.g., Toyota Camry, BMW 3 Series",
  className = "",
  showRequiredHint = false,
  onTransportRecommendation,
  onVehicleSelect,
  enableSearch = false,
}: VehicleModelInputProps) {
  const [suggestions, setSuggestions] = useState<GoogleSheetsVehicleModel[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showTooltip, setShowTooltip] = useState<GoogleSheetsVehicleModel | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<GoogleSheetsVehicleModel | null>(null)
  const [showYearSelection, setShowYearSelection] = useState(false)
  const [tooltipYearOptions, setTooltipYearOptions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const hideTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const [tooltipRect, setTooltipRect] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateDropdownRect = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      const dropdownWidth = rect.width
      const viewportWidth = window.innerWidth
      const margin = 8

      // Clamp left so dropdown never goes off-screen right
      const rawLeft = rect.left + window.scrollX
      const clampedLeft = Math.min(rawLeft, window.scrollX + viewportWidth - dropdownWidth - margin)
      const finalLeft = Math.max(window.scrollX + margin, clampedLeft)

      // If not enough space below, show above
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 240 // max-h-60
      const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight
      const top = showAbove
        ? rect.top + window.scrollY - dropdownHeight - 4
        : rect.bottom + window.scrollY + 4

      setDropdownRect({
        top,
        left: finalLeft,
        width: dropdownWidth,
      })
      setTooltipRect({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 8,
      })
    }
  }, [])

  useEffect(() => {
    if (showSuggestions || showYearSelection || showTooltip) {
      updateDropdownRect()
      window.addEventListener("scroll", updateDropdownRect, true)
      window.addEventListener("resize", updateDropdownRect)
      return () => {
        window.removeEventListener("scroll", updateDropdownRect, true)
        window.removeEventListener("resize", updateDropdownRect)
      }
    }
  }, [showSuggestions, showYearSelection, showTooltip, updateDropdownRect])

  // Use Google Sheets vehicle data
  const { 
    vehicles,
    isLoading, 
    error, 
    refreshData 
  } = useGoogleSheetsVehicles()

  // Create a stable search function using useCallback
  const performSearch = useCallback((query: string, limit: number = 8) => {
    if (!query || query.length < 2 || !enableSearch) return []
    
    const queryLower = query.toLowerCase()
    const results: GoogleSheetsVehicleModel[] = []

    // Search by make and model
    for (const vehicle of vehicles) {
      const makeMatch = vehicle.make.toLowerCase().includes(queryLower)
      const modelMatch = vehicle.model.toLowerCase().includes(queryLower)
      const aliasMatch = vehicle.aliases?.some((alias) => alias.toLowerCase().includes(queryLower))

      if (makeMatch || modelMatch || aliasMatch) {
        results.push(vehicle)
      }

      if (results.length >= limit) break
    }

    // Sort by relevance (exact matches first, then partial matches)
    return results.sort((a, b) => {
      const aExact = `${a.make} ${a.model}`.toLowerCase() === queryLower
      const bExact = `${b.make} ${b.model}`.toLowerCase() === queryLower

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      const aMakeExact = a.make.toLowerCase() === queryLower
      const bMakeExact = b.make.toLowerCase() === queryLower

      if (aMakeExact && !bMakeExact) return -1
      if (!aMakeExact && bMakeExact) return 1

      return a.make.localeCompare(b.make)
    })
  }, [vehicles, enableSearch])

  useEffect(() => {
    if (enableSearch && value.length >= 2) {
      const results = performSearch(value, 8)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setShowYearSelection(false)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setShowYearSelection(false)
    }
    setSelectedIndex(-1)
  }, [value, performSearch, enableSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setSelectedVehicle(null)
    setShowYearSelection(false)
  }

  const handleSuggestionClick = (vehicle: GoogleSheetsVehicleModel) => {
    const displayValue = `${vehicle.make} ${vehicle.model}`
    onChange(displayValue)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setSelectedVehicle(vehicle)
    setShowYearSelection(true)

    if (onTransportRecommendation && vehicle.transportRecommendation) {
      const recommendation = {
        recommended: vehicle.transportRecommendation,
        reason: vehicle.transportRecommendation === "enclosed" 
          ? "Recommended for protection of high-value vehicle"
          : "Standard open transport is suitable for this vehicle"
      }
      onTransportRecommendation(recommendation)
    }
  }

  const handleYearSelect = (selectedYear: string) => {
    if (onYearChange) {
      onYearChange(selectedYear)
    }
    setShowYearSelection(false)

    if (selectedVehicle && onVehicleSelect) {
      onVehicleSelect({ ...selectedVehicle, selectedYear })
    }
  }

  const handleTooltipYearSelect = (selectedYear: string, vehicle: GoogleSheetsVehicleModel) => {
    const displayValue = `${vehicle.make} ${vehicle.model}`
    onChange(displayValue)
    if (onYearChange) {
      onYearChange(selectedYear)
    }

    setSelectedVehicle(vehicle)
    setShowTooltip(null)
    setShowSuggestions(false)

    if (onTransportRecommendation && vehicle.transportRecommendation) {
      const recommendation = {
        recommended: vehicle.transportRecommendation,
        reason: vehicle.transportRecommendation === "enclosed" 
          ? "Recommended for protection of high-value vehicle"
          : "Standard open transport is suitable for this vehicle"
      }
      onTransportRecommendation(recommendation)
    }

    if (onVehicleSelect) {
      onVehicleSelect({ ...vehicle, selectedYear })
    }
  }

  const handleOtherSelection = () => {
    // Keep the user's input as-is
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setSelectedVehicle(null)
    setShowYearSelection(true) // Show year selection for custom vehicle
    
    // Set default transport recommendation for unknown vehicles
    if (onTransportRecommendation) {
      const recommendation = {
        recommended: "open" as const,
        reason: "Standard open transport is suitable for this vehicle"
      }
      onTransportRecommendation(recommendation)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!enableSearch) return

    if (showYearSelection) {
      const yearOptions = getYearOptions()
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < yearOptions.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : yearOptions.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < yearOptions.length) {
            handleYearSelect(yearOptions[selectedIndex])
          }
          break
        case "Escape":
          setShowYearSelection(false)
          setSelectedIndex(-1)
          break
      }
      return
    }

    if (!showSuggestions) return

    const totalOptions = suggestions.length + (value.length >= 2 ? 1 : 0) // Include "Other" option

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else if (selectedIndex === suggestions.length && value.length >= 2) {
          handleOtherSelection()
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    if (!enableSearch) return

    if (showYearSelection) {
      return
    }
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!enableSearch) return

    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false)
        setShowYearSelection(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  const handleMouseEnterTooltip = (vehicle: GoogleSheetsVehicleModel) => {
    if (!enableSearch) return

    // Clear any pending hide timeout
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current)
      hideTooltipTimeoutRef.current = null
    }

    setShowTooltip(vehicle)
    // Use the exact years from the table
    setTooltipYearOptions(vehicle.availableYears || [])
  }

  const handleMouseLeaveTooltip = () => {
    if (!enableSearch) return

    // Set a delay before hiding the tooltip
    hideTooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(null)
      setTooltipYearOptions([])
    }, 300) // 300ms delay
  }

  const handleTooltipMouseEnter = () => {
    // Clear the hide timeout when mouse enters the tooltip
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current)
      hideTooltipTimeoutRef.current = null
    }
  }

  const handleTooltipMouseLeave = () => {
    // Hide tooltip when mouse leaves the tooltip area
    setShowTooltip(null)
    setTooltipYearOptions([])
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTooltipTimeoutRef.current) {
        clearTimeout(hideTooltipTimeoutRef.current)
      }
    }
  }, [])

  const getTooltipContent = (vehicle: GoogleSheetsVehicleModel): string => {
    const parts = [`${vehicle.make} ${vehicle.model}`]
    return parts.join("\n")
  }

  // Generate year options based on selected vehicle - using ONLY the years from your table
  const getYearOptions = (): string[] => {
    if (!selectedVehicle || !selectedVehicle.availableYears) {
      // For custom/other vehicles, provide a range of recent years
      const currentYear = new Date().getFullYear()
      const years: string[] = []
      for (let year = currentYear; year >= currentYear - 30; year--) {
        years.push(year.toString())
      }
      return years
    }
    return selectedVehicle.availableYears // Use exact years from your Google Sheets
  }

  const getYearOptionsForVehicle = (vehicle: GoogleSheetsVehicleModel): string[] => {
    return vehicle.availableYears || [] // Use exact years from your Google Sheets
  }

  const yearOptions = getYearOptions()

  return (
    <div className="space-y-2 relative z-[60000]">
      <Label
        htmlFor="vehicleModel"
        className={`text-sm font-medium ${showRequiredHint && !value ? "text-red-600" : "text-gray-700"}`}
      >
        Vehicle model
      </Label>

      {/* Data Status Indicator */}
      {enableSearch && error && (
        <div className="flex items-center space-x-2 text-xs text-amber-600 mb-2">
          <AlertCircle className="h-3 w-3" />
          <span>Using fallback data - Google Sheets connection failed</span>
          <Button variant="ghost" size="sm" onClick={refreshData} className="h-5 px-2 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            id="vehicleModel"
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={enableSearch ? placeholder : "Enter vehicle model (search enabled after Update Search)"}
            className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6371BE] focus:border-[#6371BE] text-gray-700 ${className} ${!enableSearch ? 'bg-gray-50' : ''}`}
            autoComplete="off"
            disabled={!enableSearch}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {enableSearch && isLoading && <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {/* Vehicle Suggestions Dropdown — rendered via portal to escape overflow clipping */}
        {mounted && enableSearch && showSuggestions && !showYearSelection && dropdownRect && createPortal(
          <Card
            ref={suggestionsRef}
            style={{
              position: "absolute",
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              zIndex: 99999,
            }}
            className="shadow-lg border-2 border-[#6371BE]/20 max-h-80 overflow-y-auto"
          >
            <CardContent className="p-0">
              {suggestions.map((vehicle, index) => (
                <div
                  key={`${vehicle.make}-${vehicle.model}-${index}`}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    index === selectedIndex ? "bg-[#6371BE]/10" : ""
                  }`}
                  onClick={() => handleSuggestionClick(vehicle)}
                  onMouseEnter={() => handleMouseEnterTooltip(vehicle)}
                  onMouseLeave={() => handleMouseLeaveTooltip()}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {vehicle.make} {vehicle.model}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {vehicle.category === "electric" && <Zap className="h-3 w-3 text-yellow-500" />}
                      {(vehicle.category === "luxury" || vehicle.category === "sports") && (
                        <Star className="h-3 w-3 text-purple-500" />
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {vehicle.aliases && vehicle.aliases.length > 0 && (
                    <div className="mt-1 text-xs text-gray-400">
                      Also: {vehicle.aliases.slice(0, 3).join(", ")}
                      {vehicle.aliases.length > 3 && "..."}
                    </div>
                  )}
                </div>
              ))}
              {value.length >= 2 && (
                <div
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    suggestions.length === selectedIndex ? "bg-[#6371BE]/10" : ""
                  }`}
                  onClick={() => handleOtherSelection()}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Other: &quot;{value}&quot;</div>
                        <div className="text-xs text-gray-500">Use custom vehicle model</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>,
          document.body
        )}

        {/* Year Selection Dropdown — portal */}
        {mounted && enableSearch && showYearSelection && yearOptions.length > 0 && dropdownRect && createPortal(
          <Card
            ref={suggestionsRef}
            style={{
              position: "absolute",
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              zIndex: 99999,
            }}
            className="shadow-lg border-2 border-[#6371BE]/20 max-h-60 overflow-y-auto"
          >
            <CardContent className="p-0">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-700">
                  Select year for {selectedVehicle?.make} {selectedVehicle?.model}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Available years from database: {yearOptions.length} option{yearOptions.length !== 1 ? 's' : ''}
                </div>
              </div>
              {yearOptions.map((yearOption, index) => (
                <div
                  key={yearOption}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    index === selectedIndex ? "bg-[#6371BE]/10" : ""
                  }`}
                  onClick={() => handleYearSelect(yearOption)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">{yearOption}</span>
                    {year === yearOption && <div className="w-2 h-2 bg-[#6371BE] rounded-full" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>,
          document.body
        )}

        {/* Vehicle Details tooltip — rendered via portal to escape overflow clipping */}
        {mounted && enableSearch && showTooltip && !showYearSelection && tooltipRect && createPortal(
          <div
            style={{
              position: "absolute",
              top: tooltipRect.top,
              left: tooltipRect.left,
              width: 320,
              zIndex: 99999,
            }}
          >
            <Card
              ref={tooltipRef}
              className="shadow-lg border-2 border-[#6371BE]/20"
              onMouseEnter={handleTooltipMouseEnter}
              onMouseLeave={handleTooltipMouseLeave}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-[#6371BE]" />
                  <span className="font-medium text-gray-900">Vehicle Details</span>
                </div>

                <div className="text-sm text-gray-600 mb-3">{getTooltipContent(showTooltip)}</div>

                {tooltipYearOptions.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                      {tooltipYearOptions.map((yearOption) => (
                        <button
                          key={yearOption}
                          onClick={() => handleTooltipYearSelect(yearOption, showTooltip)}
                          className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-[#6371BE] hover:text-white hover:border-[#6371BE] transition-colors"
                        >
                          {yearOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span
                        className={
                          showTooltip.transportRecommendation === "enclosed" ? "text-purple-600" : "text-blue-600"
                        }
                      >
                        {showTooltip.transportRecommendation === "enclosed"
                          ? "Recommended for protection of high-value vehicle"
                          : "Standard open transport is suitable for this vehicle"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
