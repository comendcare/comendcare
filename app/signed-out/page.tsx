'use client'

import { useEffect, useState } from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {toast} from "sonner";

export default function SignOutPage() {
    const [countdown, setCountdown] = useState(5)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {

        signOut({ redirect: false }) // Prevent automatic redirect from NextAuth

        const reason = searchParams.get('reason');
        if (reason === "not_whitelisted") {
            toast.error("Sorry! you're not on the user whitelist. If this is a mistake, please contact us.");
        } else if (reason === "terminated") {
            toast.error("Your account has been deleted. If this was a mistake, please contact us.");
        }

        const timer = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount > 0) {
                    return prevCount - 1
                }
                return prevCount
            })
        }, 1000)

        const redirect = setTimeout(() => {
            router.push('/')
        }, 5000)

        return () => {
            clearInterval(timer)
            clearTimeout(redirect)
        }
    }, [router, searchParams])

    const handleManualRedirect = () => {
        router.push('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">You have been signed out</h1>
                <p className="mb-4">
                    You will be redirected to the home page in{' '}
                    <span className="font-bold text-blue-600" aria-live="polite">
                        {countdown}
                    </span>{' '}
                    seconds...
                </p>
                <Button onClick={handleManualRedirect} className="w-full">
                    Redirect Now
                </Button>
            </div>
        </div>
    )
}

