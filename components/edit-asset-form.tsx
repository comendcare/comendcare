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
import {debounce} from "lodash"
import {monthsList} from "@/lib/data";
import {Asset, Milestone, NODE_TYPE_OPTIONS, RFP_OPEN_TO_TYPE_OPTIONS, StatusType} from "@/lib/types"
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
import { ChevronDown, FileText, Globe, Info, Lock, Megaphone, Plus, Star, X, Store } from "lucide-react"
import { AttachmentsFormField, ContactsFormField, EditTitle, PrivatePublicFormField, StatusFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createOrUpdateAsset, deleteAsset } from "@/lib/actions"
import { Option } from "@/lib/types"


type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional()
    // disable: z.boolean().optional(),
});

const editAssetForm = z.object({
    nodeType: z.string(),
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional()
})

export function EditAssetForm({
    assetData,
}: {
    assetData: Partial<Asset>
}) {
    const router = useRouter()
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    console.log(`asset data`, assetData)

    const form = useForm<z.infer<typeof editAssetForm>>({
        mode: "onChange",
        resolver: zodResolver(editAssetForm),
        defaultValues: {
            title: assetData?.title || "",
            description: assetData?.description || "",
            attachments: assetData?.attachments || undefined,
            isPrivate: assetData?.private !== undefined ? assetData?.private : true,
            contacts: assetData?.contacts || undefined,
            milestones: (assetData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
        }
    })

    const formData = {
        nodeType: form.watch("nodeType"),
        title: form.watch("title"),
        description: form.watch("description"),
        attachments: form.watch("attachments"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editAssetForm>) => {
        console.log(`handle form submit`, values)
        const {
            title,
            description,
            attachments,
            isPrivate,
            contacts,
            milestones,
        } = values;

        console.log(`save`, values)

        const updateData: Partial<Asset> = {
            ...assetData,
            title,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    assetId: assetData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
        }

        console.log(`updateData`, updateData)

        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        try {
            await createOrUpdateAsset(updateData, session.user.organizationId);
            toast.success("Asset created or updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error creating or updating asset:", error);
            toast.error("Failed to create or update asset.");
        }
    }

    const handleDeleteAsset = async () => {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.")
            return
        }

        if (!assetData.id) {
            toast.error("This asset does not have an id.")
            return
        }

        try {
            await deleteAsset(assetData.id)
            toast.success("Asset deleted successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error deleting asset:", error);
            toast.error("Failed to delete asset.");
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

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    console.log(`fetched projects`, fetchedMilestones)

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
                            {`Changing the visiblity of your asset allows you show or hide it from your organization profile.`}
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

                    <ContactsFormField form={form} />
                    <AttachmentsFormField form={form} />

                    <span className="flex gap-2 w-full justify-end">
                        <DialogClose asChild>
                            <Button variant={"secondary"}>Cancel</Button>
                        </DialogClose>
                        <Dialog>
                            <DialogTrigger asChild className={cn(assetData.id ? "" : "hidden")}>
                                <Button type="button" variant="destructive">
                                    Delete Asset
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`This action cannot be undone. This will permanently delete your Asset and it's data.`}
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
                                                onClick={handleDeleteAsset}
                                            >
                                                Delete Asset
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                        <Button
                            onClick={() => {
                                handleFormSubmit(form.getValues())
                                // onClose()
                            }}
                        >
                            Save Changes
                        </Button>
                    </span>
                </form>
            </ScrollArea>
        </Form>
    )
}
