import { Badge } from "@comend/components/ui/badge"
import { Separator } from "@comend/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@comend/components/ui/tooltip"
import { getSession } from "@comend/lib/auth"
import prisma from "@comend/lib/prisma"
import { Member } from "@prisma/client"
import { CircleCheck, CircleX } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import InviteToClaimOrgDialog from "~admin/components/invite-to-claim-org-dialog copy"
import InviteUserToOrgDialog from "~admin/components/invite-user-to-org-dialog"
import PAGSettingsClaimOrganizationInvitationsTab from "~admin/components/pag-settings-claim-invitations-tab"
import PAGSettingsInvitationsTab from "~admin/components/pag-settings-invitations-tab"
import PAGSettingsMembersTab from "~admin/components/pag-settings-members-tab"

export default async function OrganizationMembersPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    const data = await prisma.organization.findUnique({
        where: {
            id: decodeURIComponent(params.id)
        },
        include: {
            members: {include: {user: true}},
            invitations: true,
            claimOrganizationInvitations: true,
        }
    })

    if (!data) {
        notFound()
    }

    const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`

    return (
        <>
            <div className="flex items-center justify-center sm:justify-start">
                <div className="flex flex-col items-center space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <h1 className="font-cal text-xl font-bold dark:text-white sm:text-3xl">
                        Members of {data.name}
                    </h1>
                    <a
                        href={`https://${url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                    >
                        {url} ↗
                    </a>
                    <InviteUserToOrgDialog organization={data} />
                    <InviteToClaimOrgDialog organization={data} />
                    {data.members.filter((member: Member) => !member.email.includes('comendcare.com')).length > 0 
                        ? (
                            <Badge variant={'green'}>
                                Claimed
                            </Badge>
                        ): (
                            <Badge variant={'red'}>
                                Unclaimed
                            </Badge>
                        )
                    }
                </div>
            </div>
            <TooltipProvider>
                <div className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8 gap-8">
                    <PAGSettingsMembersTab members={data.members}/>
                    <Separator />
                    <PAGSettingsInvitationsTab organization={data}/>
                    <Separator />
                    <PAGSettingsClaimOrganizationInvitationsTab organization={data} />
                </div>
            </TooltipProvider>
        </>
    )
}