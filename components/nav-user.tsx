"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ChevronsUpDown,
    LogOut,
    User,
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import Loading from "@/app/loading";
import { getUser } from "@/lib/fetchers";

export function NavUser() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isMobile } = useSidebar();
    const [userData, setUserData] = useState<any>(null);

    // Redirect to login and fetch user data
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
    }, [status, session, router]);

    if (status === "loading") {
        return <Loading />;
    }

    if (!userData) {
        return null;
    }

    const { name, email, image } = userData?.data || {};

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                                isMobile ? "justify-center" : ""
                            }`}
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={image} alt={name} />
                                <AvatarFallback className="rounded-lg">
                                    {name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            {!isMobile && (
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{name}</span>
                                    <span className="truncate text-xs">{email}</span>
                                </div>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => router.push(`/user/${session?.user?.id}`)}
                            >
                                <User />
                                User profile
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
