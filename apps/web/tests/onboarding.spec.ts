// apps/web/tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';
import { TID } from "@/utils/test-utils/test-ids";
import prisma from "@comend/lib/prisma"


const rand = () => Math.random().toString(36).slice(2, 8);

export async function resetDb() {
    await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Organization", "User", "Subdomain" RESTART IDENTITY CASCADE;
  `);
}


test.describe('Onboarding', () => {
    test.beforeEach(async ({ request }) => {
        // optional reset when running locally against test env
        if (process.env.NODE_ENV === 'test') {
            await resetDb()
        }
    });


    test('Happy path creates org + owner + subdomain + workspace', async ({ page }) => {
        await page.goto('/onboarding');


        await page.getByTestId('onboard-name').fill('Jane Founder');
        await page.getByTestId('onboard-admin-email').fill(`jane+${rand()}@example.org`);
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
        await expect(page.getByTestId('onboard-success')).toBeVisible();
        await expect(page).toHaveURL(/profile|welcome/i);


// Subdomain normalization appears somewhere (optional):
        await expect(page.getByText(new RegExp(`${sub}\.comend\.(?:.*)`, 'i'))).toBeVisible();
    });


    test('Inline validation prevents submit on missing/invalid fields', async ({ page }) => {
        await page.goto('/onboarding');
        await page.getByTestId('onboard-submit').click();


        await expect(page.locator(TID.inlineError).first()).toBeVisible();
        await expect(page.getByTestId('onboard-submit')).toBeDisabled();


        await page.getByTestId('onboard-admin-email').fill('not-an-email');
        await expect(page.getByText(/invalid email/i)).toBeVisible();
    });


    test('Server error path shows friendly error and guidance', async ({ page }) => {
        await page.goto('/onboarding');


        await page.getByTestId('onboard-name').fill('Error Case');
        await page.getByTestId('onboard-admin-email').fill(`err+${rand()}@example.org`);
        await page.getByTestId('onboard-org-name').fill('Org Err');
        await page.getByTestId('onboard-subdomain').fill(`dupe-subdomain`);


// If your app checks subdomain uniqueness via /api/subdomain/exists, you can simulate a collision:
        await page.route('**/api/subdomain/exists**', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ exists: true }) });
        });


        await page.getByTestId('onboard-submit').click();


        await expect(page.getByText(/already taken|choose another/i)).toBeVisible();
// If submit reaches server and fails:
// await expect(page.getByText(/something went wrong|contact support/i)).toBeVisible();
    });
});
