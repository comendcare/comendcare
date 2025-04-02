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
import { Asset } from "@/lib/types";
import { toast } from "sonner";
import { createOrUpdateAsset } from "@/lib/actions";
import { useSession } from "next-auth/react";

export function AssetBulkImportDialog() {
    const router = useRouter()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)

    const handleImport = async (file: File | undefined) => {
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            Papa.parse(file, {
                complete: async (result) => {
                    try {
                        const newAssets: Partial<Asset>[] = []

                        const isValidFormat = (entry: any) => {
                            const errors = []

                            // only title is a required field
                            if (!(entry.title && typeof entry.title === "string")) {
                                errors.push({
                                    type: "title",
                                    message: "Field 'title' is not formatted properly"
                                })
                            }

                            if (errors.length > 0) return { isValid: false, errors: errors }
                            return { isValid: true }
                        }

                        let errors: {type: string, message: string}[] = []
                        result.data.forEach((entry: any) => {
                            // validate asset format
                            const validate = isValidFormat(entry)
                            if (validate.isValid && !validate.errors) {
                                newAssets.push({
                                    title: entry.title || 'New Asset',
                                    description: entry.description || '', // description is optional
                                })
                            } else {
                                errors = errors.concat(validate.errors || [])

                                // attempt to create anyways
                                newAssets.push({
                                    title: entry.title && typeof entry.title === 'string' ? entry.title : 'New milestone',
                                    description: entry.description || '',
                                })
                            }
                        })

                        if (errors.length > 0) {
                            toast('Warning!', {
                                position: "bottom-left",
                                duration: 4000,
                                description: `Missing fields in import file: A title is required for each Asset. Please ensure all Assets have titles before importing.`
                            })
                            console.error("Error: imported assets are missing required fields", errors)
                        }

                        await Promise.all(newAssets.map(async (asset) => {
                            await createOrUpdateAsset(asset, session?.user.organizationId)
                        }))
                    } catch (e) {
                        toast('Error!', {
                            position: "bottom-left",
                            duration: 4000,
                            description: `Import failed. Please try again. If the problem continues, contact us at support@comendcare.com`
                        })
                        console.error("Error: failed to import milestones", e)
                    }
                    router.refresh()
                },
                header: true,
                skipEmptyLines: true,
            })
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
                        <p>{`Import assets from .csv`}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import Assets
            </DialogTitle>
            <DialogDescription>
                Import multiple assets at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1AJYdnvlPTYRR5nx2xz65lpQnK9RfCpkouEtshEsKSb0/edit?usp=sharing">Asset input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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