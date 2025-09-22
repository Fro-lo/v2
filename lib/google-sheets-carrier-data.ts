export interface CarrierData {
  id: string
  companyName: string
  price: number
  rating: number
  reviewCount: number
  dotNumber: string
  mcNumber: string
  yearsInBusiness: number
  insuranceCoverage: number
  truck: string
  trailer: string
  vehicleType: string
  forVehicles: string
  slots: string
  trailerType: string
  state: string
  status: string
  description: string
  pickupTimeframe: string
  deliveryTimeframe: string
  pricePerMile: number
  basePrice: number
}

export class GoogleSheetsCarrierService {
  private spreadsheetId: string
  private gid: string

  constructor(config: { spreadsheetId: string; gid: string }) {
    this.spreadsheetId = config.spreadsheetId
    this.gid = config.gid
  }

  async fetchCarrierData(): Promise<CarrierData[]> {
    try {
      // Use the hardcoded spreadsheet ID and GID that were working before
      const actualSpreadsheetId =
        this.spreadsheetId === "fallback" ? "1LLjbVWiTawNgel1Ybpv3SsL9FRtSY3SM2tDUmq_dl98" : this.spreadsheetId
      const actualGid = this.gid === "0" ? "1327223389" : this.gid

      const csvUrl = `https://docs.google.com/spreadsheets/d/${actualSpreadsheetId}/export?format=csv&gid=${actualGid}`

      console.log("Fetching carrier data from:", csvUrl)

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch carrier data: ${response.status}`)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)

      if (rows.length === 0) {
        throw new Error("No data found in the spreadsheet")
      }

      // Get headers from first row
      const headers = rows[0].map((header) => header.trim().toLowerCase())
      console.log("CSV Headers:", headers)

      // Process data rows
      const carrierData: CarrierData[] = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length === 0 || row.every((cell) => !cell.trim())) {
          continue // Skip empty rows
        }

        try {
          const carrier: CarrierData = {
            id: this.getCellValue(row, headers, "id") || `carrier-${i}`,
            companyName:
              this.getCellValue(row, headers, "company name") ||
              this.getCellValue(row, headers, "companyname") ||
              this.getCellValue(row, headers, "company") ||
              `Carrier ${i}`,
            price: Number.parseFloat(this.getCellValue(row, headers, "price") || "1.0"),
            rating: Number.parseFloat(this.getCellValue(row, headers, "rating") || "4.0"),
            reviewCount: Number.parseInt(
              this.getCellValue(row, headers, "review count") ||
                this.getCellValue(row, headers, "reviewcount") ||
                this.getCellValue(row, headers, "reviews") ||
                "33",
            ),
            dotNumber:
              this.getCellValue(row, headers, "dot number") ||
              this.getCellValue(row, headers, "dotnumber") ||
              this.getCellValue(row, headers, "dot") ||
              `DOT${Math.floor(Math.random() * 1000000)}`,
            mcNumber:
              this.getCellValue(row, headers, "mc number") ||
              this.getCellValue(row, headers, "mcnumber") ||
              this.getCellValue(row, headers, "mc") ||
              `MC${Math.floor(Math.random() * 1000000)}`,
            yearsInBusiness: Number.parseInt(
              this.getCellValue(row, headers, "years in business") ||
                this.getCellValue(row, headers, "yearsinbusiness") ||
                this.getCellValue(row, headers, "years") ||
                "12",
            ),
            insuranceCoverage: Number.parseInt(
              this.getCellValue(row, headers, "insurance coverage") ||
                this.getCellValue(row, headers, "insurancecoverage") ||
                this.getCellValue(row, headers, "insurance") ||
                "1000000",
            ),
            truck: this.getCellValue(row, headers, "truck") || "Standard Truck",
            trailer: this.getCellValue(row, headers, "trailer") || "Standard Trailer",
            vehicleType:
              this.getCellValue(row, headers, "vehicler type") ||
              this.getCellValue(row, headers, "vehiclertype") ||
              this.getCellValue(row, headers, "vehicle type") ||
              this.getCellValue(row, headers, "vehicletype") ||
              "Open",
            forVehicles:
              this.getCellValue(row, headers, "for vehicles") ||
              this.getCellValue(row, headers, "forvehicles") ||
              this.getCellValue(row, headers, "vehicles") ||
              "All Types",
            slots: this.getCellValue(row, headers, "slots") || "Multi",
            trailerType:
              this.getCellValue(row, headers, "trailer type") ||
              this.getCellValue(row, headers, "trailertype") ||
              "Standard",
            state: this.getCellValue(row, headers, "state") || "AL",
            status: this.getCellValue(row, headers, "status") || "Available",
            description: this.getCellValue(row, headers, "description") || "Professional vehicle transport service",
            pickupTimeframe:
              this.getCellValue(row, headers, "pickup timeframe") ||
              this.getCellValue(row, headers, "pickuptimeframe") ||
              this.getCellValue(row, headers, "pickup") ||
              "1-3 days",
            deliveryTimeframe:
              this.getCellValue(row, headers, "delivery timeframe") ||
              this.getCellValue(row, headers, "deliverytimeframe") ||
              this.getCellValue(row, headers, "delivery") ||
              "3-5 days",
            pricePerMile: Number.parseFloat(
              this.getCellValue(row, headers, "price per mile") ||
                this.getCellValue(row, headers, "pricepermile") ||
                this.getCellValue(row, headers, "price/mile") ||
                this.getCellValue(row, headers, "per mile") ||
                "1.0",
            ),
            basePrice: Number.parseFloat(
              this.getCellValue(row, headers, "base price") ||
                this.getCellValue(row, headers, "baseprice") ||
                this.getCellValue(row, headers, "base") ||
                "0",
            ),
          }

          // Add debugging for price calculation fields
          console.log(
            `Carrier ${i} - Company: "${carrier.companyName}", Vehicle Type: "${carrier.vehicleType}", Price Per Mile: ${carrier.pricePerMile}, Base Price: ${carrier.basePrice}`,
          )

          carrierData.push(carrier)
        } catch (error) {
          console.warn(`Error processing row ${i}:`, error)
          continue
        }
      }

      console.log(`Successfully processed ${carrierData.length} carriers`)
      return carrierData
    } catch (error) {
      console.error("Error fetching carrier data from Google Sheets:", error)
      throw error
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
}
