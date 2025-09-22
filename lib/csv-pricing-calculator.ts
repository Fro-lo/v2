interface CSVPricingData {
  fromState: string
  toState: string
  distance: number
  basePrice: number
  vehicleType: string
  condition: string
  actualPrice: number
}

export class CSVPricingCalculator {
  private static mockData: CSVPricingData[] = [
    {
      fromState: "CA",
      toState: "NY",
      distance: 2800,
      basePrice: 1200,
      vehicleType: "sedan",
      condition: "operable",
      actualPrice: 1350,
    },
    {
      fromState: "TX",
      toState: "FL",
      distance: 1100,
      basePrice: 850,
      vehicleType: "suv",
      condition: "operable",
      actualPrice: 920,
    },
    {
      fromState: "WA",
      toState: "AZ",
      distance: 1400,
      basePrice: 950,
      vehicleType: "truck",
      condition: "inoperable",
      actualPrice: 1180,
    },
    {
      fromState: "NY",
      toState: "CA",
      distance: 2800,
      basePrice: 1200,
      vehicleType: "sedan",
      condition: "operable",
      actualPrice: 1280,
    },
    {
      fromState: "FL",
      toState: "WA",
      distance: 3100,
      basePrice: 1400,
      vehicleType: "classic",
      condition: "operable",
      actualPrice: 1850,
    },
    {
      fromState: "IL",
      toState: "CA",
      distance: 2000,
      basePrice: 1000,
      vehicleType: "sedan",
      condition: "operable",
      actualPrice: 1150,
    },
    {
      fromState: "GA",
      toState: "TX",
      distance: 900,
      basePrice: 750,
      vehicleType: "suv",
      condition: "operable",
      actualPrice: 820,
    },
    {
      fromState: "OH",
      toState: "FL",
      distance: 1200,
      basePrice: 900,
      vehicleType: "truck",
      condition: "operable",
      actualPrice: 1050,
    },
  ]

  static async calculatePrice(
    distance: number,
    vehicleModel: string,
    vehicleCondition: string,
    fromState: string,
    toState: string,
  ): Promise<any> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Find similar routes in mock data
    const similarRoutes = this.mockData.filter(
      (data) =>
        (data.fromState === fromState && data.toState === toState) ||
        (data.fromState === toState && data.toState === fromState) ||
        Math.abs(data.distance - distance) < 500,
    )

    let basePrice = 800
    let priceRange = { min: 750, max: 950 }

    if (similarRoutes.length > 0) {
      const avgPrice = similarRoutes.reduce((sum, route) => sum + route.actualPrice, 0) / similarRoutes.length
      basePrice = Math.round(avgPrice)
      priceRange = {
        min: Math.round(avgPrice * 0.85),
        max: Math.round(avgPrice * 1.15),
      }
    } else {
      // Calculate based on distance
      const pricePerMile = 0.85
      basePrice = Math.max(400, Math.round(distance * pricePerMile))
      priceRange = {
        min: Math.round(basePrice * 0.85),
        max: Math.round(basePrice * 1.15),
      }
    }

    // Apply vehicle type multiplier
    const vehicleMultipliers: Record<string, number> = {
      sedan: 1.0,
      suv: 1.15,
      truck: 1.25,
      motorcycle: 0.75,
      classic: 1.4,
    }

    const vehicleType = this.getVehicleType(vehicleModel)
    const vehicleMultiplier = vehicleMultipliers[vehicleType] || 1.0

    // Apply condition multiplier
    const conditionMultiplier = vehicleCondition.toLowerCase() === "inoperable" ? 1.25 : 1.0

    // Apply multipliers
    basePrice = Math.round(basePrice * vehicleMultiplier * conditionMultiplier)
    priceRange.min = Math.round(priceRange.min * vehicleMultiplier * conditionMultiplier)
    priceRange.max = Math.round(priceRange.max * vehicleMultiplier * conditionMultiplier)

    return {
      basePrice,
      priceRange,
      factors: {
        distance,
        vehicleType,
        condition: vehicleCondition.toLowerCase(),
        vehicleMultiplier,
        conditionMultiplier,
      },
      confidence: similarRoutes.length > 0 ? "high" : "medium",
    }
  }

  private static getVehicleType(vehicleModel: string): string {
    const model = vehicleModel.toLowerCase()

    if (model.includes("motorcycle") || model.includes("bike")) return "motorcycle"
    if (model.includes("truck") || model.includes("pickup")) return "truck"
    if (model.includes("suv") || model.includes("jeep")) return "suv"
    if (model.includes("classic") || model.includes("vintage")) return "classic"

    return "sedan"
  }
}
