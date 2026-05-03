import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

import { db } from '@/db';
import { article, user } from '@/db/schema';
import { AuthError } from '../auth';
import { getAuthorById, getAuthorByUsername } from '../author/service';
import { slugify } from '../utils';
import type {
  ArticleResponse,
  ArticlesQuery,
  ArticlesResponse,
  CreateArticleBody,
  UpdateArticleBody,
} from './model';

export async function createArticle(
  { title, content, status, excerpt, coverImage }: CreateArticleBody,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const author = await getAuthorById(userId);

  const [articleData] = await db
    .insert(article)
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
      publicId: article.publicId,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      status: article.status,
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    });

  return {
    ...articleData,
    author,
  } satisfies ArticleResponse;
}

export async function getArticles(
  { status, q, page = 1, limit = 20 }: ArticlesQuery,
  username?: string | null | undefined
) {
  const offset = (page - 1) * limit;
  const author = username ? await getAuthorByUsername(username) : null;

  const whereConditions = and(
    eq(article.status, status ?? 'published'),
    author ? eq(article.authorId, author.id) : undefined,
    q ? ilike(article.title, `%${q}%`) : undefined
  );

  const dataQuery = db
    .select({
      publicId: article.publicId,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      status: article.status,
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: {
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        username: user.username,
        displayUsername: user.displayUsername,
      },
    })
    .from(article)
    .leftJoin(user, eq(article.authorId, user.id))
    .where(whereConditions)
    .orderBy(desc(article.createdAt))
    .limit(limit)
    .offset(offset);

  const countQuery = db
    .select({ count: count() })
    .from(article)
    .where(whereConditions);

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
  } satisfies ArticlesResponse;
}

export async function getArticleByPublicId(
  publicId: string,
  userId: string | undefined
) {
  const [articleData] = await db
    .select({
      publicId: article.publicId,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      status: article.status,
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      authorId: article.authorId,
      author: {
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        username: user.username,
        displayUsername: user.displayUsername,
      },
    })
    .from(article)
    .leftJoin(user, eq(article.authorId, user.id))
    .where(eq(article.publicId, publicId))
    .limit(1);

  if (!articleData) {
    throw new NotFoundError('Article not found.');
  }

  if (articleData.status !== 'published' && articleData.authorId !== userId) {
    throw new AuthError('You are not allowed to access this resource.', 403);
  }

  return articleData satisfies ArticleResponse;
}

export async function getArticleBySlug(slug: string, username: string) {
  const author = await getAuthorByUsername(username);

  const [articleData] = await db
    .select({
      publicId: article.publicId,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      status: article.status,
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      authorId: article.authorId,
    })
    .from(article)
    .where(
      and(
        eq(article.status, 'published'),
        eq(article.slug, slug),
        eq(article.authorId, author.id)
      )
    )
    .limit(1);

  if (!articleData) {
    throw new NotFoundError('Article not found.');
  }

  return {
    ...articleData,
    author,
  } satisfies ArticleResponse;
}

export async function updateArticle(
  publicId: string,
  {
    title,
    content,
    excerpt,
    status: articleStatus,
    coverImage,
  }: UpdateArticleBody,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const articleData = await getArticleByPublicId(publicId, userId);
  const author = await getAuthorById(articleData.authorId);

  const payload: Partial<UpdateArticleBody> = {};

  if (title !== undefined && title !== articleData.title) {
    payload.title = title?.trim();
    payload.slug = await slugify(title, author.id);
  }

  if (content !== undefined && content !== articleData.content) {
    payload.content = content?.trim();
  }

  if (excerpt !== undefined && excerpt !== articleData.excerpt) {
    payload.excerpt = excerpt?.trim();
  }

  if (articleStatus !== undefined && articleStatus !== articleData.status) {
    payload.status = articleStatus;
  }

  if (coverImage !== undefined && coverImage !== articleData.coverImage) {
    payload.coverImage = coverImage;
  }

  if (Object.keys(payload).length === 0) {
    return articleData satisfies ArticleResponse;
  }

  const [updatedData] = await db
    .update(article)
    .set({ ...payload })
    .where(eq(article.publicId, publicId))
    .returning({
      publicId: article.publicId,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      status: article.status,
      coverImage: article.coverImage,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    });

  return {
    ...updatedData,
    author,
  } satisfies ArticleResponse;
}

export async function deleteArticle(
  publicId: string,
  userId: string | undefined
) {
  if (!userId) {
    throw new AuthError('You are not allowed to perform this action.');
  }

  const articleData = await getArticleByPublicId(publicId, userId);

  await db.delete(article).where(eq(article.publicId, articleData.publicId));

  return { message: 'Article deleted successfully' };
}
