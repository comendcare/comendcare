"use client"

import {signOut, useSession} from "next-auth/react"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import LogoutButton from "./logout-button"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {FaArrowRightFromBracket} from "react-icons/fa6";
import Loading from "@/app/loading";
import { getUser } from "@/lib/fetchers"
import { ProfilePhoto } from "@/components/profile-photo"

export default function Profile({isCollapsed = false}: {isCollapsed?: boolean }) {
    const {data: session, status} = useSession()
    const router = useRouter()
    const [userData, setUserData] = useState<any>()

    // Redirect to login if the user is not authenticated, and fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (status === "unauthenticated") {
                router.push("/login");
                return;
            }

            if (status === "authenticated" && session?.user?.id) {
                try {
                    const userData = await getUser(session.user.id);
                    setUserData(userData);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        fetchUserData();
    }, [status, session, router])

    // Handle loading state while session is being fetched
    if (status === "loading") {
        return <Loading/>
    }

    return isCollapsed ? (
        <div className="flex w-full items-center justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* <Image
                        src={getUserPhoto(userData?.data, session)}
                        width={40}
                        height={40}
                        alt={session?.user?.name ?? "User avatar"}
                        className="h-8 w-8 rounded-full"
                    /> */}
                    <ProfilePhoto
                        img={userData?.data?.image}
                        name={userData?.data?.name}
                        className="h-8 w-8 rounded-full"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel
                        onClick={() => router.push(`/user/${session?.user?.id}`)}
                    >
                        My profile
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        onClick={() => signOut()}
                    >
                        <FaArrowRightFromBracket/>
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ) : (
        <div className="flex w-full items-center justify-between">
            <Link
                href={`/user/${session?.user?.id}`}
                className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
            >
                {/* <Image
                    src={getUserPhoto(userData?.data, session)}
                    width={40}
                    height={40}
                    alt={session?.user?.name ?? "User avatar"}
                    className="h-6 w-6 rounded-full"
                /> */}
                <ProfilePhoto
                    img={userData?.data?.image}
                    name={userData?.data?.name}
                    className="h-8 w-8 rounded-full"
                />
                <span className="truncate text-sm font-medium">
                    {session?.user?.name}
                </span>
            </Link>
            <LogoutButton/>
        </div>
    )
}
