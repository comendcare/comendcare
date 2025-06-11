type ConsentKeyType = 'functional' | 'analytics' | 'necessary'

const hasConsent = (consentKey: ConsentKeyType) => {
	// CookieYes sets this cookie after user consents
	const consentCookie = document.cookie
		.split('; ')
		.find(row => row.startsWith('cookieyes-consent='))

	if (!consentCookie) return false

	try {
		const value = decodeURIComponent(consentCookie.split('=')[1])
		const consent = JSON.parse(value) // if JSON format
		return (
			consent.functional === true ||
			consent.includes?.("functional") // in case of array-based format
		)
	} catch {
		return false
	}
};

export const consentedLocalStorage = {
	hasConsent: (consentKey: ConsentKeyType) => {
		if (!hasConsent(consentKey)) return null
		return true
	},
	getItem: (key: string, consentKey: ConsentKeyType) => {
		if (!hasConsent(consentKey)) return null
		return localStorage.getItem(key)
	},
	setItem: (key: string, consentKey: ConsentKeyType, value: string) => {
		if (!hasConsent(consentKey)) return
		localStorage.setItem(key, value)
	},
	removeItem: (key: string, consentKey: ConsentKeyType) => {
		if (!hasConsent(consentKey)) return
		localStorage.removeItem(key)
	},
	clear: (consentKey: ConsentKeyType) => {
		if (!hasConsent(consentKey)) return
		localStorage.clear()
	}
};