"use client"

import { Ellipsis } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useEffect, useRef, useState } from "react"
import { RFP } from "@/lib/types"
import { useShallow } from "zustand/react/shallow"
import { useSession } from "next-auth/react"
import { Dialog, DialogPortal } from "./ui/dialog"
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore"
import { DeleteRFPDialog } from "./delete-rfp-dialog"

const rfpSelector = (state: RFPState) => ({
    createRFP: state.createRFP,
    updateRFP: state.updateRFP,
    deleteRFP: state.deleteRFP,
    saveState: state.saveState
})

export const RFPActionsMenu = ({rfp}: {rfp: RFP}) => {
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
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

    return (
        <>
        <Popover open={isOpen}>
            <PopoverTrigger asChild>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                    variant="ghost"
                    className="p-2 h-auto justify-end h-full"
                >
                    <Ellipsis />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col w-fit p-2 z-20" side={'left'} sideOffset={4} ref={popoverRef}>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate()
                        setIsOpen(false)
                    }}
                    variant="ghost"
                    className="h-full justify-start"
                >
                    Duplicate
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDelete()
                        setIsOpen(false)
                    }}
                    variant="ghost"
                    className="h-full justify-start"
                >
                    Delete
                </Button>
            </PopoverContent>
        </Popover>
        {/* Contain dialog content isn a Dialog Portal, so any click events don't propogate and cause unexpected open/close behaviour in the EditRFPForm */}
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
        <DialogPortal>
            <div onClick={(e) => e.stopPropagation()}>
            <DeleteRFPDialog rfpId={rfp.id} />
            </div>
        </DialogPortal>
        </Dialog>
        </>
    )
}