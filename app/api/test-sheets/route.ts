import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

    console.log("=== GOOGLE SHEETS DEBUG TEST ===")
    console.log("API Key exists:", !!API_KEY)
    console.log("API Key length:", API_KEY?.length || 0)
    console.log("Sheet ID:", SHEET_ID)

    if (!API_KEY) {
      return NextResponse.json({
        success: false,
        error: "No API key found",
        debug: {
          hasApiKey: false,
          envVars: Object.keys(process.env).filter((key) => key.includes("GOOGLE")),
        },
      })
    }

    // Test different sheet names and ranges
    const testConfigs = [
      { sheet: "Sheet1", range: "A:A" },
      { sheet: "Sheet1", range: "A1:A100" },
      { sheet: "Sheet1", range: "A:Z" },
      { sheet: "Sheet2", range: "A:A" },
      { sheet: "Bookings", range: "A:A" },
    ]

    const results = []

    for (const config of testConfigs) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${config.sheet}!${config.range}?key=${API_KEY}`
        console.log(`Testing: ${config.sheet}!${config.range}`)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const responseText = await response.text()
        console.log(`Response status: ${response.status}`)
        console.log(`Response text: ${responseText.substring(0, 500)}...`)

        if (response.ok) {
          const data = JSON.parse(responseText)
          results.push({
            config,
            success: true,
            status: response.status,
            rowCount: data.values?.length || 0,
            firstFewRows: data.values?.slice(0, 5) || [],
            allData: data.values || [],
          })
        } else {
          results.push({
            config,
            success: false,
            status: response.status,
            error: responseText,
          })
        }
      } catch (error) {
        results.push({
          config,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      apiKeyLength: API_KEY.length,
      sheetId: SHEET_ID,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test sheets error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
