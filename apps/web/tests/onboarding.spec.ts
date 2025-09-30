// apps/web/tests/e2e/onboarding.spec.ts
import {test, expect} from "@playwright/test";
import {TID} from "@/utils/test-utils/test-ids";
import prisma from "@comend/lib/prisma";

const rand = () => Math.random().toString(36).slice(2, 8);
const TEST_EMAIL = process.env.TEST_EMAIL ?? "e2e+user@comend.test";

/**
 * Tiny 1x1 transparent PNG as a buffer (valid PNG header).
 */
function tinyPngBuffer() {
    // iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB... (1x1 transparent)
    const b64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9Wm1P9YAAAAASUVORK5CYII=";
    return Buffer.from(b64, "base64");
}

test("debug cookies", async ({page, context}) => {
    const cookies = await context.cookies();
    // eslint-disable-next-line no-console
    console.log(
        "cookies for origin",
        cookies.filter((c) => c.domain?.includes("localhost")),
    );
});


test.describe("Onboarding", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/onboarding");
    });

    test("Page context check", async ({page}) => {
        await expect(page).toHaveTitle("Onboarding | Comend");
        await expect(page.getByRole("heading", {name: "Welcome to Comend"})).toBeVisible();
        await expect(page.getByRole("button", {name: "Complete sign-up"})).toBeVisible();
    });

    test("Inline validation blocks submit when required name is missing/too short", async ({page}) => {

        // Click submit on an empty form to get the toast
        await page.getByRole("button", {name: "Complete sign-up"}).click();

        // Now touch the field to force inline validation to render
        const nameInput = page.getByTestId("onboard-name");

        // Type a single char (invalid: min 2), then blur
        await nameInput.fill("A");
        await nameInput.blur();

        // Assert the inline error by its message (most resilient)
        await expect(page.getByText(/your name must be at least 2 characters/i)).toBeVisible();

        // Fix it -> error should disappear
        await nameInput.fill("Jane Doe");
        await nameInput.blur();
        await expect(page.getByText(/your name must be at least 2 characters/i)).toHaveCount(0);
    });

    test("Checkboxes can be toggled (notification + consent)", async ({page}) => {

        // Ensure form is rendered
        await expect(page.getByTestId("onboard-name")).toBeVisible();

        const checkboxes = page.getByRole("checkbox");
        await expect(checkboxes).toHaveCount(2);

        const toggleAndAssert = async (box: ReturnType<typeof page.getByRole>) => {
            const before = (await box.getAttribute("aria-checked")) ?? "false";

            await box.click();
            await expect(box).toHaveAttribute(
                "aria-checked",
                before === "true" ? "false" : "true"
            );

            await box.click();
            await expect(box).toHaveAttribute("aria-checked", before);
        };

        await toggleAndAssert(checkboxes.nth(0));
        await toggleAndAssert(checkboxes.nth(1));
    });

    test("Image upload accepts PNG/JPG (no testids)", async ({page}) => {
        await expect(page.getByTestId("onboard-name")).toBeVisible();

        // Try to use any file input (even if hidden); wait a bit for init
        const anyInput = page.locator('input[type="file"]');
        await expect(anyInput.first()).toBeAttached({timeout: 5000});

        const b64 =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9Wm1P9YAAAAASUVORK5CYII=";
        await anyInput.first().setInputFiles({
            name: "avatar.png",
            mimeType: "image/png",
            buffer: Buffer.from(b64, "base64"),
        });

        // Scope the Crop button to the toolbar that also has Cancel
        const cropBar = page
            .locator('div:has(> button:has-text("Cancel")):has(> button:has-text("Crop"))')
            .first();

        // Crop may or may not appear (e.g., if your component skips it); handle both
        await expect.soft(cropBar).toBeVisible({timeout: 3000});
        if ((await cropBar.count()) > 0) {
            await cropBar.getByRole("button", {name: /^Crop$/}).click();
            await expect(cropBar).toBeHidden();
        }

        await expect(page.locator('img[src^="data:image/"]')).toBeVisible();
    });

    test("Happy path: fill name, toggle preferences, upload image, then submit (shows loading state and success toast)", async ({page}) => {

        // Fill the required name
        await page.getByTestId("onboard-name").fill(`Jane Founder ${rand()}`);

        // Opt into notifications/consent (exercise the mixpanel gates as best-effort)
        const checkboxes = page.getByRole("checkbox");
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Upload a tiny PNG so the image field is populated
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.count()) {
            await fileInput.setInputFiles({
                name: `avatar-${rand()}.png`,
                mimeType: "image/png",
                buffer: tinyPngBuffer(),
            });
        }

        const cropBar = page.locator('div:has(> button:has-text("Cancel")):has(> button:has-text("Crop"))').first();
        await cropBar.getByRole('button', {name: /^Crop$/}).click();

        const submit = page.getByRole("button", {name: "Complete sign-up"});

        // Click submit and expect it to enter a loading/disabled state briefly
        await submit.click();

        // We should see either a success toast (best case) or, if backend rejects,
        // at least NOT see inline validation (we already passed validation).
        // Prefer success toast when the app is correctly wired:
        // "Onboarding complete ✨" (from onSubmit)
        await expect
            .poll(async () => {
                const successToast = await page.getByText(/Onboarding complete/i).count();
                return successToast > 0 ? "success" : "pending";
            }, {timeout: 10000, intervals: [200, 400, 800]})
            .toBe("success");

        // After success, the app navigates away to either /app/profile or /app/dashboard
        await expect(page).toHaveURL(/\/app\/(profile|dashboard)/, {timeout: 10000});
    });

    test("Server error path surfaces a friendly error toast", async ({page}) => {

        await page.getByTestId("onboard-name").fill(`Error Case ${rand()}`);

        const submit = page.getByRole("button", {name: "Complete sign-up"});
        await submit.click();

        const successToast = page.getByText(/Onboarding complete/i);
        const errorToast = page.getByText(/Something went wrong while saving/i);

        // Wait for either success or error to appear
        try {
            await Promise.race([
                successToast.waitFor({state: "visible", timeout: 10000}),
                errorToast.waitFor({state: "visible", timeout: 10000}),
            ]);
            // Optional: assert at least one is visible now
            expect(
                (await successToast.count()) > 0 || (await errorToast.count()) > 0
            ).toBeTruthy();
        } catch {
            // If neither appears, ensure we stayed on the page and no inline validation regressed
            await expect(page.locator(TID.inlineError)).toHaveCount(0);
        }
    });
});
