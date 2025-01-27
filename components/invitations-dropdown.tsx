"use client"

import {deleteInvitation} from "@/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {FaEllipsis, FaUserXmark} from "react-icons/fa6";
import {useSession} from "next-auth/react";
import {Invitation} from "@prisma/client";

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
                <FaEllipsis/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => revokeInvite(invitation)}
                >
                    <FaUserXmark />
                    Revoke invitation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}