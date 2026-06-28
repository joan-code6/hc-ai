-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add the violation_event_id column if it doesn't exist yet
ALTER TABLE IF EXISTS "content_violations" ADD COLUMN IF NOT EXISTS "violation_event_id" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "violations_event_id_idx" ON "content_violations" USING btree ("violation_event_id");
