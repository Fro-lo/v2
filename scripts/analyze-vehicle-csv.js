// Fetch and analyze the vehicle CSV data
async function analyzeVehicleData() {
  try {
    console.log("Fetching vehicle data from CSV...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Vehicles%20-%20Vehicles-HxBttQ4cFrBSNroFcDmjwAIGgeA4DU.csv",
    )
    const csvText = await response.text()

    console.log(`CSV data received, length: ${csvText.length} characters`)

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Total lines: ${lines.length}`)

    if (lines.length < 2) {
      throw new Error("CSV file appears to be empty or invalid")
    }

    // Parse header
    const headers = parseCSVLine(lines[0])
    console.log("Headers:", headers)

    // Parse data rows
    const vehicles = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length >= 4 && values[0] && values[1]) {
        // Must have brand and model
        vehicles.push({
          brand: values[0].trim(),
          model: values[1].trim(),
          category: values[2] ? values[2].trim() : "Unknown",
          year: values[3] ? values[3].trim() : "Unknown",
        })
      }
    }

    console.log(`Parsed ${vehicles.length} valid vehicle records`)

    // Analyze the data
    console.log("\n=== DATA ANALYSIS ===")

    // Count by brand
    const brandCounts = {}
    vehicles.forEach((v) => {
      brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1
    })

    console.log("\nTop 15 Brands by Model Count:")
    Object.entries(brandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .forEach(([brand, count]) => {
        console.log(`${brand}: ${count} models`)
      })

    // Count by category
    const categoryCounts = {}
    vehicles.forEach((v) => {
      categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1
    })

    console.log("\nCategories:")
    Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`${category}: ${count} models`)
      })

    // Count by year
    const yearCounts = {}
    vehicles.forEach((v) => {
      yearCounts[v.year] = (yearCounts[v.year] || 0) + 1
    })

    console.log("\nTop Years:")
    Object.entries(yearCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([year, count]) => {
        console.log(`${year}: ${count} models`)
      })

    // Show sample data
    console.log("\nSample Vehicle Records:")
    vehicles.slice(0, 10).forEach((vehicle, i) => {
      console.log(`${i + 1}. ${vehicle.brand} ${vehicle.model} (${vehicle.category}, ${vehicle.year})`)
    })

    // Generate unique combinations for search
    const uniqueVehicles = new Map()
    vehicles.forEach((vehicle) => {
      const key = `${vehicle.brand} ${vehicle.model}`.toLowerCase()
      if (!uniqueVehicles.has(key)) {
        uniqueVehicles.set(key, {
          make: vehicle.brand,
          model: vehicle.model,
          category: mapCategory(vehicle.category),
          years: [vehicle.year],
          originalCategory: vehicle.category,
        })
      } else {
        const existing = uniqueVehicles.get(key)
        if (!existing.years.includes(vehicle.year)) {
          existing.years.push(vehicle.year)
        }
      }
    })

    console.log(`\nGenerated ${uniqueVehicles.size} unique vehicle combinations`)

    return {
      totalRecords: vehicles.length,
      uniqueVehicles: uniqueVehicles.size,
      brands: Object.keys(brandCounts).length,
      categories: Object.keys(categoryCounts).length,
      vehicleData: Array.from(uniqueVehicles.values()),
      rawData: vehicles,
    }
  } catch (error) {
    console.error("Error analyzing vehicle data:", error)
    throw error
  }
}

// Helper function to parse CSV lines (handles quoted fields)
function parseCSVLine(line) {
  const result = []
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

// Helper function to map categories to our standard categories
function mapCategory(originalCategory) {
  if (!originalCategory || originalCategory === "Unknown") return "sedan"

  const category = originalCategory.toLowerCase()

  // Map various category names to our standard categories
  if (category.includes("luxury") || category.includes("premium")) return "luxury"
  if (category.includes("suv") || category.includes("crossover") || category.includes("utility")) return "suv"
  if (category.includes("truck") || category.includes("pickup")) return "truck"
  if (category.includes("electric") || category.includes("hybrid") || category.includes("ev")) return "electric"
  if (category.includes("sport") || category.includes("performance") || category.includes("coupe")) return "sports"
  if (category.includes("classic") || category.includes("vintage") || category.includes("antique")) return "classic"
  if (category.includes("motorcycle") || category.includes("bike") || category.includes("scooter")) return "motorcycle"
  if (category.includes("van") || category.includes("minivan")) return "suv"
  if (
    category.includes("compact") ||
    category.includes("subcompact") ||
    category.includes("midsize") ||
    category.includes("sedan")
  )
    return "sedan"

  return "sedan" // default fallback
}

// Run the analysis
console.log("Starting vehicle CSV analysis...")
analyzeVehicleData()
  .then((result) => {
    console.log("\n=== ANALYSIS COMPLETE ===")
    console.log(`Total records processed: ${result.totalRecords}`)
    console.log(`Unique vehicles: ${result.uniqueVehicles}`)
    console.log(`Brands: ${result.brands}`)
    console.log(`Categories: ${result.categories}`)
  })
  .catch((error) => {
    console.error("Analysis failed:", error)
  })
