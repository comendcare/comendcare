"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Import } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileUploadForm } from "@/components/file-upload-form";
import Papa from "papaparse";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RFPBulkImportDialog() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    
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
                        <p>{`Import rfps from .csv`}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col justify-start">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Import RFPs
            </DialogTitle>
            <DialogDescription>
                Import multiple RFPs at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1C8yyYY_It4Mag9u7zcXFfZa2ITylqXcSz5GsFS2IdkE/edit?usp=sharing">RFP input template</Link>, filling it out, downloading it as a CSV, and uploading it.
            </DialogDescription>
                </DialogHeader>

                <FileUploadForm 
                    accept=".csv" 
                    onSubmit={(file) => {
                        if (file && file.name.endsWith(".csv")) {
                            // parse CSV file
                            Papa.parse(file, {
                                complete: (result) => {
                                    // try {
                                    //     const newMilestones: Partial<Milestone>[] = []

                                    //     const isValidFormat = (entry: any) => {
                                    //         const errors = []

                                    //         // only title is a required field
                                    //         if (!(entry.title && typeof entry.title === "string")) {
                                    //             errors.push({
                                    //                 type: "title",
                                    //                 message: "Field 'title' is not formatted properly"
                                    //             })
                                    //         }

                                    //         if (errors.length > 0) return { isValid: false, errors: errors }
                                    //         return { isValid: true }
                                    //     }

                                    //     let errors: {type: string, message: string}[] = []
                                    //     result.data.forEach((entry: any) => {
                                    //         // validate milestone format
                                    //         const validate = isValidFormat(entry)
                                    //         if (validate.isValid && !validate.errors) {
                                    //             const foundType = milestoneTypes.find(type => type.label === entry.type)
                                    //             newMilestones.push({
                                    //                 title: entry.title || 'New Milestone',
                                    //                 description: entry.description || '', // description is optional
                                    //                 types: foundType ? [{milestoneTypeId: foundType.id, milestoneType: foundType}] : [], // types are optional
                                    //                 // nodeType: entry.category === "RFP" || entry.category === "PROJECT" || entry.category === "ASSET" ? entry.category : "PROJECT" // category is optional, default to project
                                    //                 nodeType: "PROJECT"
                                    //             })
                                    //         } else {
                                    //             errors = errors.concat(validate.errors || [])

                                    //             const foundType = milestoneTypes.find(type => type.label === entry.type)
                                    //             // attempt to create anyways
                                    //             newMilestones.push({
                                    //                 title: entry.title && typeof entry.title === 'string' ? entry.title : 'New milestone',
                                    //                 description: entry.description || '',
                                    //                 types: foundType ? [{milestoneTypeId: foundType.id, milestoneType: foundType}] : [],
                                    //                 // nodeType: entry.category === "RFP" || entry.category === "PROJECT" || entry.category === "ASSET" ? entry.category : "PROJECT"
                                    //                 nodeType: "PROJECT"
                                    //             })
                                    //         }
                                    //     })

                                    //     if (errors.length > 0) {
                                    //         toast('Warning!', {
                                    //             position: "bottom-left",
                                    //             duration: 4000,
                                    //             description: `Missing fields in import file: A title is required for each milestone. Please ensure all milestones have titles before importing.`
                                    //         })
                                    //         console.error("Error: imported milestones are missing required fields", errors)
                                    //     }

                                    //     addMilestones(newMilestones)
                                    // } catch (e) {
                                    //     toast('Error!', {
                                    //         position: "bottom-left",
                                    //         duration: 4000,
                                    //         description: `Import failed. Please try again. If the problem continues, contact us at support@comendcare.com`
                                    //     })
                                    //     console.error("Error: failed to import milestones", e)
                                    // }
                                    router.refresh()
                                },
                                header: true,
                                skipEmptyLines: true,
                            })
                        } else {
                            console.error("Please upload a valid CSV file.");
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}