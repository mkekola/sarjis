import { defineConfig } from 'vitest/config';

// The domain logic is plain functions, so the tests need no browser
// environment. Component tests will need @nuxt/test-utils; add it then.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
});
