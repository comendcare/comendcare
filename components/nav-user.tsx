"use client";

import {useEffect, useState} from "react";
import {signOut, useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {ChevronsUpDown, LogOut, User} from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loading from "@/app/loading";
import {getAllMembershipsFromUserId, getInvitations, getOrganizationFromOrganizationId, getUser} from "@/lib/fetchers";
import {toast} from "sonner";
import {acceptInvitation, deleteInvitation} from "@/lib/actions";
import {Invitation, Member, Organization} from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ProfilePhoto} from "@/components/profile-photo";
import UserEditSettingsDialog from "@/components/user-edit-settings-dialog";
import {cn} from "@/lib/utils";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import UserEditForm from "@/components/user-edit-form";
import UserSettings from "@/components/user-settings";

type InvitationWithOrganization = Invitation & {
    organization?: Organization | null; // Optional because the organization might be null if not fetched
};

type MembershipWithOrganization = Member & {
    organization?: Organization | null; // Optional because the organization might be null if not fetched
};

export function NavUser() {
    const {data: session, update, status} = useSession();
    const router = useRouter();
    const {isMobile} = useSidebar();
    const [userData, setUserData] = useState<any>(null);
    const [memberships, setMemberships] = useState<MembershipWithOrganization[]>();
    const [invitations, setInvitations] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

                    const response = await getInvitations();

                    if (response.success && response.data) {
                        const invitationsWithDetails = await Promise.all(
                            response.data.map(async (invitation) => {
                                const orgResponse = await getOrganizationFromOrganizationId(invitation.organizationId);
                                return {
                                    ...invitation,
                                    organization: orgResponse.success ? orgResponse.data : null,
                                };
                            })
                        );

                        setInvitations(invitationsWithDetails);
                        setIsDialogOpen(true);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        async function fetchOrgData() {
            if (session) {
                try {
                    const response = await getAllMembershipsFromUserId(session.user.id);

                    // Map the response to the correct structure if needed
                    if (response.success && response.data) {
                        setMemberships(response.data);
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }

                } catch (error) {
                    console.error("Error fetching organizations:", error);
                    toast.error("Couldn't get organizations");
                }
            }
        }

        async function fetchInvitationData() {
            if (!session?.user?.email && status !== "loading") {
                console.error("User email is not available in the session.");
                toast.error("Session email is missing. Unable to fetch invitations.");
                return;
            }

            try {
                const response = await getInvitations();

                if (response.success && response.data) {
                    const invitationsWithDetails = await Promise.all(
                        response.data.map(async (invitation) => {
                            const orgResponse = await getOrganizationFromOrganizationId(invitation.organizationId);
                            if (orgResponse.success) {
                                return {
                                    ...invitation,
                                    organization: orgResponse.data,
                                };
                            } else {
                                console.error(orgResponse.error);
                                toast.error(`Could not fetch organization details for ID ${invitation.organizationId}`);
                                return {...invitation, organization: null};
                            }
                        })
                    );

                    setInvitations(invitationsWithDetails);
                } else if (response.error) {
                    console.error(response.error);
                    toast.error(response.error);
                } else {
                    console.error("Unexpected response structure:", response);
                    toast.error("Couldn't fetch invitations. Please try again.");
                }
            } catch (error) {
                console.error("Error fetching invitations:", error);
                toast.error("An unexpected error occurred while fetching invitations.");
            }
        }

        fetchUserData()
        fetchOrgData()
        fetchInvitationData()
    }, [status, session, router]);

    async function handleAcceptInvitation(invitationId: string) {
        try {
            const response = await acceptInvitation(invitationId);

            if (response.success && response.data) {
                toast.success("Invitation accepted successfully!");
                // Remove the accepted invitation from the list
                setInvitations((prevInvitations) =>
                    prevInvitations?.filter((invitation) => invitation.id !== invitationId)
                );
                await update({
                    ...session,
                    organizationId: response.data.organizationId,
                })
                router.refresh()
            } else {
                toast.error(response.error || "Failed to accept the invitation.");
            }
        } catch (error) {
            console.error("Error accepting invitation:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    }

    const handleAccept = async (invitation: Invitation) => {
        try {
            const response = await acceptInvitation(invitation.id);

            if (response.success && response.data) {
                toast.success("Invitation accepted successfully!");
                // Remove the accepted invitation from the list
                setInvitations((prevInvitations) =>
                    prevInvitations?.filter((oldInvitation) => oldInvitation.id !== invitation.id)
                );
                await update({
                    ...session,
                    organizationId: response.data.organizationId,
                })
                router.refresh()
            } else {
                toast.error(response.error || "Failed to accept the invitation.");
            }
        } catch (error) {
            toast.error("Failed to accept invitation.");
        } finally {
            setIsDialogOpen(false);
        }
    };

    const handleDeny = async (invitation: Invitation) => {
        try {
            // Call API to deny invitation
            if (session?.user.organizationId) {
                const response = await deleteInvitation(invitation)

                if (response.success) {
                    toast.success(`Successfully deleted your invitation to ${invitations[0].organization?.name}.`)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            }
        } catch (error) {
            toast.error("Failed to deny invitation.");
        } finally {
            setIsDialogOpen(false);
        }
    };

    if (status === "loading") {
        return <Loading/>;
    }

    if (!userData) {
        return null;
    }

    const {name, email, image} = userData?.data || {};

    return (
        <>
            {isDialogOpen && invitations.length > 0 && (
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>You’ve been invited
                                to {invitations[0].organization?.name}</AlertDialogTitle>
                            <AlertDialogDescription>
                                Join {invitations[0].organization?.name} on Comend to access their profile, research
                                plan, and dashboard.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => handleDeny(invitations[0])}>
                                Deny and delete
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleAccept(invitations[0])}>
                                Accept and join
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

                <Dialog>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                                            isMobile ? "justify-center" : ""
                                        }`}
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={image} alt={name}/>
                                            <AvatarFallback className="rounded-lg">
                                                {name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {!isMobile && (
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <div className="inline">
                                                    <span className="truncate font-semibold">{name}</span>
                                                    {session?.user.membership?.role && (
                                                        <> - <span
                                                            className="capitalize">{session.user.membership.role}</span></>
                                                    )}
                                                </div>
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
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem
                                                // onClick={() => router.push(`/user/${session?.user?.id}`)}
                                            >
                                                <User/>
                                                User profile
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut/>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        User profile and settings
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`You can edit your user profile's settings here.`}
                                    </DialogDescription>
                                    <Tabs defaultValue="account" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="organizations">
                                                Organizations
                                            </TabsTrigger>
                                            <TabsTrigger value="settings">
                                                Settings
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="organizations" className="flex flex-col gap-8">
                                            <div className="flex flex-col gap-2">
                                                <h2 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                                    Organizations
                                                </h2>
                                                <div className="flex flex-col items-start gap-4">
                                                    {memberships && (
                                                        memberships.length > 0 ? memberships?.map((membership) =>
                                                            <div key={membership.id}
                                                                 className="flex items-center gap-4">
                                                                <Avatar className="hidden h-9 w-9 sm:flex">
                                                                    <AvatarImage src="/avatars/01.png" alt="Avatar"/>
                                                                    <AvatarFallback>OM</AvatarFallback>
                                                                </Avatar>
                                                                <div className="grid gap-1">
                                                                    <>
                                                                        <p className="text-sm font-medium leading-none">
                                                                            {membership.organization?.name}
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground capitalize">
                                                                            {membership.role}
                                                                        </p>
                                                                    </>
                                                                </div>
                                                            </div>
                                                        ) : <div className="flex flex-col space-y-2 text-left">
                                                            <h3 className="scroll-m-20 text-md tracking-tight font-semibold">
                                                                {`No Organizations Yet`}
                                                            </h3>
                                                            <p>
                                                                {`You aren't part of any organizations yet.`}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <h2 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                                    Invitations
                                                </h2>
                                                <div className="flex items-center gap-4">
                                                    {invitations && (
                                                        invitations.length > 0 ? invitations?.map((invitation) =>
                                                            <>
                                                                <Avatar className="hidden h-9 w-9 sm:flex">
                                                                    <AvatarImage src="/avatars/01.png" alt="Avatar"/>
                                                                    <AvatarFallback>OM</AvatarFallback>
                                                                </Avatar>
                                                                <div className="grid gap-1">
                                                                    <p className="text-sm font-medium leading-none">
                                                                        {invitation.organization?.name || "Unknown Organization"}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {`${invitation.organization?.subdomain || "unknown"}.comend.io`}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="default"
                                                                    onClick={() => handleAcceptInvitation(invitation.id)}
                                                                >
                                                                    Accept
                                                                </Button>
                                                            </>
                                                        ) : <p className="text-muted-foreground text-sm">
                                                            {`You don't have any pending invitations.`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="settings" className="flex flex-col gap-8 w-full">
                                            <UserEditForm/>
                                            <UserSettings/>
                                        </TabsContent>
                                    </Tabs>
                                </DialogHeader>
                            </DialogContent>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </Dialog>
        </>
    );
}
