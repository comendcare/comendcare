"use client"


import {MemberRequestWithUserAndOrganization} from "@comend/lib/types";
import {approveMemberRequestAndCreateMember, denyMemberRequest} from "@comend/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@comend/components/ui/dropdown-menu";
import {useSession} from "next-auth/react";
import { Ellipsis, UserCheck, UserX } from "lucide-react";
import { mixpanelTrack } from "@comend/lib/mixpanel";

export default function MemberRequestsDropdown({memberRequest}: { memberRequest: MemberRequestWithUserAndOrganization }) {
    const session = useSession()

    async function approveMemberRequestClick(memberRequest: MemberRequestWithUserAndOrganization) {
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
                window.location.reload() // force full page reload
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    async function denyMemberRequestClick(memberRequest: MemberRequestWithUserAndOrganization) {
        if (session?.data?.user.organizationId) {
            const response = await denyMemberRequest(session.data.user.organizationId, memberRequest)

            if (response.success) {
                mixpanelTrack("Membership Request Denied", {
                    "Member Name": response.data.user.name,
                    "Member Email": response.data.user.email,
                    "Title": response.data.title,
                    "Role": response.data.role
                })

                toast.success(`Successfully deleted ${response.data.user.name}'s member request`)
                window.location.reload() // force full page reload
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    const canApproveRequest = session?.data?.user?.membership?.role === "owner"
    const canDenyRequest = session?.data?.user?.membership?.role === "owner"

    const showDropdownTrigger = canApproveRequest || canDenyRequest

    if (!showDropdownTrigger) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={() => approveMemberRequestClick(memberRequest)}
                >
                    <UserCheck />
                    Approve request
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => denyMemberRequestClick(memberRequest)}
                    className="text-red-600 hover:text-red-800"
                >
                    <UserX />
                    Deny request
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
