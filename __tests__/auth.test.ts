import { describe, expect, it } from 'bun:test';

import { usernameRegex } from '@/lib/auth';

/**
 * @TODO E2E auth flows with authContext.testUser and authContext.authTest.
 * @see `setupAuthContext()` in `__tests__/auth.utils.ts`
 */
describe('Auth', () => {
  describe('Utils', () => {
    it('validates usernames with configured regex', () => {
      expect(usernameRegex.test('valid_name')).toBe(true);
      expect(usernameRegex.test('.invalid')).toBe(false);
    });
  });
});
