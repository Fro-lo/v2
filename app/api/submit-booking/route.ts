import { NextResponse } from "next/server"
import { existsSync } from "fs"
import { join } from "path"
import { GoogleAuth } from "google-auth-library"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const CREDENTIALS_FILES = [
  "google-service-account.json",
  "key.json",
  "focused-poet-466713-n9-a54f638b557b.json",
]

function getCredentialsPath(): string | null {
  const credentialsDir = join(process.cwd(), "credentials")
  for (const filename of CREDENTIALS_FILES) {
    const p = join(credentialsDir, filename)
    if (existsSync(p)) return p
  }
  return null
}

// Функция для получения аутентифицированного клиента Google Sheets
async function getAuthenticatedSheetsClient() {
  const { readFileSync } = await import("fs")
  const credentialsDir = join(process.cwd(), "credentials")

  for (const filename of CREDENTIALS_FILES) {
    const credentialsPath = join(credentialsDir, filename)
    if (!existsSync(credentialsPath)) continue
    try {
      console.log("[Google Sheets] 📁 Чтение credentials из файла:", credentialsPath)
      const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"))
      console.log("[Google Sheets] ✅ Credentials успешно загружены из файла")

      const auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
      const authClient = await auth.getClient()
      return google.sheets({ version: "v4", auth: authClient as any })
    } catch (error) {
      console.error(`[Google Sheets] ❌ Ошибка при чтении ${filename}:`, error)
    }
  }
  throw new Error("No valid credentials file found in credentials/")
}

export async function POST(request: Request) {
  try {
    console.log("[Google Sheets] 💾 API: Получен запрос на сохранение бронирования")
    const body = await request.json()

    console.log("[Google Sheets] 📝 API: Данные бронирования:", {
      "размер данных": JSON.stringify(body).length,
      "поля": Object.keys(body),
      "примеры значений": {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        vehicleModel: body.vehicleModel,
        totalPrice: body.totalPrice,
      },
    })

    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    const SHEET_GID = "1494336667" // GID из URL пользователя

    const hasServiceAccount = !!getCredentialsPath()

    // Генерируем Booking ID
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
    const bookingId = `#${randomLetters}${timestamp.slice(-3)}${randomPart}`

    console.log("[Google Sheets] 📊 API: Конфигурация:", {
      SHEET_ID,
      SHEET_GID,
      "Service Account (настроен)": hasServiceAccount,
      bookingId,
    })

    // Формируем адреса
    const pickupAddress = `${body.fromHouseNumber || ""} ${body.fromStreet || ""}, ${body.fromCity || ""}, ${body.fromState || ""} ${body.fromZip || ""}`.trim()
    const deliveryAddress = `${body.toHouseNumber || ""} ${body.toStreet || ""}, ${body.toCity || ""}, ${body.toState || ""} ${body.toZip || ""}`.trim()

    // Форматируем дату и время отправки
    const now = new Date()
    const submissionTime = `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`

    // Формируем строку для добавления в таблицу
    // Структура колонок: A Booking ID, B Customer Name, C Customer Email, D Customer Phone, E Customer Notes,
    // F Pickup Address, G Pickup Address Type, H Delivery Address, I Delivery Address Type, J Vehicle,
    // K Pickup Date, L Estimated Delivery, M Transport Type, N Total Price, O Contact Name, P Contact Phone,
    // Q Special Instructions, R Submission Time, S Status
    const row = [
      bookingId, // 0: Booking ID (A)
      body.customerName || "", // 1: Customer Name (B)
      body.customerEmail || "", // 2: Customer Email (C)
      body.customerPhone || "", // 3: Customer Phone (D)
      body.customerNotes || "", // 4: Customer Notes (E)
      pickupAddress, // 5: Pickup Address (F)
      body.fromAddressType || "Residential", // 6: Pickup Address Type (G)
      deliveryAddress, // 7: Delivery Address (H)
      body.toAddressType || "Residential", // 8: Delivery Address Type (I)
      body.vehicleModel || "", // 9: Vehicle (J)
      body.pickupDate || "", // 10: Pickup Date (K)
      body.deliveryDate || "", // 11: Estimated Delivery (L)
      body.transportType || "Open", // 12: Transport Type (M)
      body.finalPrice || body.totalPrice || "", // 13: Total Price (N)
      body.contactName || body.customerName || "", // 14: Contact Name (O)
      body.contactPhone || body.customerPhone || "", // 15: Contact Phone (P)
      body.specialInstructions || "", // 16: Special Instructions (Q)
      submissionTime, // 17: Submission Time (R)
      "Pending", // 18: Status (S)
    ]

    console.log("[Google Sheets] 📋 API: Строка для добавления:", row)

    if (!hasServiceAccount) {
      console.warn("[Google Sheets] ⚠️  API: Google Service Account не настроен, данные не будут сохранены")
      console.warn("[Google Sheets] ⚠️  API: Положите в credentials/ один из: google-service-account.json, key.json")
      return NextResponse.json({
        success: true,
        message: "Booking submitted successfully (not saved to Google Sheets - Service Account missing)",
        bookingId,
        data: body,
        warning: "Service Account credentials file in credentials/ required for writing to Google Sheets",
      })
    }

    const POSSIBLE_SHEET_NAMES = ["Orders", "Orders - Orders", "Sheet1", "Bookings", "Data", "Main", "Sheet2"]
    let saved = false
    let lastError: string | null = null
    let lastErrorDetails: unknown = null

    try {
      console.log("[Google Sheets] 🔐 API: Использование Service Account для аутентификации")
      const sheets = await getAuthenticatedSheetsClient()

      for (const sheetName of POSSIBLE_SHEET_NAMES) {
        try {
          console.log(`[Google Sheets] 🔗 API: Попытка сохранения в лист "${sheetName}"`)
          const fetchStartTime = Date.now()
          const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [row] },
          })
          const fetchDuration = Date.now() - fetchStartTime
          console.log(`[Google Sheets] ⏱️  API: Время сохранения: ${fetchDuration}мс, статус: ${response.status}`)

          if (response.status === 200 && response.data) {
            console.log(`[Google Sheets] ✅ API: Данные успешно сохранены в лист "${sheetName}":`, {
              "обновленный диапазон": response.data.updates?.updatedRange,
              "обновлено ячеек": response.data.updates?.updatedCells,
            })
            saved = true
            break
          } else {
            console.warn(`[Google Sheets] ⚠️  API: Неожиданный ответ от листа "${sheetName}", статус: ${response.status}`)
          }
        } catch (error: unknown) {
          const err = error as { response?: { data?: unknown }; message?: string }
          console.error(`[Google Sheets] ❌ API: Ошибка при сохранении в лист "${sheetName}":`, error)
          if (err.response?.data) {
            lastErrorDetails = err.response.data
            lastError = JSON.stringify(err.response.data)
          } else {
            lastError = err instanceof Error ? err.message : String(error)
          }
        }
      }

      if (!saved) {
        try {
          console.log(`[Google Sheets] 🔗 API: Попытка сохранения без указания листа`)
          const fetchStartTime = Date.now()
          const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "A1",
            valueInputOption: "RAW",
            requestBody: { values: [row] },
          })
          const fetchDuration = Date.now() - fetchStartTime
          console.log(`[Google Sheets] ⏱️  API: Время сохранения: ${fetchDuration}мс, статус: ${response.status}`)
          if (response.status === 200 && response.data) {
            console.log(`[Google Sheets] ✅ API: Данные успешно сохранены (без указания листа)`)
            saved = true
          }
        } catch (error: unknown) {
          const err = error as { response?: { data?: unknown }; message?: string }
          console.error("[Google Sheets] ❌ API: Ошибка при сохранении без указания листа:", error)
          if (err.response?.data) {
            lastErrorDetails = err.response.data
            lastError = JSON.stringify(err.response.data)
          } else {
            lastError = err instanceof Error ? err.message : String(error)
          }
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string }
      console.error("[Google Sheets] ❌ API: Критическая ошибка при создании клиента Google Sheets:", error)
      lastError = err instanceof Error ? err.message : String(error)
      if (err.response?.data) lastErrorDetails = err.response.data
    }

    if (!saved) {
      console.error("[Google Sheets] ❌ API: Не удалось сохранить данные ни в один лист")
      console.error("[Google Sheets] ❌ API: Последняя ошибка:", lastError)
      console.error("[Google Sheets] ❌ API: Детали ошибки:", lastErrorDetails)
      return NextResponse.json({
        success: true,
        message: "Booking submitted successfully (failed to save to Google Sheets)",
        bookingId,
        data: body,
        warning: "Could not save to Google Sheets",
        error: lastError ?? undefined,
        errorDetails: lastErrorDetails ?? undefined,
      })
    }

    console.log("[Google Sheets] ✅ API: Бронирование успешно сохранено, ID:", bookingId)
    return NextResponse.json({
      success: true,
      message: "Booking submitted successfully",
      bookingId,
      data: body,
    })
  } catch (error) {
    console.error("[Google Sheets] ❌ API: Критическая ошибка при сохранении бронирования:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit booking",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Submit booking endpoint - use POST method",
  })
}
