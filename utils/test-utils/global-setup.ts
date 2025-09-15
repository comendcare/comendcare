// utils/test-utils/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '@comend/lib/prisma';
import { encode } from 'next-auth/jwt';

const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e@comend.test';

const apps = [
    { name: 'web', url: process.env.WEB_URL || 'http://localhost:3000' },
    // add others later as you enable them
];

export default async function globalSetup(_config: FullConfig) {
    const outDir = path.resolve(process.cwd(), 'storage-states');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Ensure user exists (idempotent)
    const user = await prisma.user.upsert({
        where: { email: TEST_EMAIL },
        update: {},
        create: { email: TEST_EMAIL, name: 'E2E User' },
    });

    await prisma.whitelist.upsert({
        where: { email: TEST_EMAIL },
        update: {},
        create: {
            email: TEST_EMAIL,
        },
    });

    // Mint a NextAuth JWT compatible with your session: { strategy: 'jwt' }
    if (!process.env.NEXTAUTH_SECRET) {
        throw new Error('NEXTAUTH_SECRET must be set for tests.');
    }
    const token = await encode({
        token: { sub: user.id, email: user.email, name: user.name },
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const browser = await chromium.launch();

    for (const app of apps) {
        const appUrl = app.url.replace(/\/$/, '');
        const { hostname, protocol } = new URL(appUrl);

        // IMPORTANT: cookie name & options match your auth config
        // Local dev: no domain, secure: false, sameSite: 'Lax'
        const cookieName = 'next-auth.session-token';

        const context = await browser.newContext({
            // start clean so we only write our cookie
            storageState: { cookies: [], origins: [] },
        });

        await context.addCookies([{
            name: cookieName,
            value: token,
            domain: hostname,   // 'localhost'
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
            secure: protocol === 'https:', // false for http://localhost
            expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        }]);

        // Optional: quick probe to ensure we’re not bounced to /login
        const page = await context.newPage();
        await page.goto(appUrl + '/', { waitUntil: 'domcontentloaded' });
        if (page.url().includes('/login')) {
            throw new Error('Auth cookie did not stick; landed on /login. Check cookie name/options.');
        }

        await context.storageState({ path: path.join(outDir, `${app.name}.json`) });
        await context.close();
    }

    await browser.close();
}
