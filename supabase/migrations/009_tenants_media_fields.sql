ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS logo_url       TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description    TEXT;
