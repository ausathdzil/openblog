import { describe, expect, it, mock } from 'bun:test';

import { slugify } from '@/app/elysia/modules/utils';

describe('Module utils', () => {
  describe('Slugify', () => {
    it('returns null when input is missing', async () => {
      const noop = mock(async () => false);
      expect(await slugify(null, 'user-1', noop)).toBeNull();
      expect(await slugify('Hello World', null, noop)).toBeNull();
      expect(noop).not.toHaveBeenCalled();
    });

    it('returns base slug when unique', async () => {
      const slugExists = mock(async () => false);
      const result = await slugify('Hello World', 'user-1', slugExists);

      expect(result).toBe('hello-world');
      expect(slugExists).toHaveBeenCalledTimes(1);
      expect(slugExists).toHaveBeenCalledWith('hello-world', 'user-1');
    });

    it('appends suffix when slug exists', async () => {
      const slugExists = mock()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await slugify('Hello World', 'user-1', slugExists);

      expect(result).toBe('hello-world-2');
      expect(slugExists).toHaveBeenNthCalledWith(1, 'hello-world', 'user-1');
      expect(slugExists).toHaveBeenNthCalledWith(2, 'hello-world-2', 'user-1');
    });

    it('increments until suffix is unique', async () => {
      const slugExists = mock()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await slugify('Hello World', 'user-1', slugExists);

      expect(result).toBe('hello-world-3');
      expect(slugExists).toHaveBeenNthCalledWith(1, 'hello-world', 'user-1');
      expect(slugExists).toHaveBeenNthCalledWith(2, 'hello-world-2', 'user-1');
      expect(slugExists).toHaveBeenNthCalledWith(3, 'hello-world-3', 'user-1');
    });
  });
});
