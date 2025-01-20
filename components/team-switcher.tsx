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
import {Organization} from "@prisma/client";
import {MemberWithOrganization} from "@/app/(platform)/app/layout";
import {ProfilePhoto} from "@/components/profile-photo";

interface Team {
    id: string;
    name: string;
    logo: React.ElementType;
    plan: string;
}

export function TeamSwitcher({
                                 teams,
                             }: {
    teams: MemberWithOrganization[];
}) {
    const {isMobile} = useSidebar();
    const router = useRouter();
    const {data: session, update} = useSession();
    const [activeTeam, setActiveTeam] = React.useState<MemberWithOrganization | null>(null);

    React.useEffect(() => {
        if (!teams || teams.length === 0) return;

        const matchingTeam = teams.find(
            (team) => team.id === session?.user?.organizationId
        );
        setActiveTeam(matchingTeam || teams[0]);
    }, [teams, session?.user?.organizationId]);

    const handleTeamChange = async (team: MemberWithOrganization) => {
        setActiveTeam(team);
        await update({
            ...session,
            organizationId: team.id,
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
                                {activeTeam &&
                                    <ProfilePhoto
                                        img={activeTeam?.organization?.image}
                                        name={activeTeam?.organization?.name}
                                        className="size-6"
                                    />
                                }
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeTeam ? activeTeam.organization.name : "Select a team"}
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
                        {teams.map((team, index) => (
                            <DropdownMenuItem
                                key={team.id}
                                onClick={() => handleTeamChange(team)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center">
                                    {activeTeam &&
                                        <ProfilePhoto
                                            img={activeTeam?.organization?.image}
                                            name={activeTeam?.organization?.name}
                                            className="size-4 shrink-0"
                                        />
                                    }
                                </div>
                                {team.organization.name}
                                {activeTeam?.id === team.id && (
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
