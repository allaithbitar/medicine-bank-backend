CREATE TYPE "public"."house_ownership_status_enum " AS ENUM('owned', 'rent', 'loan', 'mortage');--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD COLUMN "house_ownership" "house_ownership_status_enum ";--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD COLUMN "house_ownership_note" text;--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD COLUMN "house_condition" "house_hold_asset_condition_enum ";--> statement-breakpoint
ALTER TABLE "disclosure_details" ADD COLUMN "house_condition_note" text;--> statement-breakpoint
ALTER TABLE "disclosure_details" DROP COLUMN "home_condition";--> statement-breakpoint
ALTER TABLE "disclosure_details" DROP COLUMN "home_condition_status";