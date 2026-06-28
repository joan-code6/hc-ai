ALTER TABLE IF EXISTS "content_violations" ADD COLUMN IF NOT EXISTS "dismissed" boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "violations_dismissed_idx" ON "content_violations" USING btree ("dismissed");
