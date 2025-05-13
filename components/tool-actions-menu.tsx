"use client"

import { Ellipsis } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useEffect, useRef, useState } from "react"
import { Asset } from "@/lib/types"
import { AssetState, useAssetStore } from "@/state/asset/assetStore"
import { useShallow } from "zustand/react/shallow"
import { useSession } from "next-auth/react"
import { Dialog, DialogPortal } from "./ui/dialog"
import { DeleteAssetDialog } from "./delete-asset-dialog"

const assetSelector = (state: AssetState) => ({
    createAsset: state.createAsset,
    updateAsset: state.updateAsset,
    deleteAsset: state.deleteAsset,
    saveState: state.saveState
})

export const AssetActionsMenu = ({asset}: {asset: Asset}) => {
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const popoverRef = useRef<HTMLInputElement>(null)
    const { createAsset } = useAssetStore(useShallow(assetSelector))

    const handleDuplicate = () => {
        if (session?.user?.organizationId) createAsset({...asset, id: undefined}, session.user.organizationId)
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
                            handleDuplicate()
                        }}
                    >
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete()
                        }}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                        <DeleteAssetDialog assetId={asset.id} />
                    </div>
                </DialogPortal>
            </Dialog>
        </>
    )
}
