CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" varchar(12) NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" varchar(255) NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"cover_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"author_id" text NOT NULL,
	CONSTRAINT "articles_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_title_idx" ON "articles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "article_excerpt_idx" ON "articles" USING btree ("excerpt");