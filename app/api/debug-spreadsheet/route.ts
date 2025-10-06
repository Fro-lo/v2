import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const POSSIBLE_SHEET_NAMES = ["Sheet1", "Sheet2", "Bookings", "Data", "Main"]
    const RANGE = "A:T"

    if (!API_KEY) {
      return NextResponse.json({
        error: "No Google Sheets API key provided",
        hasApiKey: false,
      })
    }

    const allSheetData = []

    // Try all possible sheet names
    for (const sheetName of POSSIBLE_SHEET_NAMES) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!${RANGE}?key=${API_KEY}`
        console.log(`Trying to fetch from sheet: ${sheetName}`)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.values && data.values.length > 0) {
            allSheetData.push({
              sheetName,
              headers: data.values[0] || [],
              totalRows: data.values.length - 1,
              sampleRows: data.values.slice(1, 6), // First 5 data rows
              allBookingIds: data.values
                .slice(1)
                .map((row: string[]) => row[0])
                .filter((id: string) => id && id.toString().trim() !== "")
                .slice(0, 20), // First 20 booking IDs
            })
            console.log(`Successfully fetched from sheet: ${sheetName}`)
          }
        } else {
          console.log(`Failed to fetch from sheet ${sheetName}: ${response.status}`)
        }
      } catch (error) {
        console.log(`Error fetching from sheet ${sheetName}:`, error)
      }
    }

    return NextResponse.json({
      hasApiKey: true,
      sheetsFound: allSheetData.length,
      sheetData: allSheetData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error debugging spreadsheet:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      hasApiKey: !!process.env.GOOGLE_SHEETS_API_KEY,
    })
  }
}
