import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Here you would typically save the booking to your database
    // For now, we'll just return a success response with the booking data

    console.log("New booking submission:", body)

    // You could integrate with Google Sheets here to add the booking
    // const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    // const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

    return NextResponse.json({
      success: true,
      message: "Booking submitted successfully",
      bookingId: `BK${Date.now()}`, // Generate a temporary booking ID
      data: body,
    })
  } catch (error) {
    console.error("Error submitting booking:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit booking",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Submit booking endpoint - use POST method",
  })
}
