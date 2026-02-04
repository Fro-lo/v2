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
      console.log("[Google Sheets] 💰 Начало загрузки данных о ценах")
      console.log("[Google Sheets] 📊 Конфигурация:", {
        spreadsheetId: this.config.spreadsheetId,
        range: this.config.range,
        "API Key (первые 10 символов)": this.config.apiKey?.substring(0, 10) + "...",
      })

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`
      console.log("[Google Sheets] 🔗 Запрос к Google Sheets API:", url.replace(this.config.apiKey, "API_KEY_HIDDEN"))

      const fetchStartTime = Date.now()
      const response = await fetch(url)
      const fetchDuration = Date.now() - fetchStartTime
      
      console.log("[Google Sheets] ⏱️  Время запроса:", `${fetchDuration}мс, статус:`, response.status)

      const data = await response.json()

      if (!data.values || data.values.length === 0) {
        console.error("[Google Sheets] ❌ В таблице не найдено данных")
        throw new Error("No data found in spreadsheet")
      }

      console.log("[Google Sheets] ✅ Данные получены:", {
        "всего строк": data.values.length,
        "заголовок": data.values[0],
      })

      // Skip header row and convert to objects
      const rows = data.values.slice(1)
      console.log("[Google Sheets] 🔄 Обработка", rows.length, "строк данных о ценах")

      const result = rows.map((row: string[]) => ({
        fromState: row[0] || "",
        toState: row[1] || "",
        distance: Number.parseFloat(row[2]) || 0,
        basePrice: Number.parseFloat(row[3]) || 0,
        vehicleType: row[4] || "",
        condition: row[5] || "",
        actualPrice: Number.parseFloat(row[6]) || 0,
        date: row[7] || "",
      }))

      console.log("[Google Sheets] ✅ Данные о ценах обработаны:", {
        "записей": result.length,
        "пример": result[0] ? {
          fromState: result[0].fromState,
          toState: result[0].toState,
          distance: result[0].distance,
          actualPrice: result[0].actualPrice,
        } : null,
      })

      return result
    } catch (error) {
      console.error("[Google Sheets] ❌ Ошибка при загрузке данных о ценах:", error)
      throw error
    }
  }

  async appendPricingData(data: Omit<PricingDataRow, "date">): Promise<void> {
    try {
      console.log("[Google Sheets] 💾 Начало сохранения данных о ценах в Google Sheets")
      console.log("[Google Sheets] 📝 Данные для сохранения:", {
        fromState: data.fromState,
        toState: data.toState,
        distance: data.distance,
        basePrice: data.basePrice,
        vehicleType: data.vehicleType,
        condition: data.condition,
        actualPrice: data.actualPrice,
      })

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}:append?valueInputOption=RAW&key=${this.config.apiKey}`
      console.log("[Google Sheets] 🔗 URL для сохранения:", url.replace(this.config.apiKey, "API_KEY_HIDDEN"))

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

      console.log("[Google Sheets] 📋 Строка для добавления:", row)

      const fetchStartTime = Date.now()
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [row],
        }),
      })
      const fetchDuration = Date.now() - fetchStartTime

      console.log("[Google Sheets] ⏱️  Время сохранения:", `${fetchDuration}мс, статус:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[Google Sheets] ❌ Ошибка при сохранении, статус:", response.status, "ответ:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("[Google Sheets] ✅ Данные успешно сохранены в Google Sheets:", {
        "обновленный диапазон": responseData.updates?.updatedRange,
        "обновлено ячеек": responseData.updates?.updatedCells,
      })
    } catch (error) {
      console.error("[Google Sheets] ❌ Критическая ошибка при сохранении данных в Google Sheets:", error)
      throw error
    }
  }
}
