"use client"


import {MemberRequestWithUser} from "@/lib/types";
import {approveMemberRequestAndCreateMember, deleteMemberRequest} from "@/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useSession} from "next-auth/react";
import { Ellipsis, UserCheck, UserX } from "lucide-react";
import mixpanel from "mixpanel-browser";
import { mixpanelTrack } from "@/app/mixpanel";

export default async function MemberRequestsDropdown({memberRequest}: { memberRequest: MemberRequestWithUser }) {
    const session = useSession()

    async function approveMemberRequest(memberRequest: MemberRequestWithUser) {
        if (session?.data?.user.organizationId) {
            const response = await approveMemberRequestAndCreateMember(session.data.user.organizationId, memberRequest)

            if (response.success) {
                mixpanelTrack("Membership Request Approved", {
                    "Member Name": response.data.user.name,
                    "Member Email": response.data.user.email,
                    "Title": response.data.title,
                    "Role": response.data.role
                })
                
                toast.success(`Successfully approved member request and added ${response.data.user.name} as a member.`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }

            location.reload() // force full page refresh
        }
    }

    async function denyMemberRequest(memberRequest: MemberRequestWithUser) {
        if (session?.data?.user.organizationId) {
            const response = await deleteMemberRequest(session.data.user.organizationId, memberRequest)

            if (response.success) {
                mixpanelTrack("Membership Request Denied", {
                    "Member Name": response.data.user.name,
                    "Member Email": response.data.user.email,
                    "Title": response.data.title,
                    "Role": response.data.role
                })

                toast.success(`Successfully deleted ${response.data.user.name}'s member request`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }

            location.reload() // force full page refresh
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={() => approveMemberRequest(memberRequest)}
                >
                    <UserCheck />
                    Approve request
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => denyMemberRequest(memberRequest)}
                    className="text-red-600 hover:text-red-800"
                >
                    <UserX />
                    Deny request
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
