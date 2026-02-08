ALTER TABLE "medicines" ALTER COLUMN "dose_variants" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;