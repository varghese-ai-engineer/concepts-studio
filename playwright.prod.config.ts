import { defineConfig } from '@playwright/test';

// Production verification config — no local web servers.
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  reporter: [['list']],
  use: {
    baseURL: 'https://webchat.aisolutioncraft.com',
  },
});
