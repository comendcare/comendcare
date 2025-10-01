// utils/test-utils/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';
import prisma from '@comend/lib/test-prisma';
import { encode } from 'next-auth/jwt';

function runPrisma(args: string[]) {
    // Resolve the installed prisma package.json from the repo root
    const pkgPath = require.resolve("prisma/package.json", { paths: [process.cwd()] });
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const prismaDir = path.dirname(pkgPath);
    // Find the "bin" entry for prisma (usually "build/index.js")
    const binRel = (pkg.bin && (pkg.bin.prisma || pkg.bin)) || "build/index.js";
    const binAbs = path.resolve(prismaDir, typeof binRel === "string" ? binRel : binRel.prisma);

    // Use Node to exec the CLI script directly
    childProcess.execFileSync(process.execPath, [binAbs, ...args], {
        stdio: "inherit",
        env: {
            ...process.env,
            PRISMA_HIDE_UPDATE_MESSAGE: "1",
        },
    });
}

function assertSafeTestDatabase(url?: string) {
    if (process.env.NODE_ENV === "test") {
        if (!url) throw new Error('DATABASE_URL is not set.');
        const lower = url.toLowerCase();
        const looksProdHost = lower.includes('prod') || lower.includes('production') || lower.includes('aws') && !lower.includes('localhost');
        const hasTestMarker = lower.includes('test') || lower.includes('_test') || lower.includes('-test');
        if (looksProdHost || !hasTestMarker) {
            throw new Error(`Refusing to reset a non-test database. DATABASE_URL="${url}"`);
        }
    }
}

async function resetDatabase() {
    const url = process.env.DATABASE_URL;
    assertSafeTestDatabase(url);

    const schemaPath = path.resolve(process.cwd(), "prisma", "schema.prisma");

    try {
        // Preferred: real migrations
        runPrisma(["migrate", "reset", "--force", "--skip-generate", "--skip-seed", "--schema", schemaPath]);
    } catch (err) {
        // Fallback: fast schema sync if migrations aren’t available in the environment
        console.warn("[global-setup] migrate reset failed, falling back to db push --force-reset");
        runPrisma(["db", "push", "--force-reset", "--skip-generate", "--schema", schemaPath]);
    }
}

const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e@comend.test';

async function seedOrgForUser() {
    // 1) Ensure user exists
    const user = await prisma.user.upsert({
        where: { email: TEST_EMAIL },
        update: {},
        create: { email: TEST_EMAIL, name: 'E2E User' },
    });

    // 2) Create or reuse a small condition catalog so the picker isn’t empty
    // (idempotent upserts so repeated runs are fine)
    await prisma.condition.upsert({
        where: { slug: 'e2e-test-condition-a' },
        update: {},
        create: {
            name: 'E2E Test Condition A',
            slug: 'e2e-test-condition-a',
            synonyms: [],
            diseaseCategories: [],
        },
    });

    // 3) Org with minimal fields
    const org = await prisma.organization.create({
        data: {
            name: 'PRG Test Org',
            subdomain: `e2e-${Math.random().toString(36).slice(2, 8)}`,
            yearFounded: '2012',
            incorporationStatus: 'YES',
            website: 'https://example.org',
            moneyRaised: 500000, // $500k
            user: { connect: { id: user.id } }, // Organization.userId = owner
            public: true,
            published: true,
            verified: false,
        },
    });

    // 4) Link user as a member
    await prisma.member.create({
        data: {
            userId: user.id,
            organizationId: org.id,
            role: 'owner',
            email: TEST_EMAIL,
        },
    });

    // 5) Set activeOrganizationId
    await prisma.user.update({
        where: { id: user.id },
        data: { activeOrganizationId: org.id },
    });

    // 6) Optional: give the Roadmaps card something to show
    await prisma.roadmap.create({
        data: {
            organizationId: org.id,
            userId: user.id,
            title: 'E2E Sample Roadmap',
            description: 'A minimal roadmap for tests.',
            published: true,
            nodes: {
                create: [{ positionX: 0, positionY: 0 }], // ✅ no roadmapId needed
            },
        },
    });

    return { user, org };
}

export default async function globalSetup(config: FullConfig) {
    // 1) Reset DB once per run
    await resetDatabase();

    const outDir = path.resolve(process.cwd(), './tests/storage-states');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Ensure identities exist
    const { user, org } = await seedOrgForUser();

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
        const apps = new Map<string, Set<string>>();
        for (const p of config.projects) {
            const baseURL = (p.use as any)?.baseURL as string | undefined;
            if (!baseURL) continue;
            const appName = p.name.split('-')[0];
            if (!apps.has(appName)) apps.set(appName, new Set());
            apps.get(appName)!.add(baseURL);
        }

        for (const appName of Array.from(apps.keys())) {
            const baseURLs = apps.get(appName)!;
            const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });

            for (const baseURL of Array.from(baseURLs)) {
                const u = new URL(baseURL);
                const isHttps = u.protocol === 'https:';
                const cookieNames = isHttps
                    ? ['__Secure-next-auth.session-token', 'next-auth.session-token']
                    : ['next-auth.session-token'];
                for (const name of cookieNames) {
                    await context.addCookies([{
                        name, value: jwt, domain: u.hostname, path: '/',
                        httpOnly: true, sameSite: 'Lax', secure: isHttps,
                        expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
                    }]);
                }
            }

            await context.storageState({ path: path.join(outDir, `${appName}.json`) });
            await context.close();
        }
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
}
