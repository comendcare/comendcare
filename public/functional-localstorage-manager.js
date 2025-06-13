function getCookie(key) {
    const cookies = document.cookie
        .split(";")
        .reduce(
        (ac, cv, i) => Object.assign(ac, { [cv.split("=")[0].trim()]: cv.split("=")[1] }), {})["cookieyes-consent"]
    const { [key]: value } = cookies
        .split(",")
        .reduce(
        (obj, pair) => ((pair = pair.split(":")), (obj[pair[0]] = pair[1]), obj), {});
    return value
}

(function () {
    // This function will only run if the script is executed by CookieYes after consent
    window.functionalConsentedLocalStorage = {
        set(key, value) {
            if (process.env.NEXT_PUBLIC_NODE_ENV !== "production" || (getCookie("consent") == "yes" && getCookie('functional') == "yes")) {
                localStorage.setItem(key, JSON.stringify(value))
            }
            return null
        },
        get(key) {
            try {
                if (process.env.NEXT_PUBLIC_NODE_ENV !== "production" || (getCookie("consent") == "yes" && getCookie('functional') == "yes")) {
                    return JSON.parse(localStorage.getItem(key));
                }
            } catch {
                return null
            }
            return null
        },
        remove(key) {
            if (process.env.NEXT_PUBLIC_NODE_ENV !== "production" || (getCookie("consent") == "yes" && getCookie('functional') == "yes")) {
                localStorage.removeItem(key)
            }
        },
    }
})()