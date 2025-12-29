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

    // const contactsLength = Math.max((data.contactNames || []).length, (data.contactEmails || []).length)
    // const contacts = []
    // for (let i = 0; i < contactsLength; i++) {
    //     if (data.contactNames[i] && data.contactEmails[i]) {
    //         contacts.push({
    //             name: data.contactNames[i] || "", 
    //             email: data.contactEmails[i] || "", 
    //             role: null
    //         })
    //     } else if (data.contactNames[i]) {
    //         contacts.push({
    //             name: data.contactNames[i] || "", 
    //             email: "", 
    //             role: null
    //         })
    //     } else if (data.contactEmails[i]) {
    //         contacts.push({
    //             name: "", 
    //             email: data.contactEmails[i] || "", 
    //             role: null
    //         })
    //     }
    // }

    // data.contacts = contacts

    // const linksLength = Math.max((data.linkNames || []).length, (data.linkURLs || []).length)
    // const links = []
    // for (let i = 0; i < linksLength; i++) {
    //     if (data.linkNames [i] && data.linkURLs[i]) {
    //         links.push({
    //             name: data.linkNames [i],
    //             link: data.linkURLs[i]
    //         })
    //     } else if (data.linkNames [i]) {
    //         links.push({
    //             name: data.linkNames [i],
    //             link: ""
    //         })
    //     } else if (data.linkURLs[i]) {
    //         links.push({
    //             name: "",
    //             link: data.linkURLs[i]
    //         })
    //     }
    // }

    // data.attachments = links

    return {data: data as z.infer<typeof editBiosampleForm>, errors}
}

// {key: 'Diagnoses Severity', required:false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Variant', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Availability', required: false, defaultValue: undefined, isValid: (entry) => AVAILABILITY_OPTIONS.find(option => option.label === entry) !== undefined},
// {key: 'Total Available Quantity', required: false, defaultValue: undefined, isValid: (entry) => JSON.parse(entry) > 0},
// {key: 'Quantity Unit', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Current Location', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
// {key: 'Location of Collection', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
// {key: 'Collection Date', required: false, defaultValue: undefined, isValid: (entry) => {try {const isDate = new Date(entry); return true} catch (e) {return false}}},
// {key: 'Preservation Method', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
// {key: 'Anatomical Site', required: false, defaultValue: undefined, isValid: (entry) => ANATOMICAL_SITE_OPTIONS.find(option => option.label === entry) !== undefined},
// {key: 'Method of Transport', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
// {key: 'Donor Age at Collection', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Internal Donor ID', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor Gender', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Sex', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Race', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor Ethnicity', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor Height', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor Weight', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor BMI', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor Medications', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
// {key: 'Donor Medical Treatments', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},

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
        spreadsheetKey: 'BSI ID',
        databaseKey: 'bsiId',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Genotype',
        databaseKey: 'genotype',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Type',
        databaseKey: 'types',
        required: false,
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
    // {
    //     spreadsheetKey: 'Diagnoses',
    //     databaseKey: 'diagnoses',
    //     required: false,
    //     defaultValue: undefined,
    //     isValid: (entry) => typeof entry === 'string',
    //     fetchDatabaseValue: async (entry) => entry.split(","),
    // },
    // {
    //     spreadsheetKey: 'Diagnoses Severity',
    //     databaseKey: 'diagnosesSeverity',
    //     required: false,
    //     defaultValue: undefined,
    //     isValid: (entry) => typeof entry === 'string',
    //     fetchDatabaseValue: async (entry) => entry.split(","),
    // },
]

// export async function formatBiosampleData(biosample: any): Promise<z.infer<typeof editBiosampleForm>> {
//     const res = await fetch(`/api/genes?search=${encodeURIComponent(biosample['Gene']?.trim() || "")}`);
//     const foundGenes = await res.json();

//     const companiesResponse = await fetch(`/api/companies?search=${encodeURIComponent(biosample['Storage Facility']?.trim() || '')}`)
//     const foundCompanies = await companiesResponse.json()

//     const institutionsResponse = await fetch(`/api/institutions?search=${encodeURIComponent(biosample['Storage Facility']?.trim() || '')}`)
//     const foundInstitutions = await institutionsResponse.json()

//     const diagnoses = (biosample['Diagnoses']?.trim() || "").split(",")
//     const diagnosesSeverity = (biosample['Diagnoses Severity']?.trim() || "").split(",")

//     const diagnosesLength = Math.max(diagnoses.length, diagnosesSeverity.length)
//     const diagnosesList = []
//     for (let i = 0; i < diagnosesLength; i++) {
//         if (diagnoses[i] && diagnosesSeverity[i]) {
//             diagnosesList.push({
//                 diagnosis: [{label: diagnoses[i], value: diagnoses[i].toUpperCase()?.replace(/[^0-9a-z]/gi, '')}],
//                 severity: DIAGNOSIS_SEVERITY_OPTIONS.find(option => option.label === diagnosesSeverity[i])?.value || undefined, 
//                 role: null
//             })
//         } else if (diagnoses[i]) {
//             diagnosesList.push({
//                 diagnosis: [{label: diagnoses[i], value: diagnoses[i].toUpperCase()?.replace(/[^0-9a-z]/gi, '')}],
//                 severity: "", 
//                 role: null
//             })
//         } 
//         // else if (diagnosesSeverity[i]) {
//         //     diagnosesList.push({
//         //         diagnosis: [], 
//         //         severity: DIAGNOSIS_SEVERITY_OPTIONS.find(option => option.label === diagnosesSeverity[i])?.value || undefined, 
//         //         role: null
//         //     })
//         // }
//     }

//     const data: z.infer<typeof editBiosampleForm> = {
//         types: (() => {
//             const foundOption = BIOSAMPLE_TYPE_OPTIONS.find(option => option.label === biosample['Type']?.trim())
//             if (foundOption) return [foundOption]
//             return []
//         })(),
//         // diagnoses: (biosample["Diagnoses"]?.split(",") || []).map((diagnosis: string) => ({
//         //     severity: undefined,
//         //     diagnosis: [{label: diagnosis, value: diagnosis.toUpperCase()?.replace(/[^0-9a-z]/gi, '')}]
//         // })),
//         diagnoses: diagnosesList || [],
//         genes: (() => {
//             if (foundGenes && foundGenes.length > 0 && biosample['Gene']?.trim()) return [{label: biosample['Gene']?.trim(), value: biosample['Gene']?.trim()}]
//             return []
//         })(),
//         variant: biosample['Variant']?.trim(),
//         availability: AVAILABILITY_OPTIONS.find(option => option.label === biosample['Availability']?.trim())?.value,
//         quantity: biosample['Total Available Quantity']?.trim(),
//         quantityUnit: QUANTITY_OPTIONS.find(option => option.label === biosample['Quantity Unit']?.trim())?.value || 'ml',
//         description: biosample.Description,
//         currentCountry: COUNTRY_OPTIONS.find(option => option.label === biosample['Current Location']?.trim())?.value,
//         countryOfCollection: COUNTRY_OPTIONS.find(option => option.label === biosample['Location of Collection']?.trim())?.value,
//         collectionDate: 
//             biosample['Collection Date']?.trim() 
//                 // ? new Date(biosample['Collection Date']?.trim())
//                   ? (() => {
//                         const d = new Date(biosample["Collection Date"]?.trim())
//                         // strip time, only store date. Store at midnight UTC - when displaying display in UTC
//                         return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
//                     })()
//                 : undefined,
//         preservationMethod: SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === biosample['Preservation Method']?.trim())?.value,
//         anatomicalSite: ANATOMICAL_SITE_OPTIONS.find(option => option.label === biosample['Anatomical Site']?.trim())?.value,
//         methodOfTransport: SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === biosample['Method of Transport']?.trim())?.value,
//         internalDonorId: biosample['Internal Donor ID']?.trim(),
//         age: biosample['Donor Age at Collection']?.trim(),
//         gender: DONOR_GENDER_OPTIONS.find(option => option.label === biosample['Donor Gender']?.trim())?.value,
//         race: DONOR_RACE_OPTIONS.find(option => option.label === biosample['Race']?.trim())?.value,
//         sex: DONOR_SEX_OPTIONS.find(option => option.label === biosample['Sex']?.trim())?.value,
//         ethnicity: DONOR_ETHNICITY_OPTIONS.find(option => option.label === biosample['Donor Ethnicity']?.trim())?.value,
//         height: biosample['Donor Height']?.trim(),
//         weight: biosample['Donor Weight']?.trim(),
//         bmi: biosample['Donor BMI']?.trim(),
//         medications: biosample['Donor Medications']?.trim()?.split(",") || [],
//         treatments: biosample['Donor Medical Treatments']?.trim()?.split(",") || [],
//         priceUnit: 'usd',
//         genotype: biosample['Genotype']?.trim() || undefined,
//         // storage facility
//         storageFacility: (() => {
//             // if (foundInstitutions && foundInstitutions.length > 0 && biosample['Storage Facility']?.trim()) {
//             //     return foundInstitutions
//             // }

//             // return []
//             return foundCompanies.concat(foundInstitutions)
//         })(),
//         bsiId: biosample['BSI ID']?.trim(),
//         isPrivate: biosample['Visibility']?.trim() ? (biosample['Visibility']?.trim() === 'Published' ? false : true) : true
//     }
//     return data
// }

export function BiosampleBulkImportDialog({
    isCollapsed = false
}: {
    isCollapsed?: boolean
}) {
    const router = useRouter()
    const pathname = usePathname()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    // const [isImporting, setIsImporting] = useState(false)
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

                let newNodes: any[] = []
                let errors: any[] = []

                setImportState('importing')
                setImportCount(0)

                for (let i = 0; i < result.values.length; i++) {
                    const {data: formattedBiosample, errors: formattedErrors} = await formatBiosampleData(result.values[i])
                    const newBiosample = await createBiosample(session?.user.organizationId, formattedBiosample)
                    console.log(`new biosample`, newBiosample)
                    await sleep(2000)
                    setImportCount(prev => prev + 1)

                    // newNodes.push({
                    //     private: formattedProject.isPrivate,
                    //     isPrivate: formattedProject.isPrivate,
                    //     nodeType: 'PROJECT',
                    //     title: formattedProject.title,
                    //     description: formattedProject.description,
                    //     status: formattedProject.status,
                    //     budget: formattedProject.budget,
                    //     startDate: formattedProject.startDate,
                    //     endDate: formattedProject.endDate,
                    //     contacts: formattedProject.contacts,
                    //     attachments: formattedProject.attachments,
                    //     notes: JSON.stringify(formattedProject.notes),
                    //     types: (formattedProject.types || []).map((type: any) => type.id).map((type: string) => {
                    //         const milestoneType = BIOSAMPLE_TYPE_OPTIONS.find(t => t.id === type)
                    //         if (!milestoneType) return // milestone type not found, don't add it to created milestone
                    //         return {
                    //             milestoneTypeId: type,
                    //             milestoneType: milestoneType
                    //         }
                    //     }).filter((type: any) => type !== undefined),
                    // })
                    if (formattedErrors.length > 0) errors.push(formattedErrors)
                }

                // await addMilestones(newNodes)

                setTotalErrors(errors)
                // setImportCount(newNodes.length)

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
                                // setIsOpen(false)
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

// export function BiosampleBulkImportDialog() {
//     const router = useRouter()
//     const pathname = usePathname()
//     const {data: session} = useSession()
//     const [isOpen, setIsOpen] = useState(false)
//     const [isImporting, setIsImporting] = useState(false)
//     const [importCount, setImportCount] = useState(0)
//     const [totalItems, setTotalItems] = useState(0)

//     const handleImport = async (file: File | undefined) => {
//         setIsImporting(true)
//         if (file && file.name.endsWith(".csv")) {
//             // parse CSV file
//             try {
//                 const result = await parseCSV(
//                     file,
//                     [
//                         {key: 'Type', required: true, defaultValue: undefined, isValid: (entry) => BIOSAMPLE_TYPE_OPTIONS.find(option => option.labal === entry.Type) !== undefined},
//                         {key: 'Gene', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Storage Facility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Diagnoses', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Diagnoses Severity', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Variant', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Availability', required: false, defaultValue: undefined, isValid: (entry) => AVAILABILITY_OPTIONS.find(option => option.label === entry) !== undefined},
//                         {key: 'Total Available Quantity', required: false, defaultValue: undefined, isValid: (entry) => JSON.parse(entry) > 0},
//                         {key: 'Quantity Unit', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Current Location', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
//                         {key: 'Location of Collection', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
//                         {key: 'Collection Date', required: false, defaultValue: undefined, isValid: (entry) => {try {const isDate = new Date(entry); return true} catch (e) {return false}}},
//                         {key: 'Preservation Method', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
//                         {key: 'Anatomical Site', required: false, defaultValue: undefined, isValid: (entry) => ANATOMICAL_SITE_OPTIONS.find(option => option.label === entry) !== undefined},
//                         {key: 'Method of Transport', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
//                         {key: 'Donor Age at Collection', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Internal Donor ID', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor Gender', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Sex', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Race', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor Ethnicity', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor Height', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor Weight', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor BMI', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor Medications', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Donor Medical Treatments', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Genotype', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'BSI ID', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                         {key: 'Visibility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
//                     ]
//                 )

//                 setTotalItems(result.values.length)
//                 setImportCount(0)
    
//                 if (result.errors.length > 0) {
//                     toast('Warning!', {
//                         position: "bottom-left",
//                         duration: 6000,
//                         description: `Missing fields in import file: A title is required for each Biosample. Edit the biosample to add title.`
//                     })
//                     console.error("Error: imported biosamples are missing required fields", result.errors)
//                 }

//                 let pagIDtoInternalID: {[key: string]: string} = {}

//                 const {data: organization} = await getOrganizationFromOrganizationId(session?.user.organizationId, {
//                     donors: true
//                 })

//                 if (organization.donors && organization.donors.length > 0) {
//                     organization.donors.map((d: Donor) => {
//                         if (d.internalId && !pagIDtoInternalID[d.internalId]) {
//                             pagIDtoInternalID[d.internalId] = d.id
//                         }
//                     })
//                 }

//                 for (let i = 0; i < result.values.length; i++) {
//                     const biosample = result.values[i]
//                     let formattedBiosample = await formatBiosampleData(biosample)
//                     if (formattedBiosample.internalDonorId && pagIDtoInternalID[formattedBiosample.internalDonorId]) {
//                         formattedBiosample.donorId = pagIDtoInternalID[formattedBiosample.internalDonorId]
//                     }
//                     const newBiosample = await createBiosample(session?.user.organizationId, formattedBiosample)
//                     if (formattedBiosample.internalDonorId) pagIDtoInternalID[formattedBiosample.internalDonorId] = newBiosample.donorId
//                     setImportCount((prev) => prev + 1)
//                 }
//             } catch (e) {
//                 toast('Error!', {
//                     position: "bottom-left",
//                     duration: 6000,
//                     description: `Import failed. Please try again to upload using a copy of our template. If the problem continues, contact us at support@comendcare.com`
//                 })
//                 console.error("Error: failed to import biosamples", e)
//             }
//         } else {
//             console.error("Please upload a valid CSV file.");
//         }

//         await revalidate(pathname)
//         setIsOpen(false)
//         setIsImporting(false)
//         setImportCount(0)
//         setTotalItems(0)

//         router.refresh()
//     }
    
//     return (
//         <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
//             <DialogTrigger asChild>
//                 <Button 
//                     variant={"ghost"}
//                     onClick={() => setIsOpen(true)}
//                 >
//                     <Import />
//                     <p>{`Import biosamples`}</p>
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="flex flex-col justify-start">
//             {isImporting ? (
//                 <>
//                 <DialogHeader>
//                     <DialogTitle className="text-2xl">
//                         Importing... please keep this tab open
//                     </DialogTitle>
//                     <DialogDescription>
//                         We’re processing your file. This can take a few minutes.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div className="h-[180px] w-full flex gap-4 justify-center items-center">
//                     <LoaderCircle className={cn("h-[40px] w-[40px] animate-spin")}/>
//                     <p>{importCount > 0 ? `${importCount} of ${totalItems} samples imported` : `Processing file...`}</p>
//                 </div>
//                 </>
//             ) : (
//                 <>
//                 <DialogHeader>
//                     <DialogTitle className="text-2xl">
//                         Import biosamples
//                     </DialogTitle>
//                     <DialogDescription>
//                         Copy our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, fill it out, download it as a CSV, and upload it back into the platform. Any optional details you include are stored securely and help us optimize the platform experience.
//                     </DialogDescription>
//                 </DialogHeader>

//                 <FileUploadForm 
//                     accept=".csv" 
//                     onSubmit={handleImport}
//                 />
//                 </>
//             )}
//             </DialogContent>
//         </Dialog>
//     )
// }
