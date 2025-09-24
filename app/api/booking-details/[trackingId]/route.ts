import { NextRequest, NextResponse } from "next/server"

interface BookingDetails {
  id: string
  status: string
  estimatedDelivery: string
  currentLocation: string
  pickupLocation: string
  deliveryLocation: string
  vehicleInfo: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes: string
  pickupAddressType: string
  deliveryAddressType: string
  pickupDate: string
  transportType: string
  totalPrice: string
  contactName: string
  contactPhone: string
  specialInstructions: string
  submissionTime: string
  rawData?: string[]
  timeline: Array<{
    status: string
    date: string
    time: string
    completed: boolean
    icon: string
  }>
}

const mockBookingDetails: BookingDetails = {
  id: "MOCK_ID",
  status: "In Transit",
  estimatedDelivery: "01/08/25",
  currentLocation: "Distribution Center - Chicago, IL",
  pickupLocation: "Los Angeles, CA",
  deliveryLocation: "New York, NY",
  vehicleInfo: "Vehicle Transport",
  customerName: "John Smith",
  customerEmail: "john@example.com",
  customerPhone: "(555) 123-4567",
  customerNotes: "Handle with care",
  pickupAddressType: "Residential",
  deliveryAddressType: "Commercial",
  pickupDate: "01/03/25",
  transportType: "Open Transport",
  totalPrice: "$1,200",
  contactName: "John Smith",
  contactPhone: "(555) 123-4567",
  specialInstructions: "Call before delivery",
  submissionTime: "01/01/25 10:30 AM",
  timeline: [
    { status: "Order Confirmed", date: "01/02/25", time: "2:30 PM", completed: true, icon: "CheckCircle" },
    { status: "Vehicle Picked Up", date: "01/03/25", time: "10:15 AM", completed: true, icon: "Package" },
    { status: "In Transit", date: "01/04/25", time: "8:45 AM", completed: true, icon: "Truck" },
    { status: "Out for Delivery", date: "01/08/25", time: "Expected", completed: false, icon: "Truck" },
  ],
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split("/")
  const trackingId = pathSegments[pathSegments.length - 1]

  try {
    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

    if (!API_KEY) {
      console.log("No Google Sheets API key provided, using mock data")
      return NextResponse.json({
        booking: { ...mockBookingDetails, id: trackingId },
        source: "mock",
        message: "Google Sheets API key not configured",
      })
    }

    const POSSIBLE_SHEET_NAMES = ["Sheet1", "Sheet2", "Bookings", "Data", "Main"]
    const RANGE = "A:T"

    let data: any = null
    let usedSheetName = ""
    let allAvailableIds: string[] = []

    for (const sheetName of POSSIBLE_SHEET_NAMES) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!${RANGE}?key=${API_KEY}`
        const response = await fetch(url)
        if (response.ok) {
          const sheetData = await response.json()
          if (sheetData.values && sheetData.values.length > 0) {
            data = sheetData
            usedSheetName = sheetName
            allAvailableIds = sheetData.values.slice(1)
              .map((row: string[]) => row[0]?.toString().trim())
              .filter(Boolean)
            break
          }
        }
      } catch {
        continue
      }
    }

    if (!data) {
      return NextResponse.json({
        booking: { ...mockBookingDetails, id: trackingId },
        source: "mock",
        error: "Could not access any sheet in the spreadsheet",
      })
    }

    const headers = data.values[0] || []
    const rows = data.values.slice(1)
    const bookingRow = rows.find((row: string[]) => row[0]?.toString().trim() === trackingId) || null

    if (!bookingRow) {
      return NextResponse.json({
        booking: null,
        source: "google_sheets",
        error: "Booking not found",
        debug: {
          sheetUsed: usedSheetName,
          headers,
          searchedFor: trackingId,
          totalRows: rows.length,
          availableBookingIds: allAvailableIds.slice(0, 10),
        },
      })
    }

    const getColumn = (index: number, defaultValue = "N/A") => bookingRow[index]?.toString().trim() || defaultValue

    const bookingDetails: BookingDetails = {
      id: getColumn(0, trackingId),
      customerName: getColumn(1, "Customer"),
      customerEmail: getColumn(2, "N/A"),
      customerPhone: getColumn(3, "N/A"),
      customerNotes: getColumn(4, ""),
      pickupLocation: getColumn(5, "N/A"),
      pickupAddressType: getColumn(6, "N/A"),
      deliveryLocation: getColumn(7, "N/A"),
      deliveryAddressType: getColumn(8, "N/A"),
      pickupDate: getColumn(9, "N/A"),
      estimatedDelivery: getColumn(10, "TBD"),
      transportType: getColumn(11, "N/A"),
      totalPrice: getColumn(12, "N/A"),
      contactName: getColumn(13, "N/A"),
      contactPhone: getColumn(14, "N/A"),
      specialInstructions: getColumn(15, ""),
      submissionTime: getColumn(16, "N/A"),
      status: getColumn(17, "Pending"),
      vehicleInfo: getColumn(11, "Vehicle Transport"),
      currentLocation: getColumn(17, "In Transit").includes("Transit") ? "In Transit" : getColumn(7, "N/A"),
      rawData: bookingRow,
      timeline: [
        {
          status: "Order Submitted",
          date: getColumn(16, "N/A").split(" ")[0] || "N/A",
          time: getColumn(16, "N/A").split(" ")[1] + " " + (getColumn(16, "N/A").split(" ")[2] || "") || "N/A",
          completed: true,
          icon: "CheckCircle",
        },
        {
          status: "Pickup Scheduled",
          date: getColumn(9, "N/A"),
          time: "Scheduled",
          completed: getColumn(17, "").toLowerCase().includes("picked") || getColumn(17, "").toLowerCase().includes("transit"),
          icon: "Package",
        },
        {
          status: getColumn(17, "In Transit"),
          date: "Current",
          time: "Now",
          completed: getColumn(17, "").toLowerCase() !== "pending",
          icon: "Truck",
        },
        {
          status: "Delivery",
          date: getColumn(10, "Expected"),
          time: "Expected",
          completed: getColumn(17, "").toLowerCase().includes("delivered"),
          icon: "CheckCircle",
        },
      ],
    }

    return NextResponse.json({
      booking: bookingDetails,
      source: "google_sheets",
      debug: {
        sheetUsed: usedSheetName,
        headers,
        totalAvailableIds: allAvailableIds.length,
      },
    })
  } catch (error) {
    console.error("Error fetching booking details:", error)
    return NextResponse.json({
      booking: { ...mockBookingDetails, id: trackingId },
      source: "mock",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
