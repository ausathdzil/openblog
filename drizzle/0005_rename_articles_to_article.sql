ALTER TABLE "articles" RENAME TO "article";
--> statement-breakpoint
ALTER TABLE "article" RENAME CONSTRAINT "articles_author_id_user_id_fk" TO "article_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "article" RENAME CONSTRAINT "articles_public_id_unique" TO "article_public_id_unique";
--> statement-breakpoint
ALTER SEQUENCE IF EXISTS "articles_id_seq" RENAME TO "article_id_seq";