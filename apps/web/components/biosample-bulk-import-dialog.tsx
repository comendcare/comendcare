"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { CircleX, Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBiosample } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn, parseCSV, sleep } from "@comend/lib/utils";
import { 
    ANATOMICAL_SITE_OPTIONS, 
    AVAILABILITY_OPTIONS, 
    BIOSAMPLE_TYPE_OPTIONS, 
    COUNTRY_OPTIONS, 
    DIAGNOSIS_SEVERITY_OPTIONS, 
    DONOR_ETHNICITY_OPTIONS, 
    DONOR_GENDER_OPTIONS, 
    DONOR_RACE_OPTIONS, 
    DONOR_SEX_OPTIONS, 
    editBiosampleForm, 
    ImportSchemaEntry, 
    QUANTITY_OPTIONS, 
    SAMPLE_PRESERVATION_METHOD_OPTIONS, 
    SAMPLE_TRANSPORT_METHOD_OPTIONS 
} from "@comend/lib/types";
import { revalidate } from "@comend/lib/revalidate";
import z from "zod";
import { getOrganizationFromOrganizationId } from "@comend/lib/fetchers";
import { Donor } from "@prisma/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { Badge } from "@comend/components/ui/badge";
import Papa from "papaparse";

export async function formatBiosampleData(project: any): Promise<{
    data: z.infer<typeof editBiosampleForm>,
    errors: any[]
}> {
    const errors: {
        message: string,
        value: any,
        id: string,
    }[] = []

    let data = Object.fromEntries(await Promise.all(biosampleImportSchema.map(async (option: ImportSchemaEntry) => {
        if (!project[option.spreadsheetKey] && option.required) {
            errors.push({
                message: `Field ${option.spreadsheetKey} is required, and is missing a value.`,
                value: project[option.spreadsheetKey],
                id: project['Title'] || 'New project'
            })

            return [option.databaseKey, option.defaultValue]
        } else if (project[option.spreadsheetKey] && !option.isValid(project[option.spreadsheetKey])) {
            errors.push({
                message: `Field ${option.spreadsheetKey} is formatted incorrectly. This field may not import properly.`,
                value: project[option.spreadsheetKey],
                id: project['Title'] || 'New project'
            })

            return [option.databaseKey, option.defaultValue]
        }

        let val = option.defaultValue

        try {
            if (option.fetchDatabaseValue) {
                val = await option.fetchDatabaseValue(project[option.spreadsheetKey])
            } else if (project[option.spreadsheetKey]) {
                val = project[option.spreadsheetKey]
            }
        } catch (error) {
            errors.push({
                message: `Field ${option.spreadsheetKey} encountered an error.`,
                value: project[option.spreadsheetKey],
                id: project['Title'] || 'New project'
            })

            return [option.databaseKey, option.defaultValue]
        }

        return [option.databaseKey, val]
    })))

    console.log(`data`, data)

    return {data: data as z.infer<typeof editBiosampleForm>, errors}
}

const biosampleImportSchema: ImportSchemaEntry[] = [
    {
        spreadsheetKey: 'Visibility', 
        databaseKey: 'isPrivate',
        required: false, 
        defaultValue: true, 
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => {
            if (entry == 'Published') return false
            if (entry == 'Private') return true

            return true
        }
    },
    {
        spreadsheetKey: 'Internal Donor ID',
        databaseKey: 'internalDonorId',
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
    {
        spreadsheetKey: 'Type',
        databaseKey: 'types',
        required: true,
        defaultValue: [],
        isValid: (entry) => !!BIOSAMPLE_TYPE_OPTIONS.find(option => option.label === entry),
        fetchDatabaseValue: async (entry) => {
            const foundOption = BIOSAMPLE_TYPE_OPTIONS.find(option => option.label === entry)
            if (foundOption) return [foundOption]
            return []
        }
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
        spreadsheetKey: 'Sex',
        databaseKey: 'sex',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => !!DONOR_SEX_OPTIONS.find(option => option.label === entry),
        fetchDatabaseValue: async (entry) => {
            const foundOption = DONOR_SEX_OPTIONS.find(option => option.label === entry)
            if (foundOption) return foundOption.value
            return undefined
        }
    },
    {
        spreadsheetKey: 'Race',
        databaseKey: 'race',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => !!DONOR_RACE_OPTIONS.find(option => option.label === entry),
        fetchDatabaseValue: async (entry) => {
            const foundOption = DONOR_RACE_OPTIONS.find(option => option.label === entry)
            if (foundOption) return foundOption.value
            return undefined
        }
    },
    {
        spreadsheetKey: 'Diagnoses',
        databaseKey: 'diagnoses',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: async (entry) => {
            if (!entry) return []

            const res = await fetch(`/api/diagnoses?search=${encodeURIComponent(entry?.trim() || "")}`);
            const foundDiagnoses = await res.json();

            if (foundDiagnoses && foundDiagnoses.length > 0) {
                return foundDiagnoses.map((diagnosis: any) => ({diagnosis: [diagnosis]}))
            }

            return []
        }
    },
    {
        spreadsheetKey: 'Total Available Quantity',
        databaseKey: 'quantity',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Quantity Unit',
        databaseKey: 'quantityUnit',
        required: false,
        defaultValue: 'ml',
        isValid: (entry) => !!QUANTITY_OPTIONS.find(option => option.label === entry),
        fetchDatabaseValue: async (entry) => {
            const foundOption = QUANTITY_OPTIONS.find(option => option.label === entry)
            if (foundOption) return foundOption.value
            return 'ml'
        }
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
        spreadsheetKey: 'BSI ID',
        databaseKey: 'bsiId',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Collection Date',
        databaseKey: 'collectionDate',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => {
            try {
                const isDate = new Date(entry)
                return (isDate instanceof Date && !isNaN(isDate.getTime()))
            } catch (e) {
                return false
            }
        },
        fetchDatabaseValue: async (entry) => {
            if (entry) {
                const d = new Date(entry)
                // strip time, only store date (midnight, EST is stored as time in DB)
                return new Date(d.getFullYear(), d.getMonth(), d.getDate())
            }

            return undefined
        }
    },
    {
        spreadsheetKey: 'Donor Age at Collection',
        databaseKey: 'age',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
]

export function BiosampleBulkImportDialog({
    isCollapsed = false
}: {
    isCollapsed?: boolean
}) {
    const router = useRouter()
    const pathname = usePathname()
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
                    const {data: formattedBiosample, errors: formattedErrors} = await formatBiosampleData(result.values[i])
                    const newBiosample = await createBiosample(session?.user.organizationId, formattedBiosample)
                    setImportCount(prev => prev + 1)
                    if (formattedErrors.length > 0) errors.push(formattedErrors)
                }

                setTotalErrors(errors)
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
                            {!isCollapsed && <p>{`Import biosamples`}</p>}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent className="max-w-80">
                        <p>{`Import biosamples`}</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent className="flex flex-col justify-start">
            {importState === 'start' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import biosamples
                    </DialogTitle>
                    <DialogDescription>
                        Copy our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, fill it out, download it as a CSV, and upload it back into the platform. Any optional details you include are stored securely and help us optimize the platform experience.
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
                         Import biosamples
                     </DialogTitle>
                     <DialogDescription>
                         Copy our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, fill it out, download it as a CSV, and upload it back into the platform. Any optional details you include are stored securely and help us optimize the platform experience.
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
                        Import biosamples
                    </DialogTitle>
                    <DialogDescription>
                        Copy our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, fill it out, download it as a CSV, and upload it back into the platform. Any optional details you include are stored securely and help us optimize the platform experience.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full flex flex-col gap-4 justify-center">
                    <p className="w-full justify-start">{`Finished importing ${importCount} of ${totalItems}.`}</p>
                    {totalErrors.length > 0 
                        ? (
                            <div className="w-full flex flex-col justify-start gap-4">
                            <p>⚠️ A few details didn’t import for the biosamples below. Please review them and add any missing information.</p>
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
                            <p>Successfully imported all biosamples!</p>
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
                            Import more projects
                        </Button>
                    </div>
                </div>
                </>
            )}
            </DialogContent>
        </Dialog>
    )
}
