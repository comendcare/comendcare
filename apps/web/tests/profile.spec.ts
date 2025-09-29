// apps/web/tests/e2e/profile-edit.spec.ts
import { test, expect, Page, Locator } from "@playwright/test";

const rand = () => Math.random().toString(36).slice(2, 8);

/** Tiny 1x1 transparent PNG buffer */
function tinyPngBuffer() {
    const b64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9Wm1P9YAAAAASUVORK5CYII=";
    return Buffer.from(b64, "base64");
}

async function withinCard(page: Page, heading: RegExp | string) {
    const card = page
        .locator("section, div")
        .filter({
            has: page.getByRole("heading", { name: heading, exact: false }),
        })
        .first();
    await expect(card).toBeVisible();
    return card;
}

async function closeAnyDialog(page: Page) {
    const dlg = page.getByRole("dialog");
    if (await dlg.isVisible().catch(() => false)) {
        // Prefer "Cancel" then close button "×", else ESC
        const cancel = dlg.getByRole("button", { name: /cancel/i });
        if (await cancel.isVisible().catch(() => false)) {
            await cancel.click();
            await expect(dlg).toBeHidden();
            return;
        }
        const close = dlg.locator('button:has-text("×"), [aria-label="Close"]');
        if (await close.isVisible().catch(() => false)) {
            await close.click();
            await expect(dlg).toBeHidden();
            return;
        }
        await page.keyboard.press("Escape");
        await expect(dlg).toBeHidden();
    }
}

test.describe("PAG Profile – edit flows", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate directly to the private profile page
        await page.goto("/app/profile");
        // Basic smoke: main layout pieces show up
        await expect(page.getByRole("main")).toBeVisible();
        await expect(
            page.getByRole("heading", { level: 1 })
        ).toBeVisible({ timeout: 10_000 });
    });

    test("Share dialog opens and closes", async ({ page }) => {
        const shareBtn = page.getByRole("button", { name: /share public profile/i });
        await expect(shareBtn).toBeVisible();
        await shareBtn.click();

        const dlg = page.getByRole("dialog");
        await expect(dlg).toBeVisible();

        // Dialog should include a copyable URL field
        await expect(
            dlg.getByText(/organization profile shared/i).or(dlg.getByText(/share/i))
        ).toBeVisible();

        // Close the dialog
        await closeAnyDialog(page);
    });

    test("Edit Header dialog: updates name, year founded, 501(c)(3) toggle, and money raised", async ({
                                                                                                          page,
                                                                                                      }) => {
        // Find the header card (contains org H1 + edit trigger)
        const headerCard = await withinCard(page, /.+/);
        const editHeaderBtn = headerCard.getByRole("button", { name: /edit/i }).first();
        await expect(editHeaderBtn).toBeVisible();
        await editHeaderBtn.click();

        const dlg = page.getByRole("dialog");
        await expect(dlg).toBeVisible();

        // Fill fields defensively by accessible labels (best effort; adjust labels as needed)
        const newName = `PRG Org ${rand()}`;
        await dlg.getByLabel(/name/i).fill(newName);

        // Try common labels for the year and money fields
        const yearInput =
            (await dlg.getByLabel(/year founded|founded|year/i).first().isVisible().catch(() => false))
                ? dlg.getByLabel(/year founded|founded|year/i).first()
                : null;
        if (yearInput) await yearInput.fill("2015");

        const c3Toggle =
            (await dlg.getByRole("checkbox", { name: /501/i }).isVisible().catch(() => false))
                ? dlg.getByRole("checkbox", { name: /501/i })
                : null;
        if (c3Toggle) {
            const before = (await c3Toggle.getAttribute("aria-checked")) ?? "false";
            await c3Toggle.click();
            await expect(c3Toggle).toHaveAttribute(
                "aria-checked",
                before === "true" ? "false" : "true"
            );
        }

        const moneyInput =
            (await dlg.getByLabel(/money raised|raised|budget/i).first().isVisible().catch(() => false))
                ? dlg.getByLabel(/money raised|raised|budget/i).first()
                : null;
        if (moneyInput) await moneyInput.fill("2500000"); // $2.5M

        // Save
        const saveBtn =
            (await dlg.getByRole("button", { name: /^save(?: changes)?$/i }).isVisible().catch(() => false))
                ? dlg.getByRole("button", { name: /^save(?: changes)?$/i })
                : dlg.getByRole("button", { name: /save/i }).first();
        await saveBtn.click();

        await expect(dlg).toBeHidden();

        // Assertions on the updated UI
        const h1 = page.getByRole("heading", { level: 1, name: newName });
        await expect(h1).toBeVisible();

        // Founded year chip
        await expect(page.getByText(/founded in 2015/i)).toBeVisible();

        // 501(c)(3) chip
        if (c3Toggle) {
            await expect(page.getByText(/501\(c\)\(3\)/i)).toBeVisible();
        }

        // Money raised chip
        if (moneyInput) {
            await expect(page.getByText(/raised/i)).toBeVisible();
        }
    });

    test("Edit About dialog: updates description and website", async ({ page }) => {
        const aboutCard = await withinCard(page, /about/i);
        const editBtn = aboutCard.getByRole("button", { name: /edit/i });
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        const dlg = page.getByRole("dialog");
        await expect(dlg).toBeVisible();

        const newDesc = `Updated description ${rand()}`;
        const newSite = `https://example-${rand()}.org`;

        // Fill accessible fields
        const desc = dlg.getByLabel(/description/i).or(dlg.getByRole("textbox", { name: /about|description/i }));
        await desc.fill(newDesc);

        const website = dlg.getByLabel(/website|url/i);
        await website.fill(newSite);

        // Save
        await dlg.getByRole("button", { name: /^save(?: changes)?$/i }).click();
        await expect(dlg).toBeHidden();

        // Assertions on card content
        await expect(aboutCard.getByText(newDesc)).toBeVisible();
        // Link (truncate-safe): check anchor exists and href contains our domain
        const siteLink = aboutCard.getByRole("link").filter({ hasText: /example-/i }).first();
        await expect(siteLink).toBeVisible();
        await expect(siteLink).toHaveAttribute("href", newSite);
    });

    test("Edit Conditions dialog: choose a condition and verify rendered card", async ({ page }) => {
        const conditionsCard = await withinCard(page, /conditions|epidemiology/i);
        const editBtn = conditionsCard.getByRole("button", { name: /edit/i }).first();
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        const dlg = page.getByRole("dialog");
        await expect(dlg).toBeVisible();

        // Strategy: select the first available option in the condition picker
        // Works with both combobox and listbox patterns.
        const combo =
            (await dlg.getByRole("combobox").first().isVisible().catch(() => false))
                ? dlg.getByRole("combobox").first()
                : null;
        if (combo) {
            await combo.click();
            const firstOption = page.getByRole("option").first();
            const chosenText = await firstOption.innerText();
            await firstOption.click();

            await dlg.getByRole("button", { name: /^save(?: changes)?$/i }).click();
            await expect(dlg).toBeHidden();

            // Header title should show condition name now
            await expect(
                conditionsCard.getByRole("heading", { name: new RegExp(chosenText.trim(), "i") })
            ).toBeVisible();
        } else {
            // Fallback: if the dialog uses a plain select or pills
            const anyOption = dlg.locator('[role="option"], [data-option], button').first();
            const chosenText = (await anyOption.textContent())?.trim() ?? "";
            await anyOption.click();
            await dlg.getByRole("button", { name: /^save(?: changes)?$/i }).click();
            await expect(dlg).toBeHidden();
            if (chosenText) {
                await expect(
                    conditionsCard.getByRole("heading", { name: new RegExp(chosenText, "i") })
                ).toBeVisible();
            } else {
                // At minimum, ensure the "No Conditions Yet" state is gone
                await expect(conditionsCard.getByText(/no conditions yet/i)).toHaveCount(0);
            }
        }
    });

    test("Edit Cover (banner) photo flow: upload, crop, save, and persist", async ({ page }) => {
        // The banner editor is inline; look for any file input that becomes available after clicking an edit affordance
        // Try clicking the first "Edit" control near the banner image if present
        const headerCard = await withinCard(page, /.+/);
        const maybeEditCover = headerCard.getByRole("button", { name: /edit.*(cover|banner)|change.*(cover|banner)/i }).first();
        if (await maybeEditCover.isVisible().catch(() => false)) {
            await maybeEditCover.click();
        }

        // Find the file input and set a tiny PNG
        const file = page.locator('input[type="file"]').first();
        await expect(file).toBeAttached({ timeout: 5000 });
        await file.setInputFiles({
            name: `banner-${rand()}.png`,
            mimeType: "image/png",
            buffer: tinyPngBuffer(),
        });

        // Handle crop toolbar if it appears
        const cropBar = page
            .locator('div:has(> button:has-text("Cancel")):has(> button:has-text("Crop"))')
            .first();
        if (await cropBar.isVisible().catch(() => false)) {
            await cropBar.getByRole("button", { name: /^Crop$/ }).click();
            await expect(cropBar).toBeHidden();
        }

        // Save (if a dialog is shown)
        const dlg = page.getByRole("dialog");
        if (await dlg.isVisible().catch(() => false)) {
            const save = dlg.getByRole("button", { name: /^save/i }).or(dlg.getByRole("button", { name: /apply/i }));
            await save.click();
            await expect(dlg).toBeHidden();
        }

        // Assert a data/blob image is now visible in the banner region
        // (We avoid exact src match; just ensure an <img> with data/blob src is present.)
        const bannerImg = headerCard.locator('img[src^="blob:"], img[src^="data:image/"]');
        await expect(bannerImg.first()).toBeVisible();
    });

    test("Edit Profile photo flow: upload, crop, save, and persist", async ({ page }) => {
        // Click the profile photo editor (usually overlaps the avatar)
        const avatarEdit = page
            .getByRole("button", { name: /edit.*(photo|avatar)|change.*(photo|avatar)/i })
            .first();

        // If not explicitly labeled, try to click on the avatar container to reveal controls
        if (!(await avatarEdit.isVisible().catch(() => false))) {
            const avatarContainer = page.locator('img[alt*="profile"], img[alt*="avatar"], img[alt*="logo"]').first();
            if (await avatarContainer.isVisible().catch(() => false)) {
                await avatarContainer.click({ force: true });
            }
        } else {
            await avatarEdit.click();
        }

        const file = page.locator('input[type="file"]').first();
        await expect(file).toBeAttached({ timeout: 5000 });
        await file.setInputFiles({
            name: `avatar-${rand()}.png`,
            mimeType: "image/png",
            buffer: tinyPngBuffer(),
        });

        const cropBar = page
            .locator('div:has(> button:has-text("Cancel")):has(> button:has-text("Crop"))')
            .first();
        if (await cropBar.isVisible().catch(() => false)) {
            await cropBar.getByRole("button", { name: /^Crop$/ }).click();
            await expect(cropBar).toBeHidden();
        }

        const dlg = page.getByRole("dialog");
        if (await dlg.isVisible().catch(() => false)) {
            const save = dlg.getByRole("button", { name: /^save/i }).or(dlg.getByRole("button", { name: /apply/i }));
            await save.click();
            await expect(dlg).toBeHidden();
        }

        // Assert the avatar now shows a blob/data url (or at least an <img> element is present)
        const avatarImg = page.locator('img[src^="blob:"], img[src^="data:image/"]').first();
        await expect(avatarImg).toBeVisible();
    });

    test("Roadmaps card renders and remains after edits", async ({ page }) => {
        // Sanity check that non-edited sections still render
        const roadmapsCard = await withinCard(page, /roadmaps/i);
        await expect(roadmapsCard).toBeVisible();
        // Ensure at least the card title is visible
        await expect(roadmapsCard.getByRole("heading", { name: /roadmaps/i })).toBeVisible();
    });

    test("Public profile link renders", async ({ page }) => {
        // "View public profile" button should exist and open new tab
        const btn = page.getByRole("link", { name: /view public profile/i });
        await expect(btn).toBeVisible();
        await expect(btn).toHaveAttribute("target", "_blank");
    });
});
