"use client"

import { Copy, Ellipsis, Share, Trash } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useEffect, useRef, useState } from "react"
import { RFP } from "@/lib/types"
import { useShallow } from "zustand/react/shallow"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogPortal } from "./ui/dialog"
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore"
import { DeleteRFPDialog } from "./delete-rfp-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import ShareDialog from "./share-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { getOrganizationData, getOrganizationFromOrganizationId } from "@/lib/fetchers"
import { Organization, Prisma } from "@prisma/client"
import { organizations } from "@/data/sample-pags"

const rfpSelector = (state: RFPState) => ({
    createRFP: state.createRFP,
    updateRFP: state.updateRFP
})

export const RFPActionsMenu = ({rfp}: {rfp: RFP}) => {
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const [organization, setOrganization] = useState<Organization | undefined>(undefined)
    const popoverRef = useRef<HTMLInputElement>(null)
    const { createRFP } = useRFPStore(useShallow(rfpSelector))

    const handleDuplicate = () => {
        if (session?.user?.organizationId) createRFP({...rfp, id: undefined}, session.user.organizationId)
    }

    const handleDelete = () => {
        setDeleteIsOpen(true)
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (
            popoverRef.current &&
            !popoverRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
            popoverRef.current.blur();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchend', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchend', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchend', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        const setOrg = async () => {
            const org = await getOrganizationFromOrganizationId(rfp.organizationId, {
                id: true,
                subdomain: true,
            })
            setOrganization(org.data)
        }

        setOrg()
    }, [])

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    return (
        <>
        <DropdownMenu open={isOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                    variant="ghost"
                    className="p-2 justify-end h-full"
                >
                    <Ellipsis />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col w-fit p-2 z-20" side={'left'} sideOffset={4} ref={popoverRef}>
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <DropdownMenuItem
                                disabled={rfp.private}
                                onClick={(e) => {
                                    if (rfp.private) return
                                    e.preventDefault()
                                    handleShare()
                                    setIsOpen(false)
                                }}
                            >
                                <Share />
                                Share
                            </DropdownMenuItem>
                        </TooltipTrigger>
                        {rfp.private && (
                            <TooltipContent side={"left"}>
                                <p>This RFP is private. Make it public to share.</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDuplicate()
                        setIsOpen(false)
                    }}
                    className="h-full justify-start"
                >
                    <Copy />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete()
                        setIsOpen(false)
                    }}
                    className="h-full justify-start"
                >
                    <Trash />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {/* Contain dialog content isn a Dialog Portal, so any click events don't propogate and cause unexpected open/close behaviour in the EditRFPForm */}
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DialogPortal>
                <div onClick={(e) => e.stopPropagation()}>
                    <DeleteRFPDialog rfpId={rfp.id} />
                </div>
            </DialogPortal>
        </Dialog>

        <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
            <DialogPortal>
                <div onClick={(e) => e.stopPropagation()}>
                    <DialogContent className="min-w-fit">
                        <ShareDialog
                            url={`${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?rfp=${rfp.id}`}
                            embeddedRFPData={{
                                embeddedRFPLink: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization?.subdomain}/rfp/${rfp.id}`,
                                rfpId: rfp.id,
                                rfpTitle: rfp.title
                            }}  
                            organization={organization}
                            postMessage={`A new RFP ${rfp.title} has been added to ${organization?.name} ${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?rfp=${rfp.id}`}
                            postSubject={`A new RFP ${rfp.title} has been added to ${organization?.name}`}

                            trackShareEvent={{
                                title: `RFP Shared`,
                                additonalProperties: {
                                    "RFP ID": rfp.id,
                                    "RFP Title": rfp.title
                                }
                            }}
                        />
                    </DialogContent>
                </div>
            </DialogPortal>
        </Dialog>
        </>
    )
}