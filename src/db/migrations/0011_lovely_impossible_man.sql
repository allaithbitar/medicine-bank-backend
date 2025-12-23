CREATE TYPE "public"."consultation_status_enum" AS ENUM('not_required', 'requested', 'completed');--> statement-breakpoint
CREATE TYPE "public"."disclosure_note_type_enum" AS ENUM('text', 'audio');--> statement-breakpoint
CREATE TYPE "public"."disclosure_type_enum" AS ENUM('new', 'return', 'help');--> statement-breakpoint
ALTER TYPE "public"."audit_table_enum" ADD VALUE 'disclosure_consultations';--> statement-breakpoint
CREATE TABLE "disclosure_consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"disclosure_id" uuid NOT NULL,
	"rating_id" uuid,
	"consultation_status" "consultation_status_enum" DEFAULT 'not_required' NOT NULL,
	"consulted_by" uuid,
	"consultation_note" text,
	"consultation_audio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD COLUMN "note_audio" text;--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD COLUMN "note_text" text;--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD COLUMN "type" "disclosure_note_type_enum" DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "type" "disclosure_type_enum" DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "is_received" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "archive_number" integer;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_rating_id_disclosures_to_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."disclosures_to_ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_consulted_by_employees_id_fk" FOREIGN KEY ("consulted_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_notes" DROP COLUMN "note";
