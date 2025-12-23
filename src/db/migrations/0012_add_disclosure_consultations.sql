-- Create the disclosure_consultations table
CREATE TABLE "disclosure_consultations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "disclosure_id" uuid NOT NULL REFERENCES "disclosures"("id"),
  "rating_id" uuid REFERENCES "disclosures_to_ratings"("id"),
  "consultation_status" "consultation_status_enum" NOT NULL DEFAULT 'not_required',
  "consulted_by" uuid REFERENCES "employees"("id"),
  "consultation_note" text,
  "consultation_audio" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  "created_by" uuid REFERENCES "employees"("id"),
  "updated_by" uuid REFERENCES "employees"("id")
);

-- Migrate existing data from disclosures_to_ratings to disclosure_consultations
INSERT INTO "disclosure_consultations" (
  "id",
  "disclosure_id",
  "rating_id",
  "consultation_status",
  "consulted_by",
  "consultation_note",
  "consultation_audio",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
)
SELECT
  gen_random_uuid(),
  "disclosure_id",
  "id",
  "consultation_status",
  "consulted_by",
  "consultation_note",
  "consultation_audio",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by"
FROM "disclosures_to_ratings"
WHERE "consultation_status" != 'not_required';

-- Remove consultation columns from disclosures_to_ratings
ALTER TABLE "disclosures_to_ratings" DROP COLUMN "consultation_status";
ALTER TABLE "disclosures_to_ratings" DROP COLUMN "consulted_by";
ALTER TABLE "disclosures_to_ratings" DROP COLUMN "consultation_note";
ALTER TABLE "disclosures_to_ratings" DROP COLUMN "consultation_audio";