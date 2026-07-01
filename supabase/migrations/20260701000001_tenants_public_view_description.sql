-- Extend tenants_public view to expose description, needed by the store detail page.
CREATE OR REPLACE VIEW tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category, logo_url, gallery_images, description
  FROM tenants;
