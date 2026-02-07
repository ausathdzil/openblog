import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { articles, user } from '@/db/schema';
import { AuthError } from '../auth';
import * as AuthorService from '../author/service';
import { slugify } from '../utils';
import type { ArticleModel } from './model';

export async function createArticle(
  {
    title,
    content,
    status,
    excerpt,
    coverImage,
  }: ArticleModel.CreateArticleBody,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const author = await AuthorService.getAuthorById(userId);

  const [article] = await db
    .insert(articles)
    .values({
      title: title?.trim(),
      slug: await slugify(title, author.id),
      content: content?.trim(),
      excerpt: excerpt?.trim(),
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

export async function getArticles(
  { status, q, page = 1, limit = 20 }: ArticleModel.ArticlesQuery,
  username?: string | null | undefined
) {
  const offset = (page - 1) * limit;

  if (username) {
    await AuthorService.getAuthorByUsername(username);
  }

  const whereConditions = and(
    eq(articles.status, status ?? 'published'),
    username ? eq(user.username, username) : undefined,
    q ? ilike(articles.title, `%${q}%`) : undefined
  );

  const dataQuery = db
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
    .where(whereConditions)
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  const baseCountQuery = db
    .select({ count: count() })
    .from(articles)
    .where(whereConditions);

  const countQuery = username
    ? baseCountQuery.leftJoin(user, eq(articles.authorId, user.id))
    : baseCountQuery;

  const [data, totalResult] = await Promise.all([dataQuery, countQuery]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  } satisfies ArticleModel.ArticlesResponse;
}

export async function getArticleByPublicId(
  publicId: string,
  userId: string | undefined
) {
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
    throw new NotFoundError('Article not found.');
  }

  if (article.status !== 'published' && article.authorId !== userId) {
    throw new AuthError('You are not allowed to access this resource.', 403);
  }

  return article satisfies ArticleModel.ArticleResponse;
}

export async function getArticleBySlug(slug: string, username: string) {
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
    .where(
      and(
        eq(articles.status, 'published'),
        eq(articles.slug, slug),
        username ? eq(user.username, username) : undefined
      )
    )
    .limit(1);

  if (!article) {
    throw new NotFoundError('Article not found.');
  }

  return article satisfies ArticleModel.ArticleResponse;
}

export async function updateArticle(
  publicId: string,
  {
    title,
    content,
    excerpt,
    status: articleStatus,
    coverImage,
  }: ArticleModel.UpdateArticleBody,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const article = await getArticleByPublicId(publicId, userId);
  const author = await AuthorService.getAuthorById(article.authorId);

  const payload: Partial<ArticleModel.UpdateArticleBody> = {};

  if (title !== undefined && title !== article.title) {
    payload.title = title?.trim();
    payload.slug = await slugify(title, author.id);
  }

  if (content !== undefined && content !== article.content) {
    payload.content = content?.trim();
  }

  if (excerpt !== undefined && excerpt !== article.excerpt) {
    payload.excerpt = excerpt?.trim();
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
    author,
  } satisfies ArticleModel.ArticleResponse;
}

export async function deleteArticle(
  publicId: string,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const article = await getArticleByPublicId(publicId, userId);

  await db.delete(articles).where(eq(articles.publicId, article.publicId));

  return { message: 'Article deleted successfully' };
}
