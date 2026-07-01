ALTER TABLE "users" ADD COLUMN "is_admin" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_is_admin_idx" ON "users" USING btree ("is_admin");