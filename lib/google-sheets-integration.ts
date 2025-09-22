export interface GoogleSheetsConfig {
  spreadsheetId: string
  apiKey: string
  range: string
}

export interface PricingDataRow {
  fromState: string
  toState: string
  distance: number
  basePrice: number
  vehicleType: string
  condition: string
  actualPrice: number
  date: string
}

export class GoogleSheetsIntegration {
  private config: GoogleSheetsConfig

  constructor(config: GoogleSheetsConfig) {
    this.config = config
  }

  async fetchPricingData(): Promise<PricingDataRow[]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.values || data.values.length === 0) {
        throw new Error("No data found in spreadsheet")
      }

      // Skip header row and convert to objects
      const rows = data.values.slice(1)

      return rows.map((row: string[]) => ({
        fromState: row[0] || "",
        toState: row[1] || "",
        distance: Number.parseFloat(row[2]) || 0,
        basePrice: Number.parseFloat(row[3]) || 0,
        vehicleType: row[4] || "",
        condition: row[5] || "",
        actualPrice: Number.parseFloat(row[6]) || 0,
        date: row[7] || "",
      }))
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error)
      throw error
    }
  }

  async appendPricingData(data: Omit<PricingDataRow, "date">): Promise<void> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}:append?valueInputOption=RAW&key=${this.config.apiKey}`

      const row = [
        data.fromState,
        data.toState,
        data.distance.toString(),
        data.basePrice.toString(),
        data.vehicleType,
        data.condition,
        data.actualPrice.toString(),
        new Date().toISOString(),
      ]

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [row],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error appending data to Google Sheets:", error)
      throw error
    }
  }
}
