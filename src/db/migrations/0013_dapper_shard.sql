CREATE TYPE "public"."notification_type_enum" AS ENUM('consultation_requested', 'consultation_completed');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type_enum" NOT NULL,
	"from" uuid NOT NULL,
	"to" uuid NOT NULL,
	"text" text,
	"record_id" uuid,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "disclosures_to_ratings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "visits" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "disclosures_to_ratings" CASCADE;--> statement-breakpoint
DROP TABLE "visits" CASCADE;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" DROP CONSTRAINT "disclosure_consultations_rating_id_disclosures_to_ratings_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "table" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."audit_table_enum";--> statement-breakpoint
CREATE TYPE "public"."audit_table_enum" AS ENUM('disclosures', 'disclosure_notes', 'disclosure_consultations');--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "table" SET DATA TYPE "public"."audit_table_enum" USING "table"::"public"."audit_table_enum";--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ALTER COLUMN "consultation_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ALTER COLUMN "consultation_status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."consultation_status_enum";--> statement-breakpoint
CREATE TYPE "public"."consultation_status_enum" AS ENUM('pending', 'completed');--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ALTER COLUMN "consultation_status" SET DEFAULT 'pending'::"public"."consultation_status_enum";--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ALTER COLUMN "consultation_status" SET DATA TYPE "public"."consultation_status_enum" USING "consultation_status"::"public"."consultation_status_enum";--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "details" json;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "visit_result" "visit_status_enum" DEFAULT 'not_completed';--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "visit_reason" text;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "visit_note" text;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "rating_id" uuid;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "is_custom_rating" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "custom_rating" text;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "rating_note" text;--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "kids_count" integer;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_employees_id_fk" FOREIGN KEY ("from") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_to_employees_id_fk" FOREIGN KEY ("to") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" DROP COLUMN "rating_id";