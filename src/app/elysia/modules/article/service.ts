/** biome-ignore-all lint/complexity/noStaticOnlyClass: Elysia Service */
import { eq } from 'drizzle-orm';
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
        slug: slugify(title),
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
    } satisfies ArticleModel.CreateArticleResponse;
  }

  static async getArticles() {
    return (await db
      .select({
        publicId: articles.publicId,
        status: articles.status,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
      })
      .from(articles)) satisfies ArticleModel.GetArticlesResponse;
  }
}
