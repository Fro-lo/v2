"use client"

import { useState, useEffect } from "react"
import { CSVPricingCalculator } from "@/lib/csv-pricing-calculator"

export function useCSVPricing(
  fromCity: string,
  fromState: string,
  toCity: string,
  toState: string,
  vehicleModel: string,
  vehicleCondition: string,
  pickupDate?: Date,
) {
  const [pricing, setPricing] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fromCity || !fromState || !toCity || !toState || !vehicleModel) {
      setPricing(null)
      return
    }

    setIsCalculating(true)
    setError(null)

    // Simple distance calculation (will be enhanced)
    const calculateDistance = (fromState: string, toState: string): number => {
      const stateCodes = [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
      ]
      const fromIndex = stateCodes.indexOf(fromState.toUpperCase())
      const toIndex = stateCodes.indexOf(toState.toUpperCase())

      if (fromIndex === -1 || toIndex === -1) return 1000

      const stateDifference = Math.abs(fromIndex - toIndex)
      return Math.max(200, stateDifference * 100)
    }

    const distance = calculateDistance(fromState, toState)

    CSVPricingCalculator.calculatePrice(distance, vehicleModel, vehicleCondition, fromState, toState)
      .then((result) => {
        setPricing(result)
        setIsCalculating(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsCalculating(false)
      })
  }, [fromCity, fromState, toCity, toState, vehicleModel, vehicleCondition, pickupDate])

  return { pricing, isCalculating, error }
}
