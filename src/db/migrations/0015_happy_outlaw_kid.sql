ALTER TYPE "public"."disclosure_status_enum" ADD VALUE 'suspended' BEFORE 'archived';--> statement-breakpoint
ALTER TABLE "disclosures" ALTER COLUMN "is_appointment_completed" SET NOT NULL;