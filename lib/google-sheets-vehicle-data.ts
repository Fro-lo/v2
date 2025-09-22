export interface GoogleSheetsVehicleModel {
  make: string
  model: string
  category: string
  years: string
  availableYears: string[] // New field for actual years from the table
  aliases?: string[]
  notes?: string
  transportRecommendation?: "open" | "enclosed"
  icon?: string
}

export interface GoogleSheetsVehicleConfig {
  spreadsheetId: string
  gid?: string
  range?: string
}

export class GoogleSheetsVehicleService {
  private config: GoogleSheetsVehicleConfig
  private vehicleCache: Map<string, GoogleSheetsVehicleModel> = new Map()
  private lastFetch: Date | null = null
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  constructor(config: GoogleSheetsVehicleConfig) {
    this.config = config
  }

  async fetchVehicleData(): Promise<GoogleSheetsVehicleModel[]> {
    try {
      console.log("Attempting to fetch vehicle data from your Google Sheets...")

      // Check if we have cached data that's still fresh
      if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION && this.vehicleCache.size > 0) {
        console.log("Using cached vehicle data")
        return Array.from(this.vehicleCache.values())
      }

      // Build the CSV export URL from your sheet ID
      const csvUrls = [
        `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/export?format=csv&gid=${this.config.gid}`,
        `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}/export?format=csv`,
        `https://docs.google.com/spreadsheets/d/e/2PACX-1vS${this.config.spreadsheetId}/pub?gid=${this.config.gid}&single=true&output=csv`
      ]

      for (const csvUrl of csvUrls) {
        try {
          console.log("Trying CSV export:", csvUrl)
          const response = await fetch(csvUrl, {
            headers: {
              Accept: "text/csv,text/plain,*/*",
            },
          })

          if (response.ok) {
            const csvText = await response.text()
            console.log("Vehicle CSV data received, length:", csvText.length)

            if (
              csvText.includes(",") &&
              csvText.split("\n").length > 1 &&
              !csvText.includes("does not exist") &&
              !csvText.includes("Sorry, the file") &&
              !csvText.includes("requested does not exist")
            ) {
              const parsedData = this.parseCSVData(csvText)
              console.log("Parsed vehicle models from your sheet:", parsedData.length)

              if (parsedData.length > 0) {
                // Update cache
                this.vehicleCache.clear()
                parsedData.forEach((vehicle, index) =>
                  this.vehicleCache.set(`${vehicle.make}-${vehicle.model}-${index}`, vehicle),
                )
                this.lastFetch = new Date()
                return parsedData
              }
            } else {
              console.warn("Received error page or invalid CSV data from:", csvUrl)
            }
          } else {
            console.warn(`CSV fetch failed with status: ${response.status} for URL: ${csvUrl}`)
          }
        } catch (csvError) {
          console.warn("CSV fetch error for URL:", csvUrl, csvError)
        }
      }

      throw new Error("Unable to access your Google Sheets data. Please ensure the sheet is published as CSV.")
    } catch (error) {
      console.error("Error fetching vehicle data:", error)
      throw error
    }
  }

  private parseCSVData(csvText: string): GoogleSheetsVehicleModel[] {
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = this.parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
    const rows = lines.slice(1).map((line) => this.parseCSVLine(line))

    console.log("Headers found in your sheet:", headers)
    console.log("Sample row from your sheet:", rows[0])
    console.log(`Processing ${rows.length} vehicle records from your Google Sheets`)

    // Group vehicles by make and model to collect all available years
    const vehicleGroups = new Map<string, {
      make: string
      model: string
      category: string
      years: Set<string>
      aliases?: string[]
      notes?: string
    }>()

    rows
      .filter((row) => row.some((cell) => cell && cell.trim())) // Filter out empty rows
      .forEach((row) => {
        const vehicle: any = {}

        headers.forEach((header, colIndex) => {
          const value = row[colIndex] || ""

          switch (true) {
            case header.includes("car brand") || header.includes("brand") || header === "make":
              if (value.trim()) {
                vehicle.make = value.trim()
              }
              break
            case header.includes("model") || header === "vehicle_model":
              if (value.trim()) {
                vehicle.model = value.trim()
              }
              break
            case header.includes("category") || header.includes("type"):
              if (value.trim()) {
                vehicle.category = this.mapCategoryToStandard(value.trim())
              }
              break
            case header.includes("year") && !header.includes("popular"):
              if (value.trim()) {
                vehicle.year = value.trim()
              }
              break
            case header.includes("alias") || header.includes("variant"):
              if (value.trim()) {
                vehicle.aliases = value
                  .split(",")
                  .map((a: string) => a.trim())
                  .filter((a: string) => a)
              }
              break
            case header.includes("note") || header.includes("description"):
              if (value.trim()) {
                vehicle.notes = value.trim()
              }
              break
          }
        })

        // Only process if we have required fields
        if (vehicle.make && vehicle.model) {
          const key = `${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}`
          
          if (!vehicleGroups.has(key)) {
            vehicleGroups.set(key, {
              make: vehicle.make,
              model: vehicle.model,
              category: vehicle.category || "sedan",
              years: new Set<string>(),
              aliases: vehicle.aliases,
              notes: vehicle.notes
            })
          }

          const group = vehicleGroups.get(key)!
          
          // Add the year from this row to the set of available years
          if (vehicle.year && vehicle.year.trim()) {
            group.years.add(vehicle.year.trim())
          }

          // Update category if not set or if we have a more specific one
          if (vehicle.category) {
            group.category = vehicle.category
          }

          // Merge aliases
          if (vehicle.aliases && vehicle.aliases.length > 0) {
            group.aliases = [...(group.aliases || []), ...vehicle.aliases]
              .filter((alias, index, arr) => arr.indexOf(alias) === index) // Remove duplicates
          }

          // Update notes
          if (vehicle.notes) {
            group.notes = vehicle.notes
          }
        }
      })

    // Convert grouped data to final format
    return Array.from(vehicleGroups.values()).map((group) => {
      const categoryDefaults: Record<string, { icon: string; transport: "open" | "enclosed" }> = {
        luxury: { icon: "✨", transport: "enclosed" },
        sedan: { icon: "🚗", transport: "open" },
        suv: { icon: "🚙", transport: "open" },
        truck: { icon: "🚚", transport: "open" },
        electric: { icon: "⚡", transport: "enclosed" },
        sports: { icon: "🏎️", transport: "enclosed" },
        classic: { icon: "🏛️", transport: "enclosed" },
        motorcycle: { icon: "🏍️", transport: "enclosed" },
      }

      const defaults = categoryDefaults[group.category] || categoryDefaults.sedan
      const availableYears = Array.from(group.years).sort((a, b) => {
        // Sort years numerically, with most recent first
        const yearA = parseInt(a)
        const yearB = parseInt(b)
        if (!isNaN(yearA) && !isNaN(yearB)) {
          return yearB - yearA // Descending order
        }
        return b.localeCompare(a) // Fallback to string comparison
      })

      // Create a display string for years
      let yearsDisplay: string
      if (availableYears.length === 1) {
        yearsDisplay = availableYears[0]
      } else if (availableYears.length <= 3) {
        yearsDisplay = availableYears.join(", ")
      } else {
        const minYear = availableYears[availableYears.length - 1]
        const maxYear = availableYears[0]
        yearsDisplay = `${minYear}-${maxYear} (${availableYears.length} years)`
      }

      return {
        make: group.make,
        model: group.model,
        category: group.category,
        years: yearsDisplay,
        availableYears: availableYears, // This is the key addition - exact years from your table
        aliases: group.aliases,
        notes: group.notes,
        transportRecommendation: defaults.transport,
        icon: defaults.icon,
      } as GoogleSheetsVehicleModel
    })
  }

  // Map categories from your sheet to our standard categories
  private mapCategoryToStandard(originalCategory: string): string {
    const category = originalCategory.toLowerCase()
    
    // Map your specific categories to our standard ones
    if (category.includes("minicompact") || category.includes("subcompact") || category.includes("compact")) return "sedan"
    if (category.includes("midsize") || category.includes("large cars")) return "sedan"
    if (category.includes("two seaters")) return "sports"
    if (category.includes("special purpose vehicle")) return "truck"
    if (category.includes("station wagon")) return "suv"
    if (category.includes("limousine")) return "luxury"
    
    // Default mappings
    if (category.includes("luxury") || category.includes("premium")) return "luxury"
    if (category.includes("suv") || category.includes("crossover") || category.includes("utility")) return "suv"
    if (category.includes("truck") || category.includes("pickup")) return "truck"
    if (category.includes("electric") || category.includes("hybrid") || category.includes("ev")) return "electric"
    if (category.includes("sport") || category.includes("performance") || category.includes("coupe")) return "sports"
    if (category.includes("classic") || category.includes("vintage") || category.includes("antique")) return "classic"
    if (category.includes("motorcycle") || category.includes("bike") || category.includes("scooter")) return "motorcycle"
    
    return "sedan" // default fallback
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  // Search functionality
  searchModels(query: string, limit = 10): GoogleSheetsVehicleModel[] {
    if (!query || query.length < 2) return []

    const vehicles = Array.from(this.vehicleCache.values())
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
  }

  // Public method to get mock data as fallback
  async getMockData(): Promise<GoogleSheetsVehicleModel[]> {
    return [
      { 
        make: "BMW", 
        model: "3 Series", 
        category: "sedan", 
        years: "1984", 
        availableYears: ["1984"],
        transportRecommendation: "enclosed", 
        icon: "🚗" 
      },
      { 
        make: "BMW", 
        model: "5 Series", 
        category: "sedan", 
        years: "1984", 
        availableYears: ["1984"],
        transportRecommendation: "enclosed", 
        icon: "🚗" 
      },
      // Add more mock data with availableYears...
    ]
  }

  // Get cache statistics
  getCacheInfo() {
    return {
      size: this.vehicleCache.size,
      lastFetch: this.lastFetch,
      isStale: this.lastFetch ? Date.now() - this.lastFetch.getTime() > this.CACHE_DURATION : true,
    }
  }
}
