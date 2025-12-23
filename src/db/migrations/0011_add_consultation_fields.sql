-- Create the consultation_status_enum
CREATE TYPE "public"."consultation_status_enum" AS ENUM('not_required', 'requested', 'completed');

-- Add columns to disclosures_to_ratings
ALTER TABLE "disclosures_to_ratings" ADD COLUMN "consultation_status" "public"."consultation_status_enum" DEFAULT 'not_required' NOT NULL;
ALTER TABLE "disclosures_to_ratings" ADD COLUMN "consulted_by" uuid REFERENCES "employees"("id");
ALTER TABLE "disclosures_to_ratings" ADD COLUMN "consultation_note" text;
ALTER TABLE "disclosures_to_ratings" ADD COLUMN "consultation_audio" text;