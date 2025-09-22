"use client"

import { useState, useEffect, useCallback } from "react"
import { VehicleTransportPricingCalculator } from "@/lib/pricing-calculator"
import { GoogleSheetsCarrierService } from "@/lib/google-sheets-carrier-data"

interface Quote {
  id: string
  company: string
  price: number
  rating: number
  reviews: number
  pickup: string
  pickupRange: string
  delivery: string
  deliveryRange: string
  dotNumber: string
  mcNumber: string
  yearsInBusiness: number
  insuranceCoverage: number
  truck: string
  trailer: string
  vehicleType: string
  forVehicles: string
  slots: string
  trailerType: string
  state: string
  isLocal: boolean
  isEnclosed: boolean
  description: string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const DATA_FRESHNESS_THRESHOLD = 2 * 60 * 1000 // 2 minutes

// Helper function to calculate pickup date range
function calculatePickupRange(pickupDate: Date | undefined, timeframe: string): string {
  if (!pickupDate) return "TBD"

  // Parse timeframe (e.g., "1-3 days", "2-5 days", "same day")
  const timeframeLower = timeframe.toLowerCase()

  let minDays = 0
  let maxDays = 0

  if (timeframeLower.includes("same day")) {
    minDays = 0
    maxDays = 0
  } else if (timeframeLower.includes("next day")) {
    minDays = 1
    maxDays = 1
  } else {
    // Extract numbers from timeframe like "1-3 days" or "2-5 days"
    const matches = timeframeLower.match(/(\d+)[-–](\d+)\s*days?/)
    if (matches) {
      minDays = Number.parseInt(matches[1])
      maxDays = Number.parseInt(matches[2])
    } else {
      // Try to extract single number like "3 days"
      const singleMatch = timeframeLower.match(/(\d+)\s*days?/)
      if (singleMatch) {
        minDays = Number.parseInt(singleMatch[1])
        maxDays = minDays
      } else {
        // Default fallback
        minDays = 1
        maxDays = 3
      }
    }
  }

  const startDate = new Date(pickupDate)
  startDate.setDate(startDate.getDate() + minDays)

  const endDate = new Date(pickupDate)
  endDate.setDate(endDate.getDate() + maxDays)

  if (minDays === maxDays) {
    return startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
  } else {
    return `${startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })} - ${endDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })}`
  }
}

// Helper function to calculate delivery date range
function calculateDeliveryRange(deliveryDate: Date | undefined, timeframe: string): string {
  if (!deliveryDate) return "TBD"

  // Parse timeframe (e.g., "3-5 days", "4-7 days", "same day")
  const timeframeLower = timeframe.toLowerCase()

  let minDays = 0
  let maxDays = 0

  if (timeframeLower.includes("same day")) {
    minDays = 0
    maxDays = 0
  } else if (timeframeLower.includes("next day")) {
    minDays = 1
    maxDays = 1
  } else {
    // Extract numbers from timeframe like "3-5 days" or "4-7 days"
    const matches = timeframeLower.match(/(\d+)[-–](\d+)\s*days?/)
    if (matches) {
      minDays = Number.parseInt(matches[1])
      maxDays = Number.parseInt(matches[2])
    } else {
      // Try to extract single number like "5 days"
      const singleMatch = timeframeLower.match(/(\d+)\s*days?/)
      if (singleMatch) {
        minDays = Number.parseInt(singleMatch[1])
        maxDays = minDays
      } else {
        // Default fallback
        minDays = 3
        maxDays = 5
      }
    }
  }

  const startDate = new Date(deliveryDate)
  startDate.setDate(startDate.getDate() + minDays)

  const endDate = new Date(deliveryDate)
  endDate.setDate(endDate.getDate() + maxDays)

  if (minDays === maxDays) {
    return startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
  } else {
    return `${startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })} - ${endDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })}`
  }
}

export function useCarrierData(
  fromState: string,
  toState: string,
  distance: number,
  vehicleModel: string,
  vehicleCondition: string,
  pickupDate?: Date,
  deliveryDate?: Date,
  vehicleCategory?: string,
  fromCity?: string,
  toCity?: string,
) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const isDataFresh = lastFetch ? Date.now() - lastFetch.getTime() < DATA_FRESHNESS_THRESHOLD : false

  const fetchCarrierData = useCallback(async () => {
    if (!fromState || !toState || !distance || !vehicleModel || !vehicleCondition) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use the GoogleSheetsCarrierService to fetch data from your specific sheet
      // const carrierService = new GoogleSheetsCarrierService({
      //   spreadsheetId: process.env.NEXT_PUBLIC_CARRIER_SPREADSHEET_ID || "1LLjbVWiTawNgel1Ybpv3SsL9FRtSY3SM2tDUmq_dl98",
      //   gid: process.env.NEXT_PUBLIC_CARRIER_SHEET_GID || "1327223389",
      // })
            const carrierService = new GoogleSheetsCarrierService({
        spreadsheetId: process.env.NEXT_PUBLIC_CARRIER_SPREADSHEET_ID || "",
        gid: process.env.NEXT_PUBLIC_CARRIER_SHEET_GID || "",
      })

      const carrierData = await carrierService.fetchCarrierData()
      console.log("Fetched carrier data:", carrierData.length, "carriers")

      // Add debug logging right after fetching carrier data
      console.log(
        "Sample carrier data for debugging:",
        carrierData.slice(0, 2).map((c) => ({
          company: c.companyName,
          vehicleType: c.vehicleType,
          forVehicles: c.forVehicles,
          trailerType: c.trailerType,
          pricePerMile: c.pricePerMile,
          basePrice: c.basePrice,
        })),
      )

      // Filter out carriers with "On the way" status (В пути) or similar
      const availableCarriers = carrierData.filter((carrier) => {
        const status = carrier.status.toLowerCase().trim()
        const excludedStatuses = ["on the way", "on way", "в пути", "в дороге", "busy", "occupied", "unavailable"]
        return !excludedStatuses.some((excluded) => status.includes(excluded))
      })

      console.log("Available carriers after filtering:", availableCarriers.length)

      const processedQuotes: Quote[] = availableCarriers.map((carrier, index) => {
        // Calculate dynamic pricing based on the route and vehicle
        const season = pickupDate ? VehicleTransportPricingCalculator.getSeason(pickupDate) : "normal"

        let vehicleType: "sedan" | "suv" | "truck" | "motorcycle" | "classic" = "sedan"
        const modelLower = vehicleModel.toLowerCase()
        if (modelLower.includes("suv") || modelLower.includes("crossover")) {
          vehicleType = "suv"
        } else if (modelLower.includes("truck") || modelLower.includes("pickup")) {
          vehicleType = "truck"
        } else if (modelLower.includes("motorcycle") || modelLower.includes("bike")) {
          vehicleType = "motorcycle"
        } else if (modelLower.includes("classic") || modelLower.includes("vintage")) {
          vehicleType = "classic"
        }

        const pricingFactors = {
          distance,
          vehicleType,
          vehicleCategory,
          condition: vehicleCondition.toLowerCase() as "operable" | "inoperable",
          transportType: "open" as const,
          season,
          urgency: "standard" as const,
        }

        const pricingResult = VehicleTransportPricingCalculator.calculatePrice(pricingFactors, fromState, toState)

        // NEW PRICING FORMULA: (Calculator Base Price × Price Per Mile Coefficient) + Base Price
        const baseCalculatedPrice = pricingResult.breakdown.total
        const pricePerMileCoefficient = carrier.pricePerMile || 1.0
        const basePrice = carrier.basePrice || 0
        const finalPrice = Math.round(baseCalculatedPrice * pricePerMileCoefficient + basePrice)

        console.log(`Carrier ${carrier.companyName} price calculation:`)
        console.log(`- Base calculated price: $${baseCalculatedPrice}`)
        console.log(`- Price per mile coefficient: ${pricePerMileCoefficient}`)
        console.log(`- Base price: $${basePrice}`)
        console.log(`- Final price: $${finalPrice}`)

        // Check if this carrier offers enclosed transport based on vehicleType field from table
        const isEnclosed =
          carrier.vehicleType.toLowerCase().includes("enclosed") ||
          carrier.vehicleType.toLowerCase().includes("enclos") ||
          carrier.trailerType.toLowerCase().includes("enclosed")

        // Apply enclosed transport premium if applicable
        const adjustedPrice = isEnclosed ? Math.round(finalPrice * 1.2) : finalPrice

        // Calculate pickup range using the timeframe from your table
        const pickupRange = calculatePickupRange(pickupDate, carrier.pickupTimeframe)

        // Calculate delivery range using the timeframe from your table
        const deliveryRange = calculateDeliveryRange(deliveryDate, carrier.deliveryTimeframe)

        return {
          id: carrier.id,
          company: carrier.companyName,
          price: Math.max(400, adjustedPrice), // Ensure minimum price of $400
          rating: carrier.rating,
          reviews: carrier.reviewCount,
          pickup: pickupDate
            ? pickupDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
            : "TBD",
          pickupRange,
          delivery: deliveryDate
            ? deliveryDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
            : "TBD",
          deliveryRange,
          dotNumber: carrier.dotNumber,
          mcNumber: carrier.mcNumber,
          yearsInBusiness: carrier.yearsInBusiness,
          insuranceCoverage: carrier.insuranceCoverage,
          truck: carrier.truck,
          trailer: carrier.trailer,
          vehicleType: carrier.vehicleType, // Now correctly shows the actual Vehicle Type from your table
          forVehicles: carrier.forVehicles, // This shows what vehicles the carrier handles
          slots: carrier.slots,
          trailerType: carrier.trailerType,
          state: carrier.state,
          isLocal: carrier.state === fromState,
          isEnclosed, // This is determined by the vehicleType field containing "enclosed"
          description: carrier.description,
        }
      })

      // Sort by price (lowest first)
      processedQuotes.sort((a, b) => a.price - b.price)

      setQuotes(processedQuotes)
      setLastFetch(new Date())
      console.log("Successfully processed quotes:", processedQuotes.length)
    } catch (err) {
      console.error("Error fetching carrier data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch carrier data")

      // Generate fallback mock data with the new pricing structure
      const mockQuotes: Quote[] = Array.from({ length: 8 }, (_, index) => {
        const season = pickupDate ? VehicleTransportPricingCalculator.getSeason(pickupDate) : "normal"

        let vehicleType: "sedan" | "suv" | "truck" | "motorcycle" | "classic" = "sedan"
        const modelLower = vehicleModel.toLowerCase()
        if (modelLower.includes("suv") || modelLower.includes("crossover")) {
          vehicleType = "suv"
        } else if (modelLower.includes("truck") || modelLower.includes("pickup")) {
          vehicleType = "truck"
        } else if (modelLower.includes("motorcycle") || modelLower.includes("bike")) {
          vehicleType = "motorcycle"
        } else if (modelLower.includes("classic") || modelLower.includes("vintage")) {
          vehicleType = "classic"
        }

        const pricingFactors = {
          distance,
          vehicleType,
          vehicleCategory,
          condition: vehicleCondition.toLowerCase() as "operable" | "inoperable",
          transportType: "open" as const,
          season,
          urgency: "standard" as const,
        }

        const pricingResult = VehicleTransportPricingCalculator.calculatePrice(pricingFactors, fromState, toState)

        // Apply mock pricing formula
        const basePrice = pricingResult.breakdown.total
        const mockPricePerMile = 0.8 + Math.random() * 0.4 // Random coefficient between 0.8 and 1.2
        const mockBasePrice = 100 + Math.random() * 200 // Random base price between 100 and 300
        const finalPrice = Math.round(basePrice * mockPricePerMile + mockBasePrice)

        const isEnclosed = Math.random() > 0.7
        const adjustedPrice = isEnclosed ? Math.round(finalPrice * 1.2) : finalPrice

        const companies = [
          "МБАЛ ГРУЗЧИК",
          "СЕМЕН СИДОРОВ",
          "ГТК ГИН",
          "ИП Куликинов",
          "Prime Haulers",
          "Express Transport",
          "Trans Logistics",
          "Road Freight",
        ]

        const timeframes = [
          "1-3 days",
          "2-5 days",
          "1-2 days",
          "3-7 days",
          "same day",
          "2-4 days",
          "1-4 days",
          "3-5 days",
        ]
        const deliveryTimeframes = [
          "3-5 days",
          "4-7 days",
          "2-4 days",
          "5-8 days",
          "3-6 days",
          "4-6 days",
          "3-7 days",
          "5-7 days",
        ]
        const timeframe = timeframes[index] || "1-3 days"
        const deliveryTimeframe = deliveryTimeframes[index] || "3-5 days"
        const pickupRange = calculatePickupRange(pickupDate, timeframe)
        const deliveryRange = calculateDeliveryRange(deliveryDate, deliveryTimeframe)

        return {
          id: `mock-quote-${index}`,
          company: companies[index] || `Carrier ${index + 1}`,
          price: Math.max(400, adjustedPrice),
          rating: 4.0,
          reviews: 33,
          pickup: pickupDate
            ? pickupDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
            : "TBD",
          pickupRange,
          delivery: deliveryDate
            ? deliveryDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
            : "TBD",
          deliveryRange,
          dotNumber: `DOT23456${7 + index}`,
          mcNumber: `MC89012${3 + index}`,
          yearsInBusiness: 12,
          insuranceCoverage: 1000000,
          truck: `RAM-${4500 + index * 100}`,
          trailer: "5'3\" Dually 2021",
          vehicleType: isEnclosed ? "Enclosed" : "Open",
          forVehicles: "Sedan",
          slots: "Multi",
          trailerType: isEnclosed ? "Enclosed" : "Double Deck",
          state: "AL",
          isLocal: Math.random() > 0.5,
          isEnclosed,
          description: "Nationwide car transport",
        }
      })

      mockQuotes.sort((a, b) => a.price - b.price)
      setQuotes(mockQuotes)
      setLastFetch(new Date())
    } finally {
      setIsLoading(false)
    }
  }, [fromState, toState, distance, vehicleModel, vehicleCondition, pickupDate, deliveryDate, vehicleCategory])

  const refreshData = useCallback(() => {
    fetchCarrierData()
  }, [fetchCarrierData])

  const regenerateQuotes = useCallback(() => {
    fetchCarrierData()
  }, [fetchCarrierData])

  useEffect(() => {
    if (fromState && toState && distance && vehicleModel && vehicleCondition) {
      fetchCarrierData()
    }
  }, [fetchCarrierData])

  return {
    quotes,
    isLoading,
    error,
    refreshData,
    regenerateQuotes,
    lastFetch,
    isDataFresh,
  }
}
