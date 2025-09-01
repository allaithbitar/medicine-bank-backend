ALTER TABLE "disclosures" RENAME COLUMN "employee_id" TO "scout_id";--> statement-breakpoint
ALTER TABLE "disclosures" DROP CONSTRAINT "disclosures_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_scout_id_employees_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;