-- Drop the overly-permissive RLS policy that exposed all columns to anon.
DROP POLICY IF EXISTS "tenants_public_select" ON tenants;

-- Create a security-barrier view exposing only the public-safe columns.
-- security_barrier prevents the optimizer from pushing anon-supplied WHERE clauses
-- through the view in a way that could leak data via side-channels.
CREATE VIEW tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category
  FROM tenants;

-- Grant SELECT on the view to anon only (not the base table).
GRANT SELECT ON tenants_public TO anon;
