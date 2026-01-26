"use client"

import {Ellipsis, Pencil} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu"
import { Button } from "@comend/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { Roadmap } from "@comend/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogPortal, DialogTitle } from "@comend/components/ui/dialog"
import dynamic from "next/dynamic"

const EditResearchPlanForm = dynamic(
    () => import("./edit-research-plan-form").then(m => m.EditResearchPlanForm),
    {
        ssr: false,
        loading: () => (
            <div className="text-sm text-muted-foreground">Loading editor…</div>
        ),
    }
)


export const ResearchPlanActionsMenu = ({researchPlan}: {researchPlan: Roadmap}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [editIsOpen, setEditIsOpen] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const popoverRef = useRef<HTMLInputElement>(null)

    const handleEdit = () => {
        setEditIsOpen(true)
    }

    const closeDialog = () => {
        setEditIsOpen(false)
        setIsClosing(false)
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
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsOpen(true)
                        }}
                        variant="ghost"
                        className="p-2 justify-end h-full w-fit"
                    >
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left" sideOffset={4} className="w-40 p-1">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEdit()
                        }}
                    >
                        <Pencil/>
                        Edit
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete()
                        }}
                    >
                        <Trash/>
                        Delete
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog 
                open={editIsOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsClosing(true)
                    }
                }}
            >
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Edit Research Plan Details
                                </DialogTitle>
                                <DialogDescription>
                                    {`Edit details like the name and description of your Research Plan. Click save when you're done.`}
                                </DialogDescription>
                            </DialogHeader>

                            <EditResearchPlanForm 
                                researchPlanData={researchPlan} 
                                closeDialog={closeDialog}
                                isClosing={isClosing} 
                                setIsClosing={setIsClosing}
                            />
                        </DialogContent>
                    </div>
                </DialogPortal>
            </Dialog>
        </>
    )
}
