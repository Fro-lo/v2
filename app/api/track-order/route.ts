import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId")?.trim()
  const email = searchParams.get("email")?.trim()

  if (!bookingId && !email) {
    return NextResponse.json({ error: "Please provide a booking ID or email" }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  let query = supabase.from("b2c-bookings").select("*")

  if (bookingId) {
    query = query.ilike("booking_id", bookingId)
  } else if (email) {
    query = query.ilike("customer_email", email)
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No orders found" }, { status: 404 })
  }

  return NextResponse.json({ orders: data })
}
