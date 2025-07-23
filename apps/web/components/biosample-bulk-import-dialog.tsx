"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrUpdateAsset, createOrUpdateBiosample } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { parseCSV, validateImport } from "@comend/lib/utils";
import { ANATOMICAL_SITE_OPTIONS, BIOSAMPLE_TYPE_OPTIONS, COUNTRY_OPTIONS, DONOR_ETHNICITY_OPTIONS, DONOR_GENDER_OPTIONS, DONOR_RACE_OPTIONS, DONOR_SEX_OPTIONS, SAMPLE_PRESERVATION_METHOD_OPTIONS, SAMPLE_TRANSPORT_METHOD_OPTIONS } from "@/packages/lib/types";
import { revalidate } from "@/packages/lib/revalidate";
import { editBiosampleForm } from "./edit-biosample-tool-form";
import z from "zod";

export function formatBiosampleData(biosample: any): z.infer<typeof editBiosampleForm> {
    const data: z.infer<typeof editBiosampleForm> = {
        types: (() => {
            const foundOption = BIOSAMPLE_TYPE_OPTIONS.find(option => option.label === biosample.Type)
            if (foundOption) return [foundOption]
            return []
        })(),
        diagnoses: biosample["Diagnoses"].split(",").map((diagnosis: string) => ({
            severity: undefined,
            diagnosis: [{label: diagnosis, value: diagnosis.toUpperCase()?.replace(/[^0-9a-z]/gi, '')}]
        })),
        quantity: biosample['Available Quantity'],
        quantityUnit: biosample['Available Quantity Measurement'] || 'ml',
        sex: DONOR_SEX_OPTIONS.find(option => option.label === biosample['Donor Biological Sex at Birth'])?.value,
        description: biosample.Description,
        currentCountry: COUNTRY_OPTIONS.find(option => option.label === biosample['Current Location'])?.value,
        countryOfCollection: COUNTRY_OPTIONS.find(option => option.label === biosample['Location of Collection'])?.value,
        preservationMethod: SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === biosample['Preservation Method'])?.value,
        anatomicalSite: ANATOMICAL_SITE_OPTIONS.find(option => option.label === biosample['Anatomical Site'])?.value,
        methodOfTransport: SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === biosample['Method of Transport'])?.value,
        age: biosample['Donor Age at Collection'],
        gender: DONOR_GENDER_OPTIONS.find(option => option.label === biosample['Donor Gender'])?.value,
        race: DONOR_RACE_OPTIONS.find(option => option.label === biosample['Donor Race'])?.value,
        ethnicity: DONOR_ETHNICITY_OPTIONS.find(option => option.label === biosample['Donor Ethnicity'])?.value,
        height: biosample['Donor Height'],
        weight: biosample['Donor Weight'],
        bmi: biosample['Donor BMI'],
        medications: biosample['Donor Medications']?.split(","),
        treatments: biosample['Donor Medical Treatments']?.split(","),
        isPinned: false,
        isPrivate: false,
        priceUnit: 'usd',
    }
    return data
}

export function BiosampleBulkImportDialog() {
    const router = useRouter()
    const pathname = usePathname()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)

    const handleImport = async (file: File | undefined) => {
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            try {
                const result = await parseCSV(
                    file,
                    [
                        {key: 'Type', required: false, defaultValue: undefined, isValid: (entry) => BIOSAMPLE_TYPE_OPTIONS.find(option => option.labal === entry.Type) !== undefined},
                        {key: 'Diagnoses', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Available Quantity', required: false, defaultValue: undefined, isValid: (entry) => JSON.parse(entry) > 0},
                        {key: 'Available Quantity Measurement', required: false, defaultValue: 'ml', isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Biological Sex at Birth', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Current Location', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Location of Collection', required: false, defaultValue: undefined, isValid: (entry) => COUNTRY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Preservation Method', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_PRESERVATION_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Anatomical Site', required: false, defaultValue: undefined, isValid: (entry) => ANATOMICAL_SITE_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Method of Transport', required: false, defaultValue: undefined, isValid: (entry) => SAMPLE_TRANSPORT_METHOD_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Age at Collection', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Gender', required: false, defaultValue: undefined, isValid: (entry) => DONOR_GENDER_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Race', required: false, defaultValue: undefined, isValid: (entry) => DONOR_RACE_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Ethnicity', required: false, defaultValue: undefined, isValid: (entry) => DONOR_ETHNICITY_OPTIONS.find(option => option.label === entry) !== undefined},
                        {key: 'Donor Height', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Weight', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor BMI', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Medications', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Donor Medical Treatments', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                    ]
                )
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each Biosample. Edit the biosample to add title.`
                    })
                    console.error("Error: imported biosamples are missing required fields", result.errors)
                }

                await Promise.all(result.values.map(async (biosample) => {
                    await createOrUpdateBiosample(session?.user.organizationId, formatBiosampleData(biosample))
                    await revalidate(pathname)
                }))
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
                        <p>{`Import biosamples from .csv`}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import Biosamples
            </DialogTitle>
            <DialogDescription>
                Import multiple biosamples at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1O5NOlRhC-qagsIP_Zk_5_CEdMWAy5VEPoCCu3_2WJoE/edit?usp=sharing">Biosample input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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
