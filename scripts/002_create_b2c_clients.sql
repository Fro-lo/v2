CREATE TABLE IF NOT EXISTS public."b2c-clients" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent full duplicates
  CONSTRAINT b2c_clients_unique UNIQUE (first_name, last_name, email, phone)
);

ALTER TABLE public."b2c-clients" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all" ON public."b2c-clients" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON public."b2c-clients" FOR SELECT USING (true);
