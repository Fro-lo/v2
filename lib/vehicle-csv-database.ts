export interface VehicleCSVModel {
  make: string
  model: string
  category: "luxury" | "sedan" | "suv" | "truck" | "electric" | "sports" | "classic" | "motorcycle"
  years: string[]
  yearRange: string
  originalCategory: string
  aliases?: string[]
  transportRecommendation: "open" | "enclosed"
  icon: string
  popularity: number
}

export interface VehicleSearchResult {
  make: string
  model: string
  category: string
  years: string
  popularYears?: number[]
  aliases?: string[]
  notes?: string
  transportRecommendation: "open" | "enclosed"
  icon: string
}

export class VehicleCSVDatabase {
  private static vehicleData: Map<string, VehicleCSVModel> = new Map()
  private static isInitialized = false

  // Category mappings and properties
  private static categoryMappings = {
    luxury: {
      icon: "✨",
      transport: "enclosed" as const,
      keywords: ["luxury", "premium", "high-end", "executive"],
    },
    sedan: {
      icon: "🚗",
      transport: "open" as const,
      keywords: ["sedan", "compact", "midsize", "full-size", "economy"],
    },
    suv: {
      icon: "🚙",
      transport: "open" as const,
      keywords: ["suv", "crossover", "utility", "van", "minivan"],
    },
    truck: {
      icon: "🚚",
      transport: "open" as const,
      keywords: ["truck", "pickup", "commercial"],
    },
    electric: {
      icon: "⚡",
      transport: "enclosed" as const,
      keywords: ["electric", "hybrid", "ev", "plug-in"],
    },
    sports: {
      icon: "🏎️",
      transport: "enclosed" as const,
      keywords: ["sport", "performance", "coupe", "convertible", "roadster"],
    },
    classic: {
      icon: "🏛️",
      transport: "enclosed" as const,
      keywords: ["classic", "vintage", "antique", "collectible"],
    },
    motorcycle: {
      icon: "🏍️",
      transport: "enclosed" as const,
      keywords: ["motorcycle", "bike", "scooter", "moped"],
    },
  }

  // Initialize the database by fetching CSV data
  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("Initializing Vehicle CSV Database...")

      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Vehicles%20-%20Vehicles-HxBttQ4cFrBSNroFcDmjwAIGgeA4DU.csv",
      )
      const csvText = await response.text()

      const vehicles = this.parseCSVData(csvText)
      console.log(`Loaded ${vehicles.length} vehicles from CSV`)

      // Process and store vehicles
      const uniqueVehicles = new Map<string, VehicleCSVModel>()

      vehicles.forEach((vehicle) => {
        const key = `${vehicle.brand} ${vehicle.model}`.toLowerCase().trim()

        if (!uniqueVehicles.has(key)) {
          const category = this.mapCategory(vehicle.category)
          const categoryProps = this.categoryMappings[category]

          uniqueVehicles.set(key, {
            make: vehicle.brand,
            model: vehicle.model,
            category,
            years: [vehicle.year],
            yearRange: vehicle.year,
            originalCategory: vehicle.category,
            transportRecommendation: categoryProps.transport,
            icon: categoryProps.icon,
            popularity: 1,
          })
        } else {
          const existing = uniqueVehicles.get(key)!
          if (!existing.years.includes(vehicle.year)) {
            existing.years.push(vehicle.year)
            existing.popularity++
          }
        }
      })

      // Sort years and create year ranges
      uniqueVehicles.forEach((vehicle) => {
        const numericYears = vehicle.years
          .filter((y) => y !== "Unknown" && !isNaN(Number.parseInt(y)))
          .map((y) => Number.parseInt(y))
          .sort((a, b) => a - b)

        if (numericYears.length > 0) {
          const minYear = Math.min(...numericYears)
          const maxYear = Math.max(...numericYears)
          vehicle.yearRange = minYear === maxYear ? minYear.toString() : `${minYear}-${maxYear}`
        } else {
          vehicle.yearRange = vehicle.years.join(", ")
        }
      })

      this.vehicleData = uniqueVehicles
      this.isInitialized = true

      console.log(`Processed ${this.vehicleData.size} unique vehicle models`)
    } catch (error) {
      console.error("Failed to initialize Vehicle CSV Database:", error)
      // Fallback to empty database
      this.vehicleData = new Map()
      this.isInitialized = true
    }
  }

  private static parseCSVData(
    csvText: string,
  ): Array<{ brand: string; model: string; category: string; year: string }> {
    const lines = csvText.split("\n").filter((line) => line.trim())
    const vehicles: Array<{ brand: string; model: string; category: string; year: string }> = []

    for (let i = 1; i < lines.length; i++) {
      // Skip header
      const values = this.parseCSVLine(lines[i])
      if (values.length >= 4 && values[0] && values[1]) {
        vehicles.push({
          brand: values[0].trim(),
          model: values[1].trim(),
          category: values[2] ? values[2].trim() : "Unknown",
          year: values[3] ? values[3].trim() : "Unknown",
        })
      }
    }

    return vehicles
  }

  private static parseCSVLine(line: string): string[] {
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

  private static mapCategory(originalCategory: string): VehicleCSVModel["category"] {
    if (!originalCategory || originalCategory === "Unknown") return "sedan"

    const category = originalCategory.toLowerCase()

    // Check each category mapping
    for (const [categoryKey, props] of Object.entries(this.categoryMappings)) {
      if (props.keywords.some((keyword) => category.includes(keyword))) {
        return categoryKey as VehicleCSVModel["category"]
      }
    }

    return "sedan" // default fallback
  }

  // Search vehicles by query
  static async search(query: string, limit = 10): Promise<VehicleSearchResult[]> {
    await this.initialize()

    if (!query || query.length < 2) return []

    const queryLower = query.toLowerCase().trim()
    const results: Array<{ vehicle: VehicleCSVModel; relevance: number }> = []

    for (const [key, vehicle] of this.vehicleData.entries()) {
      let relevance = 0

      // Exact match gets highest relevance
      const fullName = `${vehicle.make} ${vehicle.model}`.toLowerCase()
      if (fullName === queryLower) {
        relevance = 1000
      } else if (fullName.startsWith(queryLower)) {
        relevance = 900
      } else if (fullName.includes(queryLower)) {
        relevance = 800
      }

      // Make exact match
      if (vehicle.make.toLowerCase() === queryLower) {
        relevance = Math.max(relevance, 700)
      } else if (vehicle.make.toLowerCase().startsWith(queryLower)) {
        relevance = Math.max(relevance, 600)
      } else if (vehicle.make.toLowerCase().includes(queryLower)) {
        relevance = Math.max(relevance, 500)
      }

      // Model exact match
      if (vehicle.model.toLowerCase() === queryLower) {
        relevance = Math.max(relevance, 650)
      } else if (vehicle.model.toLowerCase().startsWith(queryLower)) {
        relevance = Math.max(relevance, 550)
      } else if (vehicle.model.toLowerCase().includes(queryLower)) {
        relevance = Math.max(relevance, 450)
      }

      // Add popularity bonus
      relevance += Math.min(vehicle.popularity * 10, 100)

      if (relevance > 0) {
        results.push({ vehicle, relevance })
      }
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(({ vehicle }) => this.formatSearchResult(vehicle))
  }

  private static formatSearchResult(vehicle: VehicleCSVModel): VehicleSearchResult {
    const categoryProps = this.categoryMappings[vehicle.category]

    // Extract popular years (most common years)
    const yearCounts = new Map<string, number>()
    vehicle.years.forEach((year) => {
      if (year !== "Unknown" && !isNaN(Number.parseInt(year))) {
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1)
      }
    })

    const popularYears = Array.from(yearCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([year]) => Number.parseInt(year))
      .filter((year) => !isNaN(year))
      .sort((a, b) => b - a) // Most recent first

    return {
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      years: vehicle.yearRange,
      popularYears: popularYears.length > 0 ? popularYears : undefined,
      transportRecommendation: vehicle.transportRecommendation,
      icon: vehicle.icon,
      notes:
        vehicle.originalCategory !== vehicle.category
          ? `Originally categorized as: ${vehicle.originalCategory}`
          : undefined,
    }
  }

  // Get vehicle by exact make and model
  static async getVehicle(make: string, model: string): Promise<VehicleSearchResult | null> {
    await this.initialize()

    const key = `${make} ${model}`.toLowerCase().trim()
    const vehicle = this.vehicleData.get(key)

    return vehicle ? this.formatSearchResult(vehicle) : null
  }

  // Get vehicles by make
  static async getVehiclesByMake(make: string): Promise<VehicleSearchResult[]> {
    await this.initialize()

    const makeLower = make.toLowerCase().trim()
    const results: VehicleCSVModel[] = []

    for (const vehicle of this.vehicleData.values()) {
      if (vehicle.make.toLowerCase() === makeLower) {
        results.push(vehicle)
      }
    }

    return results.sort((a, b) => b.popularity - a.popularity).map((vehicle) => this.formatSearchResult(vehicle))
  }

  // Get popular vehicles
  static async getPopularVehicles(limit = 20): Promise<VehicleSearchResult[]> {
    await this.initialize()

    return Array.from(this.vehicleData.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
      .map((vehicle) => this.formatSearchResult(vehicle))
  }

  // Get vehicles by category
  static async getVehiclesByCategory(category: VehicleCSVModel["category"]): Promise<VehicleSearchResult[]> {
    await this.initialize()

    const results: VehicleCSVModel[] = []

    for (const vehicle of this.vehicleData.values()) {
      if (vehicle.category === category) {
        results.push(vehicle)
      }
    }

    return results.sort((a, b) => b.popularity - a.popularity).map((vehicle) => this.formatSearchResult(vehicle))
  }

  // Get database statistics
  static async getStatistics() {
    await this.initialize()

    const stats = {
      totalVehicles: this.vehicleData.size,
      byCategory: {} as Record<string, number>,
      byMake: {} as Record<string, number>,
      topMakes: [] as Array<{ make: string; count: number }>,
      topCategories: [] as Array<{ category: string; count: number }>,
    }

    // Count by category and make
    for (const vehicle of this.vehicleData.values()) {
      stats.byCategory[vehicle.category] = (stats.byCategory[vehicle.category] || 0) + 1
      stats.byMake[vehicle.make] = (stats.byMake[vehicle.make] || 0) + 1
    }

    // Get top makes
    stats.topMakes = Object.entries(stats.byMake)
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    // Get categories
    stats.topCategories = Object.entries(stats.byCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    return stats
  }

  // Format vehicle display name
  static formatVehicleDisplay(vehicle: VehicleSearchResult): string {
    return `${vehicle.make} ${vehicle.model}`
  }

  // Get vehicle tooltip information
  static getVehicleTooltip(vehicle: VehicleSearchResult): string {
    const parts = [`${vehicle.make} ${vehicle.model}`, `Category: ${vehicle.category}`, `Years: ${vehicle.years}`]

    if (vehicle.popularYears && vehicle.popularYears.length > 0) {
      parts.push(`Popular years: ${vehicle.popularYears.join(", ")}`)
    }

    if (vehicle.notes) {
      parts.push(`Note: ${vehicle.notes}`)
    }

    const categoryProps = this.categoryMappings[vehicle.category as keyof typeof this.categoryMappings]
    if (categoryProps) {
      const transportText =
        vehicle.transportRecommendation === "enclosed"
          ? "Enclosed transport recommended for protection"
          : "Standard open transport suitable"
      parts.push(`Transport: ${transportText}`)
    }

    return parts.join("\n")
  }

  // Get transport recommendation
  static getTransportRecommendation(vehicle: VehicleSearchResult): {
    recommended: "open" | "enclosed"
    reason: string
  } {
    const reasons = {
      luxury: "Recommended for protection of luxury vehicle",
      sports: "Recommended for protection of sports vehicle",
      electric: "Recommended for protection of electric vehicle",
      classic: "Required for protection of classic vehicle",
      motorcycle: "Motorcycles typically require enclosed transport",
      sedan: "Standard open transport is suitable for this vehicle",
      suv: "Standard open transport is suitable for this vehicle",
      truck: "Standard open transport is suitable for this vehicle",
    }

    return {
      recommended: vehicle.transportRecommendation,
      reason: reasons[vehicle.category as keyof typeof reasons] || reasons.sedan,
    }
  }
}
