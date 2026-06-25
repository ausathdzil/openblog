import { describe, expect, it, mock } from 'bun:test';

import { slugify } from '@/app/elysia/modules/utils';

describe('Module utils', () => {
  describe('Slugify', () => {
    it('returns null when input is missing', async () => {
      const noop = mock(async () => []);
      expect(await slugify(null, 'user-1', noop)).toBeNull();
      expect(await slugify('Hello World', null, noop)).toBeNull();
      expect(noop).not.toHaveBeenCalled();
    });

    it('returns base slug when unique', async () => {
      const getExistingSlugs = mock(async () => []);
      const result = await slugify('Hello World', 'user-1', getExistingSlugs);

      expect(result).toBe('hello-world');
      expect(getExistingSlugs).toHaveBeenCalledTimes(1);
      expect(getExistingSlugs).toHaveBeenCalledWith('hello-world', 'user-1');
    });

    it('appends suffix when slug exists', async () => {
      const getExistingSlugs = mock(async () => ['hello-world']);

      const result = await slugify('Hello World', 'user-1', getExistingSlugs);

      expect(result).toBe('hello-world-2');
      expect(getExistingSlugs).toHaveBeenCalledTimes(1);
      expect(getExistingSlugs).toHaveBeenCalledWith('hello-world', 'user-1');
    });

    it('increments until suffix is unique', async () => {
      const getExistingSlugs = mock(async () => ['hello-world', 'hello-world-2']);

      const result = await slugify('Hello World', 'user-1', getExistingSlugs);

      expect(result).toBe('hello-world-3');
      expect(getExistingSlugs).toHaveBeenCalledTimes(1);
      expect(getExistingSlugs).toHaveBeenCalledWith('hello-world', 'user-1');
    });
  });
});
