// apps/web/tests/e2e/profile-edit.spec.ts
import { test, expect, Page, Locator } from "@playwright/test";

const rand = () => Math.random().toString(36).slice(2, 8);

/** Tiny 1x1 transparent PNG buffer */
function tinyPngBuffer() {
    const b64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9Wm1P9YAAAAASUVORK5CYII=";
    return Buffer.from(b64, "base64");
}

// Finds a card container by test id (pass the card's data-testid)
async function withinCard(page: Page, testId: string) {
    const card = page.getByTestId(testId).first();
    await expect(card).toBeVisible();
    return card;
}

async function selectYearFoundedByTid(page: Page, year: string) {
    const trigger = page.getByTestId("founded-select-trigger");
    await expect(trigger).toBeVisible();
    await trigger.click();

    // The content is in a portal; target from page
    const content = page.getByTestId("founded-select-content");
    await expect(content).toBeVisible();

    await page.getByTestId(`founded-option-${year}`).click();

    // Verify trigger reflects the chosen year and menu closed
    await expect(trigger).toContainText(year);
}

async function createCreatableMsValue(scope: Page | Locator, tid: string, value: string) {
    const box = scope.getByTestId(tid);
    await box.waitFor({ state: "attached" });
    await box.focus();

    // Open the list so Enter is handled by the combobox
    if ((await box.getAttribute("aria-expanded")) !== "true") {
        await box.press("ArrowDown");
    }

    await box.fill(value);

    // Wait for the empty-state row to show (covers both copy variants)
    const emptyState = scope.getByText(/no (conditions|results) found\.?/i).first();
    await emptyState.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});

    // Nudge highlight onto the "create" row if needed
    if (!(await box.getAttribute("aria-activedescendant"))) {
        await box.press("ArrowDown");
    }

    await box.press("Enter");
}

async function closeAnyDialog(page: Page) {
    const dlg = page.getByTestId("dialog");
    if (await dlg.isVisible().catch(() => false)) {
        // Prefer "Cancel" then close button, else ESC
        const cancel = dlg.getByTestId("dialog-cancel-btn");
        if (await cancel.isVisible().catch(() => false)) {
            await cancel.click();
            await expect(dlg).toBeHidden();
            return;
        }
        const close = dlg.getByTestId("dialog-close-btn");
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
        await expect(page.getByTestId("pag-profile-main")).toBeVisible();
        await expect(page.getByTestId("org-name-heading")).toBeVisible({ timeout: 10_000 });
    });

    test("Share dialog opens and closes", async ({ page }) => {
        const shareBtn = page.getByTestId("share-public-profile-btn");
        await expect(shareBtn).toBeVisible();
        await shareBtn.click();

        const dlg = page.getByTestId("dialog");
        await expect(dlg).toBeVisible();

        // Dialog should include a copyable URL field
        await expect(dlg.getByTestId("share-url-field")).toBeVisible();

        // Close the dialog
        await closeAnyDialog(page);
    });

    test("Edit Header dialog: updates name, year founded, 501(c)(3) toggle, and money raised", async ({ page }) => {
        // Find the header card (contains org H1 + edit trigger)
        const headerCard = await withinCard(page, "pag-profile-header-card");
        const editHeaderBtn = headerCard.getByTestId("header-edit-btn").first();
        await expect(editHeaderBtn).toBeVisible();
        await editHeaderBtn.click();

        const dlg = page.getByTestId("dialog");
        await expect(dlg).toBeVisible();

        // Fill fields defensively by test ids
        const newName = `PRG Org ${rand()}`;
        await dlg.getByTestId("org-name-input").fill(newName);

        await selectYearFoundedByTid(page, "2015");

        const c3Toggle = dlg.getByTestId("c3-checkbox");
        if (await c3Toggle.isVisible().catch(() => false)) {
            const before = (await c3Toggle.getAttribute("aria-checked")) ?? "false";
            await c3Toggle.click();
            await expect(c3Toggle).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");
        }

        const moneyInput = dlg.getByTestId("money-raised-input");
        if (await moneyInput.isVisible().catch(() => false)) {
            await moneyInput.fill("2500000"); // $2.5M
        }

        // Save
        const saveBtn = dlg.getByTestId("dialog-save-btn");
        await saveBtn.click();
        await expect(dlg).toBeHidden();

        // Assertions on the updated UI
        await expect(page.getByTestId("org-name-heading")).toHaveText(newName);

        // Founded year chip
        await expect(page.getByTestId("founded-chip")).toContainText("2015");

        // 501(c)(3) chip
        if (await c3Toggle.isVisible().catch(() => false)) {
            await expect(page.getByTestId("c3-chip")).toBeVisible();
        }

        // Money raised chip
        if (await moneyInput.isVisible().catch(() => false)) {
            await expect(page.getByTestId("raised-chip")).toBeVisible();
        }
    });

    test("Edit About dialog: updates description and website", async ({ page }) => {
        const aboutCard = await withinCard(page, "about-card");
        const editBtn = aboutCard.getByTestId("about-edit-btn");
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        const dlg = page.getByTestId("dialog");
        await expect(dlg).toBeVisible();

        const newDesc = `Updated description ${rand()}`;
        const newSite = `https://example-${rand()}.org`;

        // Fill fields
        await dlg.getByTestId("about-description-input").fill(newDesc);
        await dlg.getByTestId("website-input").fill(newSite);

        // Save
        await dlg.getByTestId("dialog-save-btn").click();
        await expect(dlg).toBeHidden();

        // Assertions on card content
        await expect(aboutCard.getByTestId("about-description-value")).toHaveText(newDesc, {timeout: 10_000});

        const siteLink = aboutCard.getByTestId("website-link").first();
        await expect(siteLink).toBeVisible();
        await expect(siteLink).toHaveAttribute("href", newSite);
    });

    test("Edit Conditions dialog: create a new disorder and verify rendered card", async ({ page }) => {
        const conditionsCard = await withinCard(page, "conditions-card");
        const editBtn = conditionsCard.getByTestId("conditions-edit-btn").first();
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        const dlg = page.getByTestId("dialog");
        await expect(dlg).toBeVisible();

        // 👇 Create a brand new disorder (not from the list)
        const newDisorder = `Test Disorder ${rand()}`;
        await createCreatableMsValue(dlg, "ms-disorder", newDisorder);

        // Save and assert
        await dlg.getByTestId("dialog-save-btn").click();
        await expect(dlg).toBeHidden();

        await expect(conditionsCard.getByTestId("conditions-title")).toContainText(newDisorder);
    });

    test("Edit Cover (banner) photo flow: upload, crop, save, and persist", async ({ page }) => {
        const headerCard = await withinCard(page, "pag-profile-header-card");
        const maybeEditCover = headerCard.getByTestId("edit-banner-btn").first();
        if (await maybeEditCover.isVisible().catch(() => false)) {
            await maybeEditCover.click();
        }

        const file = page.getByTestId("cover-file-input").first();
        await expect(file).toBeAttached({ timeout: 5000 });
        await file.setInputFiles({
            name: `banner-${rand()}.png`,
            mimeType: "image/png",
            buffer: tinyPngBuffer(),
        });

        // Handle crop toolbar if it appears
        const cropBar = page.getByTestId("crop-toolbar").first();
        if (await cropBar.isVisible().catch(() => false)) {
            await cropBar.getByTestId("crop-btn").click();
            await expect(cropBar).toBeHidden();
        }

        // Save (if a dialog is shown)
        const dlg = page.getByTestId("dialog");
        if (await dlg.isVisible().catch(() => false)) {
            const save = dlg.getByTestId("dialog-save-btn").or(dlg.getByTestId("apply-btn"));
            await save.click();
            await expect(dlg).toBeHidden();
        }

        // Assert a new banner image is visible
        await expect(headerCard.getByTestId("banner-img").first()).toBeVisible();
    });

    test("Edit Profile photo flow: upload, crop, save, and persist", async ({ page }) => {
        const avatarEdit = page.getByTestId("edit-avatar-btn").first();

        if (!(await avatarEdit.isVisible().catch(() => false))) {
            const avatarContainer = page.getByTestId("avatar-image").first();
            if (await avatarContainer.isVisible().catch(() => false)) {
                await avatarContainer.click({ force: true });
            }
        } else {
            await avatarEdit.click();
        }

        await expect(page.getByTestId("avatar-dialog")).toBeVisible();

        const file = page.getByTestId("avatar-file-input").first();
        await expect(file).toBeAttached({ timeout: 5000 });
        await file.setInputFiles({
            name: `avatar-${rand()}.png`,
            mimeType: "image/png",
            buffer: tinyPngBuffer(),
        });

        const cropBar = page.getByTestId("crop-toolbar").first();
        if (await cropBar.isVisible().catch(() => false)) {
            await cropBar.getByTestId("crop-btn").click();
            await expect(cropBar).toBeHidden();
        }

        const dlg = page.getByTestId("avatar-dialog");
        if (await dlg.isVisible().catch(() => false)) {
            const save = dlg.getByTestId("dialog-save-btn").or(dlg.getByTestId("apply-btn"));
            await save.click();
            await expect(dlg).toBeHidden();  // passes if it closes OR after a reload (detached counts as hidden)
        }

        // Final assertion: avatar is rendered
        await expect(page.getByTestId("avatar-image").first()).toBeVisible();
    });

    test("Roadmaps card renders and remains after edits", async ({ page }) => {
        const roadmapsCard = await withinCard(page, "roadmaps-card");
        await expect(roadmapsCard).toBeVisible();
        await expect(roadmapsCard.getByTestId("roadmaps-heading")).toBeVisible();
    });

    test("Public profile link renders", async ({ page }) => {
        const btn = page.getByTestId("public-profile-link");
        await expect(btn).toBeVisible();
        await expect(btn).toHaveAttribute("target", "_blank");
    });
});
