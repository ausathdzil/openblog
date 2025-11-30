/** biome-ignore-all lint/complexity/noStaticOnlyClass: Elysia Service */
import { db } from '@/db';
import { table } from '@/db/schema';
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
    const [article] = await db
      .insert(table.articles)
      .values({
        title,
        slug: slugify(title),
        content,
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
      .select()
      .from(table.articles)) satisfies ArticleModel.GetArticlesResponse;
  }
}
