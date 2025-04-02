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
import {ScrollArea} from "./ui/scroll-area"
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
    DialogTrigger
} from "./ui/dialog"
import {DeleteMilestoneDialogContent} from "./delete-milestone-dialog-content"
import {PrivateBadge} from "./private-badge"
import {debounce} from "lodash"
import {monthsList} from "@/lib/data";
import {Asset, Milestone, NODE_TYPE_OPTIONS, RFP, RFP_OPEN_TO_TYPE_OPTIONS, StatusType, Option} from "@/lib/types"
import {AssetToMilestone, MilestoneType, PlatformNotification, Prisma} from "@prisma/client"
import {getAssets, getOrganizationFromOrganizationId, getRFPs} from "@/lib/fetchers"
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
import { toast } from "sonner"


type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional()
    // disable: z.boolean().optional(),
});

const selector = (state: RoadmapState) => ({
    setMilestone: state.setMilestone
})

const recommendationsSelector = (state: CROSearchState) => ({
    recommendations: state.recommendations,
    setRecommendations: state.setRecommendations
})

const notificationsSelector = (state: NotificationsState) => ({
    initialized: state.initialized,
    notifications: state.notifications,
    addNotification: state.addNotification,
    setNotificationsViewed: state.setNotificationsViewed
})

const editMilestoneForm = z.object({
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
    types: z.array(z.custom<MilestoneType>()).optional(),
    otherTypeDetails: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.number().max(2147483647).min(0).optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    status: z.string(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.array(z.string()).optional(),
    assets: z.array(z.custom<Asset>()).optional(),
    rfps: z.array(z.custom<RFP>()).optional(),
    notes: z.array(z.record(z.any()))
})

export function EditMilestoneForm({
    milestoneData,
    onClose
}: {
    milestoneData: Milestone
    onClose: () => void
}) {
    const { setMilestone } = useRoadmapStore(useShallow(selector))
    const { recommendations, setRecommendations } = useCROSearchStore(useShallow(recommendationsSelector))
    const { initialized: notificationsInitialized, notifications, addNotification, setNotificationsViewed } = useNotificationsStore(useShallow(notificationsSelector))
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)
    const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
    const [fetchedAssets, setFetchedAssets] = useState<Asset[]>([])
    const [fetchedRFPs, setFetchedRFPs] = useState<RFP[]>([])
    const [tab, setTab] = useState<"edit" | "recommendations">("edit")

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            nodeType: milestoneData?.nodeType || "PROJECT",
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            types: ((milestoneData?.types || []).map((type: any) => type.milestoneType) || []),
            otherTypeDetails: milestoneData?.otherTypeDetails || undefined,
            startDate: milestoneData?.startDate || undefined,
            endDate: milestoneData?.endDate || undefined,
            budget: milestoneData?.budget || undefined,
            attachments: milestoneData?.attachments || undefined,
            status: milestoneData?.status || "PLANNED",
            isPrivate: milestoneData?.private || false,
            contacts: milestoneData?.contacts || undefined,
            openTo: milestoneData?.openTo || [],
            assets: (milestoneData?.assets || []).map((asset: any) => asset.asset) || [],
            rfps: (milestoneData?.rfps || []).map((rfp: any) => rfp.rfp) || [],
            notes: JSON.parse(milestoneData?.notes || "[]") || [],
        }
    })

    const formData = {
        nodeType: form.watch("nodeType"),
        title: form.watch("title"),
        description: form.watch("description"),
        types: form.watch("types"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        startDate: form.watch("startDate"),
        endDate: form.watch("endDate"),
        budget: form.watch("budget"),
        attachments: form.watch("attachments"),
        status: form.watch("status"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        openTo: form.watch("openTo"),
        assets: form.watch("assets"),
        rfps: form.watch("rfps"),
        notes: form.watch("notes")
    }

    const handleMilestoneFormSubmit = async (values: z.infer<typeof editMilestoneForm>) => {
        const {
            nodeType,
            title,
            description,
            types,
            otherTypeDetails,
            startDate,
            endDate,
            budget,
            attachments,
            // tasks,
            status,
            isPrivate,
            contacts,
            openTo,
            assets,
            rfps,
            notes
        } = values;

        console.log(`types`, types)
        console.log(`assets`, assets)
        console.log(`rfps`, rfps)

        const updateData: Milestone = {
            ...milestoneData,
            nodeType,
            title,
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(startDate ? {startDate} : undefined),
            ...(endDate ? {endDate} : undefined),
            ...(budget ? {budget} : undefined),
            ...(attachments ? {attachments} : undefined),
            types: (types || []).map((type) => {
                return ({ 
                    milestoneId: milestoneData.id,
                    milestoneTypeId: type.id,
                    milestoneType: type
                })  
            }).filter((type) => type !== undefined),
            ...(otherTypeDetails !== undefined && otherTypeDetails !== null ? {otherTypeDetails} : undefined),
            status,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            ...(contacts ? {contacts} : undefined),
            ...(openTo ? {openTo} : undefined),
            assets: (assets || []).map((asset) => {
                return ({
                    milestoneId: milestoneData.id,
                    assetId: asset.id,
                    asset: asset
                })
            }).filter((asset) => asset !== undefined),
            rfps: (rfps || []).map((rfp) => {
                return ({
                    milestoneId: milestoneData.id,
                    rfpId: rfp.id,
                    rfp: rfp
                })
            }).filter((rfp) => rfp !== undefined),
            ...(notes !== undefined && notes !== null ? {notes: JSON.stringify(notes)}: undefined)
        }

        if (milestoneData?.nodeId) setMilestone(milestoneData.nodeId, updateData)

        // update recommendations
        if (milestoneData) {
            await setRecommendations([{
                ...milestoneData,
                ...updateData
            } as Milestone], {limit: 3})
        }

        // Mixpanel tracking for "Other" field
        // only send to mixpanel if the details explaining the 'other' type have been updated
        if (otherTypeDetails && otherTypeDetails !== milestoneData?.otherTypeDetails && session?.user.organizationId) {
            const response = await getOrganizationFromOrganizationId(session?.user.organizationId)

            mixpanel.track("Milestone has other type", {
                orgName: response?.data?.name || "Unknown Org",
                milestoneTitle: title,
                milestoneType: otherTypeDetails,
            });
        }

        // toast('Success!', {
        //     position: "bottom-left",
        //     description: 'The changes to your milestone have been successfully saved.'
        // })
        setIsMigrating(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        // Prevent form submission if Enter is pressed inside an input
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault()
        }
    }

    const handleMilestoneFormSubmitCallback = useCallback(
        handleMilestoneFormSubmit, 
        [milestoneData, session?.user.organizationId, setMilestone, setRecommendations, milestoneTypes]
    )

    // memo ensures we're not creating a new debounce every time this is called
    const debounceUpdates = useMemo(() => 
        debounce((updatedValues) => handleMilestoneFormSubmitCallback(updatedValues), 500), 
        [handleMilestoneFormSubmitCallback]
    )

    // Initialization - Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {
                const response = await getOrganizationFromOrganizationId(session.user.organizationId)
                if (response.success && response.data) {
                    setOrgIsPublished(response.data.published)
                }

                const assetsResponse = await getAssets(session.user.organizationId)
                if (assetsResponse.success && assetsResponse.data) {
                    // setFetchedAssets((assetsResponse.data || []).map(asset => ({label: asset.title, value: asset.id})))
                    setFetchedAssets(assetsResponse.data || [])
                }

                const rfpsResponse = await getRFPs(session.user.organizationId)
                if (rfpsResponse.success && rfpsResponse.data) {
                    // setFetchedRFPs((rfpsResponse.data || []).map(rfp => ({label: rfp.title, value: rfp.id})))
                    setFetchedRFPs(rfpsResponse.data || [])
                }
            }

            // get milestone types from database
            const response = await getMilestoneTypes()
            if (response.success && response.data) {
                setMilestoneTypes(response.data || [])
            }

            if (milestoneData) {
                await setRecommendations([milestoneData as Milestone], { limit: 3 })
            }

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // when switching to recommendations tab, set notifications as viewed
    useEffect(() => {
        if (tab === "recommendations") {
            const relevantNotifications = recommendations?.map(({content, milestone}) => (
                notifications.find((notification: any) => (
                    notification.type === "NEW_RECOMMENDATION" &&
                    notification.metadata?.companyId === content.id &&
                    notification.metadata?.milestoneId === milestone.id && 
                    notification.lastViewed
                ))
            )).filter(n => n !== undefined) || []
            if (relevantNotifications.length > 0) setNotificationsViewed(relevantNotifications)
        }
    }, [tab, notifications, recommendations, setNotificationsViewed])

    useEffect(() => {
        const setupNotifications = async () => {
            if (!initializing.current && notificationsInitialized) {
                // if is initialized, set up the notifications for new recommendations
                // Copy the notifications to avoid mutating the original array
                let localNotifications: Partial<PlatformNotification>[] = [...notifications]
                for (const recommendation of (recommendations || [])) {
                    
                    const exists = localNotifications
                                    .filter((notification: any) => (
                                        notification.type === "NEW_RECOMMENDATION" && 
                                        notification.metadata?.milestoneId === recommendation.milestone.id && 
                                        notification.metadata?.companyId === recommendation.content.id
                                    )).length > 0

                    console.log(`notifications exist`, exists)
            
                    if (!exists) {
                        console.log(`notifications`, localNotifications);
                        console.log(
                            `ADD NOTIFICATION`,
                            `New recommendation: ${recommendation.content.title} for milestone ${recommendation.milestone.title}`
                        );

                        const notificationData = {
                            type: "NEW_RECOMMENDATION",
                            title: `New recommendation: ${recommendation.content.title} for milestone ${recommendation.milestone.title}`,
                            metadata: {
                                milestoneId: recommendation.milestone.id,
                                companyId: recommendation.content.id,
                            },
                        }
                        await addNotification(notificationData)
                        localNotifications = localNotifications.concat([notificationData])
                    }
                }
            }
        }

        setupNotifications()
    // missing dependencies disabled - we only want to run this once on shortly after the notifications are initialized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recommendations, notificationsInitialized, addNotification])

    // Watch form changes, don't watch while initializing
    useEffect(() => {
        const subscription = form.watch((values) => debounceUpdates(values))
        return () => subscription.unsubscribe();
    }, [form.watch, debounceUpdates, form])

    return (
        <Form {...form}>
            <ScrollArea className="research-plan-tour-step3 px-8 pb-4 h-full">
                <form
                    onKeyDown={handleKeyDown}
                    onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}
                    className="flex flex-col gap-4 mt-2 px-1"
                >
                    <Button className="absolute top-0 right-0 mx-4 my-2" variant="secondary" onClick={(e) => {
                        e.preventDefault()
                        onClose()
                    }}>
                        <X />
                    </Button>

                    <EditTitle form={form}/>

                    <Tabs value={tab} onValueChange={(value) => setTab(value as "edit" | "recommendations")} className="space-y-4 w-full h-full">
                        <div className="flex gap-4 items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="edit">
                                    Edit
                                </TabsTrigger>
                                <TabsTrigger className="relative" value="recommendations">
                                    Marketplace recommendations
                                    {
                                        notifications && 
                                        notifications
                                            .filter((notification: any) => (
                                                notification.type === "NEW_RECOMMENDATION" && 
                                                notification.metadata?.milestoneId === milestoneData.id && 
                                                (recommendations || []).map(rec => rec.content.id).includes(notification.metadata?.companyId) &&
                                                !notification.lastViewedAt
                                            )).length > 0 && 
                                        <NotificationBubble />
                                    }
                                </TabsTrigger>
                            </TabsList>
                            {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="font-semibold h-8 text-sm flex justify-center gap-2 border-none text-blue-dark bg-blue-light hover:bg-blue-light rounded-full">
                                        {formData.nodeType === "ASSET" && (
                                            <>
                                                <Star />
                                                {"Asset"}
                                            </>
                                        )}
                                        {formData.nodeType === "PROJECT" && (
                                            <>
                                                <FileText />
                                                {"Project"}
                                            </>
                                        )}
                                        {formData.nodeType === "RFP" && (
                                            <>
                                                <Megaphone />
                                                {"RFP"}
                                            </>
                                        )}
                                        <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <FormField 
                                        control={form.control}
                                        name="nodeType"
                                        render={({field}) => (
                                            <>
                                            {field.value !== "ASSET" && (
                                                <DropdownMenuItem
                                                    onSelect={async (e) => {
                                                        setIsMigrating(true)
                                                        await sleep(1000)
                                                        field.onChange("ASSET")
                                                        setIsMigrating(false)
                                                    }}
                                                >
                                                    <TypeBadge type="ASSET" iconOnly={true} className="w-8"/>
                                                    Migrate to asset
                                                    <Tooltip>
                                                        <TooltipTrigger className="ml-auto">
                                                            <Info className="h-4 w-4"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80 text-wrap text-left">
                                                            {NODE_TYPE_OPTIONS.find(option => option.value === "ASSET")?.description}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </DropdownMenuItem>
                                            )}
                                            {field.value !== "PROJECT" && (
                                                <DropdownMenuItem
                                                    onSelect={async (e) => {
                                                        setIsMigrating(true)
                                                        await sleep(1000)
                                                        field.onChange("PROJECT")
                                                        setIsMigrating(false)
                                                    }}
                                                >
                                                    <TypeBadge type="PROJECT" iconOnly={true} className="w-8"/>
                                                    Migrate to project
                                                    <Tooltip>
                                                        <TooltipTrigger className="ml-auto">
                                                            <Info className="h-4 w-4"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80 text-wrap text-left">
                                                            {NODE_TYPE_OPTIONS.find(option => option.value === "PROJECT")?.description}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </DropdownMenuItem>
                                            )}
                                            {field.value !== "RFP" && (
                                                <DropdownMenuItem
                                                    onSelect={async (e) => {
                                                        setIsMigrating(true)
                                                        await sleep(1000)
                                                        field.onChange("RFP")
                                                        setIsMigrating(false)
                                                    }}
                                                >
                                                    <TypeBadge type="RFP" iconOnly={true} className="w-8"/>
                                                    Migrate to RFP
                                                    <Tooltip>
                                                        <TooltipTrigger className="ml-auto">
                                                            <Info className="h-4 w-4"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80 text-wrap text-left">
                                                            {NODE_TYPE_OPTIONS.find(option => option.value === "RFP")?.description}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </DropdownMenuItem>
                                            )}
                                            </>
                                        )}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu> */}
                        </div>
                        {isMigrating ? (
                            <Loading />
                        ): (
                            <>
                            <TabsContent value="edit" className="space-y-6 w-full h-full">
                                {/* <FormItem>

                                <FormItem className="w-full grid grid-cols-[180px_auto] gap-x-2 items-center">
                                    <FormLabel className="text-md mt-2">Visibility</FormLabel>
                                    <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({field}) => (
                                        <FormItem className="w-full grid grid-cols-[180px_auto] gap-x-2 items-start">
                                            <FormLabel className="text-md mt-2">
                                                {`Description`}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    id="description"
                                                    placeholder={`Enter a description...`}
                                                    // defaultValue={field.value}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <div className="w-full grid grid-cols-[180px_auto] gap-x-2 items-center">
                                    <div>
                                    <FormLabel className="text-md mt-2">{`Milestone Type`}</FormLabel>
                                    {formData?.types?.length === 3 && <FormDescription className="text-sm text-gray-500">{`Maximum selection is 3 types.`}</FormDescription>}
                                    </div>
                                    <MilestoneTypeFormField form={form} milestoneTypes={milestoneTypes}/>

                                    {formData.nodeType === "ASSET" && (
                                        <>
                                            <FormLabel className="text-md mt-2">{`Total Cost`}</FormLabel>
                                            <BudgetFormField form={form}/>
                                        </>
                                    )}

                                    {formData.nodeType === "PROJECT" && (
                                        <>
                                            <FormLabel className="text-md mt-2">{`Project Status`}</FormLabel>
                                            <StatusFormField form={form}/>

                                            <FormLabel className="text-md mt-2">{`Budget`}</FormLabel>
                                            <span className="mt-2"><BudgetFormField form={form}/></span>
                                        </>
                                    )}

                                    {formData.nodeType === "RFP" && (
                                        <>
                                            <FormLabel className="text-md mt-2">{`Budget`}</FormLabel>
                                            <BudgetFormField form={form}/>

                                            <FormLabel className="text-md mt-2">{`Open To`}</FormLabel>
                                            <OpenToFormField form={form}/>
                                        </>
                                    )}
                                </div>

                                {formData.nodeType === "PROJECT" && (
                                    <TimelineFormField form={form} startLabel={"Start Date"} endLabel={"End Date"}/>
                                )}

                                {formData.nodeType === "RFP" && (
                                    <TimelineFormField form={form} startLabel={"Request Opens"}
                                                    endLabel={"Deadline for Proposals"}/>
                                )}
                                </FormItem> */}

                                <div className="w-full grid grid-cols-[100px_auto] gap-x-2 items-center">
                                    <FormLabel>Visibility</FormLabel>
                                    <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>

                                    <FormLabel >{`Description`}</FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormControl className="mt-2">
                                                <Textarea
                                                    id="description"
                                                    placeholder={`Enter a description...`}
                                                    {...field}
                                                />
                                            </FormControl>
                                        )}
                                    />

                                    <div>
                                        <FormLabel>{`Project Type`}</FormLabel>
                                        {formData?.types?.length === 3 && <FormDescription>{`Maximum selection is 3 types.`}</FormDescription>}
                                    </div>
                                    <MilestoneTypeFormField form={form} milestoneTypes={milestoneTypes}/>

                                    <FormLabel>{`Project Status`}</FormLabel>
                                    <StatusFormField form={form}/>

                                    <FormLabel>{`Budget`}</FormLabel>
                                    <BudgetFormField form={form}/>

                                    <TimelineFormField form={form} startLabel={"Start Date"} endLabel={"End Date"}/>

                                    <FormLabel>Linked Assets</FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="assets"
                                        render={({field}) => (
                                            <FormItem className="w-full mt-2">
                                                <FormControl>
                                                    <MultipleSelector
                                                        value={field.value?.map(asset => ({...asset, value: asset.id, label: asset.title}))}
                                                        onChange={field.onChange}
                                                        defaultOptions={fetchedAssets.map(asset => ({...asset, value: asset.id, label: asset.title} as Option))}
                                                        options={fetchedAssets.map(asset => ({...asset, value: asset.id, label: asset.title} as Option))}
                                                        hidePlaceholderWhenSelected={true}
                                                        showHoverCard={false}
                                                        placeholder="Link assets"
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

                                    <FormLabel>Linked RFPs</FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="rfps"
                                        render={({field}) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <MultipleSelector
                                                        value={field.value?.map(rfp => ({...rfp, value: rfp.id, label: rfp.title}))}
                                                        onChange={field.onChange}
                                                        defaultOptions={fetchedRFPs.map(rfp => ({...rfp, value: rfp.id, label: rfp.title} as any))}
                                                        options={fetchedRFPs.map(rfp => ({...rfp, value: rfp.id, label: rfp.title} as any))}
                                                        hidePlaceholderWhenSelected={true}
                                                        showHoverCard={false}
                                                        placeholder="Link RFPs"
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
                                </div>

                                <ContactsFormField form={form}/>

                                <AttachmentsFormField form={form}/>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({field}) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="flex gap-2 items-center">
                                                {`Notes`}
                                                <PrivateBadge className="font-normal text-gray-500" iconOnly={true}/>
                                            </FormLabel>
                                            <FormDescription>
                                                {`Add any internal notes about this project. Notes are always private, and will never be shown on your profile.`}
                                            </FormDescription>
                                            <FormControl>
                                                <div className="w-full col-span-2" data-registry="plate">
                                                        <PlateEditor
                                                            value={field.value ?? []}
                                                            onChange={field.onChange}
                                                        />
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <span className="h-8" />

                                <span className="flex justify-end gap-4 flex-wrap absolute bottom-2 right-0 m-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="destructive">
                                                Delete Milestone
                                            </Button>
                                        </DialogTrigger>
                                        <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
                                    </Dialog>
                                    <Button
                                        id="edit-milestone-scroll-area"
                                        className="research-plan-tour-step4"
                                        onClick={() => {
                                            handleMilestoneFormSubmit(form.getValues())
                                            onClose()
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </span>
                            </TabsContent>
                            <TabsContent value="recommendations" className="space-y-4 w-full">
                                {!recommendations && (
                                    <Loading />
                                )}
                                
                                {(recommendations && recommendations.length === 0) && (
                                    <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
                                        <CardContent className="flex flex-col gap-4 p-4">
                                            <h2 className="text-xl">{`Sorry, we don't have any recommendations for this milestone`}</h2>
                                            <div className="flex justify-center">
                                                <Image
                                                    alt="No recommendations"
                                                    src="https://illustrations.popsy.co/gray/team-idea.svg"
                                                    width={300}
                                                    height={300}
                                                    className="dark:hidden"
                                                />
                                                <Image
                                                    alt="No recommendations"
                                                    src="https://illustrations.popsy.co/gray/team-idea.svg"
                                                    width={300}
                                                    height={300}
                                                    className="hidden dark:block"
                                                />
                                            </div>
                                            <p className="text-md">
                                                {`Please add more information to your milestone to generate some recommendations.`}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {recommendations && recommendations.length > 0 && (
                                    <>
                                        <div className={cn("w-full grid gap-4 grid-cols-1")}>
                                            {(recommendations || []).map((result: Recommendation, index) => (
                                                // <CRORecommendationCard cro={result.content} key={index} milestone={result.milestone} />
                                                <CROMarketplaceCard cro={result.content} key={index} />
                                            ))}
                                        </div>
                                    </>
                                )}

                                <Link href={`/app/marketplace/cro?milestone=${milestoneData.id}&expanded=true`}>
                                    <Button className="pl-0" variant={"link"}>
                                        <Store />
                                        Explore Marketplace
                                    </Button>
                                </Link>
                            </TabsContent>
                            </>
                        )}
                    </Tabs>
                </form>
            </ScrollArea>
        </Form>
    )
}

export const MilestoneTypeFormField = ({form, milestoneTypes}: { form: any, milestoneTypes: any[] }) => {
    const types = form.watch("types")

    return (
        <>
            <FormField
                control={form.control}
                name="types"
                render={({field}) => (
                    <FormItem className="w-full mt-2">
                        <FormControl>
                            <MultipleSelector
                                {...field}
                                maxSelected={3}
                                defaultOptions={milestoneTypes.map(type => ({...type, value: type.id}))}
                                options={milestoneTypes.map(type => ({...type, value: type.id}))}
                                hidePlaceholderWhenSelected={true}
                                showHoverCard={false}
                                placeholder="Project type"
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

            {types.map((type: any) => type?.value).includes("OTHER") && (
                <>
                    <div>
                        <FormLabel className="text-md">{`Type Description`}</FormLabel>
                        <FormDescription>{`This will be used to improve the platform.`}</FormDescription>
                    </div>
                    <FormField
                        control={form.control}
                        name="otherTypeDetails"
                        render={({field}) => (
                            <FormItem className="flex flex-col grow">
                                <FormControl>
                                    <Textarea
                                        id="otherTypeDetails"
                                        placeholder={`Please enter a short description of your project type.`}
                                        // defaultValue={field.value}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </>
            )}
        </>
    )
}

export const PrivatePublicFormField = ({form, formData, disabled = false}: { form: any, formData: any, disabled?: boolean }) => {
    return (
        <FormField
            control={form.control}
            name="isPrivate"
            render={({field}) => (
                <span className="h-full items-center flex flex-row justify-end gap-4">
                    <FormControl>
                     <Tooltip disableHoverableContent={disabled}>
                        <TooltipTrigger disabled={disabled} asChild>
                            <RadioGroup
                                onValueChange={(value)=> {
                                    form.setValue("isPrivate", value === "PRIVATE")
                                }}
                                defaultValue={field.value ? "PRIVATE" : "PUBLIC"}
                                className={cn("flex flex-wrap space-y-0 gap-x-8", disabled ? "opacity-50": "")}
                                disabled={disabled}
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <span className="flex gap-2">
                                            <RadioGroupItem value="PRIVATE" />
                                            <Tooltip disableHoverableContent={disabled}>
                                                <TooltipTrigger disabled={disabled} asChild>
                                                    <FormLabel className="font-normal flex gap-1 items-center">
                                                        <Lock className="h-4 w-4"/>
                                                        {`Private`}
                                                    </FormLabel>
                                                </TooltipTrigger>
                                                {!disabled && (
                                                    <TooltipContent className="max-w-80 text-wrap text-left">
                                                        {`Private milestones are only visible to your team.`}
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </span>
                                    </FormControl>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <span className="flex gap-2">
                                            <RadioGroupItem value="PUBLIC" />
                                            <Tooltip disableHoverableContent={disabled}>
                                            <TooltipTrigger disabled={disabled} asChild>
                                                <FormLabel className="font-normal flex gap-1 items-center">
                                                    <Globe className="h-4 w-4"/>
                                                    {`Public`}
                                                </FormLabel>
                                            </TooltipTrigger>
                                            {!disabled && (
                                                <TooltipContent className="max-w-80 text-wrap text-left">
                                                    {`Public milestones are visible on your profile and discoverable in the marketplace.`}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                        </span>
                                    </FormControl>
                                </FormItem>
                            </RadioGroup>
                        </TooltipTrigger>
                        {disabled && (
                            <TooltipContent className="max-w-80 text-wrap text-left">
                                {`Publish your organization to create public milestones.`}
                            </TooltipContent>
                        )}
                    </Tooltip>
                    </FormControl>
                    <FormMessage/>
                </span>
            )}
        />
    )
}

export const StatusFormField = ({form}: { form: any }) => {
    return (
        <FormField
            control={form.control}
            name="status"
            render={({field}) => (
                <FormItem className="h-full flex items-center justify-end gap-4">
                    <FormControl>
                        <StatusButton
                            className="h-[40px] w-full"
                            status={
                                field?.value as StatusType
                            }
                            onStatusChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export const BudgetFormField = ({form}: { form: any }) => {
    return (
        <MoneyInput
            form={form}
            name="budget"
        />
    )
}

export const TimelineFormField = ({
                               form,
                               startLabel,
                               endLabel
                           }: {
    form: any,
    startLabel?: string,
    endLabel?: string
}) => {
    return (
        <>
            <FormLabel>{startLabel ? startLabel : `Start`}</FormLabel>
            <FormField
                control={form.control}
                name="startDate"
                render={({field}) => (
                    <div className="flex gap-2 mt-2">
                        <Select
                            defaultValue={field.value ? monthsList[new Date(field.value).getMonth()] : undefined}
                            onValueChange={(value) => {
                                const previousStartDate: Date = field.value ? new Date(field.value) : new Date()
                                const monthIndex = monthsList.indexOf(value)
                                const newStartDate: Date = new Date(previousStartDate.setMonth(monthIndex))
                                form.setValue('startDate', newStartDate)
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="h-[32px]">
                                    <SelectValue placeholder="Month"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {monthsList.map(
                                    (
                                        month: string,
                                        index: number
                                    ) => (
                                        <SelectItem
                                            value={month}
                                            key={index}
                                        >
                                            {month}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Year"
                            maxLength={4}
                            defaultValue={field.value ? new Date(field.value).getFullYear() : undefined}
                            onChange={(event) => {
                                const previousStartDate: Date = field.value ? new Date(field.value) : new Date()
                                const newStartDate: Date = new Date(previousStartDate.setFullYear(JSON.parse(event.target.value || new Date().getFullYear().toString())))
                                form.setValue('startDate', newStartDate)
                            }}
                        />
                    </div>
                )}
            />

            <FormLabel>{endLabel ? endLabel : `End`}</FormLabel>
            <FormField
                control={form.control}
                name="endDate"
                render={({field}) => (
                    <div className="flex gap-2 mt-2">
                        <Select
                            defaultValue={field.value ? monthsList[new Date(field.value).getMonth()] : undefined}
                            onValueChange={(value) => {
                                const previousEndDate: Date = field.value ? new Date(field.value) : new Date()
                                const monthIndex = monthsList.indexOf(value)
                                const newEndDate: Date = new Date(previousEndDate.setMonth(monthIndex))
                                form.setValue('endDate', newEndDate)
                            }}
                        >
                            <FormControl>
                                <SelectTrigger className="h-[32px]">
                                    <SelectValue placeholder="Month"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {monthsList.map(
                                    (
                                        month: string,
                                        index: number
                                    ) => (
                                        <SelectItem
                                            value={month}
                                            key={index}
                                        >
                                            {month}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Year"
                            maxLength={4}
                            defaultValue={field.value ? new Date(field.value).getFullYear() : undefined}
                            onChange={(event) => {
                                const previousEndDate: Date = field.value ? new Date(field.value) : new Date()
                                const newEndDate: Date = new Date(previousEndDate.setFullYear(JSON.parse(event.target.value || new Date().getFullYear().toString())))
                                form.setValue('endDate', newEndDate)
                            }}
                        />
                    </div>
                )}
            />
            <FormMessage/>
        </>
    )
}

export const StartDateFormField = ({form}: { form: any }) => {
    return (
        <FormField
            control={form.control}
            name="startDate"
            render={({field}) => (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                        >
                            <Calendar className="mr-2"/>
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
            )}
        />
    )
}

export const OpenToFormField = ({form}: { form: any }) => {
    return (
        <FormField
            control={form.control}
            name="openTo"
            render={({field}) => (
                <FormItem>
                    <FormLabel >{`Open to`}</FormLabel>
                    <FormDescription>{`Specify which parties you wish to source proposals from.`}</FormDescription>
                    <FormControl>
                        <ToggleGroup
                            type="multiple"
                            variant="outline"
                            value={field.value}
                            onValueChange={
                                field.onChange
                            }
                            className="w-fit flex flex-wrap gap-2 justify-start mt-2"
                        >
                            {RFP_OPEN_TO_TYPE_OPTIONS.map(type => (
                                <ToggleGroupItem
                                    key={type.value}
                                    value={type.value}
                                >
                                    {type.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export function AttachmentsFormField({form}: { form: UseFormReturn<any>}) {
    return (
        <FormField
            control={form.control}
            name="attachments"
            render={({field}) => (
                <FormItem className="flex flex-col grow">
                    <FormControl>
                        <>
                            <div className="flex flex-row justify-between gap-2 items-center">
                                <div>
                                    <FormLabel>{`Links`}</FormLabel>
                                    <FormDescription>{`Add any links that are not on the Comend platform.`}</FormDescription>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button
                                            size={"icon"}
                                            variant="secondary"
                                            onClick={(e: any) => {
                                                e.preventDefault()
                                                form.setValue("attachments", [
                                                    ...(field?.value || []),
                                                    {name: '', link: ''}
                                                ])
                                            }}
                                        >
                                            <Plus />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                        {`Add a link`}
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {field.value && field.value.length > 0 && (
                                <ol className="flex flex-col gap-2">
                                    {field.value.map((paper: AttachmentType, index: number) => (
                                        <ExternalAttachmentField
                                            key={index}
                                            index={index}
                                            value={paper}
                                            onDelete={() => {
                                                form.setValue(
                                                    "attachments",
                                                    field?.value?.filter((t: AttachmentType, i: number) => i !== index)
                                                )
                                            }}
                                            onValueChange={newValue => {
                                                form.setValue(
                                                    "attachments",
                                                    field?.value?.map((currentValue: AttachmentType, i: number) => i === index ? newValue : currentValue)
                                                )
                                            }}
                                        />
                                    ))}
                                </ol>
                            )}
                        </>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export const ContactsFormField = ({form}: { form: any }) => {
    return (
        <FormField
            control={form.control}
            name="contacts"
            render={({field}) => (
                <FormItem>
                    <div className="flex flex-row justify-between gap-2 items-center">
                        <div className="flex flex-col">
                        <FormLabel>{`Contacts`}</FormLabel>
                        <FormDescription>{`Add any external contacts that are not on the Comend platform.`}</FormDescription>
                        </div>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="secondary"
                                    size={"icon"}
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault()
                                        form.setValue("contacts", [
                                            ...(field.value || []),
                                            {name: "", email: "", role: null}
                                        ])
                                    }}
                                >
                                    <Plus />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                {`Add a contact`}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {field?.value && field.value.length > 0 && (
                        <ol className="flex flex-col gap-4">
                            {field.value.map((contact: ContactType, index: number) => (
                                <ExternalContactField
                                    key={index}
                                    index={index}
                                    value={contact}
                                    onDelete={() => {
                                        form.setValue(
                                            "contacts",
                                            field?.value?.filter((t: ContactType, i: number) => i !== index)
                                        )
                                    }}
                                    onValueChange={newValue => {
                                        form.setValue(
                                            "contacts",
                                            field?.value?.map((currentValue: ContactType, i: number) => i === index ? newValue : currentValue)
                                        )
                                    }}
                                />
                            ))}
                        </ol>
                    )}

                </FormItem>
            )}
        />
    )
}

export const EditTitle = ({form}: { form: any }) => {
    // const contentRef = useRef<HTMLHeadingElement>(null);

    // const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    //     const selection = window.getSelection();
    //     const range = selection?.getRangeAt(0);
    //     const cursorPosition = range ? range.startOffset : 0;

    //     // Update the form value without causing a re-render
    //     form.setValue("title", e.currentTarget.textContent || "");

    //     // Restore cursor position
    //     if (range && selection) {
    //         setTimeout(() => {
    //             const newRange = document.createRange();
    //             newRange.setStart(contentRef.current!.childNodes[0], cursorPosition);
    //             newRange.collapse(true);
    //             selection.removeAllRanges();
    //             selection.addRange(newRange);
    //         }, 0);
    //     }
    // };

    return (
        <FormField
            control={form.control}
            name="title"
            render={({field}) => (
                <FormItem className="flex flex-col grow mr-10">
                    <FormControl>
                        <AutosizeTextarea
                            className="overflow-hidden font-semibold text-xl"
                            id="title"
                            placeholder={`Enter a title`}
                            defaultValue={field.value}
                            onChange={field.onChange}
                        />
                        {/* <span
                            className="flex flex-row gap-2 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <h1
                                id="title"
                                ref={contentRef}
                                className="text-3xl font-semibold w-full h-full focus:outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={handleInput}
                            >
                                {field.value}
                            </h1>
                        </span> */}
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
};