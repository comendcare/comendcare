"use client"

import {signOut, useSession} from "next-auth/react"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import LogoutButton from "./logout-button"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Loading from "@/loading";
import { getUser } from "@/lib/fetchers"
import { ProfilePhoto } from "@/components/profile-photo"
import { LogOut } from "lucide-react"

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
                    const userData = await getUser(session.user.id, {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        createdAt: true,
                        updatedAt: true,
                        notificationSettings: true,
                        consentSettings: true,
                        accounts: true,
                        comments: true,
                        follows: true,
                        sentInvitations: true,
                        memberships: true,
                        membershipRequests: true,
                        organizations: true,
                        posts: true,
                        reactions: true,
                        roadmaps: true,
                        sessions: true,
                        stakeholders: true,
                        platformNotifications: true,
                        reviews: true,
                        replies: true,
                        reportOnReviews: true,
                        reportOnReplies: true,
                        reviewFeedbacks: true,
                        metadata: true,
                    });
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
                        <LogOut />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ) : (
        <div className="flex w-full items-center justify-between">
            <div
                className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5"
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
            </div>
            <LogoutButton/>
        </div>
    )
}
