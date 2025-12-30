"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { CircleX, Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDiseaseModel } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn } from "@comend/lib/utils";
import { DISEASE_MODEL_TYPE_OPTIONS, editDiseaseModelForm, ImportSchemaEntry } from "@comend/lib/types";
import z from "zod";
import Papa from "papaparse";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { Badge } from "@comend/components/ui/badge";

export async function formatDiseaseModelData(diseaseModel: any): Promise<{
    data: z.infer<typeof editDiseaseModelForm>,
    errors: any[]
}> {
    const errors: {
        key: 'REQUIRED_MISSING' | 'INCORRECT_FORMAT' | 'ERROR',
        message: string,
        value: any,
        id: string,
    }[] = []

    let data = Object.fromEntries(await Promise.all(diseaseModelImportSchema.map(async (option: ImportSchemaEntry) => {
        if (!diseaseModel[option.spreadsheetKey] && option.required) {
            errors.push({
                key: 'REQUIRED_MISSING',
                message: `Field '${option.spreadsheetKey}' is required, and is missing a value.`,
                value: diseaseModel[option.spreadsheetKey],
                id: diseaseModel['Title'] || 'New disease model'
            })

            return [option.databaseKey, option.defaultValue]
        } else if (diseaseModel[option.spreadsheetKey] && !option.isValid(diseaseModel[option.spreadsheetKey])) {
            errors.push({
                key: 'INCORRECT_FORMAT',
                message: `Field '${option.spreadsheetKey}' is formatted incorrectly. This field may not import properly.`,
                value: diseaseModel[option.spreadsheetKey],
                id: diseaseModel['Title'] || 'New disease model'
            })

            return [option.databaseKey, option.defaultValue]
        }

        let val = option.defaultValue

        try {
            if (option.fetchDatabaseValue) {
                val = await option.fetchDatabaseValue(diseaseModel[option.spreadsheetKey])
            } else if (diseaseModel[option.spreadsheetKey]) {
                val = diseaseModel[option.spreadsheetKey]
            }
        } catch (error) {
            errors.push({
                key: 'ERROR',
                message: `Field '${option.spreadsheetKey}' encountered an error.`,
                value: diseaseModel[option.spreadsheetKey],
                id: diseaseModel['Title'] || 'New disease model'
            })

            return [option.databaseKey, option.defaultValue]
        }

        return [option.databaseKey, val]
    })))

    const contactsLength = Math.max((data.contactNames || []).length, (data.contactEmails || []).length)
    const contacts = []
    for (let i = 0; i < contactsLength; i++) {
        if (data.contactNames[i] && data.contactEmails[i]) {
            contacts.push({
                name: data.contactNames[i] || "", 
                email: data.contactEmails[i] || "", 
                role: null
            })
        } else if (data.contactNames[i]) {
            contacts.push({
                name: data.contactNames[i] || "", 
                email: "", 
                role: null
            })
        } else if (data.contactEmails[i]) {
            contacts.push({
                name: "", 
                email: data.contactEmails[i] || "", 
                role: null
            })
        }
    }

    data.contacts = contacts

    const linksLength = Math.max((data.linkNames || []).length, (data.linkURLs || []).length)
    const links = []
    for (let i = 0; i < linksLength; i++) {
        if (data.linkNames [i] && data.linkURLs[i]) {
            links.push({
                name: data.linkNames [i],
                link: data.linkURLs[i]
            })
        } else if (data.linkNames [i]) {
            links.push({
                name: data.linkNames [i],
                link: ""
            })
        } else if (data.linkURLs[i]) {
            links.push({
                name: "",
                link: data.linkURLs[i]
            })
        }
    }

    data.attachments = links

    return {data: data as z.infer<typeof editDiseaseModelForm>, errors}
}

const diseaseModelImportSchema: ImportSchemaEntry[] = [
    {
        spreadsheetKey: 'Visibility', 
        databaseKey: 'isPrivate',
        required: false, 
        defaultValue: true, 
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => {
            if (entry?.trim() == 'Published') return false
            if (entry?.trim() == 'Private') return true

            return true
        }
    },
    {
        spreadsheetKey: 'Type',
        databaseKey: 'types',
        required: true,
        defaultValue: [],
        isValid: (entry) => !!DISEASE_MODEL_TYPE_OPTIONS.find(option => option.label === entry?.trim()),
        fetchDatabaseValue: async (entry) => {
            const foundOption = DISEASE_MODEL_TYPE_OPTIONS.find(option => option.label === entry?.trim())
            if (foundOption) return [foundOption]
            return []
        }
    },
    {
        spreadsheetKey: 'Strain',
        databaseKey: 'strain',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Gene',
        databaseKey: 'genes',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => {
            if (!entry) return []

            const res = await fetch(`/api/genes?search=${encodeURIComponent(entry?.trim() || "")}`);
            const foundGenes = await res.json();

            if (foundGenes && foundGenes.length > 0) {
                return [{
                    label: entry?.trim(), 
                    value: entry?.trim()
                }]
            }

            return []
        }
    },
    {
        spreadsheetKey: 'Genotype',
        databaseKey: 'genotype',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Storage Facility',
        databaseKey: 'storageFacility',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => {
            if (!entry) return []

            const companiesResponse = await fetch(`/api/companies?search=${encodeURIComponent(entry?.trim() || '')}`)
            const foundCompanies = await companiesResponse.json()

            const institutionsResponse = await fetch(`/api/institutions?search=${encodeURIComponent(entry?.trim() || '')}`)
            const foundInstitutions = await institutionsResponse.json()

            return foundCompanies.concat(foundInstitutions)
        },
    },
    {
        spreadsheetKey: 'Point of Contact Name',
        databaseKey: 'contactNames', // hack to get contacts working, on the milestone this is 'contacts'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Point of Contact Email',
        databaseKey: 'contactEmails', // hack to get contacts working, on the milestone this is 'contacts'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Link Name',
        databaseKey: 'linkNames', // hack to get links working, on the milestone this is 'attachments'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Link URL',
        databaseKey: 'linkURLs', // hack to get links working, on the milestone this is 'attachments'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Notes',
        databaseKey: 'notes',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
]

export function DiseaseModelBulkImportDialog({
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
                    const {data: formattedDiseaseModel, errors: formattedErrors} = await formatDiseaseModelData(result.values[i])

                    // only create if it has all required fields
                    if (!formattedErrors.map(error => error.key).includes('REQUIRED_MISSING')) {
                        const newDiseaseModel = await createDiseaseModel(session?.user.organizationId, formattedDiseaseModel)
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
                console.error("Error: failed to import disease models", e)
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
                            {!isCollapsed && <p>{`Import disease models`}</p>}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent className="max-w-80">
                        <p>{`Import disease models`}</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent className="flex flex-col justify-start">
            {importState === 'start' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import disease models
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple disease models at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1Hwdh6LOwWhiK3lEt3gLnURLmQgfsy59CXbxYCqm5uxs/edit?usp=sharing">Disease model input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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
                        Import disease models
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple disease models at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1Hwdh6LOwWhiK3lEt3gLnURLmQgfsy59CXbxYCqm5uxs/edit?usp=sharing">Disease model input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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
                        Import disease models
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple disease models at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1Hwdh6LOwWhiK3lEt3gLnURLmQgfsy59CXbxYCqm5uxs/edit?usp=sharing">Disease model input template</Link>, filling it out, downloading it as a CSV, and uploading it.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="w-full flex flex-col gap-4 justify-center">
                    <p className="w-full justify-start">{`Finished importing ${importCount} of ${totalItems}.`}</p>
                    {totalErrors.length > 0 
                        ? (
                            <div className="w-full flex flex-col justify-start gap-4">
                            <p>⚠️ A few details didn’t import for the disease models below. Please review them and add any missing information.</p>
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
                            <p>Successfully imported all disease models!</p>
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
                            Import more disease models
                        </Button>
                    </div>
                </div>
                </>
            )}
            </DialogContent>
        </Dialog>
    )
}
