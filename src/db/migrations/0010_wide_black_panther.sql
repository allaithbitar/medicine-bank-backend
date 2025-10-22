UPDATE "disclosures" SET "status" = 'archived' WHERE "status" IN ('canceled', 'finished');--> statement-breakpoint
ALTER TABLE "disclosures" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "disclosures" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "public"."disclosure_status_enum";--> statement-breakpoint
CREATE TYPE "public"."disclosure_status_enum" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "disclosures" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."disclosure_status_enum";--> statement-breakpoint
ALTER TABLE "disclosures" ALTER COLUMN "status" SET DATA TYPE "public"."disclosure_status_enum" USING "status"::"public"."disclosure_status_enum";--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "initial_note" text;