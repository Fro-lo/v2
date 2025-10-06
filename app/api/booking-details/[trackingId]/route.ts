import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
    {
      status: "Order Confirmed",
      date: "01/02/25",
      time: "2:30 PM",
      completed: true,
      icon: "CheckCircle",
    },
    {
      status: "Vehicle Picked Up",
      date: "01/03/25",
      time: "10:15 AM",
      completed: true,
      icon: "Package",
    },
    {
      status: "In Transit",
      date: "01/04/25",
      time: "8:45 AM",
      completed: true,
      icon: "Truck",
    },
    {
      status: "Out for Delivery",
      date: "01/08/25",
      time: "Expected",
      completed: false,
      icon: "Truck",
    },
  ],
}

export async function GET(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  try {
    const { trackingId } = await params
    const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

    // Try different possible sheet names
    const POSSIBLE_SHEET_NAMES = ["Sheet1", "Sheet2", "Bookings", "Data", "Main"]
    const RANGE = "A:T" // Covers all your columns (A-T = 20 columns)

    // If no API key, return mock data
    if (!API_KEY) {
      console.log("No Google Sheets API key provided, using mock data")
      return NextResponse.json({
        booking: { ...mockBookingDetails, id: trackingId },
        source: "mock",
        message: "Google Sheets API key not configured",
      })
    }

    // Try to fetch from different possible sheet names
    let data = null
    let usedSheetName = ""
    let allAvailableIds: string[] = []

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
          const sheetData = await response.json()
          if (sheetData.values && sheetData.values.length > 0) {
            data = sheetData
            usedSheetName = sheetName

            // Collect all booking IDs for debugging
            allAvailableIds = sheetData.values
              .slice(1) // Skip header
              .map((row: string[]) => row[0])
              .filter((id: string) => id && id.toString().trim() !== "")
              .map((id: string) => id.toString().trim())

            console.log(`Successfully fetched from sheet: ${sheetName}`)
            console.log(`Found ${allAvailableIds.length} booking IDs`)
            break
          }
        } else {
          console.log(`Failed to fetch from sheet ${sheetName}: ${response.status}`)
        }
      } catch (error) {
        console.log(`Error fetching from sheet ${sheetName}:`, error)
        continue
      }
    }

    if (!data) {
      console.error("Could not fetch from any sheet")
      return NextResponse.json({
        booking: { ...mockBookingDetails, id: trackingId },
        source: "mock",
        error: "Could not access any sheet in the spreadsheet",
      })
    }

    // Parse the spreadsheet data
    if (!data.values || data.values.length === 0) {
      return NextResponse.json({
        booking: { ...mockBookingDetails, id: trackingId },
        source: "mock",
        error: "No data found in spreadsheet",
        debug: { sheetUsed: usedSheetName },
      })
    }

    console.log("Spreadsheet structure:")
    console.log("Headers found:", data.values[0])
    console.log(`Total rows: ${data.values.length - 1}`)
    console.log(`Available booking IDs: ${allAvailableIds.slice(0, 10).join(", ")}...`)

    const headers = data.values[0] || []
    const rows = data.values.slice(1)

    // Enhanced booking ID search - try multiple approaches
    let bookingRow = null
    let matchMethod = ""

    // Method 1: Exact match (case-sensitive)
    bookingRow = rows.find((row: string[]) => row[0] && row[0].toString().trim() === trackingId)
    if (bookingRow) {
      matchMethod = "exact"
    }

    // Method 2: Case-insensitive match
    if (!bookingRow) {
      bookingRow = rows.find(
        (row: string[]) => row[0] && row[0].toString().trim().toUpperCase() === trackingId.toUpperCase(),
      )
      if (bookingRow) {
        matchMethod = "case-insensitive"
      }
    }

    // Method 3: Partial match (contains)
    if (!bookingRow) {
      bookingRow = rows.find(
        (row: string[]) => row[0] && row[0].toString().trim().toUpperCase().includes(trackingId.toUpperCase()),
      )
      if (bookingRow) {
        matchMethod = "partial"
      }
    }

    // Method 4: Try other columns (in case booking ID is not in first column)
    if (!bookingRow) {
      for (let colIndex = 0; colIndex < Math.min(5, headers.length); colIndex++) {
        bookingRow = rows.find(
          (row: string[]) =>
            row[colIndex] && row[colIndex].toString().trim().toUpperCase() === trackingId.toUpperCase(),
        )
        if (bookingRow) {
          matchMethod = `found-in-column-${colIndex}`
          break
        }
      }
    }

    if (!bookingRow) {
      // Find similar booking IDs for suggestions
      const similarIds = allAvailableIds.filter(
        (id) =>
          id.toUpperCase().includes(trackingId.toUpperCase()) || trackingId.toUpperCase().includes(id.toUpperCase()),
      )

      return NextResponse.json({
        booking: null,
        source: "google_sheets",
        error: "Booking not found",
        debug: {
          sheetUsed: usedSheetName,
          headers: headers,
          searchedFor: trackingId,
          totalRows: rows.length,
          availableBookingIds: allAvailableIds.slice(0, 20),
          similarIds: similarIds.slice(0, 10),
          searchMethods: ["Exact match", "Case-insensitive match", "Partial match", "Multi-column search"],
          sampleRows: rows.slice(0, 3).map((row: string[]) => ({ bookingId: row[0], customerName: row[1] })),
        },
      })
    }

    // Helper function to safely get column value
    const getColumn = (index: number, defaultValue = "N/A"): string => {
      return bookingRow[index] && bookingRow[index].toString().trim() !== ""
        ? bookingRow[index].toString().trim()
        : defaultValue
    }

    // Map the row data to booking details using exact column positions
    const bookingDetails: BookingDetails = {
      id: getColumn(0, trackingId), // Booking ID
      customerName: getColumn(1, "Customer"), // Customer Name
      customerEmail: getColumn(2, "N/A"), // Customer Email
      customerPhone: getColumn(3, "N/A"), // Customer Phone
      customerNotes: getColumn(4, ""), // Customer Notes
      pickupLocation: getColumn(5, "N/A"), // Pickup Address
      pickupAddressType: getColumn(6, "N/A"), // Pickup Address Type
      deliveryLocation: getColumn(7, "N/A"), // Delivery Address
      deliveryAddressType: getColumn(8, "N/A"), // Delivery Address Type
      pickupDate: getColumn(9, "N/A"), // Pickup Date
      estimatedDelivery: getColumn(10, "TBD"), // Estimated Delivery
      transportType: getColumn(11, "N/A"), // Transport Type
      totalPrice: getColumn(12, "N/A"), // Total Price
      contactName: getColumn(13, "N/A"), // Contact Name
      contactPhone: getColumn(14, "N/A"), // Contact Phone
      specialInstructions: getColumn(15, ""), // Special Instructions
      submissionTime: getColumn(16, "N/A"), // Submission Time
      status: getColumn(17, "Pending"), // Status

      // Derived fields for compatibility
      vehicleInfo: getColumn(11, "Vehicle Transport"), // Using Transport Type
      currentLocation: getColumn(17, "In Transit").includes("Transit") ? "In Transit" : getColumn(7, "N/A"), // Based on status or delivery address

      rawData: bookingRow, // Include raw data for debugging

      // Create timeline based on actual data
      timeline: [
        {
          status: "Order Submitted",
          date: getColumn(16, "N/A").split(" ")[0] || "N/A", // Extract date from submission time
          time: getColumn(16, "N/A").split(" ")[1] + " " + (getColumn(16, "N/A").split(" ")[2] || "") || "N/A",
          completed: true,
          icon: "CheckCircle",
        },
        {
          status: "Pickup Scheduled",
          date: getColumn(9, "N/A"), // Pickup Date
          time: "Scheduled",
          completed:
            getColumn(17, "").toLowerCase().includes("picked") || getColumn(17, "").toLowerCase().includes("transit"),
          icon: "Package",
        },
        {
          status: getColumn(17, "In Transit"), // Current Status
          date: "Current",
          time: "Now",
          completed: getColumn(17, "").toLowerCase() !== "pending",
          icon: "Truck",
        },
        {
          status: "Delivery",
          date: getColumn(10, "Expected"), // Estimated Delivery
          time: "Expected",
          completed: getColumn(17, "").toLowerCase().includes("delivered"),
          icon: "CheckCircle",
        },
      ],
    }

    console.log(`Successfully loaded booking details for ${trackingId} using ${matchMethod} match`)

    return NextResponse.json({
      booking: bookingDetails,
      source: "google_sheets",
      debug: {
        sheetUsed: usedSheetName,
        headers: headers,
        matchMethod: matchMethod,
        rawRowData: bookingRow,
        totalAvailableIds: allAvailableIds.length,
        availableBookingIds: allAvailableIds.slice(0, 10),
      },
    })
  } catch (error) {
    console.error("Error fetching booking details:", error)

    return NextResponse.json({
      booking: { ...mockBookingDetails, id: "ERROR" },
      source: "mock",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
