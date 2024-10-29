"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import LogoutButton from "./logout-button"

export default function Profile() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // Redirect to login if the user is not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Handle loading state while session is being fetched
    if (status === "loading") {
        return <div>Loading...</div>
    }

    return (
        <div className="flex w-full items-center justify-between">
            <Link
                href="/settings"
                className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
            >
                <Image
                    src={
                        session?.user?.image ??
                        `https://avatar.vercel.sh/${session?.user?.email}`
                    }
                    width={40}
                    height={40}
                    alt={session?.user?.name ?? "User avatar"}
                    className="h-6 w-6 rounded-full"
                />
                <span className="truncate text-sm font-medium">
                    {session?.user?.name}
                </span>
            </Link>
            <LogoutButton />
        </div>
    )
}
