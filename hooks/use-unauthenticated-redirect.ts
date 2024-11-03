"use client"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export const useUnauthenticatedRedirect = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const hasShownToast = useRef(false) // Track if toast has been shown

    useEffect(() => {
        if (!session && status === "unauthenticated") {
            if (!hasShownToast.current) {
                // Show the toast only once
                toast.info(`Please sign in`, {
                    description: `You need to sign in to access this.`,
                })
                hasShownToast.current = true
            }

            // Include the return URL in the query parameters
            router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        }
    }, [session, status, router, pathname])
}
