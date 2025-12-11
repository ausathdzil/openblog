import { and, eq, ilike } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { articles, user } from '@/db/schema';
import type { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { AuthError } from '../auth';
import { Author } from '../author/service';
import type { ArticleModel } from './model';

type User = (typeof auth.$Infer.Session)['user'];

export abstract class Article {
  static async createArticle(
    { title, content, status, coverImage }: ArticleModel.CreateArticleBody,
    username: User['username'],
  ) {
    if (!username) {
      throw new AuthError('You are not allowed to perform this action');
    }

    const author = await Author.getAuthor(username);

    const [article] = await db
      .insert(articles)
      .values({
        title: title?.trim(),
        slug: slugify(title),
        content: content?.trim(),
        excerpt: content?.substring(0, 255),
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

  static async getArticles({
    status,
    authorId,
    username,
    q,
  }: ArticleModel.ArticlesQuery) {
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
          eq(articles.status, status ?? 'published'),
          authorId ? eq(articles.authorId, authorId) : undefined,
          username ? eq(user.username, username) : undefined,
          q ? ilike(articles.title, `%${q.toLowerCase()}%`) : undefined,
        ),
      )) satisfies Array<ArticleModel.ArticleResponse>;
  }

  static async getArticle(publicId: string, userId: User['id'] | undefined) {
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

    if (article.status !== 'published' && article.authorId !== userId) {
      throw new AuthError('You are not allowed to access this resource', 403);
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
    userId: User['id'] | undefined,
  ) {
    if (!userId) {
      throw new AuthError('You are not allowed to perform this action');
    }

    const article = await Article.getArticle(publicId, userId);

    const payload: Partial<ArticleModel.UpdateArticleBody> = {};

    if (title !== undefined && title !== article.title) {
      payload.title = title?.trim();
      payload.slug = slugify(title);
    }

    if (content !== undefined && content !== article.content) {
      payload.content = content?.trim();
      payload.excerpt = content?.substring(0, 255);
    }

    if (articleStatus !== undefined && articleStatus !== article.status) {
      payload.status = articleStatus;
    }

    if (coverImage !== undefined && coverImage !== article.coverImage) {
      payload.coverImage = coverImage;
    }

    if (Object.keys(payload).length === 0) {
      return article satisfies ArticleModel.ArticleResponse;
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

  static async deleteArticle(publicId: string, userId: User['id'] | undefined) {
    if (!userId) {
      throw new AuthError('You are not allowed to perform this action');
    }

    const article = await Article.getArticle(publicId, userId);

    await db.delete(articles).where(eq(articles.publicId, article.publicId));

    return { message: 'Article deleted successfully' };
  }

  static async getDrafts(
    { q }: Pick<ArticleModel.ArticlesQuery, 'q'>,
    userId: User['id'] | undefined,
  ) {
    if (!userId) {
      throw new AuthError('You are not allowed to access this resource');
    }

    return (await Article.getArticles({
      status: 'draft',
      authorId: userId,
      q,
    })) satisfies Array<ArticleModel.ArticleResponse>;
  }
}
