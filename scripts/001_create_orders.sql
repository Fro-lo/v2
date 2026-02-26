CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL UNIQUE,

  -- Customer info
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_notes TEXT,

  -- Pickup address
  pickup_house_number TEXT,
  pickup_street TEXT,
  pickup_city TEXT,
  pickup_state TEXT,
  pickup_zip TEXT,
  pickup_address_type TEXT DEFAULT 'Residential',
  pickup_address TEXT,

  -- Delivery address
  delivery_house_number TEXT,
  delivery_street TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip TEXT,
  delivery_address_type TEXT DEFAULT 'Residential',
  delivery_address TEXT,

  -- Vehicle & service
  vehicle_model TEXT,
  transport_type TEXT DEFAULT 'Open',
  service_type TEXT DEFAULT 'Door to Door',
  vehicle_condition TEXT DEFAULT 'Operable',

  -- Dates
  pickup_date TEXT,
  delivery_date TEXT,

  -- Pricing
  total_price TEXT,

  -- Contact
  contact_name TEXT,
  contact_phone TEXT,
  special_instructions TEXT,

  -- Payment
  payment_intent_id TEXT,

  -- Meta
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow server-side inserts via service role (no auth required for booking submissions)
CREATE POLICY "Allow insert for all" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON public.orders FOR SELECT USING (true);
