-- Add appointment fields to disclosures table
ALTER TABLE "disclosures" ADD COLUMN "appointment_date" date;
ALTER TABLE "disclosures" ADD COLUMN "is_appointment_completed" boolean NOT NULL DEFAULT false;

-- Migrate latest appointment data per disclosure to disclosures table
UPDATE "disclosures" 
SET 
  "appointment_date" = latest_appointments.date,
  "is_appointment_completed" = latest_appointments.is_completed
FROM (
  SELECT DISTINCT ON ("disclosure_id") 
    "disclosure_id",
    "date",
    "is_completed"
  FROM "appointments"
  ORDER BY "disclosure_id", "created_at" DESC
) AS latest_appointments
WHERE "disclosures"."id" = latest_appointments."disclosure_id";

-- Drop appointments table
DROP TABLE IF EXISTS "appointments";