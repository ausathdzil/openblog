import { describe, expect, test } from 'bun:test';

import { usernameRegex } from '@/lib/auth';
import { auth } from './auth.utils';

describe('Auth', () => {
  test('exposes test utils', async () => {
    const ctx = await auth.$context;

    expect(ctx.test).toBeDefined();
  });

  test('validates usernames with configured regex', () => {
    expect(usernameRegex.test('valid_name')).toBe(true);
    expect(usernameRegex.test('.invalid')).toBe(false);
  });
});
