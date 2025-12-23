"use client";

import {useState} from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@comend/components/ui/alert-dialog";
import {Button} from "@comend/components/ui/button";
import {toast} from "sonner";
import {acceptClaimOrganizationInvitation, declineAndDeleteClaimOrganizationInvitation} from "@comend/lib/actions";
import {useRouter} from "next/navigation";
import type {Member, Organization} from "@prisma/client";
import {Avatar, AvatarFallback, AvatarImage} from "@comend/components/ui/avatar";
import {useSession} from "next-auth/react";
import LoadingDots from "@comend/components/icons/loading-dots";
import { getOrganizationData, getOrganizationFromOrganizationId } from "@comend/lib/fetchers";
import { isClaimed } from "@comend/lib/utils";

export default function ClaimInvitationBlocker({
                                              invitations,
                                              children,
                                          }: {
    invitations: { id: string; organizationId: string; role: string; organization: Organization }[];
    children: React.ReactNode;
}) {
    const {data: session, update} = useSession();
    const router = useRouter();
    const [open] = useState(true); // permanently open until handled
    const [working, setWorking] = useState(false);

    const onAccept = async (invId: string, organizationId: string) => {
        try {
            setWorking(true);
            const res = await acceptClaimOrganizationInvitation(invId);
            if (res?.success) {
                toast.success("Invitation accepted.");
                update({});

                // this must happen after the user has been added as a member to the org
                // otherwise they don't have permissions to access the members list
                const org = await getOrganizationFromOrganizationId(organizationId, {
                    verified: true,
                    members: true,
                })

                // members that are not the current user
                const preExistingMembers: Member[] = (org?.data?.members || []).filter((member: Member) => member.email !== session?.user?.email)
                let firstToClaim = !isClaimed(preExistingMembers)

                // if this is the first user to claim, forward them to the claim forms (onboarding edit)
                // otherwise the default add membership & delete invitation suffices
                if (firstToClaim) router.push(`/onboarding/organization?id=${res?.data?.organizationId}`)
            } else {
                toast.error(res?.error ?? "Failed to accept invitation.");
            }
        } finally {
            setWorking(false);
        }
    };

    const onDecline = async (invId: string, organizationId: string) => {
        try {
            setWorking(true);
            const res = await declineAndDeleteClaimOrganizationInvitation(invId);
            if (res?.success) {
                toast.success("Invitation declined.");
                router.refresh();
            } else {
                toast.error(res?.error ?? "Failed to decline invitation.");
            }
        } finally {
            setWorking(false);
        }
    };

    return (
        <div className="relative">
            {/* Disable app behind dialog */}
            <div aria-hidden className="pointer-events-none select-none opacity-50">
                {children}
            </div>

            {/* Non-dismissable, modal dialog */}
            <AlertDialog open={open}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {invitations.length > 1
                                ? `You've been invited to claim several organizations`
                                : `You've been invited to claim an organization`
                            }
                        </AlertDialogTitle>
                        <AlertDialogDescription className="flex flex-col gap-4">
                            {invitations.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="justify-between relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                >
                                    <div
                                        className="flex flex-row items-center gap-2"
                                    >
                                        <Avatar className="h-12 w-12 rounded-lg">
                                            <AvatarImage
                                                src={inv.organization?.image ?? ""}
                                                alt={inv.organization?.name ?? ""}
                                            />
                                            <AvatarFallback className="rounded-lg text-2xl">
                                                {inv.organization?.name?.[0] || "NA"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <div className="inline">
                                                {inv.organization?.name && (
                                                    <div className="capitalize text-black font-semibold">
                                                        {inv.organization?.name}
                                                    </div>
                                                )}
                                                {inv.role && (
                                                    <div className="capitalize">
                                                        {inv.role}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={working}
                                            onClick={() => onDecline(inv.id, inv.organization?.id || inv.organizationId)}
                                        >
                                            {working ? <LoadingDots color="#ffffff" /> : "Decline"}
                                        </Button>
                                        <Button
                                            disabled={working}
                                            onClick={() => onAccept(inv.id, inv.organizationId)}
                                        >
                                            {working ? <LoadingDots color="#ffffff" /> : "Claim"}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* <div className="text-black">
                                {`Please accept or decline all invitations to continue.`}
                            </div> */}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Footer kept to avoid changing structure; now unused since buttons are per-item */}
                    <AlertDialogFooter/>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
