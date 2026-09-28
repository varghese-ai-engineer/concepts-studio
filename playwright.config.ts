import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const API_PORT = 3010;
const WEB_PORT = 3000;
// Isolated /data per test run so tests never touch real analytics config.
const dataDir = mkdtempSync(join(tmpdir(), 'ga-e2e-'));

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
  },
  webServer: [
    {
      command: `DATA_DIR=${dataDir} ANALYTICS_ADMIN_TOKEN=test-token PORT=${API_PORT} node api/server.js`,
      port: API_PORT,
      reuseExistingServer: false,
      timeout: 15000,
    },
    {
      // Dev server with /api rewrites pointed at the test API.
      command: `API_PROXY_TARGET=http://localhost:${API_PORT} npx next dev -p ${WEB_PORT}`,
      port: WEB_PORT,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
