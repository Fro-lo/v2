import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Include TEST123 as a valid booking ID
const FALLBACK_BOOKING_IDS = ["TEST123"]

export async function GET() {
  try {
    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_NAME = "Sheet1"
    const RANGE = "A:A"

    // If no API key is provided, return fallback immediately
    if (!API_KEY) {
      console.log("No Google Sheets API key provided")
      return NextResponse.json({
        bookingIds: FALLBACK_BOOKING_IDS,
        source: "fallback",
        message: "Google Sheets API key not configured",
        setupRequired: true,
      })
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`

    console.log("Attempting to fetch from Google Sheets...")

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Sheets API error:", response.status, errorText)

      let errorMessage = "Google Sheets API error"
      let setupRequired = false

      if (response.status === 403) {
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error?.details?.some((detail: any) => detail.reason === "API_KEY_SERVICE_BLOCKED")) {
            errorMessage = "Google Sheets API is not enabled for this API key"
            setupRequired = true
          } else {
            errorMessage = "Google Sheets API access denied. Check API key permissions."
            setupRequired = true
          }
        } catch {
          errorMessage = "Google Sheets API access denied"
          setupRequired = true
        }
      } else if (response.status === 404) {
        errorMessage = "Google Sheet not found or not accessible"
      } else if (response.status === 400) {
        errorMessage = "Invalid Google Sheets API request"
      }

      return NextResponse.json({
        bookingIds: FALLBACK_BOOKING_IDS,
        source: "fallback",
        error: errorMessage,
        status: response.status,
        setupRequired,
      })
    }

    const data = await response.json()
    console.log("Successfully fetched from Google Sheets")

    // Extract booking IDs from the response
    const sheetBookingIds = data.values
      ? data.values
          .flat()
          .filter((id: string) => id && id.trim() !== "")
          .map((id: string) => id.trim())
      : []

    // Always include TEST123 and any sheet booking IDs
    const allBookingIds = [...FALLBACK_BOOKING_IDS, ...sheetBookingIds]

    // Remove duplicates
    const uniqueBookingIds = [...new Set(allBookingIds)]

    console.log(
      `Successfully loaded ${uniqueBookingIds.length} booking IDs (${sheetBookingIds.length} from sheets + ${FALLBACK_BOOKING_IDS.length} fallback)`,
    )

    return NextResponse.json({
      bookingIds: uniqueBookingIds,
      source: sheetBookingIds.length > 0 ? "google_sheets" : "fallback",
      count: uniqueBookingIds.length,
      sheetCount: sheetBookingIds.length,
      fallbackCount: FALLBACK_BOOKING_IDS.length,
    })
  } catch (error) {
    console.error("Error fetching booking IDs from Google Sheets:", error)

    return NextResponse.json({
      bookingIds: FALLBACK_BOOKING_IDS,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
      setupRequired: true,
    })
  }
}
