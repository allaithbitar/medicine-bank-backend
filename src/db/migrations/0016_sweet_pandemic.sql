ALTER TABLE "disclosures" ALTER COLUMN "visit_result" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "address" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "about" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "about" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "national_number" text;--> statement-breakpoint
CREATE INDEX "phone_patient_id_idx" ON "patients_phone_numbers" USING btree ("patient_id");