// apps/web/tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';
import { TID } from "@/utils/test-utils/test-ids";
import prisma from "@comend/lib/prisma"


const rand = () => Math.random().toString(36).slice(2, 8);

const TEST_EMAIL = process.env.TEST_EMAIL ?? "e2e+user@comend.test";

test('debug cookies', async ({ page, context }) => {
    await page.goto('/');
    const cookies = await context.cookies();
    console.log('cookies for origin', cookies.filter(c => c.domain?.includes('localhost')));
});

/**
 * Targeted cleanup that avoids nuking the auth user/session.
 * - Deletes orgs your tests create (name "PRG ..." or subdomain "prg-*")
 * - Deletes throwaway users created by tests (…@example.org), but keeps TEST_EMAIL
 * - Cleans sessions/tokens for those throwaway users only
 */
export async function resetDb() {
    // Collect throwaway users (…@example.org, excluding the E2E login user if it happens to match)
    const throwawayUsers = await prisma.user.findMany({
        where: {
            email: { endsWith: "@example.org" },
            NOT: { email: TEST_EMAIL },
        },
        select: { id: true },
    });
    const throwawayUserIds = throwawayUsers.map(u => u.id);

    await prisma.$transaction([
        // 1) Remove sessions that belong to throwaway users
        prisma.session.deleteMany({
            where: { userId: { in: throwawayUserIds } },
        }),

        // 2) Remove verification tokens generated for throwaway identities
        prisma.verificationToken.deleteMany({
            where: { identifier: { endsWith: "@example.org" } },
        }),

        // 3) Remove organizations created by tests (these cascade their children)
        prisma.organization.deleteMany({
            where: {
                OR: [
                    { name: { startsWith: "PRG " } },  // from the test data
                    { subdomain: { startsWith: "prg-" } },
                ],
            },
        }),

        // 4) Finally, remove the throwaway users themselves (cascades handle dependents)
        prisma.user.deleteMany({
            where: {
                email: { endsWith: "@example.org" },
                NOT: { email: TEST_EMAIL },
            },
        }),

        // (Optional) If your tests create Roadmaps outside those PRG orgs, clean by a tag/prefix:
        // prisma.roadmap.deleteMany({ where: { title: { startsWith: "PRG " } } }),
    ]);
}

test.describe('Onboarding', () => {
    // test.beforeEach(async ({ request }) => {
    //     // optional reset when running locally against test env
    //     if (process.env.NODE_ENV === 'test') {
    //         // await resetDb()
    //     }
    // });


    test('Testing simplest thing', async ({ page }) => {
        await page.goto('/onboarding');

        await expect(page).toHaveTitle("Onboarding | Comend");
        await expect(page.getByRole("heading", {name: "Welcome to Comend"})).toBeVisible();
    });


    test('Happy path creates org + owner + subdomain + workspace', async ({ page }) => {
        await page.goto('/onboarding');


        await page.getByTestId('onboard-name').fill('Jane Founder');
        await page.getByTestId('onboard-email').fill(`jane+${rand()}@example.org`);
        await page.getByTestId('onboard-org-name').fill(`PRG ${rand()}`);


        const sub = `prg-${rand()}`;
        await page.getByTestId('onboard-subdomain').fill(sub);


        const submit = page.getByTestId('onboard-submit');
        await Promise.all([
            page.waitForResponse((res) => res.url().includes('/api/onboarding') && res.ok()),
            submit.click(),
        ]);


        await expect(submit).toBeDisabled(); // duplicate guard during submit
        await expect(page.getByTestId('loading-state')).toBeVisible();


// Success landing
//         await expect(page.getByTestId('onboard-success')).toBeVisible();
        await expect(page).toHaveURL(/profile|welcome/i);


// Subdomain normalization appears somewhere (optional):
        await expect(page.getByText(new RegExp(`${sub}\.comend\.(?:.*)`, 'i'))).toBeVisible();
    });


    test('Inline validation prevents submit on missing/invalid fields', async ({ page }) => {
        await page.goto('/onboarding');
        await page.getByTestId('onboard-submit').click();


        await expect(page.locator(TID.inlineError).first()).toBeVisible();
        await expect(page.getByTestId('onboard-submit')).toBeDisabled();


        await page.getByTestId('onboard-email').fill('not-an-email');
        await expect(page.getByText(/invalid email/i)).toBeVisible();
    });


//     test('Server error path shows friendly error and guidance', async ({ page }) => {
//         await page.goto('/onboarding');
//
//
//         await page.getByTestId('onboard-name').fill('Error Case');
//         await page.getByTestId('onboard-email').fill(`err+${rand()}@example.org`);
//         await page.getByTestId('onboard-org-name').fill('Org Err');
//         await page.getByTestId('onboard-subdomain').fill(`dupe-subdomain`);
//
//
// // If your app checks subdomain uniqueness via /api/subdomain/exists, you can simulate a collision:
//         await page.route('**/api/subdomain/exists**', (route) => {
//             route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ exists: true }) });
//         });
//
//
//         await page.getByTestId('onboard-submit').click();
//
//
//         await expect(page.getByText(/already taken|choose another/i)).toBeVisible();
// // If submit reaches server and fails:
// // await expect(page.getByText(/something went wrong|contact support/i)).toBeVisible();
//     });
});
