"use client"

import { Ellipsis } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useEffect, useRef, useState } from "react"
import { Asset } from "@/lib/types"
import { AssetState, useAssetStore } from "@/state/asset/assetStore"
import { useShallow } from "zustand/react/shallow"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent } from "./ui/dialog"
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
        {/* <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteAssetDialog assetId={asset.id} />
        </Dialog> */}
        </>
    )
}