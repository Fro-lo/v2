export interface ZipCodeData {
  zipCode: string
  city: string
  state: string
  stateCode: string
  county?: string
  latitude: number
  longitude: number
  timezone?: string
  population?: number
}

export interface GoogleSheetsZipConfig {
  spreadsheetId: string
  gid: string // Sheet ID for the specific tab
  range?: string
}

export class ZipCodeDatabase {
  private config: GoogleSheetsZipConfig
  private zipCodeCache: Map<string, ZipCodeData> = new Map()
  private lastFetch: Date | null = null
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  constructor(config: GoogleSheetsZipConfig) {
    this.config = config
  }

  // Comprehensive mock ZIP code data for fallback
  private static mockZipData: ZipCodeData[] = [
    {
      zipCode: "10001",
      city: "New York",
      state: "New York",
      stateCode: "NY",
      county: "New York",
      latitude: 40.7505,
      longitude: -73.9934,
      timezone: "EST",
      population: 21102,
    },
    {
      zipCode: "90210",
      city: "Beverly Hills",
      state: "California",
      stateCode: "CA",
      county: "Los Angeles",
      latitude: 34.0901,
      longitude: -118.4065,
      timezone: "PST",
      population: 21661,
    },
    {
      zipCode: "60601",
      city: "Chicago",
      state: "Illinois",
      stateCode: "IL",
      county: "Cook",
      latitude: 41.8827,
      longitude: -87.6233,
      timezone: "CST",
      population: 2746,
    },
    {
      zipCode: "33101",
      city: "Miami",
      state: "Florida",
      stateCode: "FL",
      county: "Miami-Dade",
      latitude: 25.7743,
      longitude: -80.1937,
      timezone: "EST",
      population: 2069,
    },
    {
      zipCode: "75201",
      city: "Dallas",
      state: "Texas",
      stateCode: "TX",
      county: "Dallas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "CST",
      population: 18906,
    },
    {
      zipCode: "98101",
      city: "Seattle",
      state: "Washington",
      stateCode: "WA",
      county: "King",
      latitude: 47.6062,
      longitude: -122.3321,
      timezone: "PST",
      population: 11217,
    },
    {
      zipCode: "02101",
      city: "Boston",
      state: "Massachusetts",
      stateCode: "MA",
      county: "Suffolk",
      latitude: 42.3601,
      longitude: -71.0589,
      timezone: "EST",
      population: 4032,
    },
    {
      zipCode: "30301",
      city: "Atlanta",
      state: "Georgia",
      stateCode: "GA",
      county: "Fulton",
      latitude: 33.749,
      longitude: -84.388,
      timezone: "EST",
      population: 12170,
    },
    {
      zipCode: "80201",
      city: "Denver",
      state: "Colorado",
      stateCode: "CO",
      county: "Denver",
      latitude: 39.7392,
      longitude: -104.9903,
      timezone: "MST",
      population: 18943,
    },
    {
      zipCode: "85001",
      city: "Phoenix",
      state: "Arizona",
      stateCode: "AZ",
      county: "Maricopa",
      latitude: 33.4484,
      longitude: -112.074,
      timezone: "MST",
      population: 2308,
    },
    {
      zipCode: "19101",
      city: "Philadelphia",
      state: "Pennsylvania",
      stateCode: "PA",
      county: "Philadelphia",
      latitude: 39.9526,
      longitude: -75.1652,
      timezone: "EST",
      population: 12081,
    },
    {
      zipCode: "48201",
      city: "Detroit",
      state: "Michigan",
      stateCode: "MI",
      county: "Wayne",
      latitude: 42.3314,
      longitude: -83.0458,
      timezone: "EST",
      population: 9441,
    },
    {
      zipCode: "77001",
      city: "Houston",
      state: "Texas",
      stateCode: "TX",
      county: "Harris",
      latitude: 29.7604,
      longitude: -95.3698,
      timezone: "CST",
      population: 11688,
    },
    {
      zipCode: "89101",
      city: "Las Vegas",
      state: "Nevada",
      stateCode: "NV",
      county: "Clark",
      latitude: 36.1699,
      longitude: -115.1398,
      timezone: "PST",
      population: 47676,
    },
    {
      zipCode: "97201",
      city: "Portland",
      state: "Oregon",
      stateCode: "OR",
      county: "Multnomah",
      latitude: 45.5152,
      longitude: -122.6784,
      timezone: "PST",
      population: 13605,
    },
    // Additional major cities
    {
      zipCode: "20001",
      city: "Washington",
      state: "District of Columbia",
      stateCode: "DC",
      county: "District of Columbia",
      latitude: 38.9072,
      longitude: -77.0369,
      timezone: "EST",
      population: 18434,
    },
    {
      zipCode: "94102",
      city: "San Francisco",
      state: "California",
      stateCode: "CA",
      county: "San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: "PST",
      population: 23824,
    },
    {
      zipCode: "55401",
      city: "Minneapolis",
      state: "Minnesota",
      stateCode: "MN",
      county: "Hennepin",
      latitude: 44.9778,
      longitude: -93.265,
      timezone: "CST",
      population: 12467,
    },
    {
      zipCode: "63101",
      city: "St. Louis",
      state: "Missouri",
      stateCode: "MO",
      county: "St. Louis City",
      latitude: 38.627,
      longitude: -90.1994,
      timezone: "CST",
      population: 6011,
    },
    {
      zipCode: "70112",
      city: "New Orleans",
      state: "Louisiana",
      stateCode: "LA",
      county: "Orleans",
      latitude: 29.9511,
      longitude: -90.0715,
      timezone: "CST",
      population: 3749,
    },
    {
      zipCode: "84101",
      city: "Salt Lake City",
      state: "Utah",
      stateCode: "UT",
      county: "Salt Lake",
      latitude: 40.7608,
      longitude: -111.891,
      timezone: "MST",
      population: 18294,
    },
    {
      zipCode: "37201",
      city: "Nashville",
      state: "Tennessee",
      stateCode: "TN",
      county: "Davidson",
      latitude: 36.1627,
      longitude: -86.7816,
      timezone: "CST",
      population: 26115,
    },
    {
      zipCode: "28202",
      city: "Charlotte",
      state: "North Carolina",
      stateCode: "NC",
      county: "Mecklenburg",
      latitude: 35.2271,
      longitude: -80.8431,
      timezone: "EST",
      population: 15567,
    },
    {
      zipCode: "46201",
      city: "Indianapolis",
      state: "Indiana",
      stateCode: "IN",
      county: "Marion",
      latitude: 39.7684,
      longitude: -86.1581,
      timezone: "EST",
      population: 15334,
    },
    {
      zipCode: "43215",
      city: "Columbus",
      state: "Ohio",
      stateCode: "OH",
      county: "Franklin",
      latitude: 39.9612,
      longitude: -82.9988,
      timezone: "EST",
      population: 13253,
    },
  ]

  async fetchZipCodeData(): Promise<ZipCodeData[]> {
    try {
      console.log("Attempting to fetch ZIP code data from Google Sheets...")

      // Check if we have cached data that's still fresh
      if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION && this.zipCodeCache.size > 0) {
        console.log("Using cached ZIP code data")
        return Array.from(this.zipCodeCache.values())
      }

      // Extract spreadsheet ID from various URL formats
      const spreadsheetId = this.extractSpreadsheetId(this.config.spreadsheetId)

      // Try multiple CSV export formats
      const csvUrls = [
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${this.config.gid}`,
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`,
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${this.config.gid}`,
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
            console.log("ZIP code CSV data received, length:", csvText.length)

            // Check if we got actual CSV data (not an error page)
            if (csvText.includes(",") && csvText.split("\n").length > 1) {
              const parsedData = this.parseCSVData(csvText)
              console.log("Parsed ZIP codes:", parsedData.length)

              if (parsedData.length > 0) {
                // Update cache
                this.zipCodeCache.clear()
                parsedData.forEach((zip) => this.zipCodeCache.set(zip.zipCode, zip))
                this.lastFetch = new Date()
                return parsedData
              }
            }
          } else {
            console.warn(`CSV fetch failed with status: ${response.status} for URL: ${csvUrl}`)
          }
        } catch (csvError) {
          console.warn("CSV fetch error for URL:", csvUrl, csvError)
        }
      }

      // Fallback to mock data
      console.log("Using mock ZIP code data as fallback")
      ZipCodeDatabase.mockZipData.forEach((zip) => this.zipCodeCache.set(zip.zipCode, zip))
      this.lastFetch = new Date()
      return ZipCodeDatabase.mockZipData
    } catch (error) {
      console.error("Error fetching ZIP code data:", error)
      return ZipCodeDatabase.mockZipData
    }
  }

  private extractSpreadsheetId(input: string): string {
    // Handle various Google Sheets URL formats
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/, // Standard format
      /\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/, // Published format
      /^([a-zA-Z0-9-_]+)$/, // Just the ID
    ]

    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return input // Return as-is if no pattern matches
  }

  private parseCSVData(csvText: string): ZipCodeData[] {
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return ZipCodeDatabase.mockZipData

    const headers = this.parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
    const rows = lines.slice(1).map((line) => this.parseCSVLine(line))

    console.log("ZIP code headers found:", headers)
    console.log("Sample ZIP code row:", rows[0])

    return rows
      .filter((row) => row.some((cell) => cell && cell.trim())) // Filter out empty rows
      .map((row, index) => {
        const zipData: Partial<ZipCodeData> = {}

        headers.forEach((header, colIndex) => {
          const value = row[colIndex] || ""

          switch (true) {
            case header.includes("zip") && !header.includes("code"):
            case header === "zipcode":
            case header === "zip_code":
            case header === "postal_code":
              if (value.trim() && /^\d{5}$/.test(value.trim())) {
                zipData.zipCode = value.trim()
              }
              break
            case header.includes("city") || header === "place_name":
              if (value.trim()) {
                zipData.city = value.trim()
              }
              break
            case header.includes("state") && !header.includes("code"):
            case header === "state_name":
              if (value.trim()) {
                zipData.state = value.trim()
              }
              break
            case header.includes("state") && header.includes("code"):
            case header === "state_id":
            case header === "state_abbr":
              if (value.trim() && value.trim().length === 2) {
                zipData.stateCode = value.trim().toUpperCase()
              }
              break
            case header.includes("county"):
              if (value.trim()) {
                zipData.county = value.trim()
              }
              break
            case header.includes("lat"):
            case header === "latitude":
              const lat = Number.parseFloat(value)
              if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                zipData.latitude = lat
              }
              break
            case header.includes("lng") || header.includes("lon"):
            case header === "longitude":
              const lng = Number.parseFloat(value)
              if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                zipData.longitude = lng
              }
              break
            case header.includes("timezone") || header.includes("tz"):
              if (value.trim()) {
                zipData.timezone = value.trim()
              }
              break
            case header.includes("population") || header.includes("pop"):
              const pop = Number.parseInt(value.replace(/[^\d]/g, ""))
              if (!isNaN(pop) && pop > 0) {
                zipData.population = pop
              }
              break
          }
        })

        // Validate required fields and provide defaults
        if (!zipData.zipCode || !zipData.city || !zipData.latitude || !zipData.longitude) {
          return null // Skip invalid entries
        }

        return {
          zipCode: zipData.zipCode,
          city: zipData.city,
          state: zipData.state || "Unknown State",
          stateCode: zipData.stateCode || "XX",
          county: zipData.county,
          latitude: zipData.latitude,
          longitude: zipData.longitude,
          timezone: zipData.timezone,
          population: zipData.population,
        } as ZipCodeData
      })
      .filter((zip): zip is ZipCodeData => zip !== null)
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

  async lookupZipCode(zipCode: string): Promise<ZipCodeData | null> {
    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return null
    }

    // Check cache first
    if (this.zipCodeCache.has(zipCode)) {
      return this.zipCodeCache.get(zipCode)!
    }

    // If not in cache, fetch all data (this will populate the cache)
    await this.fetchZipCodeData()

    // Try cache again
    return this.zipCodeCache.get(zipCode) || null
  }

  // Calculate accurate distance using Haversine formula
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Calculate distance between two ZIP codes
  async calculateZipDistance(fromZip: string, toZip: string): Promise<number | null> {
    const fromData = await this.lookupZipCode(fromZip)
    const toData = await this.lookupZipCode(toZip)

    if (!fromData || !toData) {
      return null
    }

    return ZipCodeDatabase.calculateDistance(fromData.latitude, fromData.longitude, toData.latitude, toData.longitude)
  }

  // Search ZIP codes by city and state
  async searchByCity(city: string, stateCode?: string): Promise<ZipCodeData[]> {
    await this.fetchZipCodeData() // Ensure data is loaded

    const cityLower = city.toLowerCase()
    const results = Array.from(this.zipCodeCache.values()).filter((zip) => {
      const cityMatch = zip.city.toLowerCase().includes(cityLower)
      const stateMatch = !stateCode || zip.stateCode === stateCode.toUpperCase()
      return cityMatch && stateMatch
    })

    return results.slice(0, 10) // Limit results
  }

  // Get all ZIP codes for a state
  async getZipCodesByState(stateCode: string): Promise<ZipCodeData[]> {
    await this.fetchZipCodeData()

    return Array.from(this.zipCodeCache.values())
      .filter((zip) => zip.stateCode === stateCode.toUpperCase())
      .sort((a, b) => a.zipCode.localeCompare(b.zipCode))
  }

  // Get cache statistics
  getCacheInfo() {
    return {
      size: this.zipCodeCache.size,
      lastFetch: this.lastFetch,
      isStale: this.lastFetch ? Date.now() - this.lastFetch.getTime() > this.CACHE_DURATION : true,
    }
  }
}
