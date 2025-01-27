"use client"


import {MemberRequestWithUser} from "@/lib/types";
import {approveMemberRequestAndCreateMember} from "@/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {FaEllipsis, FaUserCheck, FaUserXmark} from "react-icons/fa6";
import {useSession} from "next-auth/react";

export default async function MemberRequestsDropdown({memberRequest}: { memberRequest: MemberRequestWithUser }) {
    const session = useSession()

    async function approveMemberRequest(memberRequest: MemberRequestWithUser) {
        if (session?.data?.user.organizationId) {
            const response = await approveMemberRequestAndCreateMember(memberRequest)

            if (response.success) {
                toast.success("Successfully approved member")
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
                    onClick={() => approveMemberRequest(memberRequest)}
                >
                    <FaUserCheck/>
                    Approve request
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => approveMemberRequest(memberRequest)}
                    className="text-red-600 hover:text-red-800"
                >
                    <FaUserXmark/>
                    Deny request
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}