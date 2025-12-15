"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDiseaseModel } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { cn, parseCSV } from "@comend/lib/utils";
import { DISEASE_MODEL_TYPE_OPTIONS, editDiseaseModelForm } from "@comend/lib/types";
import { revalidate } from "@comend/lib/revalidate";
import z from "zod";
import { getOrganizationFromOrganizationId } from "@comend/lib/fetchers";

export async function formatDiseaseModelData(diseaseModel: any): Promise<z.infer<typeof editDiseaseModelForm>> {
    const genesResponse = await fetch(`/api/genes?search=${encodeURIComponent(diseaseModel['Gene']?.trim() || '')}`)
    const foundGenes = await genesResponse.json()

    const institutionsResponse = await fetch(`/api/institutions?search=${encodeURIComponent(diseaseModel['Storage Facility']?.trim() || '')}`)
    const foundInstitutions = await institutionsResponse.json()

    const contactNames = (diseaseModel['Point of Contact Name']?.trim() || "").split(",")
    const contactEmails = (diseaseModel['Point of Contact Email']?.trim() || "").split(",")

    const contactsLength = Math.max(contactNames.length, contactEmails.length)
    const contacts = []
    for (let i = 0; i < contactsLength; i++) {
        if (contactNames[i] && contactEmails[i]) {
            contacts.push({
                name: contactNames[i] || "", 
                email: contactEmails[i] || "", 
                role: null
            })
        } else if (contactNames[i]) {
            contacts.push({
                name: contactNames[i] || "", 
                email: "", 
                role: null
            })
        } else if (contactEmails[i]) {
            contacts.push({
                name: "", 
                email: contactEmails[i] || "", 
                role: null
            })
        }
    }

    const linkNames = (diseaseModel['Link Name']?.trim() || "").split(",")
    const linkURLs = (diseaseModel['Link URL']?.trim() || "").split(",")

    const linksLength = Math.max(linkNames.length, linkURLs.length)
    const links = []
    for (let i = 0; i < linksLength; i++) {
        if (linkNames[i] && linkURLs[i]) {
            links.push({
                name: linkNames[i],
                link: linkURLs[i]
            })
        } else if (linkNames[i]) {
            links.push({
                name: linkNames[i],
                link: ""
            })
        } else if (linkURLs[i]) {
            links.push({
                name: "",
                link: linkURLs[i]
            })
        }
    }

    const data: z.infer<typeof editDiseaseModelForm> = {
        types: (() => {
            const foundOption = DISEASE_MODEL_TYPE_OPTIONS.find(option => option.label === diseaseModel.Type)
            if (foundOption) return [foundOption]
            return []
        })(),
        genes: (() => {
            if (foundGenes && foundGenes.length > 0 && diseaseModel['Gene']?.trim()) return [{label: diseaseModel['Gene']?.trim(), value: diseaseModel['Gene']?.trim()}]
            return []
        })(),
        // storage facility
        storageFacility: (() => {
            if (foundInstitutions && foundInstitutions.length > 0 && diseaseModel['Storage Facility']?.trim()) {
                return foundInstitutions
            }

            return []
        })(),
        description: diseaseModel.Notes,
        contacts,
        attachments: links,
        genotype: diseaseModel['Genotype']?.trim() || undefined,
        strain: diseaseModel['Strain']?.trim() || undefined,
        isPrivate: diseaseModel['Visibility']?.trim() ? (diseaseModel['Visibility']?.trim() === 'Published' ? false : true) : true
    }
    return data
}

export function DiseaseModelBulkImportDialog() {
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
                        {key: 'Type', required: false, defaultValue: undefined, isValid: (entry) => DISEASE_MODEL_TYPE_OPTIONS.find(option => option.labal === entry.Type) !== undefined},
                        {key: 'Gene', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Storage Facility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Notes', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Point of Contact Name', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Point of Contact Email', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Link Name', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Link URL', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Genotype', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Strain', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Visibility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                    ]
                )

                setTotalItems(result.values.length)
                setImportCount(0)
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each disease model. Edit the disease model to add title.`
                    })
                    console.error("Error: imported disease models are missing required fields", result.errors)
                }

                for (let i = 0; i < result.values.length; i++) {
                    const diseaseModel = result.values[i]

                    let formattedDiseaseModel = await formatDiseaseModelData(diseaseModel)
                    console.log(`create disease model with data`, formattedDiseaseModel)

                    const newDiseaseModel = await createDiseaseModel(session?.user.organizationId, formattedDiseaseModel)
                    setImportCount((prev) => prev + 1)
                }
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
                    <p>{`Import disease models`}</p>
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
                    <p>{importCount > 0 ? `${importCount} of ${totalItems} models imported` : `Processing file...`}</p>
                </div>
                </>
            ) : (
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
            </DialogContent>
        </Dialog>
    )
}
