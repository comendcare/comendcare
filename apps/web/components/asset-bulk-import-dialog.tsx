"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { CircleX, Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { toast } from "sonner";
import { createClinicalDataset } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn } from "@comend/lib/utils";
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

    return {data: data as z.infer<typeof editDataToolForm>, errors}
}

const clinicalDatasetImportSchema: ImportSchemaEntry[] = [
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
        spreadsheetKey: 'Title',
        databaseKey: 'title',
        required: true,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
    },
    {
        spreadsheetKey: 'Type',
        databaseKey: 'types',
        required: true,
        defaultValue: [],
        isValid: (entry) => !!TOOL_TYPE_OPTIONS.find(option => option.label === entry?.trim()),
        fetchDatabaseValue: async (entry) => {
            const foundOption = TOOL_TYPE_OPTIONS.find(option => option.label === entry?.trim())
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
        setImportState("importing");

        try {
            if (!file || !file.name.endsWith(".csv")) {
                throw new Error("Please upload a valid CSV file.");
            }

            // 1) normalize headers server-side
            const fd = new FormData();
            fd.append("file", file);

            const normalizeRes = await fetch("/api/clinical-datasets/normalize-import", {
                method: "POST",
                body: fd,
            });

            if (!normalizeRes.ok) {
                const err = await normalizeRes.json().catch(() => ({}));
                throw new Error(err?.error ?? "Failed to normalize CSV.");
            }

            const normalizeJson: {
                normalizedCsv: string;
                mapping: Record<string, string>;
                missingTemplateColumns: string[];
                unusedInputColumns: string[];
                notes?: string[];
            } = await normalizeRes.json();

            // 2) parse normalized CSV client-side (template headers)
            const parsed = Papa.parse<any>(normalizeJson.normalizedCsv, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
            });

            const values = parsed.data ?? [];
            setTotalItems(values.length);
            setImportCount(0);

            const errors: any[] = [];

            for (let i = 0; i < values.length; i++) {
                const { data: formattedClinicalDataset, errors: formattedErrors } =
                    await formatClinicalDatasetData(values[i]);

                if (!formattedErrors.map((e) => e.key).includes("REQUIRED_MISSING")) {
                    await createClinicalDataset(session?.user.organizationId, formattedClinicalDataset);
                    setImportCount((prev) => prev + 1);
                }

                if (formattedErrors.length > 0) errors.push(formattedErrors);
            }

            setTotalErrors(errors);
            // optional: surface normalizeJson.missingTemplateColumns / unusedInputColumns / notes
        } catch (e: any) {
            toast("Error!", {
                position: "bottom-left",
                duration: 6000,
                description:
                    e?.message ??
                    "Import failed. Please try again to upload using a copy of our template.",
            });
            console.error("Error: failed to import clinical datasets", e);
        }

        setImportState("finished");
    };

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
                        Importing... please keep this tab open
                    </DialogTitle>
                    <DialogDescription>
                        We’re processing your file. This can take a few minutes.
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
                        Clinical datasets imported
                    </DialogTitle>
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
                                        {`${error?.[0]?.id} - ${error?.[0]?.message}`}
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
