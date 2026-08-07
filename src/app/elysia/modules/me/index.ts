import Elysia from 'elysia';

import {
  articleInvalid,
  articleResponse,
  articlesQuery,
  articlesResposnse,
} from '../article/model';
import { getArticles } from '../article/service';
import { AuthError, auth } from '../auth';
import {
  updateProfileBody,
  updateProfileInvalid,
  updateProfileResponse,
} from './model';
import { updateProfile } from './service';

export const me = new Elysia({ prefix: '/me', tags: ['Me'] })
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
      status(error.status, { message: error.message });
    }
  })
  .get(
    '/articles',
    async ({ query, user }) => {
      if (!user) {
        throw new AuthError('You are not allowed to access this resource.');
      }

      return await getArticles(query, user.username);
    },
    {
      auth: true,
      query: articlesQuery,
      response: {
        200: 'Articles',
        401: articleInvalid,
      },
    }
  )
  .patch(
    '/profile',
    async ({ body, user }) => {
      if (!user) {
        throw new AuthError('You are not allowed to access this resource.');
      }

      return await updateProfile(user.id, body);
    },
    {
      auth: true,
      body: updateProfileBody,
      response: {
        200: updateProfileResponse,
        401: updateProfileInvalid,
      },
    }
  );
