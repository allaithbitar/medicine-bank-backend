ALTER TABLE "family_members" ALTER COLUMN "birth_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "family_members" ALTER COLUMN "gender" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "residential" text;