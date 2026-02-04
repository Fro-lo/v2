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
      console.log("[Google Sheets] 🚚 Начало загрузки данных о перевозчиках")
      
      // Use the hardcoded spreadsheet ID and GID that were working before
      const actualSpreadsheetId =
        this.spreadsheetId === "fallback" ? "1LLjbVWiTawNgel1Ybpv3SsL9FRtSY3SM2tDUmq_dl98" : this.spreadsheetId
      const actualGid = this.gid === "0" ? "1327223389" : this.gid

      const csvUrl = `https://docs.google.com/spreadsheets/d/${actualSpreadsheetId}/export?format=csv&gid=${actualGid}`

      console.log("[Google Sheets] 📊 Конфигурация перевозчиков:", {
        "spreadsheetId (исходный)": this.spreadsheetId,
        "spreadsheetId (используемый)": actualSpreadsheetId,
        "gid (исходный)": this.gid,
        "gid (используемый)": actualGid,
        "URL": csvUrl,
      })

      console.log("[Google Sheets] 🔗 Запрос данных перевозчиков из:", csvUrl)
      const fetchStartTime = Date.now()

      const response = await fetch(csvUrl)
      const fetchDuration = Date.now() - fetchStartTime
      
      console.log("[Google Sheets] ⏱️  Время запроса:", `${fetchDuration}мс, статус:`, response.status)
      
      if (!response.ok) {
        console.error("[Google Sheets] ❌ Ошибка при запросе данных перевозчиков, статус:", response.status)
        throw new Error(`Failed to fetch carrier data: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("[Google Sheets] ✅ CSV данные получены:", {
        "размер": csvText.length,
        "символов": csvText.length,
      })
      
      const parseStartTime = Date.now()
      const rows = this.parseCSV(csvText)
      const parseDuration = Date.now() - parseStartTime

      console.log("[Google Sheets] ✅ CSV распарсен:", {
        "время парсинга": `${parseDuration}мс`,
        "всего строк": rows.length,
      })

      if (rows.length === 0) {
        console.error("[Google Sheets] ❌ В таблице не найдено данных")
        throw new Error("No data found in the spreadsheet")
      }

      // Get headers from first row
      const headers = rows[0].map((header) => header.trim().toLowerCase())
      console.log("[Google Sheets] 📋 Заголовки CSV:", headers)
      console.log("[Google Sheets] 📊 Структура данных:", {
        "заголовков": headers.length,
        "строк данных": rows.length - 1,
      })

      // Process data rows
      console.log("[Google Sheets] 🔄 Начало обработки строк данных перевозчиков...")
      const carrierData: CarrierData[] = []
      let processedCount = 0
      let skippedCount = 0

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length === 0 || row.every((cell) => !cell.trim())) {
          skippedCount++
          continue // Skip empty rows
        }

        try {
          processedCount++
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
          if (processedCount <= 3 || i === rows.length - 1) {
            console.log(
              `[Google Sheets] 📝 Перевозчик ${i}:`,
              {
                "Компания": carrier.companyName,
                "Тип транспорта": carrier.vehicleType,
                "Цена за милю": carrier.pricePerMile,
                "Базовая цена": carrier.basePrice,
                "Цена": carrier.price,
                "Рейтинг": carrier.rating,
              }
            )
          }

          carrierData.push(carrier)
        } catch (error) {
          console.warn(`[Google Sheets] ⚠️  Ошибка обработки строки ${i}:`, error)
          continue
        }
      }

      console.log("[Google Sheets] ✅ Обработка завершена:", {
        "успешно обработано": carrierData.length,
        "пропущено пустых": skippedCount,
        "всего строк": rows.length - 1,
      })
      
      return carrierData
    } catch (error) {
      console.error("[Google Sheets] ❌ Критическая ошибка при загрузке данных перевозчиков:", error)
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
