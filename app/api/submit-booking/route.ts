import { NextResponse } from "next/server"
import { existsSync } from "fs"
import { join } from "path"
import { GoogleAuth } from "google-auth-library"
import { google } from "googleapis"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

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

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key)
}

async function getAuthenticatedSheetsClient() {
  const { readFileSync } = await import("fs")
  const credentialsDir = join(process.cwd(), "credentials")

  for (const filename of CREDENTIALS_FILES) {
    const credentialsPath = join(credentialsDir, filename)
    if (!existsSync(credentialsPath)) continue
    try {
      const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"))
      const auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
      const authClient = await auth.getClient()
      return google.sheets({ version: "v4", auth: authClient as any })
    } catch (error) {
      console.error(`[submit-booking] Error reading ${filename}:`, error)
    }
  }
  throw new Error("No valid credentials file found in credentials/")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generate Booking ID
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
    const bookingId = `#${randomLetters}${timestamp.slice(-3)}${randomPart}`

    const pickupAddress = `${body.fromHouseNumber || ""} ${body.fromStreet || ""}, ${body.fromCity || ""}, ${body.fromState || ""} ${body.fromZip || ""}`.trim()
    const deliveryAddress = `${body.toHouseNumber || ""} ${body.toStreet || ""}, ${body.toCity || ""}, ${body.toState || ""} ${body.toZip || ""}`.trim()

    // --- Save to Supabase ---
    const supabase = getSupabaseClient()
    if (supabase) {
      const { error: supabaseError } = await supabase
        .from("b2c-bookings")
        .insert({
          booking_id: bookingId,
          customer_name: body.customerName || null,
          customer_email: body.customerEmail || null,
          customer_phone: body.customerPhone || null,
          customer_notes: body.customerNotes || null,
          pickup_house_number: body.fromHouseNumber || null,
          pickup_street: body.fromStreet || null,
          pickup_city: body.fromCity || null,
          pickup_state: body.fromState || null,
          pickup_zip: body.fromZip || null,
          pickup_address_type: body.fromAddressType || "Residential",
          pickup_address: pickupAddress,
          delivery_house_number: body.toHouseNumber || null,
          delivery_street: body.toStreet || null,
          delivery_city: body.toCity || null,
          delivery_state: body.toState || null,
          delivery_zip: body.toZip || null,
          delivery_address_type: body.toAddressType || "Residential",
          delivery_address: deliveryAddress,
          vehicle_model: body.vehicleModel || null,
          transport_type: body.transportType || "Open",
          service_type: body.serviceType || "Door to Door",
          vehicle_condition: body.vehicleCondition || "Operable",
          pickup_date: body.pickupDate || null,
          delivery_date: body.deliveryDate || null,
          total_price: body.finalPrice || body.totalPrice || null,
          contact_name: body.contactName || body.customerName || null,
          contact_phone: body.contactPhone || body.customerPhone || null,
          special_instructions: body.specialInstructions || null,
          payment_intent_id: body.paymentIntentId || null,
          status: "Pending",
        })

      if (supabaseError) {
        console.error("[submit-booking] Supabase insert error:", supabaseError)
      } else {
        console.log("[submit-booking] Saved to Supabase, bookingId:", bookingId)
      }

      // --- Save to b2c-clients (deduplicated) ---
      if (body.customerName || body.customerEmail || body.customerPhone) {
        const nameParts = (body.customerName || "").trim().split(/\s+/)
        const firstName = nameParts[0] || null
        const lastName = nameParts.slice(1).join(" ") || null

        const { error: clientError } = await supabase
          .from("b2c-clients")
          .upsert(
            {
              first_name: firstName,
              last_name: lastName,
              email: body.customerEmail || null,
              phone: body.customerPhone || null,
            },
            { onConflict: "first_name,last_name,email,phone", ignoreDuplicates: true }
          )

        if (clientError) {
          console.error("[submit-booking] b2c-clients insert error:", clientError)
        } else {
          console.log("[submit-booking] Client saved/skipped (duplicate) in b2c-clients")
        }
      }
    } else {
      console.warn("[submit-booking] Supabase not configured, skipping")
    }

    // --- Save to Google Sheets (fallback) ---
    const now = new Date()
    const submissionTime = `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`
    const row = [
      bookingId,
      body.customerName || "",
      body.customerEmail || "",
      body.customerPhone || "",
      body.customerNotes || "",
      pickupAddress,
      body.fromAddressType || "Residential",
      deliveryAddress,
      body.toAddressType || "Residential",
      body.vehicleModel || "",
      body.pickupDate || "",
      body.deliveryDate || "",
      body.transportType || "Open",
      body.finalPrice || body.totalPrice || "",
      body.contactName || body.customerName || "",
      body.contactPhone || body.customerPhone || "",
      body.specialInstructions || "",
      submissionTime,
      "Pending",
    ]

    const hasServiceAccount = !!getCredentialsPath()
    if (hasServiceAccount) {
      const SHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
      const POSSIBLE_SHEET_NAMES = ["Orders", "Orders - Orders", "Sheet1", "Bookings", "Data", "Main"]
      try {
        const sheets = await getAuthenticatedSheetsClient()
        for (const sheetName of POSSIBLE_SHEET_NAMES) {
          try {
            const response = await sheets.spreadsheets.values.append({
              spreadsheetId: SHEET_ID,
              range: `${sheetName}!A1`,
              valueInputOption: "RAW",
              requestBody: { values: [row] },
            })
            if (response.status === 200) break
          } catch {}
        }
      } catch (err) {
        console.error("[submit-booking] Google Sheets error:", err)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking submitted successfully",
      bookingId,
    })
  } catch (error) {
    console.error("[submit-booking] Critical error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to submit booking" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Submit booking endpoint - use POST method" })
}
