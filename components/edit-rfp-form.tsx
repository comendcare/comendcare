"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useForm, UseFormReturn} from "react-hook-form"
import {z} from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription,
} from "./ui/form"
import {Input} from "./ui/input"
import {AutosizeTextarea, Textarea} from "./ui/textarea"
import {Button} from "./ui/button"
import {ScrollArea, ScrollBar} from "./ui/scroll-area"
import StatusButton from "./milestone-status-button"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog"
import {DeleteMilestoneDialogContent} from "./delete-milestone-dialog-content"
import {PrivateBadge} from "./private-badge"
import {debounce, isEmpty} from "lodash"
import {monthsList} from "@/lib/data";
import {Asset, Milestone, NODE_TYPE_OPTIONS, RFP, RFP_OPEN_TO_TYPE_OPTIONS, StatusType} from "@/lib/types"
import {MilestoneType, PlatformNotification, Prisma} from "@prisma/client"
import {getMilestones, getOrganizationFromOrganizationId} from "@/lib/fetchers"
import mixpanel from "mixpanel-browser"
import {useSession} from "next-auth/react"
import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group"
import {ExternalContactField} from "./external-contact-field"
import {ExternalAttachmentField} from "./external-attachment-field"
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover"
import {cn, sleep} from "@/lib/utils"
import {format} from "date-fns"
import {Calendar} from "./ui/calendar"
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import MoneyInput from "@/components/money-input";
import MultipleSelector from "./ui/multiple-selector"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { PlateEditor } from "./editor/plate-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { CROSearchState, Recommendation, useCROSearchStore } from "@/state/search/croSearchStore"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { CROMarketplaceCard  } from "./marketplace-cro-card"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TypeBadge } from "./type-badge"
import Loading from "@/app/loading"
import { getMilestoneTypes } from "@/lib/fetchers"
import { NotificationBubble } from "./notification-bubble"
import { NotificationsState, useNotificationsStore } from "@/state/notifications/notificationsStore"
import { ChevronDown, FileText, Globe, Info, Lock, Megaphone, Plus, Star, X, Store, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createOrUpdateAsset, createOrUpdateRFP, deleteRFP } from "@/lib/actions"
import { Option } from "@/lib/types"
import { AttachmentsFormField, ContactsFormField, OpenToFormField, PrivatePublicFormField } from "./edit-milestone-form"


type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional()
    // disable: z.boolean().optional(),
});

const editRFPForm = z.object({
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.array(z.string()).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    milestones: z.array(z.custom<Milestone>()).optional()
}).refine(
    (rfp) => rfp.startDate && rfp.endDate ? rfp.startDate?.getTime() <= rfp.endDate?.getTime() : true, 
    {
        message: "Error: Please adjust the dates so the acceptance date comes before the deadline.",
        path: ["endDate"]
    }
)

export function EditRFPForm({
    rfpData,
}: {
    rfpData: Partial<RFP>
}) {
    const router = useRouter()
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    const form = useForm<z.infer<typeof editRFPForm>>({
        mode: "onChange",
        resolver: zodResolver(editRFPForm),
        defaultValues: {
            title: rfpData?.title || "",
            description: rfpData?.description || "",
            attachments: rfpData?.attachments || undefined,
            isPrivate: rfpData?.private !== undefined ? rfpData?.private : true,
            contacts: rfpData?.contacts || undefined,
            openTo: rfpData?.openTo || [],
            startDate: rfpData?.startDate || undefined,
            endDate: rfpData?.endDate || undefined,
            milestones: (rfpData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description"),
        attachments: form.watch("attachments"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        openTo: form.watch("openTo"),
        startDate: form.watch("startDate"),
        endDate: form.watch("endDate"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editRFPForm>) => {
        console.log(`handle form submit`, values)
        const {
            title,
            description,
            attachments,
            isPrivate,
            contacts,
            openTo,
            startDate,
            endDate,
            milestones
        } = values;

        const updateData: Partial<RFP> = {
            ...rfpData,
            title,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    rfpId: rfpData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
            ...(openTo ? {openTo} : undefined),
            ...(startDate ? {startDate} : undefined),
            ...(endDate ? {endDate} : undefined)
        }

        console.log(`updateData`, updateData)

        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        try {
            await createOrUpdateRFP(updateData, session.user.organizationId);
            toast.success("RFP created or updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error updating or createing RFP:", error);
            toast.error("Failed to update or create RFP.");
        }
    }

    const handleDeleteRFP = async () => {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.")
            return
        }

        if (!rfpData.id) {
            toast.error("This RFP does not have an id.")
            return
        }

        try {
            await deleteRFP(rfpData.id)
            toast.success("Organization profile updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    // Initialization - Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {
                const response = await getOrganizationFromOrganizationId(session.user.organizationId)
                if (response.success && response.data) {
                    setOrgIsPublished(response.data.published)
                }
            }

            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined)
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse?.data as Milestone[])
            } else {
                console.error(milestonesResponse.error)
            }

            // trigger a form validation if we're editing an RFP, if the imported data is not valid, let the user know right away
            if (Object.keys(rfpData).length > 0) form.trigger()

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Form {...form}>
            <ScrollArea className={"max-h-[600px] -mr-2 pr-3"} type={"always"}>
                <ScrollBar />
                <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="space-y-6 m-1"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{`Title`}</FormLabel>
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

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Description`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="description"
                                        placeholder={`Enter a description...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <FormDescription>
                            {`Changing the visiblity of your RFP allows you show or hide it from your organization profile.`}
                        </FormDescription>
                        <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full mt-2">
                                <FormLabel >{`Linked Projects`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value?.map(milestone => ({...milestone, value: milestone.id, label: milestone.title}))}
                                        onChange={field.onChange}
                                        defaultOptions={fetchedMilestones.map(milestone => ({...milestone, value: milestone.id, label: milestone.title} as Option))}
                                        options={fetchedMilestones.map(milestone => ({...milestone, value: milestone.id, label: milestone.title} as Option))}
                                        hidePlaceholderWhenSelected={true}
                                        showHoverCard={false}
                                        placeholder="Link projects"
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage className="text-primary"/>
                            </FormItem>
                        )}
                    />

                    <OpenToFormField form={form}/>
                    <ProposalTimelineInput form={form}/>

                    <ContactsFormField form={form} />
                    <AttachmentsFormField form={form} />

                    <span className="flex gap-2 w-full justify-end">
                        <DialogClose asChild>
                            <Button variant={"secondary"}>Cancel</Button>
                        </DialogClose>
                        <Dialog>
                            <DialogTrigger asChild className={cn(rfpData.id ? "" : "hidden")}>
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
                        <DialogClose disabled={!form.formState.isValid}>
                            <Button
                                disabled={!form.formState.isValid}
                                onClick={() => {
                                    handleFormSubmit(form.getValues())
                                }}
                            >
                                Save Changes
                            </Button>
                        </DialogClose>
                    </span>
                </form>
            </ScrollArea>
        </Form>
    )
}

const ProposalTimelineInput = ({form}: {form: any}) => {
    return (
        <>
        <FormField
            control={form.control}
            name="startDate"
            render={({field}) => (
                <FormItem>
                    <FormLabel>{`Request Opens`}</FormLabel>
                    <FormDescription>{`The date you'll begin accepting proposals.`}</FormDescription>
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
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="endDate"
            render={({field}) => (
                <FormItem>
                    <FormLabel>{`Deadline for Proposals`}</FormLabel>
                    <FormDescription>{`The last day you will be accepting proposals.`}</FormDescription>
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
        </>
    )
}
