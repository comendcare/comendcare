import { redis } from '@/lib/redis'
import { NextRequest, NextResponse } from "next/server"

const RATE_LIMIT = 60
const WINDOW_SECONDS = 60

const MAX_LOGIN_PAGE_VISITS = 5
const MAX_LOGIN_PAGE_VISITS_RESET_TIME = 300

export const config = {
    matcher: [
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"
    ]
}

export default async function middleware(req: NextRequest) {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip =
        req.ip ??
        (forwarded ? forwarded.split(',')[0].trim() : null) ??
        '127.0.0.1'

    const isLocal =
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === 'localhost' ||
        req.headers.get("host")?.includes("localhost")

    const isPageNavigation = req.method === "GET" && req.headers.get("accept")?.includes("text/html")
    const path = req.nextUrl.pathname

    // Rate limiting for general page navigation
    if (isPageNavigation && !isLocal && process.env.NODE_ENV !== 'development') {
        const redisKey = `rate-limit:${ip}`
        const count = await redis.incr(redisKey)
        if (count === 1) await redis.expire(redisKey, WINDOW_SECONDS)

        if (count > RATE_LIMIT) {
            console.warn(`Blocked IP: ${ip} for ${count} requests in ${WINDOW_SECONDS}s`)
            return new Response('Too many requests', {
                status: 429,
                headers: {
                    'Retry-After': WINDOW_SECONDS.toString(),
                },
            })
        }
    }

    // CAPTCHA gating logic for login page
    if (path.startsWith("/login")) {
        const loginKey = `login-hits:${ip}`
        const loginCount = await redis.incr(loginKey)
        if (loginCount === 1) await redis.expire(loginKey, MAX_LOGIN_PAGE_VISITS_RESET_TIME)

        const res = NextResponse.next()
        res.cookies.set("require_captcha", loginCount >= MAX_LOGIN_PAGE_VISITS ? "true" : "false", {
            path: "/",
            maxAge: MAX_LOGIN_PAGE_VISITS_RESET_TIME,
            httpOnly: false,
        })

        return res
    }

    // Default: allow request to proceed
    return NextResponse.next()
}
