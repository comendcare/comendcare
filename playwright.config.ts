import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Monorepo apps and targets
 */
const apps = [
    { name: 'web', dir: 'apps/web', port: 3001, envVar: 'WEB_URL' },
    // { name: 'admin', dir: 'apps/admin', port: 3002, envVar: 'ADMIN_URL' },
    // { name: 'pharma', dir: 'apps/pharma', port: 3003, envVar: 'PHARMA_URL' },
    // { name: 'provider', dir: 'apps/provider', port: 3004, envVar: 'PROVIDER_URL' },
    // { name: 'researcher', dir: 'apps/researcher', port: 3005, envVar: 'RESEARCHER_URL' },
];

const targets = [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    // { name: 'firefox', use: devices['Desktop Firefox'] },
    // { name: 'webkit', use: devices['Desktop Safari'] },
    // { name: 'iphone', use: devices['iPhone 13'] },
    // { name: 'android', use: devices['Pixel 5'] },
];

/**
 * Vercel Protection Bypass
 * Use the official variable name from Vercel docs.
 * (Also allow fallback to legacy VERCEL_BYPASS if you had one.)
 */
const vercelBypassSecret =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET || process.env.VERCEL_BYPASS;

const extraBypassHeaders =
    vercelBypassSecret
        ? {
            'x-vercel-protection-bypass': vercelBypassSecret,
            // Make follow-up browser requests authorized via cookie automatically.
            // Use 'samesitenone' if you ever exercise the app in iframes.
            'x-vercel-set-bypass-cookie': process.env.CI ? 'true' : 'true',
        }
        : undefined;

export default defineConfig({
    testDir: './apps',
    testMatch: /.*\/tests\/.*\.spec\.ts/,
    outputDir: './tests/test-results',
    globalSetup: './utils/test-utils/global-setup.ts',

    fullyParallel: true,
    forbidOnly: !!process.env.CI,

    // Flake handling
    // retries: process.env.CI ? 2 : 0,
    retries: 0,
    workers: process.env.CI ? 1 : undefined,

    // DX + CI visibility
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        // ['junit', { outputFile: 'tests/test-results/junit.xml' }], // uncomment if needed
    ],

    use: {
        // Artifacts tuned for CI/local
        trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
        video: process.env.CI ? 'retain-on-failure' : 'off',
        screenshot: process.env.CI ? 'only-on-failure' : 'off',

        // Add Vercel bypass headers if configured
        extraHTTPHeaders: extraBypassHeaders,
    },

    // Flatten matrix: one project per (app × target)
    projects: apps.flatMap(app =>
        targets.map(t => ({
            name: `${app.name}-${t.name}`,
            testDir: `${app.dir}/tests`,
            use: {
                ...t.use,
                baseURL: process.env[app.envVar] || `http://localhost:${app.port}`,
                storageState: `storage-states/${app.name}.json`,
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
            env: {
                ...process.env,
                PORT: String(app.port),
                NODE_ENV: 'test',
                E2E: '1',
                NEXTAUTH_URL: process.env[app.envVar] || `http://localhost:${app.port}`,
                NEXT_PUBLIC_ROOT_DOMAIN:
                    process.env.NEXT_PUBLIC_ROOT_DOMAIN || `localhost:${app.port}`,
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
                DATABASE_URL: process.env.DATABASE_URL!,
                TEST_EMAIL: process.env.TEST_EMAIL || 'e2e@comend.test',
            },
        })),
});
