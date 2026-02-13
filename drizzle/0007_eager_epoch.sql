ALTER TABLE "books" ALTER COLUMN "table_of_contents" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "table_of_contents" SET NOT NULL;