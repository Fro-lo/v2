"use client"

import { useState, useEffect, useCallback } from "react"
import { VehicleCSVDatabase, type VehicleSearchResult } from "@/lib/vehicle-csv-database"

export function useCSVVehicleData() {
  const [vehicles, setVehicles] = useState<VehicleSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [statistics, setStatistics] = useState<any>(null)

  // Initialize the database
  const initializeDatabase = useCallback(async () => {
    if (isInitialized) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Initializing CSV Vehicle Database...")
      await VehicleCSVDatabase.initialize()

      // Load popular vehicles as default
      const popularVehicles = await VehicleCSVDatabase.getPopularVehicles(50)
      setVehicles(popularVehicles)

      // Load statistics
      const stats = await VehicleCSVDatabase.getStatistics()
      setStatistics(stats)

      setIsInitialized(true)
      setLastFetch(new Date())

      console.log(`Initialized with ${popularVehicles.length} popular vehicles`)
      console.log(`Total vehicles in database: ${stats.totalVehicles}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize vehicle database"
      setError(errorMessage)
      console.error("Error initializing CSV vehicle database:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  // Search vehicles
  const searchVehicles = useCallback(
    async (query: string, limit = 10): Promise<VehicleSearchResult[]> => {
      if (!isInitialized) {
        await initializeDatabase()
      }

      try {
        const results = await VehicleCSVDatabase.search(query, limit)
        return results
      } catch (err) {
        console.error("Error searching vehicles:", err)
        return []
      }
    },
    [isInitialized, initializeDatabase],
  )

  // Get vehicle by exact match
  const getVehicle = useCallback(
    async (make: string, model: string): Promise<VehicleSearchResult | null> => {
      if (!isInitialized) {
        await initializeDatabase()
      }

      try {
        return await VehicleCSVDatabase.getVehicle(make, model)
      } catch (err) {
        console.error("Error getting vehicle:", err)
        return null
      }
    },
    [isInitialized, initializeDatabase],
  )

  // Get vehicles by make
  const getVehiclesByMake = useCallback(
    async (make: string): Promise<VehicleSearchResult[]> => {
      if (!isInitialized) {
        await initializeDatabase()
      }

      try {
        return await VehicleCSVDatabase.getVehiclesByMake(make)
      } catch (err) {
        console.error("Error getting vehicles by make:", err)
        return []
      }
    },
    [isInitialized, initializeDatabase],
  )

  // Get vehicles by category
  const getVehiclesByCategory = useCallback(
    async (category: string): Promise<VehicleSearchResult[]> => {
      if (!isInitialized) {
        await initializeDatabase()
      }

      try {
        return await VehicleCSVDatabase.getVehiclesByCategory(category as any)
      } catch (err) {
        console.error("Error getting vehicles by category:", err)
        return []
      }
    },
    [isInitialized, initializeDatabase],
  )

  // Get popular vehicles
  const getPopularVehicles = useCallback(
    async (limit = 20): Promise<VehicleSearchResult[]> => {
      if (!isInitialized) {
        await initializeDatabase()
      }

      try {
        return await VehicleCSVDatabase.getPopularVehicles(limit)
      } catch (err) {
        console.error("Error getting popular vehicles:", err)
        return []
      }
    },
    [isInitialized, initializeDatabase],
  )

  // Get transport recommendation
  const getTransportRecommendation = useCallback((vehicle: VehicleSearchResult) => {
    return VehicleCSVDatabase.getTransportRecommendation(vehicle)
  }, [])

  // Get vehicle tooltip
  const getVehicleTooltip = useCallback((vehicle: VehicleSearchResult): string => {
    return VehicleCSVDatabase.getVehicleTooltip(vehicle)
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeDatabase()
  }, [initializeDatabase])

  const isDataFresh = lastFetch && Date.now() - lastFetch.getTime() < 60 * 60 * 1000 // 1 hour

  return {
    vehicles,
    isLoading,
    isInitialized,
    error,
    statistics,
    searchVehicles,
    getVehicle,
    getVehiclesByMake,
    getVehiclesByCategory,
    getPopularVehicles,
    getTransportRecommendation,
    getVehicleTooltip,
    refreshData: initializeDatabase,
    lastFetch,
    isDataFresh,
  }
}
