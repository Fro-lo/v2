import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const sql = `
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          TEXT UNIQUE NOT NULL,
  customer_name       TEXT,
  customer_email      TEXT,
  customer_phone      TEXT,
  notes               TEXT,
  pickup_address      TEXT,
  delivery_address    TEXT,
  vehicle             TEXT,
  vehicle_year        TEXT,
  condition           TEXT,
  pickup_start_date   DATE,
  pickup_end_date     DATE,
  transport_type      TEXT,
  carrier_name        TEXT,
  carrier_id          TEXT,
  price               NUMERIC(10,2),
  status              TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'bookings_insert_open'
  ) THEN
    CREATE POLICY "bookings_insert_open" ON public.bookings FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'bookings_select_by_id'
  ) THEN
    CREATE POLICY "bookings_select_by_id" ON public.bookings FOR SELECT USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
`

const { error } = await supabase.rpc("exec_sql", { query: sql }).single()

if (error) {
  // Try direct postgres approach via REST
  console.log("[v0] RPC failed, trying direct SQL via REST API...")
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error("[v0] REST API error:", body)
    process.exit(1)
  }
}

console.log("[v0] bookings table created successfully!")
