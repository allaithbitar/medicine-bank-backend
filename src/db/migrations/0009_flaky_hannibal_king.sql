CREATE TYPE "public"."audit_action_type_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."audit_table_enum" AS ENUM('disclosures', 'visits', 'disclosures_to_ratings', 'disclosure_notes');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table" "audit_table_enum" NOT NULL,
	"column" text,
	"action_type" "audit_action_type_enum",
	"old_value" text,
	"new_value" text,
	"record_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "disclosure_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note" text,
	"disclosure_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DROP TABLE "audit_log" CASCADE;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD CONSTRAINT "disclosure_notes_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD CONSTRAINT "disclosure_notes_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" DROP COLUMN "note";