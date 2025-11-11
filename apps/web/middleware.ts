import { redis } from '@comend/lib/redis'
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const RATE_LIMIT = 60        // max requests
const WINDOW_SECONDS = 60    // per this many seconds
const MAX_LOGIN_PAGE_VISITS = 5        // max login page visits
const MAX_LOGIN_PAGE_VISITS_RESET_TIME = 300    // per this many seconds

export const config = {
    matcher: [
        // exclude: API, Next internals, static files, and metadata routes (favicons, icons, etc.)
        '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+$|favicon\\.ico$|icon$|apple-icon$|opengraph-image$|twitter-image$|manifest\\.json$|robots\\.txt$|sitemap\\.xml$).*)'
    ]
}

export default async function middleware(req: NextRequest) {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip =
        req.ip ??
        (forwarded ? forwarded.split(',')[0].trim() : null) ??
        '127.0.0.1';

    const isLocal =
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === 'localhost' ||
        req.headers.get("host")?.includes("localhost");

    const url = req.nextUrl

    const isPageNavigation = req.method === "GET" && req.headers.get("accept")?.includes("text/html")

    // Skip rate limiting in local/dev
    if (isPageNavigation && !isLocal && process.env.NODE_ENV !== 'development') {
        const redisKey = `rate-limit:${ip}`;
        const count = await redis.incr(redisKey);

        if (count === 1) {
            await redis.expire(redisKey, WINDOW_SECONDS);
        }

        if (count > RATE_LIMIT) {
            console.warn(`Blocked IP: ${ip} for excessive requests (${count} in ${WINDOW_SECONDS}s)`);

            return new Response('Too many requests', {
                status: 429,
                headers: {
                    'Retry-After': WINDOW_SECONDS.toString(),
                },
            });
        }
    }

    // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
    let hostname = req.headers
        .get("host")!
        .replace(/\.localhost:\d+$/, `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

    // special case for Vercel preview deployment URLs
    if (
        hostname.includes("---") &&
        hostname.endsWith(
            `.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`
        )
    ) {
        hostname = `${hostname.split("---")[0]}.${
            process.env.NEXT_PUBLIC_ROOT_DOMAIN
        }`
    }

    const searchParams = req.nextUrl.searchParams.toString()
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${
        searchParams.length > 0 ? `?${searchParams}` : ""
    }`

    // Only count visits to the login page
    if (path.startsWith("/login")) {
        const loginKey = `login-hits:${ip}`
        const loginCount = await redis.incr(loginKey)
        if (loginCount === 1) {
            await redis.expire(loginKey, MAX_LOGIN_PAGE_VISITS_RESET_TIME) // 5-minute window
        }

        const res = NextResponse.next()

        if (loginCount >= MAX_LOGIN_PAGE_VISITS) {
            res.cookies.set("require_captcha", "true", {
                path: "/",
                maxAge: MAX_LOGIN_PAGE_VISITS_RESET_TIME,
                httpOnly: false,
            })
        } else {
            res.cookies.set("require_captcha", "false", {
                path: "/",
                maxAge: MAX_LOGIN_PAGE_VISITS_RESET_TIME,
                httpOnly: false,
            })
        }

        res.headers.set("x-current-path", path);

        return res
    }

    // DON'T do rewrites for app pages
    if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
        const session = await getToken({ req })
        if (!session && path !== "/login") {
            const res = NextResponse.redirect(new URL("/login", req.url))
            res.headers.set("x-current-path", path);
            return res
        } else if (session && path == "/login") {
            const res = NextResponse.redirect(new URL("/", req.url))
            res.headers.set("x-current-path", path);
            return res
        }
        const res = NextResponse.rewrite(
            new URL(`${path === "/" ? "" : path}`, req.url)
        )
        res.headers.set("x-current-path", path);
        return res
    }

    // special case for `vercel.pub` domain
    if (hostname === "vercel.pub") {
        const res = NextResponse.redirect(
            "https://vercel.com/blog/platforms-starter-kit"
        )
        res.headers.set("x-current-path", path);
        return res
    }

    // DON'T rewrite root application to `/home` folder
    if (
        /^localhost(:\d+)?$/.test(hostname) ||
        hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
        hostname === "comendcare.com"
    ) {
        const res = NextResponse.rewrite(
            new URL(`${path === "/" ? "/" : path}`, req.url)
        )
        res.headers.set("x-current-path", path);
        return res
    }

    // rewrite everything else to `/[domain]/[slug] dynamic route
    const res = NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url))
    res.headers.set("x-current-path", path);
    return res
}
