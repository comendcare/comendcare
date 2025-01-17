'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SignOutPage() {
    const [countdown, setCountdown] = useState(5)
    const router = useRouter()

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prevCount) => prevCount - 1)
        }, 1000)

        const redirect = setTimeout(() => {
            router.push('/')
        }, 5000)

        return () => {
            clearInterval(timer)
            clearTimeout(redirect)
        }
    }, [router])

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

