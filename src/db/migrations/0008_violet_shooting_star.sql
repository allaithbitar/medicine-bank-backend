CREATE TYPE "public"."broadcast_audience_enum" AS ENUM('all', 'scouts', 'supervisors');--> statement-breakpoint
CREATE TYPE "public"."system_broadcast_type_enum" AS ENUM('meeting', 'custom');--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note" text,
	"date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
