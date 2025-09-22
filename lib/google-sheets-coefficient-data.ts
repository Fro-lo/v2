export interface CoefficientData {
  id: string
  category: string
  subcategory: string
  coefficient: number
  description: string
}

export interface CalculatorData {
  id: string
  distanceRange: string
  minDistance: number
  maxDistance: number
  baseRate: number
  perMileRate: number
  description: string
}

export interface CoefficientContext {
  coefficients: CoefficientData[]
  calculatorData: CalculatorData[]
  getCoefficientByCategory: (category: string, subcategory?: string) => number
  getCalculatorDataForDistance: (distance: number) => CalculatorData | null
}

export class GoogleSheetsCoefficientsIntegration {
  private spreadsheetId: string
  private apiKey: string
  private coefficientsRange: string
  private calculatorRange: string

  constructor(config: {
    spreadsheetId: string
    apiKey: string
    coefficientsRange: string
    calculatorRange: string
  }) {
    this.spreadsheetId = config.spreadsheetId
    this.apiKey = config.apiKey
    this.coefficientsRange = config.coefficientsRange
    this.calculatorRange = config.calculatorRange
  }

  async fetchCoefficients(): Promise<CoefficientData[]> {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=0`

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch coefficients: ${response.status}`)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)

      if (rows.length === 0) {
        throw new Error("No coefficient data found")
      }

      const headers = rows[0].map((header) => header.trim().toLowerCase())
      const coefficients: CoefficientData[] = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length === 0 || row.every((cell) => !cell.trim())) {
          continue
        }

        try {
          const coefficient: CoefficientData = {
            id: this.getCellValue(row, headers, "id") || `coeff-${i}`,
            category: this.getCellValue(row, headers, "category") || "general",
            subcategory: this.getCellValue(row, headers, "subcategory") || "",
            coefficient: Number.parseFloat(this.getCellValue(row, headers, "coefficient") || "1.0"),
            description: this.getCellValue(row, headers, "description") || "",
          }

          coefficients.push(coefficient)
        } catch (error) {
          console.warn(`Error processing coefficient row ${i}:`, error)
          continue
        }
      }

      return coefficients
    } catch (error) {
      console.error("Error fetching coefficient data:", error)
      return this.getDefaultCoefficients()
    }
  }

  async fetchCalculatorData(): Promise<CalculatorData[]> {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=1`

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch calculator data: ${response.status}`)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)

      if (rows.length === 0) {
        throw new Error("No calculator data found")
      }

      const headers = rows[0].map((header) => header.trim().toLowerCase())
      const calculatorData: CalculatorData[] = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length === 0 || row.every((cell) => !cell.trim())) {
          continue
        }

        try {
          const data: CalculatorData = {
            id: this.getCellValue(row, headers, "id") || `calc-${i}`,
            distanceRange:
              this.getCellValue(row, headers, "distance_range") || this.getCellValue(row, headers, "range") || "0-100",
            minDistance: Number.parseInt(
              this.getCellValue(row, headers, "min_distance") || this.getCellValue(row, headers, "min") || "0",
            ),
            maxDistance: Number.parseInt(
              this.getCellValue(row, headers, "max_distance") || this.getCellValue(row, headers, "max") || "100",
            ),
            baseRate: Number.parseFloat(
              this.getCellValue(row, headers, "base_rate") || this.getCellValue(row, headers, "base") || "0.5",
            ),
            perMileRate: Number.parseFloat(
              this.getCellValue(row, headers, "per_mile_rate") || this.getCellValue(row, headers, "per_mile") || "1.0",
            ),
            description: this.getCellValue(row, headers, "description") || "",
          }

          calculatorData.push(data)
        } catch (error) {
          console.warn(`Error processing calculator row ${i}:`, error)
          continue
        }
      }

      return calculatorData
    } catch (error) {
      console.error("Error fetching calculator data:", error)
      return this.getDefaultCalculatorData()
    }
  }

  private parseCSV(csvText: string): string[][] {
    const rows: string[][] = []
    const lines = csvText.split("\n")

    for (const line of lines) {
      if (line.trim() === "") continue

      const row: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          row.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }

      row.push(current.trim())
      rows.push(row)
    }

    return rows
  }

  private getCellValue(row: string[], headers: string[], columnName: string): string {
    const index = headers.indexOf(columnName)
    if (index === -1) {
      return ""
    }
    return row[index]?.trim() || ""
  }

  private getDefaultCoefficients(): CoefficientData[] {
    return [
      {
        id: "vehicle_sedan",
        category: "vehicle",
        subcategory: "sedan",
        coefficient: 1.0,
        description: "Standard sedan multiplier",
      },
      { id: "vehicle_suv", category: "vehicle", subcategory: "suv", coefficient: 1.15, description: "SUV multiplier" },
      {
        id: "vehicle_truck",
        category: "vehicle",
        subcategory: "truck",
        coefficient: 1.25,
        description: "Truck multiplier",
      },
      {
        id: "vehicle_motorcycle",
        category: "vehicle",
        subcategory: "motorcycle",
        coefficient: 0.7,
        description: "Motorcycle multiplier",
      },
      {
        id: "vehicle_classic",
        category: "vehicle",
        subcategory: "classic",
        coefficient: 1.4,
        description: "Classic car multiplier",
      },
      {
        id: "condition_operable",
        category: "condition",
        subcategory: "operable",
        coefficient: 1.0,
        description: "Operable vehicle",
      },
      {
        id: "condition_inoperable",
        category: "condition",
        subcategory: "inoperable",
        coefficient: 1.3,
        description: "Inoperable vehicle",
      },
      {
        id: "transport_open",
        category: "transport",
        subcategory: "open",
        coefficient: 1.0,
        description: "Open transport",
      },
      {
        id: "transport_enclosed",
        category: "transport",
        subcategory: "enclosed",
        coefficient: 1.4,
        description: "Enclosed transport",
      },
      {
        id: "season_normal",
        category: "season",
        subcategory: "normal",
        coefficient: 1.0,
        description: "Normal season",
      },
      { id: "season_peak", category: "season", subcategory: "peak", coefficient: 1.2, description: "Peak season" },
      { id: "season_low", category: "season", subcategory: "low", coefficient: 0.9, description: "Low season" },
      {
        id: "urgency_standard",
        category: "urgency",
        subcategory: "standard",
        coefficient: 1.0,
        description: "Standard urgency",
      },
      {
        id: "urgency_expedited",
        category: "urgency",
        subcategory: "expedited",
        coefficient: 1.5,
        description: "Expedited service",
      },
    ]
  }

  private getDefaultCalculatorData(): CalculatorData[] {
    return [
      {
        id: "short",
        distanceRange: "0-300",
        minDistance: 0,
        maxDistance: 300,
        baseRate: 0.8,
        perMileRate: 1.2,
        description: "Short distance",
      },
      {
        id: "medium",
        distanceRange: "301-800",
        minDistance: 301,
        maxDistance: 800,
        baseRate: 0.7,
        perMileRate: 1.0,
        description: "Medium distance",
      },
      {
        id: "long",
        distanceRange: "801-1500",
        minDistance: 801,
        maxDistance: 1500,
        baseRate: 0.6,
        perMileRate: 0.9,
        description: "Long distance",
      },
      {
        id: "very_long",
        distanceRange: "1501+",
        minDistance: 1501,
        maxDistance: 9999,
        baseRate: 0.5,
        perMileRate: 0.8,
        description: "Very long distance",
      },
    ]
  }
}
