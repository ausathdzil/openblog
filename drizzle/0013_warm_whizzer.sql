DROP INDEX "article_author_slug_unique_idx";--> statement-breakpoint
ALTER TABLE "article" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "article" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
CREATE UNIQUE INDEX "article_author_slug_unique_idx" ON "article" USING btree ("author_id","slug") WHERE "article"."slug" is not null;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_status_check" CHECK (status in ('draft', 'published', 'archived'));--> statement-breakpoint
DROP TYPE "public"."article_status";