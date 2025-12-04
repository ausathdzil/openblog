import { eq, ilike } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { articles, user } from '@/db/schema';
import { slugify } from '@/lib/utils';
import type { ArticleModel } from './model';

export abstract class Article {
  static async createArticle({
    title,
    content,
    status,
    coverImage,
    authorId,
  }: ArticleModel.CreateArticleBody) {
    const [author] = await db.select().from(user).where(eq(user.id, authorId));

    if (!author) {
      throw new NotFoundError('Author not found');
    }

    const [article] = await db
      .insert(articles)
      .values({
        title: title.trim(),
        slug: await Article.generateArticleSlug(title),
        content: title.trim(),
        excerpt: content.substring(0, 255),
        status,
        coverImage,
        authorId,
      })
      .returning();

    return {
      publicId: article.publicId,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      status: article.status,
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    } satisfies ArticleModel.ArticleResponse;
  }

  static async getArticles() {
    return (await db
      .select({
        publicId: articles.publicId,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        status: articles.status,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)) satisfies Array<ArticleModel.ArticleResponse>;
  }

  static async getArticle(slug: string) {
    const [article] = await db
      .select({
        publicId: articles.publicId,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        status: articles.status,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    return article satisfies ArticleModel.ArticleResponse;
  }

  static async generateArticleSlug(title: string) {
    const base = slugify(title);

    const rows = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(ilike(articles.slug, `${base}%`));

    const existing = rows.map((r) => r.slug);

    if (!existing.includes(base)) {
      return base;
    }

    let i = 2;
    let candidate = `${base}-${i}`;

    while (existing.includes(candidate)) {
      i++;
      candidate = `${base}-${i}`;
    }

    return candidate;
  }
}
