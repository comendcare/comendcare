"use client"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export const useUnauthenticatedRedirect = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname() // Get the current path

    useEffect(() => {
        if (!session && status === "unauthenticated") {
            // Include the return URL in the query parameters
            router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        }
    }, [session, status, router, pathname])
}
