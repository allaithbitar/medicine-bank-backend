CREATE TABLE "areas_to_employees " (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"area_id" uuid NOT NULL,
	CONSTRAINT "employee_area_unique" UNIQUE("employee_id","area_id")
);
--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_national_number_unique";--> statement-breakpoint
ALTER TABLE "patients_phone_numbers" DROP CONSTRAINT "patients_phone_numbers_phone_unique";--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_area_id_areas_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "national_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "disclosures" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "area_id";--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "table_name_city_id_unique" UNIQUE("name","city_id");