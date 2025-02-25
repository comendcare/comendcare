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
import {getInvitations, getOrganizationFromOrganizationId, getUser} from "@/lib/fetchers";
import {toast} from "sonner";
import {acceptInvitation, deleteInvitation} from "@/lib/actions";
import {Invitation} from "@prisma/client";

export function NavUser() {
    const {data: session, update, status} = useSession();
    const router = useRouter();
    const {isMobile} = useSidebar();
    const [userData, setUserData] = useState<any>(null);
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

        fetchUserData();
    }, [status, session, router]);

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
                                <DropdownMenuItem
                                    onClick={() => router.push(`/user/${session?.user?.id}`)}
                                >
                                    <User/>
                                    User profile
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={() => signOut()}>
                                <LogOut/>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}
