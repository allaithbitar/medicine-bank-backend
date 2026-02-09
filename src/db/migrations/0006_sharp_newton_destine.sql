ALTER TYPE "public"."emplyee_role_enum" ADD VALUE 'accountant';--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"disclosure_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "payments_disclosure_id_unique" UNIQUE("disclosure_id")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;