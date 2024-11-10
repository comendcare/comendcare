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
        // Determine if the user is an admin
        const isAdmin = session?.user?.email?.endsWith("@comendcare.com") ||
            (process.env.ADMIN_WHITELIST?.split(",").includes(session?.user?.email || ""));

        // Redirect if the user is unauthenticated or lacks admin privileges
        if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
            // Show toast message only once, if needed
            if (!hasShownToast.current) {
                if (status === "unauthenticated") {
                    // Toast for unauthenticated users
                    toast.info(`Please sign in`, {
                        description: `You need to sign in to access this.`,
                    });
                } else if (!isAdmin) {
                    // Toast for authenticated users without admin access
                    toast.info(`Access restricted`, {
                        description: `You don't have permission to access this area.`,
                    });
                }
                hasShownToast.current = true;
            }

            // Redirect to sign-in page with callback URL
            router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        }
    }, [session, status, router, pathname])
}
