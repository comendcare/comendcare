import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const apps = [
    { name: 'web',        dir: 'apps/web',        port: 3000, envVar: 'WEB_URL' },
    { name: 'admin',      dir: 'apps/admin',      port: 3001, envVar: 'ADMIN_URL' },
    { name: 'pharma',     dir: 'apps/pharma',     port: 3002, envVar: 'PHARMA_URL' },
    { name: 'provider',   dir: 'apps/provider',   port: 3003, envVar: 'PROVIDER_URL' },
    { name: 'researcher', dir: 'apps/researcher', port: 3004, envVar: 'RESEARCHER_URL' },
];

const targets = [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox',  use: devices['Desktop Firefox'] },
    { name: 'webkit',   use: devices['Desktop Safari'] },
    { name: 'iphone',   use: devices['iPhone 13'] },
    { name: 'android',  use: devices['Pixel 5'] },
];

export default defineConfig({
  testDir: './apps',
  testMatch: /.*\/tests\/.*\.spec\.ts/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },


    // Flatten matrix: one project per (app × target)
    projects: apps.flatMap(app =>
        targets.map(t => ({
            name: `${app.name}-${t.name}`,
            testDir: `${app.dir}/tests`,
            use: {
                ...t.use,
                baseURL: process.env[app.envVar] || `http://localhost:${app.port}`,
            },
        })),
    ),

    // Start local servers for apps that don't have a BASE_URL provided
    webServer: apps
        .filter(app => !process.env[app.envVar])
        .map(app => ({
            command: `npm --workspace ${app.dir} run dev`,
            port: app.port,
            reuseExistingServer: !process.env.CI,
            env: { PORT: String(app.port), NODE_ENV: 'test' },
        })),
});
