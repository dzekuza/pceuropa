-- supabase/migrations/002_weekly_revenue.sql
-- Add weekly breakdown and submitted_by to revenue_reports
-- weeks is JSONB array of 5 objects: [{tx_count: int, amount_eur: numeric}, ...]
-- amount_eur and tx_count remain as the auto-summed totals

ALTER TABLE public.revenue_reports
  ADD COLUMN weeks jsonb,
  ADD COLUMN submitted_by text;
