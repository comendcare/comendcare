"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@comend/components/ui/dropdown-menu";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar} from "@comend/components/ui/sidebar";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {Check, ChevronsUpDown, Plus} from "lucide-react";
import {useSession} from "next-auth/react";
import {Skeleton} from "@comend/components/ui/skeleton";
import {MembershipWithOrganization} from "@comend/lib/types";
import Link from "next/link";

export function OrganizationSwitcher({memberships}: { memberships: MembershipWithOrganization[] }) {
    const {data: session, update} = useSession();
    const activeId = session?.user?.organizationId ?? null;
    const router = useRouter();
    const {isMobile} = useSidebar();

    const handleSelect = async (orgId: string | undefined) => {
        if (!orgId) return

        window.location.href = `/api/switch-org/${orgId}?next=/app/profile`;
    };

    const activeOrg = memberships.find(m => m.organizationId === activeId) ?? null;

    if (activeOrg) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    {activeOrg && (
                                        <ProfilePhoto
                                            img={activeOrg?.organization?.image}
                                            name={activeOrg?.organization?.name ?? "No Name"}
                                            className="size-6"
                                        />
                                    )}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <div className="truncate font-semibold">
                                        {activeOrg?.organization?.name ?? "No name organization"}
                                    </div>
                                </div>
                                <ChevronsUpDown className="ml-auto"/>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-80 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Organizations
                            </DropdownMenuLabel>

                            <div className="max-h-80 h-min overflow-auto">
                                {memberships.map((m) => (
                                    <DropdownMenuItem
                                        key={m.id}
                                        onClick={() => handleSelect(m.organizationId)}
                                        className="gap-2 p-2"
                                    >
                                        <div className="flex size-6 items-center justify-center">
                                            <ProfilePhoto
                                                img={m?.organization?.image}
                                                name={m?.organization?.name ?? "No name organization"}
                                                className="size-4 shrink-0"
                                            />
                                        </div>
                                        {m.organization?.name ?? "No name organization"}
                                        {activeId === m.organizationId && <Check className="ml-auto opacity-100"/>}
                                    </DropdownMenuItem>
                                ))}
                            </div>

                            <DropdownMenuSeparator/>

                            <DropdownMenuItem asChild className="gap-2 p-2">
                                <Link href="/create/new-organization">
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium text-muted-foreground">
                                        Create an organization
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    } else {
        return <Skeleton className="flex aspect-square items-center justify-center rounded-lg w-full h-9 px-4"/>
    }
}
