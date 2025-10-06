"use client"

import { useState, useCallback, useEffect } from "react"
import { ZipCodeDatabase } from "@/lib/zip-code-database"

export interface ZipLookupResult {
  city: string
  stateCode: string
  stateName: string
  county?: string
  latitude: number
  longitude: number
  population?: number
}

export function useZipLookup() {
  const [isLoading, setIsLoading] = useState(false)
  const [database, setDatabase] = useState<ZipCodeDatabase | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize database
  useEffect(() => {
    const zipDb = new ZipCodeDatabase({
      spreadsheetId: "1A7uAA4mu1hdrVnG8G9qkycJhpj26tVheB3MEabAiuiQ", // Your new ZIP code spreadsheet ID
      gid: "1343694376", // Your specific sheet tab ID
      range: "A:Z",
    })
    setDatabase(zipDb)
  }, [])

  // Create a stable lookup function that doesn't change on every render
  const lookupZipCode = useCallback(
    async (zipCode: string): Promise<ZipLookupResult | null> => {
      if (!database || !zipCode || zipCode.length !== 5) return null

      setIsLoading(true)
      setError(null)

      try {
        const result = await database.lookupZipCode(zipCode)

        if (!result) {
          return null
        }

        return {
          city: result.city,
          stateCode: result.stateCode,
          stateName: result.state,
          county: result.county,
          latitude: result.latitude,
          longitude: result.longitude,
          population: result.population,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to lookup ZIP code"
        setError(errorMessage)
        console.error("Error looking up ZIP code:", err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [database], // Only depend on database, which is stable
  )

  const calculateDistance = useCallback(
    async (fromZip: string, toZip: string): Promise<number | null> => {
      if (!database) return null

      try {
        return await database.calculateZipDistance(fromZip, toZip)
      } catch (err) {
        console.error("Error calculating distance:", err)
        return null
      }
    },
    [database],
  )

  const searchByCity = useCallback(
    async (city: string, stateCode?: string): Promise<ZipLookupResult[]> => {
      if (!database || !city.trim()) return []

      try {
        const results = await database.searchByCity(city, stateCode)
        return results.map((result) => ({
          city: result.city,
          stateCode: result.stateCode,
          stateName: result.state,
          county: result.county,
          latitude: result.latitude,
          longitude: result.longitude,
          population: result.population,
        }))
      } catch (err) {
        console.error("Error searching by city:", err)
        return []
      }
    },
    [database],
  )

  const getCacheInfo = useCallback(() => {
    return database?.getCacheInfo() || { size: 0, lastFetch: null, isStale: true }
  }, [database])

  return {
    lookupZipCode,
    calculateDistance,
    searchByCity,
    getCacheInfo,
    isLoading,
    error,
    database, // Expose the database instance
  }
}
