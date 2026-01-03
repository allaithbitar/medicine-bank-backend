CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."house_hold_asset_condition_enum " AS ENUM('very_good', 'good', 'medium', 'bad', 'very_bad', 'not_working');--> statement-breakpoint
CREATE TYPE "public"."kinshep_enum" AS ENUM('partner', 'child', 'parent', 'brother', 'grandparent', 'grandchild');--> statement-breakpoint
CREATE TYPE "public"."medicine_form_enum" AS ENUM('pill', 'syrup', 'injection', 'capsule', 'ointment');--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"birth_date" date,
	"gender" "gender_enum",
	"kinshep" "kinshep_enum",
	"job_or_school" text,
	"note" text,
	"patient_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"form" "medicine_form_enum" NOT NULL,
	"dose_variants" real[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_medicines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"dose_per_intake" real,
	"intake_frequency" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "gender" "gender_enum" DEFAULT 'male';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "job" text;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
