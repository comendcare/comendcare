"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrUpdateAsset, createOrUpdateBiosample } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { parseCSV, validateImport } from "@comend/lib/utils";
import { BIOSAMPLE_TYPE_OPTIONS } from "@/packages/lib/types";
import { revalidate } from "@/packages/lib/revalidate";
import { editBiosampleForm } from "./edit-biosample-tool-form";
import z from "zod";
import { unescape } from "lodash";

export function formatBiosampleData(biosample: any): z.infer<typeof editBiosampleForm> {
    const data: z.infer<typeof editBiosampleForm> = {
        types: (() => {
            const foundOption = BIOSAMPLE_TYPE_OPTIONS.find(b => b.label === biosample.Type)
            if (foundOption) return [foundOption]
            return []
        })(),
        description: biosample.Description,
        isPinned: false,
        isPrivate: false,
        quantity: biosample['Available Quantity'],
        quantityUnit: 'ml',
        priceUnit: 'usd',
    }
    return data
}

export function BiosampleBulkImportDialog() {
    const router = useRouter()
    const pathname = usePathname()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)

    const handleImport = async (file: File | undefined) => {
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            try {
                const result = await parseCSV(
                    file,
                    [
                        {key: 'Type', required: false, defaultValue: undefined, isValid: (entry) => BIOSAMPLE_TYPE_OPTIONS.find(biosample => biosample.labal === entry.Type) !== undefined},
                        {key: 'Diagnoses', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Available Quantity', required: false, defaultValue: undefined, isValid: (entry) => JSON.parse(entry) > 0},
                        {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'}
                    ]
                )
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each Biosample. Edit the biosample to add title.`
                    })
                    console.error("Error: imported biosamples are missing required fields", result.errors)
                }

                await Promise.all(result.values.map(async (biosample) => {
                    await createOrUpdateBiosample(session?.user.organizationId, formatBiosampleData(biosample))
                    await revalidate(pathname)
                }))
            } catch (e) {
                toast('Error!', {
                    position: "bottom-left",
                    duration: 6000,
                    description: `Import failed. Please try again to upload using a copy of our template. If the problem continues, contact us at support@comendcare.com`
                })
                console.error("Error: failed to import biosamples", e)
            }
        } else {
            console.error("Please upload a valid CSV file.");
        }

        router.refresh()
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            size={"icon"} 
                            variant={"ghost"}
                            onClick={() => setIsOpen(true)}
                        >
                            <Import />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Import biosamples from .csv`}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import Biosamples
            </DialogTitle>
            <DialogDescription>
                Import multiple biosamples at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, filling it out, downloading it as a CSV, and uploading it.
            </DialogDescription>
                </DialogHeader>

                <FileUploadForm 
                    accept=".csv" 
                    onSubmit={handleImport}
                />
            </DialogContent>
        </Dialog>
    )
}
