"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { CircleX, Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@comend/lib/utils";
import { editMilestoneForm, ImportSchemaEntry, MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS } from "@comend/lib/types";
import z from "zod";
import { useShallow } from "zustand/react/shallow";
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore";
import Papa from "papaparse";
import { Badge } from "@comend/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones,
    selectedView: state.selectedView,
    addNodes: state.addNodes,
    addNodesFromTemplate: state.addNodesFromTemplate,
    setSelectedNodeIds: state.setSelectedNodeIds
})

export async function formatProjectData(project: any): Promise<{
    data: z.infer<typeof editMilestoneForm>,
    errors: any[]
}> {
    const errors: {
        message: string,
        value: any,
        milestoneTitle: string,
    }[] = []

    let data = Object.fromEntries(projectImportSchema.map((option: ImportSchemaEntry) => {
        if (!project[option.spreadsheetKey] && option.required) {
            errors.push({
                message: `Field ${option.spreadsheetKey} is required, and is missing a value.`,
                value: project[option.spreadsheetKey],
                milestoneTitle: project['Title'] || 'New project'
            })

            return [option.databaseKey, option.defaultValue]
        } else if (project[option.spreadsheetKey] && !option.isValid(project[option.spreadsheetKey])) {
            errors.push({
                message: `Field ${option.spreadsheetKey} is formatted incorrectly. This field may not import properly.`,
                value: project[option.spreadsheetKey],
                milestoneTitle: project['Title'] || 'New project'
            })

            return [option.databaseKey, option.defaultValue]
        }

        let val = option.defaultValue

        try {
            if (option.fetchDatabaseValue) {
                val = option.fetchDatabaseValue(project[option.spreadsheetKey])
            } else if (project[option.spreadsheetKey]) {
                val = project[option.spreadsheetKey]
            }
        } catch (error) {
            errors.push({
                message: `Field ${option.spreadsheetKey} encountered an error.`,
                value: project[option.spreadsheetKey],
                milestoneTitle: project['Title'] || 'New project'
            })

            return [option.databaseKey, option.defaultValue]
        }

        return [option.databaseKey, val]
    }))

    console.log(`data`, data)

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

    if (data.startDate && data.endDate && data.startDate.getTime() > data.endDate.getTime()) {
        errors.push({
            message: `Field Start Date must be on or before field End Date.`,
            value: 'End Date',
            milestoneTitle: project['Title'] || 'New project'
        })

        data.endDate = undefined
    }

    // data.private = data.isPrivate

    return {data: data as z.infer<typeof editMilestoneForm>, errors}
}

const projectImportSchema: ImportSchemaEntry[] = [
    {
        spreadsheetKey: 'Visibility', 
        databaseKey: 'isPrivate',
        required: false, 
        defaultValue: true, 
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: (entry) => {
            if (entry == 'Published') return false
            if (entry == 'Private') return true

            return true
        }
    },
    {
        spreadsheetKey: 'Title',
        databaseKey: 'title',
        required: false,
        defaultValue: 'New project',
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
        spreadsheetKey: 'Project Status',
        databaseKey: 'status',
        required: false,
        defaultValue: 'PLANNED',
        isValid: (entry) => !!MILESTONE_STATUS_OPTIONS.find(option => option.label === entry),
        fetchDatabaseValue: (entry) => {
            const foundOption = MILESTONE_STATUS_OPTIONS.find(option => option.label === entry)
            if (foundOption) return foundOption.value
            return 'PLANNED'
        }
    }, 
    {
        spreadsheetKey: 'Type',
        databaseKey: 'types',
        required: false,
        defaultValue: [],
        isValid: (entry) => !!MILESTONE_TYPE_OPTIONS.find(option => option.label === entry),
        fetchDatabaseValue: (entry) => {
            const foundOption = MILESTONE_TYPE_OPTIONS.find(option => option.label === entry)
            if (foundOption) return [foundOption]
            return []
        }
    }, 
    {
        spreadsheetKey: 'Budget',
        databaseKey: 'budget',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => {
            try {
                const type = typeof entry === 'string'
                const val = parseInt(entry)

                return type && !isNaN(val)
            } catch (e) {
                return false
            }
        },
        fetchDatabaseValue: (entry) => {
            try { 
                if (!entry) return undefined
                return parseInt(entry)
            } catch (e) {
                return undefined
            }
        }
    },
    {
        spreadsheetKey: 'Start Date',
        databaseKey: 'startDate',
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
        fetchDatabaseValue: (entry) => {
            if (entry) {
                const d = new Date(entry)
                // strip time, only store date (midnight, EST is stored as time in DB)
                return new Date(d.getFullYear(), d.getMonth(), d.getDate())
            }

            return undefined
        }
    },
    {
        spreadsheetKey: 'End Date',
        databaseKey: 'endDate',
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
        fetchDatabaseValue: (entry) => {
            if (entry) {
                const d = new Date(entry)
                // strip time, only store date (midnight, EST is stored as time in DB)
                return new Date(d.getFullYear(), d.getMonth(), d.getDate())
            }

            return undefined
        }
    },
    {
        spreadsheetKey: 'Contact Name',
        databaseKey: 'contactNames', // hack to get contacts working, on the milestone this is 'contacts'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Contact Email',
        databaseKey: 'contactEmails', // hack to get contacts working, on the milestone this is 'contacts'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Link Name',
        databaseKey: 'linkNames', // hack to get links working, on the milestone this is 'attachments'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Link URL',
        databaseKey: 'linkURLs', // hack to get links working, on the milestone this is 'attachments'
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: (entry) => entry.split(","),
    },
    {
        spreadsheetKey: 'Internal Notes',
        databaseKey: 'notes',
        required: false,
        defaultValue: undefined,
        isValid: (entry) => typeof entry === 'string',
        fetchDatabaseValue: (entry) => ([{"children":[{"text":entry}],"type":"p"}])
    },
]

export function ProjectBulkImportDialog({
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

    const { 
        addMilestones,
    } = useRoadmapStore(useShallow(selector))

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

                for (let i = 0; i < result.values.length; i++) {
                    const {data: formattedProject, errors: formattedErrors} = await formatProjectData(result.values[i])

                    newNodes.push({
                        private: formattedProject.isPrivate,
                        isPrivate: formattedProject.isPrivate,
                        nodeType: 'PROJECT',
                        title: formattedProject.title,
                        description: formattedProject.description,
                        status: formattedProject.status,
                        budget: formattedProject.budget,
                        startDate: formattedProject.startDate,
                        endDate: formattedProject.endDate,
                        contacts: formattedProject.contacts,
                        attachments: formattedProject.attachments,
                        notes: JSON.stringify(formattedProject.notes),
                        types: (formattedProject.types || []).map((type: any) => type.id).map((type: string) => {
                            const milestoneType = MILESTONE_TYPE_OPTIONS.find(t => t.id === type)
                            if (!milestoneType) return // milestone type not found, don't add it to created milestone
                            return {
                                milestoneTypeId: type,
                                milestoneType: milestoneType
                            }
                        }).filter((type: any) => type !== undefined),
                    })
                    if (formattedErrors.length > 0) errors.push(formattedErrors)
                }

                await addMilestones(newNodes)

                setTotalErrors(errors)
                setImportCount(newNodes.length)

            } catch (e) {
                toast('Error!', {
                    position: "bottom-left",
                    duration: 6000,
                    description: `Import failed. Please try again to upload using a copy of our template. If the problem continues, contact us at support@comendcare.com`
                })
                console.error("Error: failed to import projects", e)
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
                            {!isCollapsed && <p>{`Import projects`}</p>}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent className="max-w-80">
                        <p>{`Import projects`}</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent className="flex flex-col justify-start">
            {importState === 'start' && (
                <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Import projects
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple projects at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1wHQ5TasGlQQF7OsvmK0VRaib8o2rFleZmL4NU5s4w8w/edit?usp=sharing">Project input template</Link>, filling it out, downloading it as a CSV, and uploading it.
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
                        Finished importing
                    </DialogTitle>
                    <DialogDescription>
                        We've finished processing your file, it is now safe to close this tab.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full flex flex-col gap-4 justify-center">
                    <p className="w-full justify-start">{`Finished importing ${importCount} of ${totalItems}.`}</p>
                    {totalErrors.length > 0 
                        ? (
                            <div className="w-full flex flex-col justify-start gap-4">
                            <p>⚠️ A few details didn’t import for the projects below. Please review them and add any missing information.</p>
                            <ul className="w-full flex flex-col gap-2">
                                {totalErrors.map((error, index) => (
                                    <Badge variant={"red"} key={index} className="w-full">
                                        <CircleX className="h-4 w-4 min-h-4 min-w-4"/>
                                        {error?.[0]?.milestoneTitle}
                                    </Badge>
                                ))}
                            </ul>
                            </div>
                        ) 
                        : (
                            <p>Successfully imported all projects!</p>
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
