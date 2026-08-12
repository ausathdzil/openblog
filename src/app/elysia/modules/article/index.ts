import Elysia, { t } from 'elysia';

import { AuthError, auth } from '../auth';
import {
  articleInvalid,
  articleResponse,
  articlesQuery,
  articlesResposnse,
  createArticleBody,
  updateArticleBody,
  uploadCoverImageBody,
  uploadCoverImageInvalid,
  uploadCoverImageResponse,
} from './model';
import {
  createArticle,
  deleteArticle,
  getArticleByPublicId,
  getArticles,
  removeCoverImage,
  updateArticle,
  updateCoverImage,
} from './service';

export const article = new Elysia({ prefix: '/articles', tags: ['Articles'] })
  .use(auth)
  .model({
    Article: articleResponse,
    Articles: articlesResposnse,
  })
  .error({
    AuthError,
  })
  .onError(({ code, status, error }) => {
    if (code === 'AuthError') {
      return status(error.status, { message: error.message });
    }
  })
  .post(
    '',
    async ({ body, set, user }) => {
      const _article = await createArticle(body, user?.id);
      set.status = 201;
      return _article;
    },
    {
      auth: true,
      body: createArticleBody,
      response: {
        201: 'Article',
        401: articleInvalid,
        422: articleInvalid,
      },
    }
  )
  .get('', async ({ query }) => await getArticles(query), {
    query: t.Omit(articlesQuery, ['status']),
    response: {
      200: 'Articles',
    },
  })
  .onError(({ code, status, error }) => {
    if (code === 'NOT_FOUND') {
      return status(404, { message: error.message });
    }
  })
  .get(
    '/:publicId',
    async ({ params, user }) =>
      await getArticleByPublicId(params.publicId, user?.id),
    {
      auth: true,
      response: {
        200: 'Article',
        403: articleInvalid,
        404: articleInvalid,
      },
    }
  )
  .patch(
    '/:publicId',
    async ({ params, body, user }) =>
      await updateArticle(params.publicId, body, user?.id),
    {
      auth: true,
      body: t.Omit(updateArticleBody, ['slug']),
      response: {
        200: 'Article',
        401: articleInvalid,
        403: articleInvalid,
        404: articleInvalid,
      },
    }
  )
  .delete(
    '/:publicId',
    async ({ params, user }) => await deleteArticle(params.publicId, user?.id),
    {
      auth: true,
      response: {
        200: articleInvalid,
        401: articleInvalid,
        403: articleInvalid,
        404: articleInvalid,
      },
    }
  )
  .post(
    '/:publicId/cover-image/upload',
    async ({ params, body, user }) => {
      if (!user) {
        throw new AuthError('You are not allowed to access this resource.');
      }
      return await updateCoverImage(params.publicId, user.id, body.file);
    },
    {
      auth: true,
      params: t.Object({ publicId: t.String() }),
      body: uploadCoverImageBody,
      response: {
        200: uploadCoverImageResponse,
        401: uploadCoverImageInvalid,
        403: uploadCoverImageInvalid,
        404: uploadCoverImageInvalid,
      },
    }
  )
  .delete(
    '/:publicId/cover-image',
    async ({ params, user }) => {
      if (!user) {
        throw new AuthError('You are not allowed to access this resource.');
      }
      return await removeCoverImage(params.publicId, user.id);
    },
    {
      auth: true,
      params: t.Object({ publicId: t.String() }),
      response: {
        200: uploadCoverImageInvalid,
        401: uploadCoverImageInvalid,
        403: uploadCoverImageInvalid,
        404: uploadCoverImageInvalid,
      },
    }
  );
