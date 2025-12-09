import { and, eq, ilike } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { articles, user } from '@/db/schema';
import { slugify } from '@/lib/utils';
import { AuthError } from '../auth';
import { Author } from '../author/service';
import type { ArticleModel } from './model';

export abstract class Article {
  static async createArticle(
    { title, content, status, coverImage }: ArticleModel.CreateArticleBody,
    handle: string,
  ) {
    const author = await Author.getAuthor(handle);

    const [article] = await db
      .insert(articles)
      .values({
        title: title.trim(),
        slug: await Article.generateArticleSlug(title),
        content: content.trim(),
        excerpt: content.substring(0, 255),
        status,
        coverImage,
        authorId: author.id,
      })
      .returning({
        publicId: articles.publicId,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        status: articles.status,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      });

    return {
      ...article,
      author,
    } satisfies ArticleModel.ArticleResponse;
  }

  static async getArticles(handle?: string | undefined) {
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
        author: {
          name: user.name,
          image: user.image,
          createdAt: user.createdAt,
          username: user.username,
          displayUsername: user.displayUsername,
        },
      })
      .from(articles)
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(
        and(
          eq(articles.status, 'published'),
          handle ? eq(user.username, handle) : undefined,
        ),
      )) satisfies Array<ArticleModel.ArticleResponse>;
  }

  static async getArticleByPublicId(publicId: string) {
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
        authorId: articles.authorId,
        author: {
          name: user.name,
          image: user.image,
          createdAt: user.createdAt,
          username: user.username,
          displayUsername: user.displayUsername,
        },
      })
      .from(articles)
      .leftJoin(user, eq(articles.authorId, user.id))
      .where(eq(articles.publicId, publicId))
      .limit(1);

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    return article satisfies ArticleModel.ArticleResponse;
  }

  static async updateArticle(
    publicId: string,
    {
      title,
      content,
      status: articleStatus,
      coverImage,
    }: ArticleModel.UpdateArticleBody,
    userId: string,
  ) {
    const article = await Article.getArticleByPublicId(publicId);

    if (article.authorId !== userId) {
      throw new AuthError('You are not allowed to modify this article');
    }

    const payload: Partial<ArticleModel.UpdateArticleBody> = {};

    const trimmedTitle = title?.trim();

    if (trimmedTitle && trimmedTitle !== article.title) {
      payload.title = trimmedTitle;
      payload.slug = await Article.generateArticleSlug(trimmedTitle);
    }

    const trimmedContent = content?.trim();

    if (trimmedContent && trimmedContent !== article.content) {
      payload.content = trimmedContent;
      payload.excerpt = trimmedContent.substring(0, 255);
    }

    if (articleStatus !== undefined) {
      payload.status === articleStatus;
    }

    if (coverImage !== undefined) {
      payload.coverImage === coverImage;
    }

    const [updatedData] = await db
      .update(articles)
      .set({ ...payload })
      .where(eq(articles.publicId, publicId))
      .returning({
        publicId: articles.publicId,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        status: articles.status,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      });

    return {
      ...updatedData,
      author: article.author,
    } satisfies ArticleModel.ArticleResponse;
  }

  static async deleteArticle(publicId: string, userId: string) {
    const article = await Article.getArticleByPublicId(publicId);

    if (article.authorId !== userId) {
      throw new AuthError('You are not allowed to delete this article');
    }

    await db.delete(articles).where(eq(articles.publicId, publicId));

    return { message: 'Article deleted successfully' };
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
