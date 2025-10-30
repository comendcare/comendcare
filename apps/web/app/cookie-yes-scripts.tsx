export const CookieyesScripts = () => {
    return (
        <>
            {/* consent scripts added so cookieyes can block cookies & localStorage where necessary, if the user has not consented */}
            {process.env.NODE_ENV !== "production" ? (
                <>
                    <script
                        data-cookieyes='cookieyes-functional'
                        src={`/functional-localstorage-manager.js`}
                    />
                    <script
                        data-cookieyes='cookieyes-analytics'
                        src={`/analytics-localstorage-manager.js`}
                    />
                </>
            ) : (
                <>
                    <script
                        id="cookieyes"
                        type="text/javascript"
                        src={`https://cdn-cookieyes.com/client_data/${process.env.COOKIE_YES_WEBSITE_KEY}/script.js`}
                        data-cookiescript-domain=".comend.io"
                    ></script>
                    <script
                        data-cookieyes='cookieyes-functional'
                        src={`/functional-localstorage-manager.js`}
                    />
                    <script
                        data-cookieyes='cookieyes-analytics'
                        src={`/analytics-localstorage-manager.js`}
                    />
                </>
            )}
        </>
    )
}