"use client"

import {deleteInvitation} from "@comend/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@comend/components/ui/dropdown-menu";
import {useSession} from "next-auth/react";
import {Invitation} from "@prisma/client";
import { Ellipsis, UserX } from "lucide-react";
import { Button } from "@comend/components/ui/button";

export default function InvitationsDropdown({invitation}: { invitation: Invitation }) {
    const session = useSession()

    async function revokeInvite(invitation: Invitation) {
        if (session?.data?.user.organizationId) {
            const response = await deleteInvitation(session.data.user.organizationId, invitation)

            if (response.success) {
                toast.success(`Successfully deleted ${response.data.email}'s invitation.`)
                window.location.reload() // force full page reload
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 h-fit">
                    <Ellipsis />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => revokeInvite(invitation)}
                >
                    <UserX />
                    Revoke invitation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}
