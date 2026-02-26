import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({
      success: false,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    }, { status: 500 })
  }

  const supabase = createClient(url, key)
  const results: Record<string, unknown> = {}

  // Check b2c-bookings
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("b2c-bookings")
    .select("id")
    .limit(1)

  results["b2c-bookings"] = bookingsError
    ? { status: "error", message: bookingsError.message }
    : { status: "ok", rowsFetched: bookingsData?.length ?? 0 }

  // Check b2c-clients
  const { data: clientsData, error: clientsError } = await supabase
    .from("b2c-clients")
    .select("id")
    .limit(1)

  results["b2c-clients"] = clientsError
    ? { status: "error", message: clientsError.message }
    : { status: "ok", rowsFetched: clientsData?.length ?? 0 }

  const allOk = Object.values(results).every((r: any) => r.status === "ok")

  return NextResponse.json({
    success: allOk,
    supabaseUrl: url.replace(/https?:\/\//, "").split(".")[0] + ".supabase.co",
    tables: results,
  })
}
