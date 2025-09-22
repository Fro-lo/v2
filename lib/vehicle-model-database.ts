export interface VehicleModel {
  make: string
  model: string
  category: string
  years: string
  popularYears?: number[]
  aliases?: string[]
  notes?: string
}

export interface VehicleMake {
  name: string
  country: string
  category: string
  models: string[]
}

export class VehicleModelDatabase {
  private static vehicleData: VehicleModel[] = [
    // Luxury Vehicles
    {
      make: "BMW",
      model: "3 Series",
      category: "luxury",
      years: "1975-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
      aliases: ["320i", "330i", "335i", "340i"],
    },
    {
      make: "BMW",
      model: "5 Series",
      category: "luxury",
      years: "1972-present",
      popularYears: [2017, 2018, 2019, 2020, 2021],
      aliases: ["520i", "530i", "540i", "550i"],
    },
    {
      make: "BMW",
      model: "X3",
      category: "luxury",
      years: "2003-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "BMW",
      model: "X5",
      category: "luxury",
      years: "1999-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
    },
    {
      make: "Mercedes-Benz",
      model: "C-Class",
      category: "luxury",
      years: "1993-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
      aliases: ["C300", "C350", "C43", "C63"],
    },
    {
      make: "Mercedes-Benz",
      model: "E-Class",
      category: "luxury",
      years: "1953-present",
      popularYears: [2017, 2018, 2019, 2020, 2021],
      aliases: ["E300", "E350", "E450", "E53"],
    },
    {
      make: "Mercedes-Benz",
      model: "GLE",
      category: "luxury",
      years: "2015-present",
      popularYears: [2020, 2021, 2022, 2023],
    },
    {
      make: "Audi",
      model: "A4",
      category: "luxury",
      years: "1994-present",
      popularYears: [2017, 2018, 2019, 2020, 2021],
    },
    {
      make: "Audi",
      model: "Q5",
      category: "luxury",
      years: "2008-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Lexus",
      model: "RX",
      category: "luxury",
      years: "1998-present",
      popularYears: [2016, 2017, 2018, 2019, 2020],
    },
    {
      make: "Lexus",
      model: "ES",
      category: "luxury",
      years: "1989-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
    },

    // Popular Sedans
    {
      make: "Toyota",
      model: "Camry",
      category: "sedan",
      years: "1982-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Toyota",
      model: "Corolla",
      category: "sedan",
      years: "1966-present",
      popularYears: [2020, 2021, 2022, 2023, 2024],
    },
    {
      make: "Honda",
      model: "Accord",
      category: "sedan",
      years: "1976-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Honda",
      model: "Civic",
      category: "sedan",
      years: "1972-present",
      popularYears: [2016, 2017, 2018, 2019, 2020],
    },
    {
      make: "Nissan",
      model: "Altima",
      category: "sedan",
      years: "1992-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
    },
    {
      make: "Nissan",
      model: "Sentra",
      category: "sedan",
      years: "1982-present",
      popularYears: [2020, 2021, 2022, 2023],
    },
    {
      make: "Hyundai",
      model: "Elantra",
      category: "sedan",
      years: "1990-present",
      popularYears: [2017, 2018, 2019, 2020, 2021],
    },
    {
      make: "Hyundai",
      model: "Sonata",
      category: "sedan",
      years: "1985-present",
      popularYears: [2020, 2021, 2022, 2023],
    },

    // SUVs
    {
      make: "Toyota",
      model: "RAV4",
      category: "suv",
      years: "1994-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
    },
    {
      make: "Toyota",
      model: "Highlander",
      category: "suv",
      years: "2000-present",
      popularYears: [2020, 2021, 2022, 2023],
    },
    {
      make: "Honda",
      model: "CR-V",
      category: "suv",
      years: "1995-present",
      popularYears: [2017, 2018, 2019, 2020, 2021],
    },
    {
      make: "Honda",
      model: "Pilot",
      category: "suv",
      years: "2002-present",
      popularYears: [2016, 2017, 2018, 2019, 2020],
    },
    { make: "Ford", model: "Explorer", category: "suv", years: "1990-present", popularYears: [2020, 2021, 2022, 2023] },
    { make: "Ford", model: "Escape", category: "suv", years: "2000-present", popularYears: [2020, 2021, 2022, 2023] },
    { make: "Chevrolet", model: "Tahoe", category: "suv", years: "1995-present", popularYears: [2021, 2022, 2023] },
    {
      make: "Chevrolet",
      model: "Equinox",
      category: "suv",
      years: "2004-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Jeep",
      model: "Grand Cherokee",
      category: "suv",
      years: "1992-present",
      popularYears: [2017, 2018, 2019, 2020, 2021],
    },
    {
      make: "Jeep",
      model: "Wrangler",
      category: "suv",
      years: "1986-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },

    // Trucks
    {
      make: "Ford",
      model: "F-150",
      category: "truck",
      years: "1975-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Chevrolet",
      model: "Silverado",
      category: "truck",
      years: "1999-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
      aliases: ["Silverado 1500", "Silverado 2500", "Silverado 3500"],
    },
    {
      make: "Ram",
      model: "1500",
      category: "truck",
      years: "2009-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
    },
    {
      make: "Toyota",
      model: "Tacoma",
      category: "truck",
      years: "1995-present",
      popularYears: [2016, 2017, 2018, 2019, 2020],
    },
    { make: "Toyota", model: "Tundra", category: "truck", years: "1999-present", popularYears: [2022, 2023] },
    {
      make: "GMC",
      model: "Sierra",
      category: "truck",
      years: "1999-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
      aliases: ["Sierra 1500", "Sierra 2500", "Sierra 3500"],
    },

    // Electric Vehicles
    {
      make: "Tesla",
      model: "Model 3",
      category: "electric",
      years: "2017-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Tesla",
      model: "Model Y",
      category: "electric",
      years: "2020-present",
      popularYears: [2020, 2021, 2022, 2023],
    },
    { make: "Tesla", model: "Model S", category: "electric", years: "2012-present", popularYears: [2021, 2022, 2023] },
    { make: "Tesla", model: "Model X", category: "electric", years: "2015-present", popularYears: [2021, 2022, 2023] },

    // Sports Cars
    {
      make: "Porsche",
      model: "911",
      category: "sports",
      years: "1963-present",
      popularYears: [2019, 2020, 2021, 2022, 2023],
    },
    {
      make: "Porsche",
      model: "Cayenne",
      category: "sports",
      years: "2002-present",
      popularYears: [2019, 2020, 2021, 2022],
    },
    {
      make: "Corvette",
      model: "Stingray",
      category: "sports",
      years: "2020-present",
      popularYears: [2020, 2021, 2022, 2023],
    },
    {
      make: "Ford",
      model: "Mustang",
      category: "sports",
      years: "1964-present",
      popularYears: [2015, 2016, 2017, 2018, 2019],
    },

    // Classic/Vintage
    {
      make: "Ford",
      model: "Mustang",
      category: "classic",
      years: "1964-1973",
      popularYears: [1965, 1966, 1967, 1968, 1969],
      notes: "Classic muscle car era",
    },
    {
      make: "Chevrolet",
      model: "Camaro",
      category: "classic",
      years: "1966-1969",
      popularYears: [1967, 1968, 1969],
      notes: "First generation classic",
    },
    {
      make: "Dodge",
      model: "Charger",
      category: "classic",
      years: "1966-1978",
      popularYears: [1968, 1969, 1970],
      notes: "Classic muscle car",
    },
    {
      make: "Plymouth",
      model: "Barracuda",
      category: "classic",
      years: "1964-1974",
      popularYears: [1970, 1971],
      notes: "Classic pony car",
    },

    // Motorcycles
    {
      make: "Harley-Davidson",
      model: "Street Glide",
      category: "motorcycle",
      years: "2006-present",
      popularYears: [2018, 2019, 2020, 2021, 2022],
    },
    {
      make: "Harley-Davidson",
      model: "Sportster",
      category: "motorcycle",
      years: "1957-present",
      popularYears: [2019, 2020, 2021, 2022],
    },
    {
      make: "Honda",
      model: "Gold Wing",
      category: "motorcycle",
      years: "1975-present",
      popularYears: [2018, 2019, 2020, 2021],
    },
    {
      make: "Yamaha",
      model: "R1",
      category: "motorcycle",
      years: "1998-present",
      popularYears: [2015, 2016, 2017, 2018, 2019],
    },
    {
      make: "Kawasaki",
      model: "Ninja",
      category: "motorcycle",
      years: "1984-present",
      popularYears: [2018, 2019, 2020, 2021],
    },
  ]

  private static makes: VehicleMake[] = [
    {
      name: "Toyota",
      country: "Japan",
      category: "mainstream",
      models: ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "Tacoma", "Tundra"],
    },
    {
      name: "Honda",
      country: "Japan",
      category: "mainstream",
      models: ["Accord", "Civic", "CR-V", "Pilot", "Odyssey"],
    },
    {
      name: "Ford",
      country: "USA",
      category: "mainstream",
      models: ["F-150", "Explorer", "Escape", "Mustang", "Focus", "Fusion"],
    },
    {
      name: "Chevrolet",
      country: "USA",
      category: "mainstream",
      models: ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban"],
    },
    {
      name: "BMW",
      country: "Germany",
      category: "luxury",
      models: ["3 Series", "5 Series", "X3", "X5", "7 Series", "X1"],
    },
    {
      name: "Mercedes-Benz",
      country: "Germany",
      category: "luxury",
      models: ["C-Class", "E-Class", "GLE", "GLC", "S-Class"],
    },
    { name: "Audi", country: "Germany", category: "luxury", models: ["A4", "Q5", "A6", "Q7", "A3", "Q3"] },
    { name: "Lexus", country: "Japan", category: "luxury", models: ["RX", "ES", "NX", "GX", "LS", "IS"] },
    { name: "Tesla", country: "USA", category: "electric", models: ["Model 3", "Model Y", "Model S", "Model X"] },
    { name: "Porsche", country: "Germany", category: "sports", models: ["911", "Cayenne", "Macan", "Panamera"] },
  ]

  static searchModels(query: string, limit = 10): VehicleModel[] {
    if (!query || query.length < 2) return []

    const queryLower = query.toLowerCase()
    const results: VehicleModel[] = []

    // Search by make and model
    for (const vehicle of this.vehicleData) {
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

  static getMakesByCategory(category?: string): VehicleMake[] {
    if (!category) return this.makes
    return this.makes.filter((make) => make.category === category)
  }

  static getModelsByMake(makeName: string): VehicleModel[] {
    return this.vehicleData.filter((vehicle) => vehicle.make.toLowerCase() === makeName.toLowerCase())
  }

  static getPopularModels(limit = 20): VehicleModel[] {
    return this.vehicleData
      .filter((vehicle) => vehicle.popularYears && vehicle.popularYears.length > 0)
      .sort((a, b) => (b.popularYears?.length || 0) - (a.popularYears?.length || 0))
      .slice(0, limit)
  }

  static formatVehicleDisplay(vehicle: VehicleModel): string {
    return `${vehicle.make} ${vehicle.model}`
  }

  static getVehicleTooltip(vehicle: VehicleModel): string {
    const parts = [`${vehicle.make} ${vehicle.model}`, `Category: ${vehicle.category}`, `Years: ${vehicle.years}`]

    if (vehicle.popularYears && vehicle.popularYears.length > 0) {
      parts.push(`Popular years: ${vehicle.popularYears.join(", ")}`)
    }

    if (vehicle.aliases && vehicle.aliases.length > 0) {
      parts.push(`Also known as: ${vehicle.aliases.join(", ")}`)
    }

    if (vehicle.notes) {
      parts.push(`Note: ${vehicle.notes}`)
    }

    return parts.join("\n")
  }

  static getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      luxury: "✨",
      sedan: "🚗",
      suv: "🚙",
      truck: "🚚",
      electric: "⚡",
      sports: "🏎️",
      classic: "🏛️",
      motorcycle: "🏍️",
      mainstream: "🚘",
    }
    return icons[category] || "🚗"
  }

  static getTransportRecommendation(vehicle: VehicleModel): {
    recommended: "open" | "enclosed"
    reason: string
  } {
    if (vehicle.category === "luxury" || vehicle.category === "sports" || vehicle.category === "classic") {
      return {
        recommended: "enclosed",
        reason: "Recommended for protection of high-value vehicle",
      }
    }

    if (vehicle.category === "motorcycle") {
      return {
        recommended: "enclosed",
        reason: "Motorcycles typically require enclosed transport",
      }
    }

    return {
      recommended: "open",
      reason: "Standard open transport is suitable for this vehicle",
    }
  }
}
