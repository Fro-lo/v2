"use client"

import { useState, useEffect } from "react"
import { VehicleTransportPricingCalculator, type PricingFactors, type PricingResult } from "@/lib/pricing-calculator"
import { useZipLookup } from "./use-zip-lookup"

export function usePricing(
  fromCity: string,
  fromState: string,
  toCity: string,
  toState: string,
  vehicleModel: string,
  vehicleCondition: string,
  pickupStartDate?: Date,
  fromZip?: string,
  toZip?: string,
  vehicleCategory?: string,
) {
  const [pricing, setPricing] = useState<PricingResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { zipDatabase } = useZipLookup()

  useEffect(() => {
    const calculatePricing = async () => {
      // Only calculate if we have the minimum required data
      if (!fromCity || !fromState || !toCity || !toState || !vehicleModel || !vehicleCondition) {
        setPricing(null)
        return
      }

      setIsCalculating(true)
      setError(null)

      try {
        // Calculate distance using ZIP codes if available, otherwise fall back to city/state
        let distance: number
        if (fromZip && toZip && zipDatabase) {
          distance = await VehicleTransportPricingCalculator.calculateDistanceWithZips(
            fromCity,
            fromState,
            toCity,
            toState,
            fromZip,
            toZip,
            zipDatabase,
          )
        } else {
          distance = VehicleTransportPricingCalculator.calculateDistance(fromCity, fromState, toCity, toState)
        }

        // Determine vehicle type from model (simplified mapping)
        let vehicleType: PricingFactors["vehicleType"] = "sedan"
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

        // Determine season from pickupStartDate
        const season = pickupStartDate ? VehicleTransportPricingCalculator.getSeason(pickupStartDate) : "normal"

        const factors: PricingFactors = {
          distance,
          vehicleType,
          vehicleCategory, // Pass the specific vehicle category if available
          condition: vehicleCondition.toLowerCase() as "operable" | "inoperable",
          transportType: "open", // Default to open transport
          season,
          urgency: "standard", // Default to standard urgency
        }

        const result = VehicleTransportPricingCalculator.calculatePrice(factors, fromState, toState)
        setPricing(result)

        // Log pricing breakdown for debugging
        const breakdown = VehicleTransportPricingCalculator.getPricingBreakdown(factors, fromState, toState)
        console.log("Pricing Breakdown:", breakdown)
      } catch (err) {
        console.error("Error calculating pricing:", err)
        setError(err instanceof Error ? err.message : "Failed to calculate pricing")
        setPricing(null)
      } finally {
        setIsCalculating(false)
      }
    }

    calculatePricing()
  }, [
    fromCity,
    fromState,
    toCity,
    toState,
    vehicleModel,
    vehicleCondition,
    pickupStartDate,
    fromZip,
    toZip,
    vehicleCategory,
    zipDatabase,
  ])

  return {
    pricing,
    isCalculating,
    error,
  }
}
