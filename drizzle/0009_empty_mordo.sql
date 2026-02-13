ALTER TABLE "books" DROP CONSTRAINT "books_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "owner_id";