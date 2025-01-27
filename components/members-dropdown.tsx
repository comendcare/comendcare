"use client"


import {MemberWithUser} from "@/lib/types";
import {deleteMember} from "@/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {FaEllipsis, FaUserXmark} from "react-icons/fa6";
import {useSession} from "next-auth/react";
import {Member} from "@prisma/client";

export default async function MembersDropdown({member}: { member: MemberWithUser }) {
    const session = useSession()

    async function revokeMembership(member: MemberWithUser) {
        if (session?.data?.user.organizationId) {
            const response = await deleteMember(member.id)

            if (response.success && response.data) {
                toast.success(`Successfully deleted ${member.user.name}'s membership.`)
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
                    onClick={() => revokeMembership(member)}
                    className="text-red-600 hover:text-red-800"
                >
                    <FaUserXmark/>
                    Revoke membership
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}