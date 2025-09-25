"use client";

import {useEffect, useState} from "react";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {ChevronsUpDown, LogOut} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@comend/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@comend/components/ui/alert-dialog";
import {toast} from "sonner";
import {acceptInvitation, deleteMemberRequest} from "@comend/lib/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {Button} from "@comend/components/ui/button";
import {cn} from "@comend/lib/utils";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@comend/components/ui/tabs";
import UserEditForm from "~web/components/user-edit-form";
import UserSettings from "~web/components/user-settings";
import {InvitationWithOrganization, MemberRequestWithUserAndOrganization, MembershipWithOrganization} from "@comend/lib/types";
import {mixpanelReset, mixpanelTrack} from "@comend/lib/mixpanel";
import Spinner from "@/packages/components/ui/spinner";
import {User} from "@prisma/client";

type NavUserProps = {
    user: Partial<User>;
    memberships: MembershipWithOrganization[];
    invitations: InvitationWithOrganization[],
    memberRequests: MemberRequestWithUserAndOrganization[];
};


export function NavUser({ user, memberships, invitations, memberRequests }: NavUserProps) {
    const {data: session, update, status} = useSession();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    async function handleAcceptInvitation(invitationId: string) {
        try {
            const response = await acceptInvitation(invitationId);

            if (response.success && response.data) {
                toast.success("Invitation accepted successfully!");
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

    const handleClose = async (memberRequest: MemberRequestWithUserAndOrganization) => {
        try {
            mixpanelTrack("Membership Request Approval Acknowledged", {
                "Member Name": memberRequest.user.name,
                "Member Email": memberRequest.user.email,
                "Role": memberRequest.role
            })

            const response = await deleteMemberRequest(session?.user.id, memberRequest);

            if (response.success && response.data) {
                // mixpanel track stuff
            } else {
                toast.error(response.error || "Failed to delete approved member request.");
            }
        } catch (error) {
            toast.error("Failed to delete approved member request.");
        } finally {
            setIsDialogOpen(false);
        }
    };

    if (status === "loading") {
        return <Spinner className="scale-100"/>
    }

    if (!user) {
        return null;
    }

    return (
        <>
            {memberRequests[0]?.approved && (
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Your member request
                                to {memberRequests[0].organization?.name} has been approved</AlertDialogTitle>
                            <AlertDialogDescription>
                                You can start viewing and making changes to {memberRequests[0].organization?.name} on
                                Comend.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => handleClose(memberRequests[0])}>
                                Close
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <Dialog>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.image || ""} alt={user.name || "User name"}/>
                            <AvatarFallback className="rounded-lg">
                                {user.name?.[0] || "NA"}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                    >
                        <DropdownMenuGroup>
                            <DialogTrigger asChild>
                                <DropdownMenuItem
                                    // onClick={() => router.push(`/user/${session?.user?.id}`)}
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.image || ""} alt={user.name || "User name"}/>
                                        <AvatarFallback className="rounded-lg">
                                            {user.name?.[0] || "NA"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <div className="inline">
                                            <span className="truncate font-semibold">{user.name || "Nameless"}</span>
                                            {session?.user.membership?.role && (
                                                <> - <span
                                                    className="capitalize">{session.user.membership.role}</span></>
                                            )}
                                        </div>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </DropdownMenuItem>
                            </DialogTrigger>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => {
                            mixpanelTrack('User Logout')
                            mixpanelReset()
                            signOut()
                        }}>
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
                                                        onClick={() => handleAcceptInvitation(invitation?.id || "")}
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
            </Dialog>
        </>
    );
}
