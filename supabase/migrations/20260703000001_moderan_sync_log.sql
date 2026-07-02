CREATE TABLE IF NOT EXISTS moderan_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by uuid REFERENCES auth.users(id),
  results jsonb NOT NULL
);

ALTER TABLE moderan_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON moderan_sync_log FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
