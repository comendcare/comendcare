"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDiseaseModel } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { parseCSV } from "@comend/lib/utils";
import { DISEASE_MODEL_TYPE_OPTIONS, editDiseaseModelForm } from "@/packages/lib/types";
import { revalidate } from "@/packages/lib/revalidate";
import z from "zod";
import { getOrganizationFromOrganizationId } from "@/packages/lib/fetchers";
import { Donor, Institution } from "@prisma/client";

export async function formatDiseaseModelData(diseaseModel: any): Promise<z.infer<typeof editDiseaseModelForm>> {
    const genesResponse = await fetch(`/api/genes?search=${encodeURIComponent(diseaseModel['Gene'] || '')}`)
    const foundGenes = await genesResponse.json()

    const institutionsResponse = await fetch(`/api/institutions?search=${encodeURIComponent(diseaseModel['Storage Facility'] || '')}`)
    const foundInstitutions = await institutionsResponse.json()

    const data: z.infer<typeof editDiseaseModelForm> = {
        types: (() => {
            const foundOption = DISEASE_MODEL_TYPE_OPTIONS.find(option => option.label === diseaseModel.Type)
            if (foundOption) return [foundOption]
            return []
        })(),
        genes: (() => {
            if (foundGenes && foundGenes.length > 0 && diseaseModel['Gene']) return [{label: diseaseModel['Gene'], value: diseaseModel['Gene']}]
            return []
        })(),
        // storage facility
        institutions: (() => {
            if (foundInstitutions && foundInstitutions.length > 0 && diseaseModel['Storage Facility']) {
                return foundInstitutions
            } else if (diseaseModel['Storage Facility']) {
                return [{label: diseaseModel['Storage Facility'], value: diseaseModel['Storage Facility']}]
            }

            return []
        })(),
        description: diseaseModel.Description,
        contacts: ((diseaseModel['Contact Name'] || diseaseModel['Contact Email'])
            ? [{
                name: diseaseModel['Contact Name'] || "", 
                email: diseaseModel['Contact Email'] || "", 
                role: null
            }] 
            : undefined),
        isPrivate: diseaseModel['Visibility'] ? (diseaseModel['Visibility'] === 'Published' ? false : true) : true
    }
    return data
}

export function DiseaseModelBulkImportDialog() {
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
                        {key: 'Type', required: false, defaultValue: undefined, isValid: (entry) => DISEASE_MODEL_TYPE_OPTIONS.find(option => option.labal === entry.Type) !== undefined},
                        {key: 'Gene', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Storage Facility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Contact Name', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Contact Email', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Visibility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                    ]
                )
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each disease model. Edit the disease model to add title.`
                    })
                    console.error("Error: imported disease models are missing required fields", result.errors)
                }

                let pagIDtoInternalID: {[key: string]: string} = {}

                const {data: organization} = await getOrganizationFromOrganizationId(session?.user.organizationId, {
                    donors: true
                })

                for (let i = 0; i < result.values.length; i++) {
                    const diseaseModel = result.values[i]

                    let formattedDiseaseModel = await formatDiseaseModelData(diseaseModel)
                    console.log(`create disease model with data`, formattedDiseaseModel)

                    const newDiseaseModel = await createDiseaseModel(session?.user.organizationId, formattedDiseaseModel)
                    await revalidate(pathname)
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
                    <p>{`Import Disease Models`}</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import Disease Models
            </DialogTitle>
            <DialogDescription>
                Import multiple disease models at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1Hwdh6LOwWhiK3lEt3gLnURLmQgfsy59CXbxYCqm5uxs/edit?usp=sharing">Disease model input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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
