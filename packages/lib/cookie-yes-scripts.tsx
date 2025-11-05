import Script from "next/script"

const functionalConsentedLocalStorage = `
    window.functionalConsentedLocalStorage = {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value))
            return null
        },
        get(key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return null
            }
        },
        remove(key) {
            localStorage.removeItem(key)
        },
    }
`

const analyticsConsentedLocalStorage = `
    window.analyticsConsentedLocalStorage = {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value))
            return null
        },
        get(key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return null
            }
        },
        remove(key) {
            localStorage.removeItem(key)
        },
    }
`

export const CookieyesScripts = () => {
    return (
        <>
            {/* consent scripts added so cookieyes can block cookies & localStorage where necessary, if the user has not consented */}
            {process.env.NODE_ENV !== "production" ? (
                <>
                    <Script
                        id="functional-ls-manager"
                        data-cookieyes="cookieyes-functional"
                        strategy="beforeInteractive"
                    >
                        {functionalConsentedLocalStorage}
                    </Script>
                    <Script
                        id="analytics-ls-manager"
                        data-cookieyes="cookieyes-analytics"
                        strategy="beforeInteractive"
                    >
                        {analyticsConsentedLocalStorage}
                    </Script>
                </>
            ) : (
                <>
                    <script
                        id="cookieyes"
                        type="text/javascript"
                        src={`https://cdn-cookieyes.com/client_data/${process.env.COOKIE_YES_WEBSITE_KEY}/script.js`}
                        data-cookiescript-domain=".comend.io"
                    />
                    <Script
                        id="functional-ls-manager"
                        data-cookieyes="cookieyes-functional"
                        strategy="beforeInteractive"
                    >
                        {functionalConsentedLocalStorage}
                    </Script>
                    <Script
                        id="analytics-ls-manager"
                        data-cookieyes="cookieyes-analytics"
                        strategy="beforeInteractive"
                    >
                        {analyticsConsentedLocalStorage}
                    </Script>
                </>
            )}
        </>
    )
}