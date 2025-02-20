"use client";

import * as React from "react";
import {ChevronsUpDown, Plus, Check} from "lucide-react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {MemberWithOrganization} from "@/app/(platform)/app/layout";
import {ProfilePhoto} from "@/components/profile-photo";

export function OrganizationSwitcher({
                                 memberships,
                             }: {
    memberships: MemberWithOrganization[];
}) {
    const {isMobile} = useSidebar();
    const router = useRouter();
    const {data: session, update} = useSession();
    const [activeOrganization, setActiveOrganization] = React.useState<MemberWithOrganization | null>(null);
    console.log(session)

    React.useEffect(() => {
        if (!memberships || memberships.length === 0) return;

        const matchingOrganization = memberships.find(
            (membership) => membership.organization.id === session?.user?.organizationId
        );
        setActiveOrganization(matchingOrganization || memberships[0]);
    }, [memberships, session?.user?.organizationId]);

    const handleOrganizationChange = async (membership: MemberWithOrganization) => {
        setActiveOrganization(membership);
        // await update({
        //     ...session,
        //     organizationId: membership.organizationId,
        //     membership: membership,
        // });
        await update({
            user: {
                ...session?.user,
                organizationId: membership.organization.id, // Ensure the correct org ID is set
                membership: membership, // Explicitly set membership
            }
        });
        router.refresh();
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex size-8 items-center justify-center">
                                {activeOrganization &&
                                    <ProfilePhoto
                                        img={activeOrganization?.organization?.image}
                                        name={activeOrganization?.organization?.name}
                                        className="size-6"
                                    />
                                }
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeOrganization ? activeOrganization.organization.name : "Select an organization"}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Organizations
                        </DropdownMenuLabel>
                        {memberships.map((membership, index) => (
                            <DropdownMenuItem
                                key={membership.id}
                                onClick={() => handleOrganizationChange(membership)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center">
                                    {activeOrganization &&
                                        <ProfilePhoto
                                            img={activeOrganization?.organization?.image}
                                            name={activeOrganization?.organization?.name}
                                            className="size-4 shrink-0"
                                        />
                                    }
                                </div>
                                {membership.organization.name}
                                {activeOrganization?.id === membership.id && (
                                    <Check className="ml-auto opacity-100"/>
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => {
                                router.push("/app/create/new-organization");
                            }}
                            className="gap-2 p-2"
                        >
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4"/>
                            </div>
                            <div className="font-medium text-muted-foreground">Create or join an organization</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
