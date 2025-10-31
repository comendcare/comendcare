"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import, LoaderCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBiosample } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn, parseCSV, validateImport } from "@comend/lib/utils";
import { ANATOMICAL_SITE_OPTIONS, AVAILABILITY_OPTIONS, BIOSAMPLE_TYPE_OPTIONS, COUNTRY_OPTIONS, DONOR_ETHNICITY_OPTIONS, DONOR_GENDER_OPTIONS, DONOR_RACE_OPTIONS, DONOR_SEX_OPTIONS, editBiosampleForm, SAMPLE_PRESERVATION_METHOD_OPTIONS, SAMPLE_TRANSPORT_METHOD_OPTIONS } from "@/packages/lib/types";
import { revalidate } from "@/packages/lib/revalidate";
import z from "zod";
import { getOrganizationData, getOrganizationFromOrganizationId } from "@/packages/lib/fetchers";
import { Donor } from "@prisma/client";
import { resourceLimits } from "worker_threads";
import Loading from "@/loading";

export async function formatBiosampleData(biosample: any): Promise<z.infer<typeof editBiosampleForm>> {
    const res = await fetch(`/api/genes?search=${encodeURIComponent(biosample['Gene'] || "")}`);
    const foundGenes = await res.json();

    const data: z.infer<typeof editBiosampleForm> = {
        types: (() => {
            const foundOption = BIOSAMPLE_TYPE_OPTIONS.find(option => option.label === biosample.Type)
            if (foundOption) return [foundOption]
            return []
        })(),
        diagnoses: (biosample["Diagnoses"]?.split(",") || []).map((diagnosis: string) => ({
            severity: undefined,
            diagnosis: [{label: diagnosis, value: diagnosis.toUpperCase()?.replace(/[^0-9a-z]/gi, '')}]
        })),
        genes: (() => {
            if (foundGenes && foundGenes.length > 0 && biosample['Gene']) return [{label: biosample['Gene'], value: biosample['Gene']}]
            return []
        })(),
        variant: biosample['Variant'],
        availability: AVAILABILITY_OPTIONS.find(option => option.label === biosample['Availability'])?.value,
        quantity: biosample['Total Available Quantity (in ml)'],
        quantityUnit: 'ml',
        sex: DONOR_SEX_OPTIONS.find(option => option.label === biosample['Sex'])?.value,
        description: biosample.Description,
        currentCountry: COUNTRY_OPTIONS.find(option => option.label === biosample['Current Location'])?.value,
        countryOfCollection: COUNTRY_OPTIONS.find(option => option.label === biosample['Location of Collection'])?.value,
        collectionDate: 
            biosample['Collection Date'] 
                // ? new Date(biosample['Collection Date'])
                  ? (() => {
                        const d = new Date(biosample["Collection Date"])
                        // strip time, only store date (midnight, EST is stored as time in DB)
                        return new Date(d.getFullYear(), d.getMonth(), d.getDate())
                    })()
                : undefined,
        preservationMethod: SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === biosample['Preservation Method'])?.value,
        anatomicalSite: ANATOMICAL_SITE_OPTIONS.find(option => option.label === biosample['Anatomical Site'])?.value,
        methodOfTransport: SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === biosample['Method of Transport'])?.value,
        internalDonorId: biosample['Internal Donor ID'],
        age: biosample['Donor Age at Collection'],
        gender: DONOR_GENDER_OPTIONS.find(option => option.label === biosample['Donor Gender'])?.value,
        race: DONOR_RACE_OPTIONS.find(option => option.label === biosample['Race'])?.value,
        ethnicity: DONOR_ETHNICITY_OPTIONS.find(option => option.label === biosample['Donor Ethnicity'])?.value,
        height: biosample['Donor Height'],
        weight: biosample['Donor Weight'],
        bmi: biosample['Donor BMI'],
        medications: biosample['Donor Medications']?.split(",") || [],
        treatments: biosample['Donor Medical Treatments']?.split(",") || [],
        priceUnit: 'usd',
        genotype: biosample['Genotype'] || undefined,
        isPrivate: biosample['Visibility'] ? (biosample['Visibility'] === 'Published' ? false : true) : true
    }
    return data
}

export function BiosampleBulkImportDialog() {
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
                        {key: 'Type', required: false, defaultValue: undefined, isValid: (entry) => BIOSAMPLE_TYPE_OPTIONS.find(option => option.labal === entry.Type) !== undefined},
                        {key: 'Gene', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Diagnoses', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Variant', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Availability', required: false, defaultValue: undefined, isValid: (entry) => AVAILABILITY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Total Available Quantity (in ml)', required: false, defaultValue: undefined, isValid: (entry) => JSON.parse(entry) > 0},
                        {key: 'Sex', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Current Location', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Location of Collection', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Collection Date', required: false, defaultValue: undefined, isValid: (entry) => {try {const isDate = new Date(entry); return true} catch (e) {return false}}},
                        {key: 'Preservation Method', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Anatomical Site', required: false, defaultValue: undefined, isValid: (entry) => ANATOMICAL_SITE_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Method of Transport', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Age at Collection', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Internal Donor ID', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Gender', required: false, defaultValue: undefined, isValid: (entry) => DONOR_GENDER_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Race', required: false, defaultValue: undefined, isValid: (entry) => DONOR_RACE_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Ethnicity', required: false, defaultValue: undefined, isValid: (entry) => DONOR_ETHNICITY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Height', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Weight', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor BMI', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Medications', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Medical Treatments', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Genotype', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Visibility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                    ]
                )

                setTotalItems(result.values.length)
                setImportCount(0)
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each Biosample. Edit the biosample to add title.`
                    })
                    console.error("Error: imported biosamples are missing required fields", result.errors)
                }

                let pagIDtoInternalID: {[key: string]: string} = {}

                const {data: organization} = await getOrganizationFromOrganizationId(session?.user.organizationId, {
                    donors: true
                })

                if (organization.donors && organization.donors.length > 0) {
                    organization.donors.map((d: Donor) => {
                        if (d.internalId && !pagIDtoInternalID[d.internalId]) {
                            pagIDtoInternalID[d.internalId] = d.id
                        }
                    })
                }

                for (let i = 0; i < result.values.length; i++) {
                    const biosample = result.values[i]
                    let formattedBiosample = await formatBiosampleData(biosample)
                    if (formattedBiosample.internalDonorId && pagIDtoInternalID[formattedBiosample.internalDonorId]) {
                        formattedBiosample.donorId = pagIDtoInternalID[formattedBiosample.internalDonorId]
                    }
                    const newBiosample = await createBiosample(session?.user.organizationId, formattedBiosample)
                    if (formattedBiosample.internalDonorId) pagIDtoInternalID[formattedBiosample.internalDonorId] = newBiosample.donorId
                    setImportCount((prev) => prev + 1)
                }
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
                    <p>{`Import biosamples`}</p>
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
                    <p>{importCount > 0 ? `${importCount} of ${totalItems} samples imported` : `Processing file...`}</p>
                </div>
                </>
            ) : (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import biosamples
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple biosamples at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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
