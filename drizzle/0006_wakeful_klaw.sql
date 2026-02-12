CREATE TYPE "public"."reading_status" AS ENUM('to-read', 'reading', 'completed', 'on-hold');--> statement-breakpoint
ALTER TABLE "user_books" ALTER COLUMN "last_position" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_books" ADD COLUMN "status" "reading_status" DEFAULT 'to-read' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_books" ADD COLUMN "total_pages" integer;--> statement-breakpoint
ALTER TABLE "user_books" ADD COLUMN "is_favorite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_books" ADD COLUMN "finished_at" timestamp with time zone;