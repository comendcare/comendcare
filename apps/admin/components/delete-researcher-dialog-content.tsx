"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@comend/components/ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@comend/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { deleteResearcherAndUser, deleteResearcherOnly } from "~admin/lib/actions"
import { toast } from "sonner"
import { usePathname } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import {useRouter} from "next/navigation"
import { getUser } from "@comend/lib/fetchers"
import { Researcher } from "@prisma/client"
import { Checkbox } from "@comend/components/ui/checkbox"
import { Label } from "@comend/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@comend/components/ui/tooltip"
import { Info } from "lucide-react"
import { Badge } from "@comend/components/ui/badge"

const handleDeleteResearcherAndUser = async (researcher: Researcher) => {
    const response = await deleteResearcherAndUser(researcher)
    console.log(`researcher delete`, response)
    if (!response.success || response.error) {
        toast.error(`Error deleting researcher: ${response.error}`)
    }
}

const handleDeleteResearcherOnly = async (researcher: Researcher) => {
    const response = await deleteResearcherOnly(researcher)
    console.log(`researcher delete`, response)
    if (!response.success || response.error) {
        toast.error(`Error deleting researcher: ${response.error}`)
    }
}

export function DeleteResearcherDialogContent({
    researcher
}: {
    researcher: any
}) {
    const pathname = usePathname()
    const router = useRouter()

    const [researcherOnly, setResearcherOnly] = useState(true)
    const [isOnPagPlatform, setIsOnPagPlatform] = useState(false)

    useEffect(() => {
        const init = async () => {
            const response = await getUser(
                researcher.userId, 
                {
                    id: true,
                    name: true,
                    memberships: true,
                    organizations: true,
                    sentInvitations: true,
                    membershipRequests: true,
                }
            )

            if (response.data && (
                (response.data?.memberships && response.data.memberships.length > 0) ||
                (response.data?.organizations && response.data.organizations.length) > 0 ||
                (response.data?.sentInvitations && response.data.sentInvitations.length) > 0 ||
                (response.data?.membershipRequests && response.data.membershipRequests.length > 0)
            )) {
                setIsOnPagPlatform(true)
                setResearcherOnly(true)
            } else {
                setIsOnPagPlatform(false)
                setResearcherOnly(false)
            }
        }
        init()
    }, []) 
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Are you absolutely sure?
                </DialogTitle>
                <DialogDescription>
                    {`This action cannot be undone. This will permanently delete this researcher's profile.`}
                </DialogDescription>
                <TooltipProvider>
                <div className="flex flex-col gap-2 py-2">
                    <span className="flex gap-2 items-center h-[28px]">
                        <Checkbox id="researcher-only" 
                            checked={researcherOnly}
                            onCheckedChange={(checked) => {
                                if (checked) setResearcherOnly(true)
                            }}
                        />
                        <Label htmlFor="researcher-only" className="flex gap-2 items-center">
                            Delete only researcher data
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4"/>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>This option will not affect any accounts the user has on the Comend PAG platform.</p>
                                </TooltipContent>
                            </Tooltip>
                            {isOnPagPlatform && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant={'green'}>Recommended</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80">
                                        <p>
                                            This user is a member of an organization on the PAG platform. This option is recommended, as it will not delete their PAG platform account.
                                            <br />
                                            <br />
                                            This option is recommended for user that have both a researcher account, and a PAG account.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </Label>
                    </span>
                    <span className="flex gap-2 items-center h-[28px]">
                        <Checkbox id="researcher-and-user" 
                            checked={!researcherOnly}
                            onCheckedChange={(checked) => {
                                if (checked) setResearcherOnly(false)
                            }}
                        />
                        <Label htmlFor="researcher-and-user" className="flex gap-2 items-center">
                            Delete all user data
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4"/>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>
                                        This options will delete ALL of this user's data in our system. 
                                        <br />
                                        <br />
                                        This option is recommended for spam accounts or users that are only signed up for the researcher platform.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            {!isOnPagPlatform && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant={'green'}>Recommended</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80">
                                        <p>
                                            This user is not a member of an organization on the Comend PAG platform. It is recommended to delete all their data.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </Label>
                    </span>
                </div>
                </TooltipProvider>
                <DialogFooter>
                    <DialogClose>
                        <Button type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose>
                        <Button
                            type="button"
                            variant={"destructive"}
                            onClick={async () => {
                                if (researcherOnly) {
                                    await handleDeleteResearcherOnly(researcher)
                                } else {
                                    await handleDeleteResearcherAndUser(researcher)
                                }
                                revalidate(pathname)
                                router.refresh()
                            }}
                        >
                            Delete researcher
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}
