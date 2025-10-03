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
import {deleteMemberRequest} from "@comend/lib/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import UserEditForm from "~web/components/user-edit-form";
import UserSettings from "~web/components/user-settings";
import {
    MemberRequestWithUserAndOrganization,
} from "@comend/lib/types";
import {mixpanelReset, mixpanelTrack} from "@comend/lib/mixpanel";
import Spinner from "@/packages/components/ui/spinner";
import {User} from "@prisma/client";

type NavUserProps = {
    user: Partial<User>;
    memberRequests: MemberRequestWithUserAndOrganization[];
};


export function NavUser({user, memberRequests}: NavUserProps) {
    const {data: session, status} = useSession();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

                        <div className="flex flex-col gap-8 w-full">
                            <UserEditForm/>
                            <UserSettings/>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
