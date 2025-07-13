ALTER TABLE "prioriy_degress" RENAME TO "priority_degrees";--> statement-breakpoint
ALTER TABLE "priority_degrees" DROP CONSTRAINT "prioriy_degress_name_unique";--> statement-breakpoint
ALTER TABLE "disclosures" DROP CONSTRAINT "disclosures_priorty_id_prioriy_degress_id_fk";
--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_priorty_id_priority_degrees_id_fk" FOREIGN KEY ("priorty_id") REFERENCES "public"."priority_degrees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "priority_degrees" ADD CONSTRAINT "priority_degrees_name_unique" UNIQUE("name");