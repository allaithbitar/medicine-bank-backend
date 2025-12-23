-- Add rating fields to disclosures table
ALTER TABLE "disclosures" ADD COLUMN "rating_id" uuid REFERENCES "ratings" ON DELETE SET NULL;
ALTER TABLE "disclosures" ADD COLUMN "is_custom_rating" boolean NOT NULL DEFAULT false;
ALTER TABLE "disclosures" ADD COLUMN "custom_rating" text;
ALTER TABLE "disclosures" ADD COLUMN "rating_note" text;

-- Migrate latest rating data per disclosure to disclosures table
UPDATE "disclosures" 
SET 
  "rating_id" = latest_ratings.rating_id,
  "is_custom_rating" = latest_ratings.is_custom,
  "custom_rating" = latest_ratings.custom_rating,
  "rating_note" = latest_ratings.note
FROM (
  SELECT DISTINCT ON ("disclosure_id") 
    "disclosure_id",
    "rating_id",
    "is_custom",
    "custom_rating",
    "note"
  FROM "disclosures_to_ratings"
  ORDER BY "disclosure_id", "created_at" DESC
) AS latest_ratings
WHERE "disclosures"."id" = latest_ratings."disclosure_id";

-- Drop disclosures_to_ratings table
DROP TABLE IF EXISTS "disclosures_to_ratings";

-- Update disclosure_consultations to remove foreign key to dropped table
ALTER TABLE "disclosure_consultations" DROP COLUMN IF EXISTS "disclosure_rating_id";