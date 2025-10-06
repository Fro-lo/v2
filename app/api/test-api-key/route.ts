import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Your API key
    const API_KEY = "AIzaSyAVEkgg7GrYaVN1IKwe5fN0e_SqQVOiRU0"
    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"

    console.log("=== TESTING API KEY DIRECTLY ===")
    console.log("API Key:", API_KEY)
    console.log("Sheet ID:", SHEET_ID)

    // Test the API key with a simple request
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A1:A10?key=${API_KEY}`

    console.log("Testing URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))
    console.log("Response body:", responseText)

    if (response.ok) {
      const data = JSON.parse(responseText)
      return NextResponse.json({
        success: true,
        status: response.status,
        message: "API key works!",
        data: {
          rowCount: data.values?.length || 0,
          firstFewRows: data.values?.slice(0, 5) || [],
          allBookingIds:
            data.values
              ?.slice(1)
              .map((row: string[]) => row[0])
              .filter((id: string) => id && id.trim()) || [],
        },
        rawResponse: data,
      })
    } else {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      return NextResponse.json({
        success: false,
        status: response.status,
        message: "API key failed",
        error: errorData,
        rawResponse: responseText,
      })
    }
  } catch (error) {
    console.error("Test API key error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Request failed",
    })
  }
}
