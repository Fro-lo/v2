"use client"

import { useState, useEffect } from "react"
import { GoogleSheetsVehicleService, type GoogleSheetsVehicleModel } from "@/lib/google-sheets-vehicle-data"

// Configuration for your specific Google Sheets vehicle data
const VEHICLE_SHEETS_CONFIG = {
  // Your sheet ID extracted from the URL
  spreadsheetId: "1Y5MJSSDWNwh_igRbIOI1JCi_7oQPOrRYOUdZGnuTowM",
  gid: "275760104", // The specific tab ID
  range: "A:Z"
}

export function useGoogleSheetsVehicles() {
  const [vehicles, setVehicles] = useState<GoogleSheetsVehicleModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Create service instance
  const vehicleService = new GoogleSheetsVehicleService(VEHICLE_SHEETS_CONFIG)

  const fetchVehicles = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("Fetching vehicles from your Google Sheets...")
      const vehicleData = await vehicleService.fetchVehicleData()
      
      if (vehicleData && vehicleData.length > 0) {
        setVehicles(vehicleData)
        setLastFetch(new Date())
        console.log(`Successfully loaded ${vehicleData.length} vehicles from your Google Sheets`)
        
        // Log sample data for verification
        console.log("Sample vehicles from your sheet:", vehicleData.slice(0, 5))
      } else {
        throw new Error("No vehicle data received from your Google Sheets")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("Failed to fetch vehicles from your Google Sheets:", errorMessage)
      setError(`Google Sheets Connection Error: ${errorMessage}`)
      
      // Fall back to mock data
      console.log("Using fallback mock data...")
      const mockData = await vehicleService.getMockData()
      setVehicles(mockData)
      setLastFetch(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    fetchVehicles()
  }

  // Search function that works with your data
  const searchVehicles = (query: string, limit = 10) => {
    return vehicleService.searchModels(query, limit)
  }

  // Initial fetch
  useEffect(() => {
    fetchVehicles()
  }, [])

  return {
    vehicles,
    isLoading,
    error,
    searchVehicles,
    refreshData,
    lastFetch,
    cacheInfo: vehicleService.getCacheInfo()
  }
}
