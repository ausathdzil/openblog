ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_slug_unique";--> statement-breakpoint
DROP INDEX "article_title_idx";--> statement-breakpoint
DROP INDEX "article_excerpt_idx";--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "articles_id_seq";--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "excerpt" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "article_author_slug_unique_idx" ON "articles" USING btree ("author_id","slug");--> statement-breakpoint
CREATE INDEX "article_status_created_at_idx" ON "articles" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "article_author_status_created_at_idx" ON "articles" USING btree ("author_id","status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessopm_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user" USING btree ("email");