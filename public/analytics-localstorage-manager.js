(function () {
    // This function will only run if the script is executed by CookieYes after consent
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
})()