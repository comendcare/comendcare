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
import { parseCSV } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createOrUpdateRFP } from "@/lib/actions";

export function RFPBulkImportDialog() {
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
                        {key: 'title', required: true, defaultValue: 'Untitled RFP', isValid: (entry) => typeof entry === 'string' && entry.length > 0},
                        {key: 'description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'}
                    ]
                )
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 4000,
                        description: `Missing fields in import file: A title is required for each RFP. Please ensure all RFPs have titles before importing.`
                    })
                    console.error("Error: imported assets are missing required fields", result.errors)
                }
    
                await Promise.all(result.values.map(async (rfp) => {
                    await createOrUpdateRFP(rfp, session?.user.organizationId)
                }))
            } catch (e) {
                toast('Error!', {
                    position: "bottom-left",
                    duration: 4000,
                    description: `Import failed. Please try again. If the problem continues, contact us at support@comendcare.com`
                })
                console.error("Error: failed to import assets", e)
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
                        <p>{`Import rfps from .csv`}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import RFPs
            </DialogTitle>
            <DialogDescription>
                Import multiple RFPs at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O1XXvlhsDQZQKAgLCDbbV2SzDd6H-Ony7lP4XTAG2CQ/edit?usp=sharing">RFP input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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