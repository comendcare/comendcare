'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {signOut} from 'next-auth/react'
import {Button} from '@comend/components/ui/button'
import {toast} from 'sonner'

export default function SignOutPage() {
    const [countdown, setCountdown] = useState(5)
    const router = useRouter()
    const searchParams = useSearchParams()
    const ranRef = useRef(false)

    // Read reason once to avoid effect retriggers
    const reason = useMemo(() => searchParams.get('reason'), [searchParams])

    useEffect(() => {
        if (ranRef.current) return
        ranRef.current = true

        ;(async () => {
            // 1) Tell NextAuth to invalidate server cookies
            await signOut({ redirect: false })

            // 2) Clear client-side storage your app might use
            try {
                // Clear namespaced keys only (safer than localStorage.clear())
                Object.keys(localStorage)
                    .filter(k => k.startsWith('comend:') || k.startsWith('nextauth:'))
                    .forEach(k => localStorage.removeItem(k))
            } catch {}

            try {
                sessionStorage.clear()
            } catch {}

            // 3) Clear Service Worker caches (if you use next-pwa or any SW)
            try {
                if ('caches' in window) {
                    const keys = await caches.keys()
                    await Promise.all(keys.map(k => caches.delete(k)))
                }
            } catch {}

            // 4) Force RSC/route cache to re-fetch on next render
            router.refresh()

            // Toast reason (after signOut to avoid double toasts on dev strict mode)
            if (reason === 'not_whitelisted') {
                toast.error("Sorry! you're not on the user whitelist. If this is a mistake, please contact us.")
            } else if (reason === 'terminated') {
                toast.error('Your account has been deleted. If this was a mistake, please contact us.')
            } else if (reason === 'roleChanged') {
                toast.error("Your role changed. For security, you'll need to sign back in.")
            }

            // Start countdown after everything is cleared
            const tick = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : c)), 1000)
            const redirect = setTimeout(() => {
                // replace() avoids a back-button hop to the signed-out page
                router.replace('/')
            }, 5000)

            return () => {
                clearInterval(tick)
                clearTimeout(redirect)
            }
        })()
    }, [reason, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">You have been signed out</h1>
                <p className="mb-4">
                    You will be redirected to the home page in{' '}
                    <span className="font-bold text-blue-600" aria-live="polite">{countdown}</span> seconds...
                </p>
                <Button onClick={() => router.replace('/')} className="w-full">Redirect Now</Button>
            </div>
        </div>
    )
}
