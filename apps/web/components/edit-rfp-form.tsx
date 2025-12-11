"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription,
} from "@comend/components/ui/form"
import {Input} from "@comend/components/ui/input"
import {Textarea} from "@comend/components/ui/textarea"
import {Button} from "@comend/components/ui/button"
import {ScrollArea, ScrollBar} from "@comend/components/ui/scroll-area"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog"
import {RFP} from "@comend/lib/types"
import type {Prisma} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import {Popover, PopoverContent, PopoverTrigger} from "@comend/components/ui/popover"
import {cn} from "@comend/lib/utils"
import {format} from "date-fns"
import {Calendar} from "@comend/components/ui/calendar"
import { Calendar as CalendarIcon, Lock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AttachmentsFormField, ContactsFormField, OpenToFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore"
import { useShallow } from "zustand/react/shallow"
import MoneyInput from "@comend/components/money-input"
import ProjectMultipleSelector from "./project-multiple-selector"
import { revalidate } from "@comend/lib/revalidate"
import { Separator } from "@comend/components/ui/separator"
import { Checkbox } from "@comend/components/ui/checkbox"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

const HEADER_IMAGE_OPTIONS = [
    // {
    //     label: "Yellow",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-yellow.svg"
    // },
    // {
    //     label: "Pink",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-pink.png"
    // },
    // {
    //     label: "Purple",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-purple.png"
    // },
    // {
    //     label: "Red",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-red.png"
    // }
    {
        label: "Yellow",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-yellow.png"
    },
    {
        label: "Pink",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-red.png"
    },
    {
        label: "Blue",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-blue.png"
    },
    {
        label: "Green",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-green.png"
    }
]

const editRFPForm = z.object({
    headerImage: z.string().optional(),
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z.string({
        required_error: "Please provide a scope"
    }).min(1, "Scope is required"),
    eligibility: z.string().optional(),
    instructions: z.string().optional(),
    evaluationProcess: z.string().optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPrivate: z.boolean(),
    // hack, contacts are actuall required, but in order to keep all error messages working we verify this later.
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.array(z.string()).min(1, "At least one applicable party is required."),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    milestones: z.array(z.custom<Milestone>()).optional(),
    budget: z.number().max(2147483647).min(0).optional(),
    notes: z.string().optional(),
    isRolling: z.boolean(),
    fundingIsFlexible: z.boolean(),
}).superRefine((rfp, ctx) => {
    if (rfp.startDate && rfp.endDate) {
        if (rfp.startDate?.getTime() >= rfp.endDate?.getTime()) {
            ctx.addIssue({
                code: "custom",
                message: "Please adjust the dates so the acceptance date comes before the deadline.",
                path: ["endDate"]
            })
        }
    }

    if (!rfp.fundingIsFlexible) {
        if (!rfp.budget) {
            ctx.addIssue({
                code: "custom",
                message: "A funding value is required.",
                path: ["budget"]
            })
        }
    }

    if (!rfp.isRolling) {
        if (!rfp.startDate) {
            ctx.addIssue({
                code: "custom",
                message: "Start date is required for non-rolling RFPs.",
                path: ["startDate"],
            });
        }
        if (!rfp.endDate) {
            ctx.addIssue({
                code: "custom",
                message: "End date is required for non-rolling RFPs.",
                path: ["endDate"],
            });
        }
    }

    if (!rfp.contacts || rfp.contacts.length <= 0) {
        ctx.addIssue({
            code: "custom",
            message: "At least one contact is required.",
            path: ["contacts"]
        })
    } else {
        rfp.contacts.map(contact => {
            if (!contact.email) {
                ctx.addIssue({
                    code: "custom",
                    message: "All contacts require an email address.",
                    path: ["contacts"]
                })
            }
        })
    }
})

const rfpSelector = (state: RFPState) => ({
    createRFP: state.createRFP,
    updateRFP: state.updateRFP,
    deleteRFP: state.deleteRFP,
    // saveState: state.saveState
})

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

export function EditRFPForm({
    rfpData,
    closeDialog
}: {
    rfpData: Partial<RFP>,
    closeDialog?: (updatedOrNewRFP?: RFP | undefined) => void
}) {
    const router = useRouter()
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const { 
        createRFP, 
        updateRFP, 
        deleteRFP, 
        // saveState 
    } = useRFPStore(useShallow(rfpSelector))
    // const { undo } = useRFPStore.temporal.getState()

    // const handleUndo = () => {
    //     undo()
    //     saveState(session?.user.organizationId)
    //     toast.dismiss("undo-toast")
    // }

    const form = useForm<z.infer<typeof editRFPForm>>({
        mode: "onChange",
        resolver: zodResolver(editRFPForm),
        defaultValues: {
            headerImage: rfpData?.headerImage || "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-blue.png",
            // headerImage: rfpData?.headerImage || undefined,
            title: rfpData?.title || "",
            description: rfpData?.description || "",
            eligibility: rfpData?.eligibility || "",
            instructions: rfpData?.instructions || "",
            evaluationProcess: rfpData?.evaluationProcess || "",
            attachments: rfpData?.attachments || undefined,
            isPrivate: rfpData?.private !== undefined ? rfpData?.private : true,
            contacts: rfpData?.contacts || undefined,
            openTo: rfpData?.openTo || [],
            startDate: rfpData?.startDate || undefined,
            endDate: rfpData?.endDate || undefined,
            milestones: (rfpData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
            budget: rfpData?.budget || undefined,
            notes: rfpData?.notes || "",
            isRolling: (rfpData?.id ? !rfpData?.startDate && !rfpData?.endDate : false) as boolean,
            fundingIsFlexible: rfpData?.id ? !rfpData?.budget : false
        }
    })

    const formData = {
        headerImage: form.watch("headerImage"),
        title: form.watch("title"),
        description: form.watch("description"),
        attachments: form.watch("attachments"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        openTo: form.watch("openTo"),
        startDate: form.watch("startDate"),
        endDate: form.watch("endDate"),
        milestones: form.watch("milestones"),
        budget: form.watch("budget"),
        fundingIsFlexible: form.watch("fundingIsFlexible"),
    }

    const handleFormSubmit = async (values: z.infer<typeof editRFPForm>) => {
        console.log(`handle form submit`, values)
        const {
            headerImage,
            title,
            description,
            eligibility,
            instructions,
            evaluationProcess,
            attachments,
            isPrivate,
            contacts,
            openTo,
            startDate,
            endDate,
            milestones,
            budget,
            notes,
            isRolling,
            fundingIsFlexible
        } = values;

        const updateData: Partial<RFP> = {
            ...rfpData,
            headerImage,
            title,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    rfpId: rfpData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(eligibility !== undefined && eligibility !== null ? {eligibility} : undefined),
            ...(instructions !== undefined && instructions !== null ? {instructions} : undefined),
            ...(evaluationProcess !== undefined && evaluationProcess !== null ? {evaluationProcess} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
            ...(openTo ? {openTo} : undefined),
            ...(startDate && !isRolling ? {startDate} : {startDate: null}),
            ...(endDate && !isRolling ? {endDate} : {endDate: null}),
            ...(budget ? {budget} : undefined),
            ...(notes !== undefined && notes !== null ? {notes} : undefined),
            ...(budget && !fundingIsFlexible ? {budget} : {budget: null}),
        }

        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        try {
            let updatedOrNewRFP = undefined
            if (rfpData.id) {
                updatedOrNewRFP = await updateRFP(updateData, session.user.organizationId)
                toast.success(
                    "RFP updated successfully!",
                    {position: "bottom-left"}
                )
            } else {
                updatedOrNewRFP = await createRFP(updateData, session.user.organizationId)
                toast.success(
                    "RFP created successfully!",
                    {position: "bottom-left"}
                )
            }
            revalidate('/app/rfps') // update page contents

            if (closeDialog) closeDialog(updatedOrNewRFP)
        } catch (error) {
            console.error("Error updating or createing RFP:", error);
            toast.error(
                "Failed to update or create RFP.",
                {position: "bottom-left"}
            )
        }
    }

    const handleDeleteRFP = async () => {
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            )
            return
        }

        if (!rfpData.id) {
            toast.error(
                "This RFP does not have an id.",
                {position: "bottom-left"}
            )
            return
        }

        try {
            await deleteRFP(rfpData.id, session.user.organizationId)
            if (closeDialog) closeDialog()
            toast(
                <div className="flex flex-col gap-2 w-full">
                    <span className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">
                            {`RFP Deleted`}
                        </p>
                        {/* <Button className="self-end" onClick={handleUndo}>Undo Delete</Button> */}
                    </span>
                    <p className="text-sm text-gray-500">
                        {`Your RFP had been deleted successfully.`}
                    </p>
                </div>,
                {position: "bottom-left", duration: 20000, id: "undo-toast"}
            )
        } catch (error) {
            console.error("Error deleting RFP:", error);
            toast.error(
                "Failed to delete RFP.",
                {position: "bottom-left"}
            );
        }
    }

    // Initialization - Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {
                const response = await getOrganizationFromOrganizationId(session.user.organizationId, {
                    id: true,
                    public: true,
                    verified: true,
                    published: true,
                    name: true,
                    description: true,
                    contactEmail: true,
                    logo: true,
                    image: true,
                    headerImage: true,
                    biopharmaConsentSettings: true,
                    subdomain: true,
                    customDomain: true,
                    statedGoal: true,
                    yearFounded: true,
                    incorporationStatus: true,
                    therapeuticsOfInterest: true,
                    therapeuticsInDevelopment: true,
                    website: true,
                    moneyRaised: true,
                    moneyDeployed: true,
                    researchBudget: true,
                    createdAt: true,
                    updatedAt: true,
                    user: true,
                    userId: true,
                    roadmaps: true,
                    members: true,
                    clients: true,
                    invitations: true,
                    membershipRequests: true,
                    conditions: true,
                    kanban: true,
                    milestones: true,
                    platformNotifications: true,
                    reviews: true,
                    savedCompanies: true,
                    tools: true,
                    rfps: true,
                    metadata: true
                })
                if (response.success && response.data) {
                    setOrgIsPublished(response.data.published)
                }
            }

            // trigger a form validation if we're editing an RFP, if the imported data is not valid, let the user know right away
            if (Object.keys(rfpData).length > 0) form.trigger()

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // useEffect(() => {
    //     // Forces re-validation whenever startDate or endDate changes
    //     if (!initializing.current) form.trigger()
    // }, [formData.startDate, formData.endDate])

    return (
        <Form {...form}>
            <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 pb-12"} type={"always"}>
                <ScrollBar />
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 m-1 pb-12">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{`Title (required)`}</FormLabel>
                                <FormControl>
                                    <Input
                                        id="title"
                                        placeholder={`Enter a title`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormItem className="flex gap-4 items-center">
                        <div className="grow">
                            <FormLabel>{`Visibility`}</FormLabel>
                            <FormDescription>
                                {`Private RFPs will not be shown to people outside of your organization.`}
                            </FormDescription>
                        </div>
                        <div className="w-[90px]">
                            <PrivatePublicFormField 
                                form={form} 
                                formData={formData} 
                            />
                        </div>
                    </FormItem>

                    <ProposalTimelineInput form={form}/>

                    <OpenToFormField form={form}/>

                    <div className="flex flex-col gap-4 rounded-md border p-4">
                        <FormLabel>{`Funding amount`}</FormLabel>
                        <FormField
                            control={form.control}
                            name="fundingIsFlexible"
                            render={({field}) => (
                                <>
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={!field.value}
                                            onCheckedChange={(checked: boolean) => {
                                                field.onChange(!checked)
                                            }}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            {`I have a set amount`}
                                        </FormLabel>
                                        <FormDescription>
                                            {`If you have a fixed budget amount, select this option`}
                                        </FormDescription>
                                        <FormMessage />
                                    </div>
                                </FormItem>

                                {!formData.fundingIsFlexible && (
                                    <MoneyInput 
                                        form={form}
                                        className="-mt-2"
                                        name="budget"
                                        placeholder="Enter total funding for project..."
                                    />
                                )}

                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            {`Funding amount is flexible`}
                                        </FormLabel>
                                        <FormDescription>
                                            {`If your funding is proposal dependent or you have not set a budget aside, select this option.`}
                                        </FormDescription>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                                </>
                            )}
                        />
                    </div>

                    <ContactsFormField form={form} title={'Contacts (required)'}/>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Scope (required)`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="scope"
                                        placeholder={`Enter scope...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eligibility"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Eligibility`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="eligibility"
                                        placeholder={`Enter eligibility...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="instructions"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Instructions`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="instructions"
                                        placeholder={`Enter instructions...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="evaluationProcess"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Evaluation process`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="evaluationProcess"
                                        placeholder={`Enter evaluation process...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full mt-2">
                                <FormLabel >{`Linked projects`}</FormLabel>
                                <FormControl>
                                    <ProjectMultipleSelector value={field.value} onChange={field.onChange}/>
                                </FormControl>
                                <FormMessage className="text-primary"/>
                            </FormItem>
                        )}
                    />                  

                    <AttachmentsFormField form={form} />

                    <Separator />
        
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[100px] flex items-center">
                                <span>Internal notes</span>
                                <Tooltip>
                                    <TooltipTrigger className="pl-2">
                                    <Lock className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left">
                                    <p className="text-normal">
                                        Only visible to your team
                                    </p>
                                    </TooltipContent>
                                </Tooltip>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="notes"
                                        placeholder={`Enter internal notes...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="absolute right-4 bottom-0 flex gap-2">
                        <DialogClose asChild>
                            <Button 
                                variant={"secondary"}
                                onClick={() => {if (closeDialog) closeDialog()}}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        {rfpData.id && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="destructive">
                                        Delete RFP
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Are you absolutely sure?
                                        </DialogTitle>
                                        <DialogDescription>
                                            {`This action cannot be undone. This will permanently delete your RFP and it's data.`}
                                        </DialogDescription>
                                        <DialogFooter>
                                            <DialogClose>
                                                <Button type="button">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <DialogClose>
                                                <Button
                                                    type="button"
                                                    variant={"destructive"}
                                                    onClick={handleDeleteRFP}
                                                >
                                                    Delete RFP
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button
                            variant={"cta"}
                            type="submit"
                        >
                            Save changes
                        </Button>
                    </div>
                </form>
            </ScrollArea>
        </Form>
    )
}

const ProposalTimelineInput = ({form}: {form: any}) => {
    const isRolling = form.watch("isRolling")

    return (
        <div className="flex flex-col gap-4 rounded-md border p-4">
            <FormLabel>{`Application timeline`}</FormLabel>
            <FormField
                control={form.control}
                name="isRolling"
                render={({field}) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                {`Rolling RFP`}
                            </FormLabel>
                            <FormDescription>
                                {`Rolling RFPs do not include any dates, and are always open.`}
                            </FormDescription>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {!isRolling && (
                <div className="flex gap-2">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({field}) => (
                        <FormItem className="w-full">
                            <FormLabel>{`Request opens (required)`}</FormLabel>
                            <div>
                                <Popover >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                        <CalendarIcon className="mr-2" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value || new Date()}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="endDate"
                    render={({field}) => (
                        <FormItem className="w-full">
                            <FormLabel>{`Deadline for proposals (required)`}</FormLabel>
                            <Popover >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                    <CalendarIcon className="mr-2" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value || new Date()}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                </div>
            )}
        </div>
    )
}
