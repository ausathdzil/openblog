import { describe, expect, it } from 'bun:test';
import { elysia } from '@/lib/eden';

describe('Elysia', () => {
  it('returns a response', async () => {
    const { data } = await elysia.get();

    expect(data).toBe('Hello, World!');
  });
});
