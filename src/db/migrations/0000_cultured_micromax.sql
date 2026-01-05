CREATE TYPE "public"."audit_action_type_enum" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."audit_table_enum" AS ENUM('disclosures', 'disclosure_notes', 'disclosure_consultations', 'disclosure_details');--> statement-breakpoint
CREATE TYPE "public"."broadcast_audience_enum" AS ENUM('all', 'scouts', 'supervisors');--> statement-breakpoint
CREATE TYPE "public"."consultation_status_enum" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."disclosure_status_enum" AS ENUM('active', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."disclosure_type_enum" AS ENUM('new', 'return', 'help');--> statement-breakpoint
CREATE TYPE "public"."emplyee_role_enum" AS ENUM('manager', 'supervisor', 'scout');--> statement-breakpoint
CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."house_hold_asset_condition_enum " AS ENUM('very_good', 'good', 'medium', 'bad', 'very_bad', 'not_working');--> statement-breakpoint
CREATE TYPE "public"."kinshep_enum" AS ENUM('partner', 'child', 'parent', 'brother', 'grandparent', 'grandchild');--> statement-breakpoint
CREATE TYPE "public"."medicine_form_enum" AS ENUM('pill', 'syrup', 'injection', 'capsule', 'ointment');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('consultation_requested', 'consultation_completed');--> statement-breakpoint
CREATE TYPE "public"."system_broadcast_type_enum" AS ENUM('meeting', 'custom');--> statement-breakpoint
CREATE TYPE "public"."visit_status_enum" AS ENUM('not_completed', 'cant_be_completed', 'completed');--> statement-breakpoint
CREATE TABLE "areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city_id" uuid NOT NULL,
	CONSTRAINT "table_name_city_id_unique" UNIQUE("name","city_id")
);
--> statement-breakpoint
CREATE TABLE "areas_to_employees " (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"area_id" uuid NOT NULL,
	CONSTRAINT "employee_area_unique" UNIQUE("employee_id","area_id")
);
--> statement-breakpoint
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
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disclosure_consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"disclosure_id" uuid NOT NULL,
	"consultation_status" "consultation_status_enum" DEFAULT 'pending' NOT NULL,
	"consulted_by" uuid,
	"consultation_note" text,
	"consultation_audio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "disclosure_details" (
	"disclosure_id" uuid PRIMARY KEY NOT NULL,
	"diseases_or_surgeries" text,
	"job_or_school" text,
	"electricity" text,
	"expenses" text,
	"home_condition" text,
	"home_condition_status" "house_hold_asset_condition_enum ",
	"pros" text,
	"cons" text,
	"other" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "disclosure_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_audio" text,
	"note_text" text,
	"disclosure_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "disclosures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "disclosure_status_enum" DEFAULT 'active' NOT NULL,
	"type" "disclosure_type_enum" DEFAULT 'new' NOT NULL,
	"priority_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"scout_id" uuid,
	"initial_note" text,
	"is_received" boolean DEFAULT false NOT NULL,
	"archive_number" integer,
	"visit_result" "visit_status_enum",
	"visit_reason" text,
	"visit_note" text,
	"rating_id" uuid,
	"is_custom_rating" boolean DEFAULT false NOT NULL,
	"custom_rating" text,
	"rating_note" text,
	"appointment_date" date,
	"is_appointment_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"phone" text NOT NULL,
	"role" "emplyee_role_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "employees_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"birth_date" date,
	"gender" "gender_enum",
	"national_number" text,
	"kinshep" "kinshep_enum",
	"job_or_school" text,
	"note" text,
	"kids_count" integer,
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
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note" text,
	"date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"national_number" text,
	"birth_date" date,
	"gender" "gender_enum" DEFAULT 'male',
	"job" text,
	"address" text,
	"about" text,
	"area_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "patients_phone_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"phone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "priority_degrees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text,
	CONSTRAINT "priority_degrees_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "system_broadcast_type_enum" NOT NULL,
	"title" text,
	"details" text,
	"audience" "broadcast_audience_enum" DEFAULT 'all' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_consulted_by_employees_id_fk" FOREIGN KEY ("consulted_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_consultations" ADD CONSTRAINT "disclosure_consultations_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD CONSTRAINT "disclosure_details_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD CONSTRAINT "disclosure_details_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD CONSTRAINT "disclosure_details_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD CONSTRAINT "disclosure_notes_disclosure_id_disclosures_id_fk" FOREIGN KEY ("disclosure_id") REFERENCES "public"."disclosures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosure_notes" ADD CONSTRAINT "disclosure_notes_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_priority_id_priority_degrees_id_fk" FOREIGN KEY ("priority_id") REFERENCES "public"."priority_degrees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_scout_id_employees_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_employees_id_fk" FOREIGN KEY ("from") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_to_employees_id_fk" FOREIGN KEY ("to") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medicines" ADD CONSTRAINT "patient_medicines_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_updated_by_employees_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients_phone_numbers" ADD CONSTRAINT "patients_phone_numbers_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phone_patient_id_idx" ON "patients_phone_numbers" USING btree ("patient_id");