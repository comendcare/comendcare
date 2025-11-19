"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClinicalDataset } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn, parseCSV } from "@comend/lib/utils";
import { revalidate } from "@comend/lib/revalidate";
import { editDataToolForm } from "@comend/lib/types";
import z from "zod";

export async function formatClinicalDatasetData(biosample: any): Promise<z.infer<typeof editDataToolForm>> {

    const data: z.infer<typeof editDataToolForm> = {
        title: biosample['Title'],
        description: biosample['Description'],
        isPrivate: true,
        types: []
        // isPrivate: biosample['Visibility'] ? (biosample['Visibility'] === 'Published' ? false : true) : true
    }
    return data
}

export function AssetBulkImportDialog() {
    const router = useRouter()
    const pathname = usePathname()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [importCount, setImportCount] = useState(0)
    const [totalItems, setTotalItems] = useState(0)

    const handleImport = async (file: File | undefined) => {
        setIsImporting(true)
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            try {
                const result = await parseCSV(
                    file,
                    [
                        {key: 'Title', required: false, defaultValue: 'Untitled Tool', isValid: (entry) => typeof entry === 'string' && entry.length > 0},
                        {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'}
                    ]
                )

                setTotalItems(result.values.length)
                setImportCount(0)
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each Tool. Edit the tool to add title.`
                    })
                    console.error("Error: imported tools are missing required fields", result.errors)
                }

                for (let i = 0; i < result.values.length; i++) {
                    const clinicalDataset = result.values[i]

                    let formattedClinicalDataset = await formatClinicalDatasetData(clinicalDataset)
                    console.log(`create clinical dataset with data`, formattedClinicalDataset)

                    const newDataset = await createClinicalDataset(session?.user.organizationId, formattedClinicalDataset)
                    setImportCount((prev) => prev + 1)
                }
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

        await revalidate(pathname)
        setIsOpen(false)
        setIsImporting(false)
        setImportCount(0)
        setTotalItems(0)

        router.refresh()
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button 
                    variant={"ghost"}
                    onClick={() => setIsOpen(true)}
                >
                    <Import />
                    <p>{`Import clinical datasets`}</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
            {isImporting ? (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Importing... please keep this tab open
                    </DialogTitle>
                    <DialogDescription>
                        We’re processing your file. This can take a few minutes.
                    </DialogDescription>
                </DialogHeader>
                <div className="h-[180px] w-full flex gap-4 justify-center items-center">
                    <LoaderCircle className={cn("h-[40px] w-[40px] animate-spin")}/>
                    <p>{importCount > 0 ? `${importCount} of ${totalItems} datasets imported` : `Processing file...`}</p>
                </div>
                </>
            ) : (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import clinical datasets
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple clinical datasets at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1AJYdnvlPTYRR5nx2xz65lpQnK9RfCpkouEtshEsKSb0/edit?usp=sharing">clinical dataset input template</Link>, filling it out, downloading it as a CSV, and uploading it.
                    </DialogDescription>
                </DialogHeader>

                <FileUploadForm 
                    accept=".csv" 
                    onSubmit={handleImport}
                />
                </>
            )}
            </DialogContent>
        </Dialog>
    )
}
