"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Import } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileUploadForm } from "@/components/file-upload-form";
import Papa from "papaparse";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrUpdateAsset } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { parseCSV, validateImport } from "@/lib/utils";

export function AssetBulkImportDialog() {
    const router = useRouter()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)

    const handleImport = async (file: File | undefined) => {
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            try {
                const result = await parseCSV(
                    file,
                    [
                        {key: 'title', required: true, defaultValue: 'Untitled Tool', isValid: (entry) => typeof entry === 'string' && entry.length > 0},
                        {key: 'description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'}
                    ]
                )
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each Tool. Edit the asset to add title.`
                    })
                    console.error("Error: imported assets are missing required fields", result.errors)
                }
    
                await Promise.all(result.values.map(async (asset) => {
                    await createOrUpdateAsset(asset, session?.user.organizationId)
                }))
            } catch (e) {
                toast('Error!', {
                    position: "bottom-left",
                    duration: 6000,
                    description: `Import failed. Please try again to upload using a copy of our template. If the problem continues, contact us at support@comendcare.com`
                })
                console.error("Error: failed to import tools", e)
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
                        <p>{`Import tools from .csv`}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import Tools
            </DialogTitle>
            <DialogDescription>
                Import multiple tools at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1AJYdnvlPTYRR5nx2xz65lpQnK9RfCpkouEtshEsKSb0/edit?usp=sharing">Tool input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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