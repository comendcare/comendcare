// apps/web/tests/e2e/create-organization.spec.ts
import { test, expect, Page } from "@playwright/test";
import {formatNumberWithCommas} from "@/packages/lib/utils";

const rand = () => Math.random().toString(36).slice(2, 8);

/** Tiny 1x1 transparent PNG buffer */
function tinyPngBuffer() {
    const b64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9Wm1P9YAAAAASUVORK5CYII=";
    return Buffer.from(b64, "base64");
}

async function withinCard(page: Page, heading: string | RegExp) {
    const card = page
        .locator("section, div, article")
        .filter({ has: page.getByRole("heading", { name: heading, exact: false }) })
        .first();
    await expect(card).toBeVisible();
    return card;
}

async function maybeCropIfPresent(page: Page) {
    const cropBar = page
        .locator('div:has(> button:has-text("Cancel")):has(> button:has-text("Crop"))')
        .first();
    if (await cropBar.isVisible().catch(() => false)) {
        await cropBar.getByRole("button", { name: /^Crop$/ }).click();
        await expect(cropBar).toBeHidden();
    }
}

test.describe("Create Organization – happy path to profile", () => {
    test("fills form, submits, and verifies profile cards reflect data", async ({ page }) => {
        // 1) Go to the create page (update the path if different)
        await page.goto("/create/new-organization"); // or the route that renders CreateNewOrganizationPage

        // 2) ORGANIZATION
        const uniqueSuffix = rand();
        const orgName = `PRG Test Org ${uniqueSuffix}`;
        const subdomain = `prg-${uniqueSuffix}`;
        const website = `https://example-${uniqueSuffix}.org`;
        const description = `This is an automated E2E description ${uniqueSuffix}.`;
        const foundedYear = "2016";

        await page.getByLabel(/Organization Name/i).fill(orgName);
        await page.getByLabel(/Describe your organization/i).fill(description);

        const subdomainInput = page.getByLabel(/Organization Abbreviation/i);
        await subdomainInput.fill(subdomain);
        await subdomainInput.blur();
        // If inline error shows "taken", tweak and retry once
        if (await page.getByText(/already taken/i).isVisible().catch(() => false)) {
            const fallback = `${subdomain}-${rand()}`;
            await subdomainInput.fill(fallback);
            await subdomainInput.blur();
        }

        await page.getByLabel(/^Website$/i).fill(website);
        await page.getByLabel(/Contact Email/i).fill(`qa+${uniqueSuffix}@example.org`);
        await page.getByLabel(/Title of your role/i).fill("Founder");

        // Year Founded (shadcn/radix Select)
        await page.getByTestId('founded-select').click();
        await page.getByRole('option', {name: foundedYear}).click();

        // Therapeutics (pick first options from both selectors)
        // In these MultipleSelector controls, click to open and select the first visible option.
        const pickFirstCmdkOptionByTid = async (tid: string) => {
            const box = page.getByTestId(tid);
            await box.waitFor({state: "attached"});

            // Focus (don't click — popover might overlap the input)
            await box.focus();

            // Ensure the popup is open
            if ((await box.getAttribute("aria-expanded")) !== "true") {
                await box.press("ArrowDown");
            }

            // Ensure an active item is highlighted; cmdk sets aria-activedescendant on the input.
            // Nudge with ArrowDown a couple times until it appears.
            let activeId = await box.getAttribute("aria-activedescendant");
            for (let i = 0; i < 3 && !activeId; i++) {
                await box.press("ArrowDown");
                activeId = await box.getAttribute("aria-activedescendant");
            }

            // If we got an active item, grab its label for assertions.
            let text = "";
            if (activeId) {
                const active = page.locator(`#${activeId.replace(/:/g, "\\:")}`); // escape radix ids
                await active.waitFor({state: "attached"});
                text = (await active.textContent())?.trim() || "";
            } else {
                // Fallback: wait for any option to exist and use that for text.
                const opt = page.getByRole("option").first();
                await opt.waitFor({state: "attached"});
                text = (await opt.textContent())?.trim() || "";
            }

            // Select the highlighted option
            await box.press("Enter");

            return text;
        };
        const pickedDev = await pickFirstCmdkOptionByTid("ms-ther-dev");
        const pickedInterest = await pickFirstCmdkOptionByTid("ms-ther-interest");

        // Upload org logo (any visible file input within the form)
        const fileInput = page.locator('input[type="file"]').first();
        await expect(fileInput).toBeAttached({timeout: 5000});
        await fileInput.setInputFiles({
            name: `logo-${uniqueSuffix}.png`,
            mimeType: "image/png",
            buffer: tinyPngBuffer(),
        });
        await maybeCropIfPresent(page);

        // 3) CONDITION
        const conditionName = `Test Condition ${uniqueSuffix}`;
        // Name of condition (creatable)
        {
            const cond = page.getByTestId("ms-disorder");
            await cond.focus();
            if ((await cond.getAttribute("aria-expanded")) !== "true") await cond.press("ArrowDown");
            await cond.type(conditionName, {delay: 10});
            await cond.press("Enter");
        }

        // Summary
        await page.getByLabel(/Describe your condition/i).fill(`Short summary for ${conditionName}.`);

        // Mechanisms of action (categories) – pick first available
        const pickedCategory = await pickFirstCmdkOptionByTid("ms-categories");

        // Epidemiology numbers
        await page.getByLabel(/Number of patients engaged/i).fill("42");
        await page.getByLabel(/Estimated US patient population/i).fill("1234");
        await page.getByLabel(/Estimated global patient population/i).fill("5678");

        // 4) FINANCES
        // The MoneyInput labels are used directly.
        await page.getByLabel(/Total funds raised to date/i).fill("2500000");
        await page.getByLabel(/Total funds deployed to date/i).fill("1000000");
        await page.getByLabel(/Total annual research budget/i).fill("750000");

        // 5) SUBMIT
        const submit = page.getByRole("button", {name: /Complete sign-up/i});
        await submit.click();

        // Expect a success toast and a redirect (profile preferred; dashboard fallback)
        await expect
            .poll(
                async () => {
                    const done = await page.getByText(/Onboarding complete/i).count();
                    return done > 0 ? "success" : "pending";
                },
                {timeout: 30_000, intervals: [250, 500, 750]}
            )
            .toBe("success");

        // Wait for navigation to either /app/profile or /app/dashboard
        await expect(page).toHaveURL(/\/app\/(profile|dashboard)/, {timeout: 30_000});
        const landedOnProfile = /\/app\/profile\/?$/.test(new URL(page.url()).pathname);

        // If we didn't land on profile (e.g. no invitations), go there now to validate the cards.
        if (!landedOnProfile) {
            await page.goto("/app/profile");
        }

        // 6) ASSERTIONS ON PROFILE

        // Header: org name visible
        await expect(page.getByRole("heading", {level: 1, name: new RegExp(orgName, "i")})).toBeVisible();

        // Header chips: Founded + Raised
        await expect(page.getByText(new RegExp(`Founded\\s+in\\s+${foundedYear}`, "i"))).toBeVisible();
        await expect(page.getByText(/raised/i)).toBeVisible(); // exact $ formatting can vary

        // "View public profile" link exists
        await expect(page.getByRole("link", {name: /view public profile/i})).toBeVisible();

        // About card: description + website + therapeutics sections present
        const aboutCard = await withinCard(page, /about/i);
        await expect(aboutCard.getByText(description)).toBeVisible();

        const siteLink = aboutCard.getByRole("link").filter({hasText: new RegExp(`example-${uniqueSuffix}\\.org`, "i")});
        await expect(siteLink.first()).toHaveAttribute("href", website);

        // These sections render on private view regardless, but ensure they’re present
        await expect(aboutCard.getByRole("heading", {name: /Therapeutics of interest/i})).toBeVisible();
        await expect(aboutCard.getByRole("heading", {name: /Therapeutics in development/i})).toBeVisible();

        // Optionally assert one picked label is somewhere (case-insensitive, capitalized in UI)
        function escapeRegExp(s: string) {
            return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }

        // Strip a trailing CODE token like GENE_THERAPY and trim
        function toHumanLabel(s: string) {
            return s.replace(/[A-Z0-9_]+$/, "").trim();
        }

        if (pickedInterest) {
            const label = toHumanLabel(pickedInterest);
            await expect(
                aboutCard
                    .getByTestId("toi-badge")
                    .filter({hasText: new RegExp(escapeRegExp(label), "i")})
                    .first()
            ).toBeVisible();
        }

        if (pickedDev) {
            const label = toHumanLabel(pickedDev);
            await expect(
                aboutCard
                    .getByTestId("tid-badge")
                    .filter({hasText: new RegExp(escapeRegExp(label), "i")})
                    .first()
            ).toBeVisible();
        }

        // Conditions card: title should be our new condition
        const conditionsCard = await withinCard(page, new RegExp(conditionName, "i"));
        await expect(conditionsCard.getByRole("heading", {name: new RegExp(conditionName, "i")})).toBeVisible();

        // Epidemiology list contains our numbers
        await expect(conditionsCard.getByText(/patients engaged/i)).toBeVisible();
        await expect(conditionsCard.getByText(/\b42\b/)).toBeVisible();
        await expect(conditionsCard.getByText(/in the US/i)).toBeVisible();
        await expect(
            conditionsCard.getByText(new RegExp(`\\b${formatNumberWithCommas("1234")}\\b`))
        ).toBeVisible();
        await expect(conditionsCard.getByText(/globally/i)).toBeVisible();
        await expect(
            conditionsCard.getByText(new RegExp(`\\b${formatNumberWithCommas("5678")}\\b`))
        ).toBeVisible();

        // Disease categories section appears if we selected one
        if (pickedCategory) {
            const label = toHumanLabel(pickedCategory);
            await expect(conditionsCard.getByRole("heading", {name: /Disease categories/i})).toBeVisible();
            await expect(
                conditionsCard
                    .getByTestId("categories-badge")
                    .filter({hasText: new RegExp(escapeRegExp(label), "i")})
                    .first()
            ).toBeVisible();
        }
    });

    test("blocks submit with missing required org name", async ({ page }) => {
        await page.goto("/create/new-organization");
        await page.getByRole("button", { name: /Complete sign-up/i }).click();
        await page.getByText(/please enter your organization's name/i).waitFor({ state: "visible" });
        await page.getByText(/your organization must claim a subdomain/i).waitFor({ state: "visible" });
    });
});
