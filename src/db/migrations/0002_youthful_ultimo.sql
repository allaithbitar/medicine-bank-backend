ALTER TABLE "disclosures_to_visits" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "disclosures_to_visits" CASCADE;--> statement-breakpoint
ALTER TABLE "disclosures" RENAME COLUMN "priorty_id" TO "priority_id";--> statement-breakpoint
ALTER TABLE "disclosures" DROP CONSTRAINT "disclosures_priorty_id_priority_degrees_id_fk";
--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "visits" ALTER COLUMN "disclosure_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "visits" ALTER COLUMN "result" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "disclosures_to_ratings" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "disclosures" ADD CONSTRAINT "disclosures_priority_id_priority_degrees_id_fk" FOREIGN KEY ("priority_id") REFERENCES "public"."priority_degrees"("id") ON DELETE no action ON UPDATE no action;