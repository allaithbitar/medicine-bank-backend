DROP TABLE "appointments" CASCADE;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "appointment_date" date;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "is_appointment_completed" boolean DEFAULT false;