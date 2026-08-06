import { isNotNull, relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text('username').unique(),
  displayUsername: text('display_username'),
  bio: text('bio'),
  website: text('website'),
  twitter: text('twitter'),
  facebook: text('facebook'),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const passkey = pgTable(
  'passkey',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('public_key').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    credentialID: text('credential_id').notNull(),
    counter: integer('counter').notNull(),
    deviceType: text('device_type').notNull(),
    backedUp: boolean('backed_up').notNull(),
    transports: text('transports'),
    createdAt: timestamp('created_at'),
    aaguid: text('aaguid'),
  },
  (table) => [
    index('passkey_userId_idx').on(table.userId),
    index('passkey_credentialID_idx').on(table.credentialID),
  ]
);

export const articleStatus = ['draft', 'published', 'archived'] as const;

export const article = pgTable(
  'article',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    publicId: text('public_id')
      .$defaultFn(() => nanoid(12))
      .notNull()
      .unique(),
    title: text('title'),
    slug: text('slug'),
    contentJson: jsonb('content_json'),
    excerpt: text('excerpt'),
    status: text('status').default('draft').notNull(),
    coverImage: text('cover_image'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('article_author_slug_unique_idx')
      .on(table.authorId, table.slug)
      .where(isNotNull(table.slug)),
    index('article_status_created_at_idx').on(table.status, table.createdAt),
    index('article_author_status_created_at_idx').on(
      table.authorId,
      table.status,
      table.createdAt
    ),
    check(
      'article_status_check',
      sql`status in (${sql.raw(articleStatus.map((s) => `'${s}'`).join(', '))})`
    ),
  ]
);

export const tag = pgTable('tag', {
  id: text('id')
    .$defaultFn(() => nanoid(12))
    .primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const articleTag = pgTable(
  'article_tag',
  {
    articleId: bigint('article_id', { mode: 'number' })
      .notNull()
      .references(() => article.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.tagId] }),
    index('article_tag_tag_id_idx').on(table.tagId),
  ]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  articles: many(article),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const articleRelations = relations(article, ({ one, many }) => ({
  author: one(user, {
    fields: [article.authorId],
    references: [user.id],
  }),
  articleTags: many(articleTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  articleTags: many(articleTag),
}));

export const articleTagsRelations = relations(articleTag, ({ one }) => ({
  article: one(article, {
    fields: [articleTag.articleId],
    references: [article.id],
  }),
  tag: one(tag, {
    fields: [articleTag.tagId],
    references: [tag.id],
  }),
}));
