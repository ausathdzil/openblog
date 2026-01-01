/**
 * biome-ignore-all lint/suspicious/noAssignInExpressions: @see https://elysiajs.com/integrations/better-auth.html#openapi
 * biome-ignore-all lint/suspicious/noExplicitAny: @see https://elysiajs.com/integrations/better-auth.html#openapi
 */

import { and, eq } from 'drizzle-orm';
import { type Static, type TSchema, t } from 'elysia';
import * as z from 'zod';

import { db } from '@/db';
import { articles } from '@/db/schema';
import { auth } from '@/lib/auth';

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const BetterAuthOpenAPI = {
  getPaths: (prefix = '/elysia/auth/api') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];

          operation.tags = ['Better Auth'];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;

// This wrapper restores the "pass object, get reference" behavior
export const Ref = <T extends TSchema>(schema: T) => {
  if (!schema.$id) {
    throw new Error('Schema passed to Ref must have an $id');
  }

  // Use t.Unsafe to trick TypeScript into treating the reference
  // as the original type for inference purposes
  return t.Unsafe<Static<T>>(t.Ref(schema.$id));
};

const Slug = z.string().slugify();

export async function slugify(
  input: string | null | undefined,
  authorId: string | null | undefined,
) {
  if (!input || !authorId) {
    return null;
  }

  const base = Slug.parse(input);
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.authorId, authorId)));

    if (existing.length === 0) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix++;
  }
}
