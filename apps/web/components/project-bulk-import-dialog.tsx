"use client"

import React, { useState } from "react";
import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Import, LoaderCircle } from "lucide-react";
import { FileUploadForm } from "~web/components/file-upload-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn, parseCSV } from "@comend/lib/utils";
import { editMilestoneForm, MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS, Option } from "@/packages/lib/types";
import { revalidate } from "@/packages/lib/revalidate";
import z from "zod";
import { getOrganizationFromOrganizationId } from "@/packages/lib/fetchers";
import { Donor, Milestone, MilestoneTypeOnMilestone } from "@prisma/client";
import { useShallow } from "zustand/react/shallow";
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore";

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones,
    selectedView: state.selectedView,
    addNodes: state.addNodes,
    addNodesFromTemplate: state.addNodesFromTemplate,
    setSelectedNodeIds: state.setSelectedNodeIds
})

export async function formatProjectData(project: any): Promise<z.infer<typeof editMilestoneForm>> {
    const contactNames = (project['Contact Name'] || "").split(",")
    const contactEmails = (project['Contact Email'] || "").split(",")

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

    const linkNames = (project['Link Name'] || "").split(",")
    const linkURLs = (project['Link URL'] || "").split(",")

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

    const data: z.infer<typeof editMilestoneForm> = {
        isPrivate: project['Visibility'] ? (project['Visibility'] === 'Published' ? false : true) : true,
        nodeType: 'PROJECT',
        title: project['Title'],
        description: project['Description'],
        status: (() => {
            const foundOption = MILESTONE_STATUS_OPTIONS.find(option => option.label === project.Status)
            if (foundOption) return foundOption.value
            return 'PLANNED'
        })(),
        budget: (() => {
            try {
                const budget = parseInt(project.Budget)
                return budget
            } catch (e) {
                return undefined
            }
        })(),
        startDate:
            project['Start Date'] 
                ? (() => {
                    const d = new Date(project["Start Date"])
                    // strip time, only store date (midnight, EST is stored as time in DB)
                    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
                })()
                : undefined,
        endDate:
            project['End Date'] 
                ? (() => {
                    const d = new Date(project["End Date"])
                    // strip time, only store date (midnight, EST is stored as time in DB)
                    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
                })()
                : undefined,
        contacts,
        attachments: links,
        types: (() => {
            const foundOption = MILESTONE_TYPE_OPTIONS.find(option => option.label === project.Type)
            if (foundOption) return [foundOption]
            return []
        })(),
        notes: project['Internal Notes'],
    }
    return data
}

export function ProjectBulkImportDialog() {
    const router = useRouter()
    const pathname = usePathname()
    const {data: session} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [importCount, setImportCount] = useState(0)
    const [totalItems, setTotalItems] = useState(0)

    const { 
        addMilestones,
    } = useRoadmapStore(useShallow(selector))

    const handleImport = async (file: File | undefined) => {
        setIsImporting(true)
        if (file && file.name.endsWith(".csv")) {
            // parse CSV file
            try {
                const result = await parseCSV(
                    file,
                    [
                        {key: 'Visibility', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Title', required: false, defaultValue: 'New project', isValid: (entry) => typeof entry === 'string'},
                        {key: 'Description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Status', required: false, defaultValue: 'PLANNED', isValid: (entry) => MILESTONE_STATUS_OPTIONS.find(option => option.label === entry.Status) !== undefined},
                        {key: 'Type', required: false, defaultValue: undefined, isValid: (entry) => MILESTONE_TYPE_OPTIONS.find(option => option.labal === entry.Type) !== undefined},
                        {key: 'Budget', required: false, defaultValue: undefined, isValid: (entry) => {
                            try {
                                const type = typeof entry === 'string'
                                const val = parseInt(entry)

                                return type
                            } catch (e) {
                                return false
                            }
                        }},
                        {key: 'Start Date', required: false, defaultValue: undefined, isValid: (entry) => {try {const isDate = new Date(entry); return true} catch (e) {return false}}},
                        {key: 'End Date', required: false, defaultValue: undefined, isValid: (entry) => {try {const isDate = new Date(entry); return true} catch (e) {return false}}},
                        {key: 'Contact Name', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Contact Email', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Link Name', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Link URL', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                        {key: 'Internal Notes', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                    ]
                )

                setTotalItems(result.values.length)
                setImportCount(0)
    
                if (result.errors.length > 0) {
                    toast('Warning!', {
                        position: "bottom-left",
                        duration: 6000,
                        description: `Missing fields in import file: A title is required for each project. Edit the project to add title.`
                    })
                    console.error("Error: imported projects are missing required fields", result.errors)
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
                    const project = result.values[i]
                    let formattedProject = await formatProjectData(project)

                    const newNode = await addMilestones([{
                        private: formattedProject.isPrivate,
                        nodeType: formattedProject.nodeType,
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
                            return {milestoneTypeId: type}
                        }).filter((type: any) => type !== undefined) as {milestoneTypeId: string}[],
                    }], "Project Import")

                    setImportCount((prev) => prev + 1)
                }
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
                    <p>{`Import projects`}</p>
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
            </DialogContent>
        </Dialog>
    )
}
