-- Extend tenants_public view to expose media fields needed for the public stores directory.
CREATE OR REPLACE VIEW tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category, logo_url, gallery_images
  FROM tenants;
