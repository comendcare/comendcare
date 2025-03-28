"use client"

import {deleteInvitation} from "@/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useSession} from "next-auth/react";
import {Invitation} from "@prisma/client";
import { Ellipsis, UserX } from "lucide-react";

export default async function InvitationsDropdown({invitation}: { invitation: Invitation }) {
    const session = useSession()

    async function revokeInvite(invitation: Invitation) {
        if (session?.data?.user.organizationId) {
            const response = await deleteInvitation(invitation)

            if (response.success) {
                toast.success(`Successfully deleted ${response.data.email}'s invitation.`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Ellipsis />
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