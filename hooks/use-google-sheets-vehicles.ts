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
      console.log("[Google Sheets] 🚗 Hook: Начало загрузки транспортных средств")
      console.log("[Google Sheets] 📊 Конфигурация hook:", VEHICLE_SHEETS_CONFIG)
      
      const fetchStartTime = Date.now()
      const vehicleData = await vehicleService.fetchVehicleData()
      const fetchDuration = Date.now() - fetchStartTime
      
      console.log("[Google Sheets] ⏱️  Hook: Загрузка завершена за", `${fetchDuration}мс`)
      
      if (vehicleData && vehicleData.length > 0) {
        setVehicles(vehicleData)
        setLastFetch(new Date())
        console.log(`[Google Sheets] ✅ Hook: Успешно загружено ${vehicleData.length} транспортных средств`)
        
        // Log sample data for verification
        console.log("[Google Sheets] 📋 Hook: Примеры загруженных моделей:", vehicleData.slice(0, 5).map(v => ({
          make: v.make,
          model: v.model,
          category: v.category,
          years: v.years,
        })))
      } else {
        console.error("[Google Sheets] ❌ Hook: Данные не получены из Google Sheets")
        throw new Error("No vehicle data received from your Google Sheets")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("[Google Sheets] ❌ Hook: Ошибка при загрузке транспортных средств:", errorMessage)
      setError(`Google Sheets Connection Error: ${errorMessage}`)
      
      // Fall back to mock data
      console.log("[Google Sheets] 🔄 Hook: Использование mock данных...")
      const mockData = await vehicleService.getMockData()
      setVehicles(mockData)
      setLastFetch(new Date())
      console.log("[Google Sheets] ✅ Hook: Загружено", mockData.length, "mock моделей")
    } finally {
      setIsLoading(false)
      console.log("[Google Sheets] ✅ Hook: Загрузка завершена, isLoading = false")
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
