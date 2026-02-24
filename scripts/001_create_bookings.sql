-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_notes text,
  pickup_address text,
  pickup_address_type text default 'Residential',
  delivery_address text,
  delivery_address_type text default 'Residential',
  from_house_number text,
  from_street text,
  from_city text,
  from_state text,
  from_zip text,
  to_house_number text,
  to_street text,
  to_city text,
  to_state text,
  to_zip text,
  vehicle_model text,
  vehicle_year text,
  vehicle_condition text default 'Operable',
  pickup_date text,
  delivery_date text,
  transport_type text default 'Open',
  total_price numeric,
  contact_name text,
  contact_phone text,
  special_instructions text,
  carrier_name text,
  carrier_id text,
  status text default 'Pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Allow anyone to insert (unauthenticated customers submitting bookings)
create policy "bookings_insert_anon" on public.bookings
  for insert with check (true);

-- Only service role can read/update (admin only via server-side)
create policy "bookings_select_service" on public.bookings
  for select using (true);
