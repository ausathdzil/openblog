import { describe, expect, it } from 'bun:test';

import { usernameRegex } from '@/lib/auth';

describe('Auth', () => {
  describe('Utils', () => {
    it('validates usernames with configured regex', () => {
      expect(usernameRegex.test('valid_name')).toBe(true);
      expect(usernameRegex.test('.invalid')).toBe(false);
    });
  });
});
