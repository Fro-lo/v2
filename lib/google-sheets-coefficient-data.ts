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
      console.log("[Google Sheets] 📈 Начало загрузки коэффициентов")
      console.log("[Google Sheets] 📊 Конфигурация:", {
        spreadsheetId: this.spreadsheetId,
        range: this.coefficientsRange,
      })

      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=0`
      console.log("[Google Sheets] 🔗 Запрос коэффициентов из:", csvUrl)

      const fetchStartTime = Date.now()
      const response = await fetch(csvUrl)
      const fetchDuration = Date.now() - fetchStartTime
      
      console.log("[Google Sheets] ⏱️  Время запроса:", `${fetchDuration}мс, статус:`, response.status)

      if (!response.ok) {
        console.error("[Google Sheets] ❌ Ошибка при запросе коэффициентов, статус:", response.status)
        throw new Error(`Failed to fetch coefficients: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("[Google Sheets] ✅ CSV данные получены, размер:", csvText.length, "символов")
      
      const parseStartTime = Date.now()
      const rows = this.parseCSV(csvText)
      const parseDuration = Date.now() - parseStartTime

      console.log("[Google Sheets] ✅ CSV распарсен:", {
        "время парсинга": `${parseDuration}мс`,
        "всего строк": rows.length,
      })

      if (rows.length === 0) {
        console.error("[Google Sheets] ❌ Данные коэффициентов не найдены")
        throw new Error("No coefficient data found")
      }

      const headers = rows[0].map((header) => header.trim().toLowerCase())
      console.log("[Google Sheets] 📋 Заголовки:", headers)
      
      const coefficients: CoefficientData[] = []
      console.log("[Google Sheets] 🔄 Обработка", rows.length - 1, "строк коэффициентов...")

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
          console.warn(`[Google Sheets] ⚠️  Ошибка обработки строки коэффициента ${i}:`, error)
          continue
        }
      }

      console.log("[Google Sheets] ✅ Коэффициенты загружены:", {
        "найдено": coefficients.length,
        "примеры": coefficients.slice(0, 3).map(c => `${c.category}/${c.subcategory}: ${c.coefficient}`),
      })

      return coefficients
    } catch (error) {
      console.error("[Google Sheets] ❌ Ошибка при загрузке коэффициентов:", error)
      console.log("[Google Sheets] 🔄 Использование коэффициентов по умолчанию")
      return this.getDefaultCoefficients()
    }
  }

  async fetchCalculatorData(): Promise<CalculatorData[]> {
    try {
      console.log("[Google Sheets] 🧮 Начало загрузки данных калькулятора")
      console.log("[Google Sheets] 📊 Конфигурация:", {
        spreadsheetId: this.spreadsheetId,
        range: this.calculatorRange,
      })

      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=1`
      console.log("[Google Sheets] 🔗 Запрос данных калькулятора из:", csvUrl)

      const fetchStartTime = Date.now()
      const response = await fetch(csvUrl)
      const fetchDuration = Date.now() - fetchStartTime
      
      console.log("[Google Sheets] ⏱️  Время запроса:", `${fetchDuration}мс, статус:`, response.status)

      if (!response.ok) {
        console.error("[Google Sheets] ❌ Ошибка при запросе данных калькулятора, статус:", response.status)
        throw new Error(`Failed to fetch calculator data: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("[Google Sheets] ✅ CSV данные получены, размер:", csvText.length, "символов")
      
      const parseStartTime = Date.now()
      const rows = this.parseCSV(csvText)
      const parseDuration = Date.now() - parseStartTime

      console.log("[Google Sheets] ✅ CSV распарсен:", {
        "время парсинга": `${parseDuration}мс`,
        "всего строк": rows.length,
      })

      if (rows.length === 0) {
        console.error("[Google Sheets] ❌ Данные калькулятора не найдены")
        throw new Error("No calculator data found")
      }

      const headers = rows[0].map((header) => header.trim().toLowerCase())
      console.log("[Google Sheets] 📋 Заголовки:", headers)
      
      const calculatorData: CalculatorData[] = []
      console.log("[Google Sheets] 🔄 Обработка", rows.length - 1, "строк данных калькулятора...")

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
          console.warn(`[Google Sheets] ⚠️  Ошибка обработки строки калькулятора ${i}:`, error)
          continue
        }
      }

      console.log("[Google Sheets] ✅ Данные калькулятора загружены:", {
        "найдено": calculatorData.length,
        "примеры": calculatorData.slice(0, 3).map(c => `${c.distanceRange}: база ${c.baseRate}, за милю ${c.perMileRate}`),
      })

      return calculatorData
    } catch (error) {
      console.error("[Google Sheets] ❌ Ошибка при загрузке данных калькулятора:", error)
      console.log("[Google Sheets] 🔄 Использование данных калькулятора по умолчанию")
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
