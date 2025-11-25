"use client"

import {signOut, useSession} from "next-auth/react"
import {useRouter} from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@comend/components/ui/dropdown-menu";
import {ProfilePhoto} from "@comend/components/profile-photo"
import {LogOut, Settings} from "lucide-react"
import type {User} from "@prisma/client";

export default function UserNavbarProfile({user}: {user: Partial<User>}) {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <ProfilePhoto
                    img={user?.image}
                    name={user?.name}
                    className="h-8 w-8 rounded-full"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                >
                    <Settings/>
                    <span>
                        Settings
                    </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={() => signOut()}
                >
                    <LogOut/>
                    <span>
                        Logout
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
