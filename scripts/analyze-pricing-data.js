// This script analyzes pricing data from Google Sheets to identify patterns and optimize pricing

async function analyzePricingData() {
  console.log("Starting pricing data analysis...")

  // Sample data structure that would come from Google Sheets
  const sampleData = [
    {
      fromZip: "90210",
      toZip: "10001",
      fromCity: "Beverly Hills",
      fromState: "CA",
      toCity: "New York",
      toState: "NY",
      distance: 2789,
      basePrice: 1200,
      vehicleType: "Sedan",
      condition: "Operable",
      seasonalMultiplier: 1.1,
      finalPrice: 1320,
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      fromZip: "33101",
      toZip: "60601",
      fromCity: "Miami",
      fromState: "FL",
      toCity: "Chicago",
      toState: "IL",
      distance: 1377,
      basePrice: 850,
      vehicleType: "SUV",
      condition: "Operable",
      seasonalMultiplier: 1.0,
      finalPrice: 1020,
      timestamp: "2024-01-16T14:20:00Z",
    },
    {
      fromZip: "78701",
      toZip: "30301",
      fromCity: "Austin",
      fromState: "TX",
      toCity: "Atlanta",
      toState: "GA",
      distance: 1042,
      basePrice: 650,
      vehicleType: "Sedan",
      condition: "Inoperable",
      seasonalMultiplier: 1.15,
      finalPrice: 935,
      timestamp: "2024-01-17T09:45:00Z",
    },
  ]

  // Analyze price per mile
  console.log("\n=== Price Per Mile Analysis ===")
  const pricePerMileData = sampleData.map((entry) => ({
    route: `${entry.fromCity}, ${entry.fromState} → ${entry.toCity}, ${entry.toState}`,
    pricePerMile: (entry.finalPrice / entry.distance).toFixed(3),
    distance: entry.distance,
    vehicleType: entry.vehicleType,
    condition: entry.condition,
  }))

  pricePerMileData.forEach((data) => {
    console.log(
      `${data.route}: $${data.pricePerMile}/mile (${data.distance} miles, ${data.vehicleType}, ${data.condition})`,
    )
  })

  // Calculate average price per mile by vehicle type
  console.log("\n=== Average Price Per Mile by Vehicle Type ===")
  const vehicleTypes = [...new Set(sampleData.map((d) => d.vehicleType))]
  vehicleTypes.forEach((type) => {
    const typeData = sampleData.filter((d) => d.vehicleType === type)
    const avgPricePerMile = typeData.reduce((sum, d) => sum + d.finalPrice / d.distance, 0) / typeData.length
    console.log(`${type}: $${avgPricePerMile.toFixed(3)}/mile`)
  })

  // Analyze seasonal impact
  console.log("\n=== Seasonal Multiplier Impact ===")
  const seasonalImpact = sampleData.map((entry) => ({
    route: `${entry.fromCity} → ${entry.toCity}`,
    basePrice: entry.basePrice,
    multiplier: entry.seasonalMultiplier,
    finalPrice: entry.finalPrice,
    impact: (((entry.finalPrice - entry.basePrice) / entry.basePrice) * 100).toFixed(1),
  }))

  seasonalImpact.forEach((data) => {
    console.log(`${data.route}: ${data.impact}% impact (${data.multiplier}x multiplier)`)
  })

  // Distance-based pricing recommendations
  console.log("\n=== Distance-Based Pricing Recommendations ===")
  const shortHaul = sampleData.filter((d) => d.distance < 500)
  const mediumHaul = sampleData.filter((d) => d.distance >= 500 && d.distance < 1500)
  const longHaul = sampleData.filter((d) => d.distance >= 1500)

  console.log(`Short haul (<500 miles): ${shortHaul.length} routes`)
  console.log(`Medium haul (500-1500 miles): ${mediumHaul.length} routes`)
  console.log(`Long haul (>1500 miles): ${longHaul.length} routes`)

  if (mediumHaul.length > 0) {
    const avgMediumPrice = mediumHaul.reduce((sum, d) => sum + d.finalPrice / d.distance, 0) / mediumHaul.length
    console.log(`Recommended medium haul rate: $${avgMediumPrice.toFixed(3)}/mile`)
  }

  if (longHaul.length > 0) {
    const avgLongPrice = longHaul.reduce((sum, d) => sum + d.finalPrice / d.distance, 0) / longHaul.length
    console.log(`Recommended long haul rate: $${avgLongPrice.toFixed(3)}/mile`)
  }

  console.log("\nPricing analysis complete!")
}

// Run the analysis
analyzePricingData().catch(console.error)
