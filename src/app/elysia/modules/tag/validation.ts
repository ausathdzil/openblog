import { t } from 'elysia';

export const tagArrayValidation = t.Optional(
  t.Array(t.String({ maxLength: 50 }), { maxItems: 5 })
);
