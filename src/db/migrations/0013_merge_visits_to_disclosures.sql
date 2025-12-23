-- Add visit fields to disclosures table
ALTER TABLE "disclosures" ADD COLUMN "visit_result" "visit_result_enum" DEFAULT 'not_completed';
ALTER TABLE "disclosures" ADD COLUMN "visit_reason" text;
ALTER TABLE "disclosures" ADD COLUMN "visit_note" text;

-- Migrate latest visit data per disclosure to disclosures table
UPDATE "disclosures" 
SET 
  "visit_result" = latest_visits.result,
  "visit_reason" = latest_visits.reason,
  "visit_note" = latest_visits.note
FROM (
  SELECT DISTINCT ON ("disclosure_id") 
    "disclosure_id",
    "result",
    "reason", 
    "note"
  FROM "visits"
  ORDER BY "disclosure_id", "created_at" DESC
) AS latest_visits
WHERE "disclosures"."id" = latest_visits."disclosure_id";

-- Drop visits table
DROP TABLE IF EXISTS "visits";

-- Remove visits from audit_table_enum
DROP TYPE IF EXISTS "audit_table_enum";
CREATE TYPE "audit_table_enum" AS ENUM('disclosures', 'disclosures_to_ratings', 'disclosure_notes', 'disclosure_consultations');