export interface PricingFactors {
  distance: number
  vehicleType: "sedan" | "suv" | "truck" | "motorcycle" | "classic"
  vehicleCategory?: string // New field for specific vehicle category
  condition: "operable" | "inoperable"
  transportType: "open" | "enclosed"
  season: "peak" | "normal" | "low"
  urgency: "standard" | "expedited" | "rush"
}

export interface PricingResult {
  basePrice: number
  priceRange: {
    min: number
    max: number
  }
  factors: {
    distance: number
    vehicleType: number
    condition: number
    transportType: number
    season: number
    urgency: number
    stateRoute: number
  }
  breakdown: {
    base: number
    adjustments: number
    total: number
  }
}

export class VehicleTransportPricingCalculator {
  // New tiered distance-based pricing structure
  private static readonly DISTANCE_TIERS = [
    { min: 0, max: 300, rate: 0.70 },
    { min: 301, max: 600, rate: 0.55 },
    { min: 601, max: 900, rate: 0.50 },
    { min: 901, max: 1200, rate: 0.45 },
    { min: 1201, max: 1500, rate: 0.40 },
    { min: 1501, max: 2000, rate: 0.35 },
    { min: 2001, max: Infinity, rate: 0.30 }
  ]

  private static readonly MINIMUM_PRICE = 400
  private static readonly MAXIMUM_PRICE = 5000

  // State-specific route coefficients - only the two requested
  private static readonly STATE_ROUTE_MULTIPLIERS: Record<string, Record<string, number>> = {
    "CA": {
      "CA": 1.3,  // California to California
      "TX": 0.9,  // California to Texas
      "default": 1.0 // Default for all other destinations from California
    },
    "default": {
      "default": 1.0 // Default for all other state combinations
    }
  }

  // Vehicle category coefficients based on the provided data
  private static readonly VEHICLE_CATEGORY_MULTIPLIERS: Record<string, number> = {
    // Compact and small vehicles - 0.9
    "compact cars": 0.9,
    "large cars": 0.9,
    "midsize cars": 0.9,
    "midsize station wagons": 0.9,
    "midsize-large station wagons": 0.9,
    "minicompact cars": 0.9,
    "small station wagons": 1.0,
    "subcompact cars": 0.9,
    "two seats": 0.9,
    "standard pickup trucks": 0.9,
    "standard pickup trucks 2wd": 0.9,
    "standard pickup trucks 4wd": 0.9,
    "standard pickup trucks/2wd": 0.9,
    "standard sport utility vehicle 2wd": 0.9,
    "standard sport utility vehicle 4wd": 0.9,
    
    // Medium vehicles - 1.0
    "small pickup trucks": 1.0,
    "small pickup trucks 2wd": 1.0,
    "small pickup trucks 4wd": 1.0,
    "small sport utility vehicle 2wd": 1.0,
    "small sport utility vehicle 4wd": 1.0,
    
    // Larger vehicles - 1.1
    "minivan - 2wd": 1.1,
    "minivan - 4wd": 1.1,
    "special purpose vehicle": 1.1,
    "special purpose vehicle 2wd": 1.1,
    "special purpose vehicle 4wd": 1.1,
    "special purpose vehicles": 1.1,
    "special purpose vehicles/2wd": 1.1,
    "special purpose vehicles/4wd": 1.1,
    "sport utility vehicle - 2wd": 1.1,
    "sport utility vehicle - 4wd": 1.1,
    "other": 1.1,
    
    // Vans - 1.2
    "vans": 1.2,
    "vans passenger": 1.2,
    "vans, cargo type": 1.2,
  }

  // Fallback multipliers for general vehicle types
  private static readonly VEHICLE_TYPE_MULTIPLIERS = {
    sedan: 0.9,
    suv: 1.1,
    truck: 1.0,
    motorcycle: 0.75,
    classic: 1.4,
  }

  private static readonly CONDITION_MULTIPLIERS = {
    operable: 1.0,
    inoperable: 1.2,
  }

  private static readonly TRANSPORT_TYPE_MULTIPLIERS = {
    open: 1.0,
    enclosed: 1.2,
  }

  private static readonly SEASON_MULTIPLIERS = {
    peak: 1.2,
    normal: 1.0,
    low: 0.9,
  }

  private static readonly URGENCY_MULTIPLIERS = {
    standard: 1.0,
    expedited: 1.3,
    rush: 1.6,
  }

  // Calculate base price using tiered distance pricing
  private static calculateTieredDistancePrice(distance: number): number {
    let totalPrice = 0
    let remainingDistance = distance

    for (const tier of this.DISTANCE_TIERS) {
      if (remainingDistance <= 0) break

      const tierDistance = Math.min(remainingDistance, tier.max - tier.min + 1)
      const tierPrice = tierDistance * tier.rate
      totalPrice += tierPrice

      remainingDistance -= tierDistance

      // If we've covered the distance within this tier, break
      if (distance <= tier.max) break
    }

    return Math.max(this.MINIMUM_PRICE, totalPrice)
  }

  // Get vehicle category multiplier
  private static getVehicleCategoryMultiplier(vehicleCategory?: string, fallbackType?: string): number {
    if (vehicleCategory) {
      const categoryKey = vehicleCategory.toLowerCase().trim()
      const multiplier = this.VEHICLE_CATEGORY_MULTIPLIERS[categoryKey]
      if (multiplier !== undefined) {
        return multiplier
      }
    }

    // Fallback to general vehicle type multiplier
    if (fallbackType && this.VEHICLE_TYPE_MULTIPLIERS[fallbackType as keyof typeof this.VEHICLE_TYPE_MULTIPLIERS]) {
      return this.VEHICLE_TYPE_MULTIPLIERS[fallbackType as keyof typeof this.VEHICLE_TYPE_MULTIPLIERS]
    }

    return 1.0 // Default multiplier
  }

  // Get state route multiplier - only for the two requested routes
  private static getStateRouteMultiplier(fromState: string, toState: string): number {
    const fromStateUpper = fromState.toUpperCase()
    const toStateUpper = toState.toUpperCase()

    // Only apply multipliers for California routes
    if (fromStateUpper === "CA") {
      if (toStateUpper === "CA") {
        return 1.3 // California to California
      }
      if (toStateUpper === "TX") {
        return 0.9 // California to Texas
      }
    }

    // All other state combinations use default multiplier
    return 1.0
  }

  // Updated to use actual distance calculation when ZIP codes are available
  static async calculateDistanceWithZips(
    fromCity: string,
    fromState: string,
    toCity: string,
    toState: string,
    fromZip?: string,
    toZip?: string,
    zipDatabase?: any,
  ): Promise<number> {
    // If we have ZIP codes and database, use accurate calculation
    if (fromZip && toZip && zipDatabase) {
      try {
        const distance = await zipDatabase.calculateZipDistance(fromZip, toZip)
        if (distance && distance > 0) {
          return Math.round(distance)
        }
      } catch (error) {
        console.warn("Failed to calculate ZIP distance, falling back to state-based calculation")
      }
    }

    // Fallback to original state-based calculation
    return this.calculateDistance(fromCity, fromState, toCity, toState)
  }

  static calculateDistance(fromCity: string, fromState: string, toCity: string, toState: string): number {
    // Simplified distance calculation - in production, use a real mapping service
    const stateCodes = [
      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    ]

    const fromIndex = stateCodes.indexOf(fromState.toUpperCase())
    const toIndex = stateCodes.indexOf(toState.toUpperCase())

    if (fromIndex === -1 || toIndex === -1) return 1000

    const stateDifference = Math.abs(fromIndex - toIndex)
    return Math.max(200, stateDifference * 100 + Math.random() * 200)
  }

  static getSeason(date: Date): PricingFactors["season"] {
    const month = date.getMonth()

    // Peak season: May-September (moving season)
    if (month >= 4 && month <= 8) return "peak"

    // Low season: December-February
    if (month === 11 || month <= 1) return "low"

    return "normal"
  }

  static calculatePrice(factors: PricingFactors, fromState?: string, toState?: string): PricingResult {
    // Calculate base price using tiered distance pricing
    const basePrice = this.calculateTieredDistancePrice(factors.distance)

    // Get vehicle category multiplier (with fallback to vehicle type)
    const vehicleMultiplier = this.getVehicleCategoryMultiplier(
      factors.vehicleCategory, 
      factors.vehicleType
    )
    
    const conditionMultiplier = this.CONDITION_MULTIPLIERS[factors.condition]
    const transportMultiplier = this.TRANSPORT_TYPE_MULTIPLIERS[factors.transportType]
    const seasonMultiplier = this.SEASON_MULTIPLIERS[factors.season]
    const urgencyMultiplier = this.URGENCY_MULTIPLIERS[factors.urgency]
    
    // Get state route multiplier - only applies to CA->CA (1.3) and CA->TX (0.9)
    const stateRouteMultiplier = fromState && toState 
      ? this.getStateRouteMultiplier(fromState, toState)
      : 1.0

    const totalMultiplier =
      vehicleMultiplier * conditionMultiplier * transportMultiplier * seasonMultiplier * urgencyMultiplier * stateRouteMultiplier

    const adjustedPrice = Math.min(this.MAXIMUM_PRICE, basePrice * totalMultiplier)

    // Create price range (±15% of adjusted price)
    const variance = adjustedPrice * 0.15
    const minPrice = Math.max(this.MINIMUM_PRICE, adjustedPrice - variance)
    const maxPrice = Math.min(this.MAXIMUM_PRICE, adjustedPrice + variance)

    return {
      basePrice: Math.round(basePrice),
      priceRange: {
        min: Math.round(minPrice),
        max: Math.round(maxPrice),
      },
      factors: {
        distance: factors.distance,
        vehicleType: vehicleMultiplier,
        condition: conditionMultiplier,
        transportType: transportMultiplier,
        season: seasonMultiplier,
        urgency: urgencyMultiplier,
        stateRoute: stateRouteMultiplier,
      },
      breakdown: {
        base: Math.round(basePrice),
        adjustments: Math.round(adjustedPrice - basePrice),
        total: Math.round(adjustedPrice),
      },
    }
  }

  // Helper method to get pricing breakdown for debugging
  static getPricingBreakdown(factors: PricingFactors, fromState?: string, toState?: string): {
    distance: number
    basePriceBeforeMultipliers: number
    vehicleMultiplier: number
    conditionMultiplier: number
    transportMultiplier: number
    seasonMultiplier: number
    urgencyMultiplier: number
    stateRouteMultiplier: number
    totalMultiplier: number
    finalPrice: number
  } {
    const basePrice = this.calculateTieredDistancePrice(factors.distance)
    const vehicleMultiplier = this.getVehicleCategoryMultiplier(factors.vehicleCategory, factors.vehicleType)
    const conditionMultiplier = this.CONDITION_MULTIPLIERS[factors.condition]
    const transportMultiplier = this.TRANSPORT_TYPE_MULTIPLIERS[factors.transportType]
    const seasonMultiplier = this.SEASON_MULTIPLIERS[factors.season]
    const urgencyMultiplier = this.URGENCY_MULTIPLIERS[factors.urgency]
    const stateRouteMultiplier = fromState && toState 
      ? this.getStateRouteMultiplier(fromState, toState)
      : 1.0
    const totalMultiplier = vehicleMultiplier * conditionMultiplier * transportMultiplier * seasonMultiplier * urgencyMultiplier * stateRouteMultiplier
    const finalPrice = Math.min(this.MAXIMUM_PRICE, basePrice * totalMultiplier)

    return {
      distance: factors.distance,
      basePriceBeforeMultipliers: Math.round(basePrice),
      vehicleMultiplier,
      conditionMultiplier,
      transportMultiplier,
      seasonMultiplier,
      urgencyMultiplier,
      stateRouteMultiplier,
      totalMultiplier: Math.round(totalMultiplier * 100) / 100,
      finalPrice: Math.round(finalPrice)
    }
  }
}
