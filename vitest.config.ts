import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node', // Engine tests are pure logic
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
