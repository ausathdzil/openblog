ALTER TABLE "article" ALTER COLUMN "public_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "article" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "article" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "article" ALTER COLUMN "excerpt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "article_tag" ALTER COLUMN "tag_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "bio" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "website" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "twitter" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "facebook" SET DATA TYPE text;--> statement-breakpoint