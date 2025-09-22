// utils/test-utils/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '@comend/lib/test-prisma';
import { encode } from 'next-auth/jwt';

const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e@comend.test';

export default async function globalSetup(config: FullConfig) {
    const outDir = path.resolve(process.cwd(), 'storage-states');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Ensure identities exist
    const user = await prisma.user.upsert({
        where: { email: TEST_EMAIL },
        update: {},
        create: { email: TEST_EMAIL, name: 'E2E User' },
    });
    await prisma.whitelist.upsert({
        where: { email: TEST_EMAIL },
        update: {},
        create: { email: TEST_EMAIL },
    });

    if (!process.env.NEXTAUTH_SECRET) {
        throw new Error('NEXTAUTH_SECRET must be set for tests.');
    }

    const jwt = await encode({
        token: { sub: user.id, email: user.email, name: user.name },
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 7,
    });

    const browser = await chromium.launch();

    try {
        // Group projects by app name and collect all distinct baseURLs we must seed
        const apps = new Map<string, Set<string>>(); // app -> set of baseURLs (may include port)
        for (const p of config.projects) {
            const baseURL = (p.use as any)?.baseURL as string | undefined;
            if (!baseURL) continue;
            const appName = p.name.split('-')[0]; // "web" from "web-chromium"
            if (!apps.has(appName)) apps.set(appName, new Set());
            apps.get(appName)!.add(baseURL);
        }

        for (const appName of Array.from(apps.keys())) {
            const baseURLs = apps.get(appName)!;
            const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });

            for (const baseURL of Array.from(baseURLs)) {
                const u = new URL(baseURL);
                const isHttps = u.protocol === 'https:';

                // Write both names on HTTPS (belt & suspenders); only the non-secure on HTTP.
                const cookieNames = isHttps
                    ? ['__Secure-next-auth.session-token', 'next-auth.session-token']
                    : ['next-auth.session-token'];

                for (const name of cookieNames) {
                    await context.addCookies([{
                        name,
                        value: jwt,
                        domain: u.hostname, // cookies are host-scoped; ports don’t apply
                        path: '/',
                        httpOnly: true,
                        sameSite: 'Lax',
                        secure: isHttps,
                        expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
                    }]);
                }
            }

            // Sanity probe using the first *full* baseURL (keeps port if present)
            const first = baseURLs.values().next().value as string | undefined;
            if (first) {
                const page = await context.newPage();
                await page.goto(new URL('/', first).toString(), { waitUntil: 'domcontentloaded' });
                await page.close();
            }

            await context.storageState({ path: path.join(outDir, `${appName}.json`) });
            await context.close();
        }
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
}
