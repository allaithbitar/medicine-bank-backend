CREATE TABLE "sub_patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"national_number" text,
	"birth_date" date,
	"gender" "gender_enum",
	"job" text,
	"about" text,
	"disclosure_id" uuid NOT NULL,
	"phones" text[]
);
--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "gender" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sub_patients" ADD CONSTRAINT "sub_patients_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE cascade ON UPDATE no action;