"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function MobileWarning() {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-center px-6">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Please use a desktop device</h1>
                <p className="text-gray-600">
                    Comend is not yet optimized for mobile or tablet. For the best experience, visit this platform on a desktop or laptop.
                </p>
                <Button onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign out and return to landing page
                </Button>
            </div>
        </div>
    )
}
