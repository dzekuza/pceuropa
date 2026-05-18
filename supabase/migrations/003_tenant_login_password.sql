-- supabase/migrations/003_tenant_login_password.sql
-- Store the admin-assigned login password for each tenant.
-- Passwords are set by admin and given to sellers — storing them here lets
-- admin look up or reset credentials from the tenant detail page.
-- NOTE: This is an internal admin tool; tenants do not have self-service access.

ALTER TABLE public.tenants
  ADD COLUMN login_password text;
