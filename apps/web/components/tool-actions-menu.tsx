"use client"

import {Copy, Ellipsis, Pencil, Trash} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu"
import { Button } from "@comend/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { Asset } from "@comend/lib/types"
import { useSession } from "next-auth/react"
import { Dialog, DialogPortal } from "@comend/components/ui/dialog"
import { DeleteAssetDialog } from "comend-pag-platform/components/delete-asset-dialog"
import { EditAssetDialog } from "./edit-tool-dialog"
import { usePathname } from "next/navigation"
import { DeleteBiosampleDialog } from "./delete-biosample-dialog"
import { DeleteDiseaseModelDialog } from "./delete-disease-model-dialog"

export const AssetActionsMenu = ({tool, type}: {tool: Asset, type: 'biosample' | 'data' | 'diseaseModel'}) => {
    const {data: session} = useSession()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [editIsOpen, setEditIsOpen] = useState(false)
    const popoverRef = useRef<HTMLInputElement>(null)

    // const handleDuplicate = async () => {
    //     if (session?.user?.organizationId) {
    //         if (type === 'biosample') await createBiosample(session.user.organizationId, {...tool, id: undefined})
    //         if (type === 'diseaseModel') await createDiseaseModel(session.user.organizationId, {...tool, id: undefined})
    //         if (type === 'data') await createClinicalDataset(session.user.organizationId, {...tool, id: undefined})
    //         // await createTool({...tool, id: undefined}, session.user.organizationId)
    //         await revalidate(pathname)
    //     }
    // }

    const handleEdit = () => {
        setEditIsOpen(true)
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
            <DropdownMenu modal={false}>
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
                    {/*<DropdownMenuItem*/}
                    {/*    onClick={(e) => {*/}
                    {/*        e.preventDefault()*/}
                    {/*        e.stopPropagation()*/}
                    {/*        handleDuplicate()*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <Copy/>*/}
                    {/*    Duplicate*/}
                    {/*</DropdownMenuItem>*/}
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete()
                        }}
                    >
                        <Trash/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={editIsOpen} onOpenChange={setEditIsOpen}>
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                        <EditAssetDialog
                            key={tool.id}
                            data={tool} 
                            type={type}
                            closeDialog={() => setEditIsOpen(false)}
                        />
                    </div>
                </DialogPortal>
            </Dialog>

            <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                        {(() => {
                            if (type === 'biosample') return <DeleteBiosampleDialog toolIds={[tool.id]} />
                            if (type === 'diseaseModel') return <DeleteDiseaseModelDialog toolIds={[tool.id]} />
                            if (type === 'data') return <DeleteAssetDialog toolIds={[tool.id]} />
                        })()}
                    </div>
                </DialogPortal>
            </Dialog>
        </>
    )
}
