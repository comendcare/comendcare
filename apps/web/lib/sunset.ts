import { NextRequest, NextResponse } from "next/server"

/*
 * Sunset mode, controlled by the SUNSET_MODE env var (redeploy after changing it):
 *   "page" (or "true") - replaces the entire site (landing, app, sign in/up, org subdomains, embeds, APIs, crons)
 *                        with a static shutdown notice
 *   "banner"           - site works as normal, with a shutdown banner on every page (see SunsetBanner)
 *   unset / other      - original site
 *
 * The full-page notice is plain HTML returned straight from middleware so it keeps working even after the
 * database, Redis, auth providers, etc. are turned off.
 */

const SUNSET_MODE = process.env.SUNSET_MODE

export const SUNSET_ENABLED = SUNSET_MODE === "page" || SUNSET_MODE === "true"
export const SUNSET_BANNER_ENABLED = SUNSET_MODE === "banner"

export const CONTACT_EMAIL = "support@comendcare.com"

export const BANNER_MESSAGE = "Comend has shut down, and all account and organization data has been permanently deleted."

// Optional, e.g. "November 15, 2026". Leave null to omit the date from the page.
const SHUTDOWN_DATE: string | null = null

export function sunsetResponse(req: NextRequest) {
    const { pathname } = req.nextUrl
    const headers = {
        "Cache-Control": "no-store",
        "X-Robots-Tag": pathname === "/" ? "index, follow" : "noindex",
    }

    if (pathname.startsWith("/api/")) {
        return NextResponse.json(
            { error: `Comend has shut down. Contact ${CONTACT_EMAIL} with any questions.` },
            { status: 410, headers }
        )
    }

    // Keep the homepage indexable so people searching for Comend find the notice; everything else is Gone
    return new NextResponse(SUNSET_HTML, {
        status: pathname === "/" ? 200 : 410,
        headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    })
}

const SUNSET_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Comend has shut down</title>
<meta name="description" content="Comend has permanently shut down. Thank you to the rare disease community for your support.">
<link rel="icon" href="/favicon.ico">
<style>
    :root {
        --bg: #f6f8f7;
        --card: #ffffff;
        --fg: #171717;
        --muted: #5b6563;
        --border: #e6ebe9;
        --primary: hsl(166 53% 40%);
        --primary-soft: hsl(166 30% 94%);
    }
    @media (prefers-color-scheme: dark) {
        :root {
            --bg: #0a0a0a;
            --card: #121514;
            --fg: #f5f5f5;
            --muted: #a3acaa;
            --border: #1f2624;
            --primary: hsl(166 53% 48%);
            --primary-soft: hsl(166 30% 12%);
        }
    }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 16px;
        background: var(--bg);
        color: var(--fg);
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
    }
    main {
        width: 100%;
        max-width: 620px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 40px;
    }
    .logo { display: block; width: 150px; height: auto; margin-bottom: 32px; }
    h1 { font-size: 28px; line-height: 1.25; margin: 0 0 8px; letter-spacing: -0.01em; }
    .date { color: var(--muted); margin: 0 0 24px; font-size: 15px; }
    p { margin: 0 0 16px; }
    h2 { font-size: 17px; margin: 32px 0 8px; }
    .notice {
        background: var(--primary-soft);
        border-left: 3px solid var(--primary);
        border-radius: 8px;
        padding: 16px 20px;
        margin: 24px 0;
    }
    .notice p:last-child { margin-bottom: 0; }
    a { color: var(--primary); }
    .contact {
        display: inline-block;
        margin-top: 4px;
        padding: 10px 18px;
        border-radius: 8px;
        background: var(--primary);
        color: #fff;
        text-decoration: none;
        font-weight: 600;
    }
    footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
        font-size: 14px;
        color: var(--muted);
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
    }
    footer a { color: var(--muted); }
    @media (max-width: 520px) {
        main { padding: 28px 20px; }
        h1 { font-size: 24px; }
    }
</style>
</head>
<body>
<main>
    <picture>
        <source srcset="/sunset-logo-dark.png" media="(prefers-color-scheme: dark)">
        <img class="logo" src="/sunset-logo.png" alt="Comend">
    </picture>

    <h1>Comend has shut down</h1>
    ${SHUTDOWN_DATE ? `<p class="date">As of ${SHUTDOWN_DATE}</p>` : ""}

    <p>
        The platform is no longer available, and signing in or creating new accounts has been turned off.
    </p>
    <p>
        Thank you to every patient advocacy group, researcher, and partner who trusted us and worked
        alongside us in the fight against rare disease. It was a privilege to build this with you.
    </p>

    <div class="notice">
        <p><strong>What happened to your data</strong></p>
        <p>
            All account, organization, and user data stored on Comend has been permanently deleted.
            You don't need to do anything, and we're not able to recover or export it.
        </p>
    </div>

    <h2>Questions?</h2>
    <p>If you have any questions about the shutdown or your data, please reach out.</p>
    <a class="contact" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>

    <footer>
        <span>&copy; Comend</span>
    </footer>
</main>
</body>
</html>`
