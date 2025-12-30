"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { CircleX, Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClinicalDataset } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn, parseCSV } from "@comend/lib/utils";
import { revalidate } from "@comend/lib/revalidate";
import { editDataToolForm, ImportSchemaEntry, TOOL_TYPE_OPTIONS } from "@comend/lib/types";
import z from "zod";
import Papa from "papaparse";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { Badge } from "@comend/components/ui/badge";

export async function formatClinicalDatasetData(clinicalDataset: any): Promise<{
    data: z.infer<typeof editDataToolForm>,
    errors: any[]
}> {
    const errors: {
        key: 'REQUIRED_MISSING' | 'INCORRECT_FORMAT' | 'ERROR',
        message: string,
        value: any,
        id: string,
    }[] = []

    let data = Object.fromEntries(await Promise.all(clinicalDatasetImportSchema.map(async (option: ImportSchemaEntry) => {
        if (!clinicalDataset[option.spreadsheetKey] && option.required) {
            errors.push({
                key: 'REQUIRED_MISSING',
                message: `Field '${option.spreadsheetKey}' is required, and is missing a value.`,
                value: clinicalDataset[option.spreadsheetKey],
                id: clinicalDataset['Title'] || 'New clinical dataset'
            })

            return [option.databaseKey, option.defaultValue]
        } else if (clinicalDataset[option.spreadsheetKey] && !option.isValid(clinicalDataset[option.spreadsheetKey])) {
            errors.push({
                key: 'INCORRECT_FORMAT',
                message: `Field '${option.spreadsheetKey}' is formatted incorrectly. This field may not import properly.`,
                value: clinicalDataset[option.spreadsheetKey],
                id: clinicalDataset['Title'] || 'New clinical dataset'
            })

            return [option.databaseKey, option.defaultValue]
        }

        let val = option.defaultValue

        try {
            if (option.fetchDatabaseValue) {
                val = await option.fetchDatabaseValue(clinicalDataset[option.spreadsheetKey])
            } else if (clinicalDataset[option.spreadsheetKey]) {
                val = clinicalDataset[option.spreadsheetKey]
            }
        } catch (error) {
            errors.push({
                key: 'ERROR',
                message: `Field '${option.spreadsheetKey}' encountered an error.`,
                value: clinicalDataset[option.spreadsheetKey],
                id: clinicalDataset['Title'] || 'New clinical dataset'
            })

            return [option.databaseKey, option.defaultValue]
        }

        return [option.databaseKey, val]
    })))

    return {data: data as z.infer<typeof editDataToolForm>, errors}
}

const clinicalDatasetImportSchema: ImportSchemaEntry[] = [
    {
        spreadsheetKey: 'Title',
        databaseKey: 'title',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Description',
        databaseKey: 'description',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
]

export function AssetBulkImportDialog({
    isCollapsed = false
}: {
    isCollapsed?: boolean
}) {
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [importState, setImportState] = useState<'start' | 'importing' | 'finished'>('start')
    const [importCount, setImportCount] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [totalErrors, setTotalErrors] = useState<any[]>([])

    const handleImport = async (file: File | undefined) => {
        setImportState('importing')
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            try {
                const result = await ((): Promise<{values: any[], errors: {key: string, message: string, object: any}[]}> => {
                    return new Promise((resolve, reject) => {
                        Papa.parse(file, {
                            header: true, // Adjust based on whether your CSV has headers
                            skipEmptyLines: true,
                            complete: (result) => {
                                const newValues: any[] = []
                                let errors: {key: string, message: string, object: any}[] = []

                                try {
                                    result.data.forEach((entry: any) => {
                                        newValues.push(entry)
                                    })
                                } catch (e) {
                                    console.error("Error: failed to import tools", e)
                                    reject(e)
                                }

                                resolve({values: newValues, errors: errors})
                            },
                            error: (error) => reject(error),
                        });
                    });
                })()

                setTotalItems(result.values.length)
                setImportState('importing')
                setImportCount(0)
                
                let errors: any[] = []

                for (let i = 0; i < result.values.length; i++) {
                    const {data: formattedClinicalDataset, errors: formattedErrors} = await formatClinicalDatasetData(result.values[i])

                    // only crate if it has all required fields
                    if (!formattedErrors.map(error => error.key).includes('REQUIRED_MISSING')) {
                        const newClinicalDataset = await createClinicalDataset(session?.user.organizationId, formattedClinicalDataset)
                        setImportCount(prev => prev + 1)
                    }

                    if (formattedErrors.length > 0) errors.push(formattedErrors)
                }

                setTotalErrors(errors)
            } catch (e) {
                toast('Error!', {
                    position: "bottom-left",
                    duration: 6000,
                    description: `Import failed. Please try again to upload using a copy of our template. If the problem continues, contact us at support@comendcare.com`
                })
                console.error("Error: failed to import clinical datasets", e)
            }
        } else {
            console.error("Please upload a valid CSV file.");
        }

        setImportState('finished')
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button 
                            variant={"ghost"}
                            onClick={() => setIsOpen(true)}
                        >
                            <Import />
                            {!isCollapsed && <p>{`Import clinical datasets`}</p>}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent className="max-w-80">
                        <p>{`Import clinical datasets`}</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent className="flex flex-col justify-start">
            {importState === 'start' && (
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
            {importState === 'importing' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import clinical datasets
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple clinical datasets at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1AJYdnvlPTYRR5nx2xz65lpQnK9RfCpkouEtshEsKSb0/edit?usp=sharing">clinical dataset input template</Link>, filling it out, downloading it as a CSV, and uploading it.
                    </DialogDescription>
                </DialogHeader>

                <div className="h-[180px] w-full flex gap-4 justify-center items-center">
                    <LoaderCircle className={cn("h-[40px] w-[40px] animate-spin")}/>
                    <p>{importCount > 0 ? `${importCount} of ${totalItems} samples imported` : `Processing file...`}</p>
                </div>
                </>
            )}
            {importState === 'finished' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import clinical datasets
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple clinical datasets at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1AJYdnvlPTYRR5nx2xz65lpQnK9RfCpkouEtshEsKSb0/edit?usp=sharing">clinical dataset input template</Link>, filling it out, downloading it as a CSV, and uploading it.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="w-full flex flex-col gap-4 justify-center">
                    <p className="w-full justify-start">{`Finished importing ${importCount} of ${totalItems}.`}</p>
                    {totalErrors.length > 0 
                        ? (
                            <div className="w-full flex flex-col justify-start gap-4">
                            <p>⚠️ A few details didn’t import for the clinical datasets below. Please review them and add any missing information.</p>
                            <ul className="w-full flex flex-col gap-2">
                                {totalErrors.map((error, index) => (
                                    <Badge variant={"red"} key={index} className="w-full">
                                        <CircleX className="h-4 w-4 min-h-4 min-w-4"/>
                                        {error?.[0]?.id}
                                    </Badge>
                                ))}
                            </ul>
                            </div>
                        ) 
                        : (
                            <p>Successfully imported all clinical datasets!</p>
                        )
                    }
                    <div className="w-full flex justify-end">
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setImportState('start')
                                setImportCount(0)
                                setTotalItems(0)
                            }}
                        >
                            Import more clinical datasets
                        </Button>
                    </div>
                </div>
                </>
            )}
            </DialogContent>
        </Dialog>
    )
}
