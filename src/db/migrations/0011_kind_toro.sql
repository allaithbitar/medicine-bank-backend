ALTER TYPE "public"."audit_table_enum" ADD VALUE 'disclosure_properties';--> statement-breakpoint
CREATE TABLE "disclosure_properties" (
	"disclosure_id" uuid PRIMARY KEY NOT NULL,
	"pros" text,
	"cons" text,
	"note" text,
	"meds" text,
	"audio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "disclosure_properties" ADD CONSTRAINT "disclosure_properties_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_properties" ADD CONSTRAINT "disclosure_properties_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_properties" ADD CONSTRAINT "disclosure_properties_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;