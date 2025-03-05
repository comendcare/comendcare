"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useCallback, useEffect, useRef, useState} from "react"
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
import {FaCalendar, FaGlobe, FaLock, FaX} from "react-icons/fa6"
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
import {MILESTONE_TYPE_OPTIONS, NODE_TYPE_OPTIONS, RFP_OPEN_TO_TYPE_OPTIONS, StatusType} from "@/lib/types"
import {Prisma} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers"
import mixpanel from "mixpanel-browser"
import {useSession} from "next-auth/react"
import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group"
import {ExternalContactField} from "./external-contact-field"
import {ExternalAttachmentField} from "./external-attachment-field"
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover"
import {cn} from "@/lib/utils"
import {format} from "date-fns"
import {Calendar} from "./ui/calendar"
import {FaInfoCircle} from "react-icons/fa";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import MoneyInput from "@/components/money-input";
import MultipleSelector from "./ui/multiple-selector"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { SettingsProvider } from "./editor/settings"
import { PlateEditor } from "./editor/plate-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { CROMarketplaceCard, CRORecommendationCard } from "./marketplace-cro-card"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    // disable: z.boolean().optional(),
});

const selector = (state: RoadmapState) => ({
    setMilestone: state.setMilestone
})

const recommendationsSelector = (state: CROSearchState) => ({
    recommendations: state.recommendations
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
    types: z.array(optionSchema).optional(),
    otherTypeDetails: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    // startDate: z.object({
    //     month: z.string().optional(),
    //     year: z.string().min(4, "Year must be 4 digits").max(4, "Year must be 4 digits").optional(),
    // }),
    // endDate: z.object({
    //     month: z.string().optional(),
    //     year: z.string().min(4, "Year must be 4 digits").max(4, "Year must be 4 digits").optional()
    // }),
    budget: z.number().max(2147483647).min(0).optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    status: z.string(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.array(z.string()).optional(),
    notes: z.array(z.record(z.any()))
})

export function EditMilestoneForm({
    milestoneData,
    onClose
}: {
    milestoneData: any
    onClose: () => void
}) {
    const {setMilestone} = useRoadmapStore(useShallow(selector))
    const { recommendations } = useCROSearchStore(useShallow(recommendationsSelector))
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            nodeType: milestoneData?.nodeType || milestoneData?.node?.type || "PROJECT",
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            types: (milestoneData?.types || []).map((type: any) => MILESTONE_TYPE_OPTIONS.find(option => option?.value === type) || {
                label: 'Unknown',
                value: "UNKNOWN"
            }),
            otherTypeDetails: milestoneData?.otherTypeDetails || undefined,
            startDate: milestoneData?.startDate,
            endDate: milestoneData?.endDate,
            budget: milestoneData?.budget || undefined,
            attachments: milestoneData?.attachments || undefined,
            status: milestoneData?.status || "PLANNED",
            isPrivate: milestoneData?.private || false,
            contacts: milestoneData?.contacts || undefined,
            openTo: milestoneData?.openTo || [],
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
        notes: form.watch("notes")
    }

    // callback ensures we're not creating a new debounce every time this is called
    const debounceUpdates = useCallback(
        debounce((updatedValues) => handleMilestoneFormSubmit(updatedValues), 500), []
    )

    // Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {
                const response = await getOrganizationFromOrganizationId(session.user.organizationId)
                if (response.success && response.data) {
                    setOrgIsPublished(response.data.published)
                }
            }

            initializing.current = false
        }

        init()
    }, []);

    // Watch form changes, don't watch while initializing
    useEffect(() => {
        const subscription = form.watch((values) => debounceUpdates(values))
        return () => subscription.unsubscribe();
    }, [form.watch])

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
            notes
        } = values;

        setMilestone(milestoneData?.nodeId, {
            nodeType,
            title,
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(startDate ? {startDate} : undefined),
            ...(endDate ? {endDate} : undefined),
            ...(budget ? {budget} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(types ? {types: types.map(t => t?.value)} : undefined),
            ...(otherTypeDetails !== undefined && otherTypeDetails !== null ? {otherTypeDetails} : undefined),
            status,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            ...(contacts ? {contacts} : undefined),
            ...(openTo ? {openTo} : undefined),
            ...(notes !== undefined && notes !== null ? {notes: JSON.stringify(notes)}: undefined)
        })

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
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        // Prevent form submission if Enter is pressed inside an input
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
        }
    };

    return (
        <Form {...form}>
            <ScrollArea className="research-plan-tour-step3 px-8 pb-4">
                <form
                    onKeyDown={handleKeyDown}
                    onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}
                    className="flex flex-col gap-4 mt-2 px-1"
                >
                    <Button className="absolute top-0 right-0 mx-4 my-2" variant="secondary" onClick={(e) => {
                        e.preventDefault()
                        onClose()
                    }}>
                        <FaX/>
                    </Button>

                    <EditTitle form={form}/>

                    <Tabs defaultValue="edit" className="space-y-4 w-full">
                        <TabsList>
                            <TabsTrigger value="edit">
                                Edit
                            </TabsTrigger>
                            <TabsTrigger value="recommendations">
                                Recommendations
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="space-y-4 w-full">
                            <FormItem>
                            {/* <FormField
                                control={form.control}
                                name="nodeType"
                                render={({field}) => (
                                    <FormItem className="flex flex-row items-center justify-between gap-4 flex-wrap grow">
                                        <FormControl>
                                            <ToggleGroup
                                                type="single"
                                                variant="outline"
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    if (value) {
                                                        field.onChange(value)
                                                    }
                                                }}
                                                className="w-full flex flex-wrap gap-2 justify-between"
                                            >
                                                {NODE_TYPE_OPTIONS.map(({label, value, description}) => (
                                                    <ToggleGroupItem
                                                        key={value}
                                                        value={value}
                                                        className={"text-md grow flex gap-2"}
                                                    >
                                                        {label}
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <FaInfoCircle/>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-80 text-wrap text-left">
                                                                {description}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            /> */}

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
                                                defaultValue={field.value}
                                                {...field}
                                                className="border-transparent hover:border-input"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormItem className="w-full grid grid-cols-[180px_auto] gap-x-4 items-center">
                                <div>
                                <FormLabel className="text-md mt-2">{`Milestone Type`}</FormLabel>
                                {formData?.types?.length === 3 && <FormDescription className="text-sm text-gray-500">{`Maximum selection is 3 types.`}</FormDescription>}
                                </div>
                                <MilestoneTypeFormField form={form}/>

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
                                        <BudgetFormField form={form}/>
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
                            </FormItem>

                            {formData.nodeType === "PROJECT" && (
                                <TimelineFormField form={form} startLabel={"Start Date"} endLabel={"End Date"}/>
                            )}

                            {formData.nodeType === "RFP" && (
                                <TimelineFormField form={form} startLabel={"Request Opens"}
                                                endLabel={"Deadline for Proposals"}/>
                            )}
                            </FormItem>

                            <ContactsFormField form={form}/>

                            <AttachmentsFormField
                                form={form}
                                attachments={formData.attachments as AttachmentType[]}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({field}) => (
                                    <FormItem className="w-full grid grid-cols-[180px_auto] gap-x-2 items-start">
                                        <FormLabel
                                            className="h-full text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
                                        >
                                            {`Notes`}
                                            <PrivateBadge className="font-normal text-gray-500" iconOnly={true}/>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="w-full col-span-2" data-registry="plate">
                                                <SettingsProvider>
                                                    <PlateEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </SettingsProvider>
                                            </div>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </TabsContent>
                        <TabsContent value="recommendations" className="space-y-4 w-full">
                            {(!recommendations || recommendations.length === 0) && (
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
                                        {(recommendations || []).map((result, index) => (
                                            // <CRORecommendationCard cro={result.content} key={index} milestone={result.milestone} />
                                            <CROMarketplaceCard cro={result.content} key={index} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>

                    <span className="h-8" />

                    <span className="flex justify-end gap-4 flex-wrap absolute bottom-0 right-0 mx-4 my-2">
                        <Dialog>
                            <DialogTrigger>
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
                </form>
            </ScrollArea>
        </Form>
    )
}

const MilestoneTypeFormField = ({form}: { form: any }) => {
    const types = form.watch("types")

    return (
        <>
            <FormField
                control={form.control}
                name="types"
                render={({field}) => (
                    <FormItem className="w-full">
                        <FormControl>
                            <MultipleSelector
                                {...field}
                                maxSelected={3}
                                defaultOptions={MILESTONE_TYPE_OPTIONS}
                                options={MILESTONE_TYPE_OPTIONS}
                                hidePlaceholderWhenSelected={true}
                                showHoverCard={false}
                                placeholder="Milestone type"
                                className="border-transparent hover:border-input"
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

            {types.map((type: any) => type.value).includes("OTHER") && (
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
                                        placeholder={`Please enter a short description of your milestone type.`}
                                        defaultValue={field.value}
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

const PrivatePublicFormField = ({form, formData, disabled = false}: { form: any, formData: any, disabled?: boolean }) => {
    return (
        <FormField
            control={form.control}
            name="isPrivate"
            render={({field}) => (
                <span className="h-full items-center flex flex-row justify-end gap-4">
                    <FormControl>
                     <Tooltip disableHoverableContent={disabled}>
                        <TooltipTrigger disabled={disabled}>
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
                                        <Tooltip disableHoverableContent={disabled}>
                                            <TooltipTrigger disabled={disabled}>
                                                <span className="flex gap-2">
                                                    <RadioGroupItem value="PRIVATE" />
                                                    <FormLabel className="font-normal flex gap-1 items-center">
                                                        <FaLock />
                                                        {`Private`}
                                                    </FormLabel>
                                                </span>
                                            </TooltipTrigger>
                                            {!disabled && (
                                                <TooltipContent className="max-w-80 text-wrap text-left">
                                                    {`Private milestones are only visible to your team.`}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </FormControl>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Tooltip disableHoverableContent={disabled}>
                                            <TooltipTrigger disabled={disabled}>
                                                <span className="flex gap-2">
                                                    <RadioGroupItem value="PUBLIC" />
                                                    <FormLabel className="font-normal flex gap-1 items-center">
                                                        <FaGlobe />
                                                        {`Public`}
                                                    </FormLabel>
                                                </span>
                                            </TooltipTrigger>
                                            {!disabled && (
                                                <TooltipContent className="max-w-80 text-wrap text-left">
                                                    {`Public milestones are visible on your profile and discoverable in the marketplace.`}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
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

const StatusFormField = ({form}: { form: any }) => {
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

const BudgetFormField = ({form}: { form: any }) => {
    return (
        <MoneyInput
            className="h-[40px] -mt-2 border-transparent hover:border-input"
            form={form}
            name="budget"
        />
    )
}

const TimelineFormField = ({
                               form,
                               startLabel,
                               endLabel
                           }: {
    form: any,
    startLabel?: string,
    endLabel?: string
}) => {
    return (
        <span className="flex flex-col gap-2 align-center">

            <FormItem
                className="w-full grid grid-rows[auto_auto] grid-cols-[180px_120px_auto] space-y-0 gap-2 items-center">
                <FormLabel className="text-md h-fit w-fit">{startLabel ? startLabel : `Start`}</FormLabel>
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({field}) => (
                        <FormItem className="h-[40px] border-transparent hover:border-input">
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
                                    <SelectTrigger className="h-[40px] border-transparent hover:border-input">
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
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="startDate"
                    render={({field}) => (
                        <FormItem className="h-[40px] border-transparent hover:border-input">
                            <Input
                                className="h-[40px] border-transparent hover:border-input w-fit"
                                placeholder="Year"
                                maxLength={4}
                                defaultValue={field.value ? new Date(field.value).getFullYear() : undefined}
                                onChange={(event) => {
                                    console.log(`start date year`, event.target.value)
                                    const previousStartDate: Date = field.value ? new Date(field.value) : new Date()
                                    const newStartDate: Date = new Date(previousStartDate.setFullYear(JSON.parse(event.target.value || new Date().getFullYear().toString())))
                                    form.setValue('startDate', newStartDate)
                                }}
                            />
                        </FormItem>
                    )}
                />

                <FormLabel className="text-md h-fit w-fit">{endLabel ? endLabel : `End`}</FormLabel>
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({field}) => (
                        <FormItem className="h-[40px] border-transparent hover:border-input">
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
                                    <SelectTrigger className="h-[40px] border-transparent hover:border-input">
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
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="endDate"
                    render={({field}) => (
                        <FormItem className="h-[40px] border-transparent hover:border-input">
                            <Input
                                className="h-[40px] border-transparent hover:border-input w-fit"
                                placeholder="Year"
                                maxLength={4}
                                defaultValue={field.value ? new Date(field.value).getFullYear() : undefined}
                                onChange={(event) => {
                                    console.log(`start date year`, event.target.value)
                                    const previousEndDate: Date = field.value ? new Date(field.value) : new Date()
                                    const newEndDate: Date = new Date(previousEndDate.setFullYear(JSON.parse(event.target.value || new Date().getFullYear().toString())))
                                    form.setValue('endDate', newEndDate)
                                }}
                            />
                        </FormItem>
                    )}
                />
                <FormMessage/>
            </FormItem>
        </span>
    )
}

const StartDateFormField = ({form}: { form: any }) => {
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
                            <FaCalendar className="mr-2 h-4 w-4"/>
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

const OpenToFormField = ({form}: { form: any }) => {
    return (
        <FormField
            control={form.control}
            name="openTo"
            render={({field}) => (
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={field.value}
                    onValueChange={
                        field.onChange
                    }
                    className="w-fit flex flex-wrap gap-2 justify-start"
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
            )}
        />
    )
}

export function AttachmentsFormField({form, attachments}: { form: UseFormReturn<any>, attachments: AttachmentType[] }) {
    return (
        <FormField
            control={form.control}
            name="attachments"
            render={({field}) => (
                <FormItem className="flex flex-col grow">
                    <FormControl>
                        <>
                            <div className="flex flex-row justify-between items-center">
                                <FormLabel className="text-2xl font-semibold leading-none tracking-tight">
                                    {`Links`}
                                </FormLabel>

                                <Button
                                    className="w-fit"
                                    variant="secondary"
                                    onClick={(e: any) => {
                                        e.preventDefault()
                                        form.setValue("attachments", [
                                            ...(field?.value || []),
                                            {name: '', link: ''}
                                        ])
                                    }}
                                >
                                    {`Add a link`}
                                </Button>

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

const ContactsFormField = ({form}: { form: any }) => {
    return (
        <FormField
            control={form.control}
            name="contacts"
            render={({field}) => (
                <FormItem>
                    <div className="flex flex-row justify-between items-center">
                        <FormLabel className="text-2xl font-semibold leading-none tracking-tight">
                            {`Contacts`}
                        </FormLabel>
                        <Button
                            variant="secondary"
                            className="w-fit"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault()
                                form.setValue("contacts", [
                                    ...(field.value || []),
                                    {name: "", email: "", role: null}
                                ])
                            }}
                        >
                            {/* <FaPlus /> */}
                            {`Add a contact`}
                        </Button>
                    </div>

                    {field?.value && field.value.length > 0 && (
                        <ol className="flex flex-col gap-2">
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

const EditTitle = ({form}: { form: any }) => {
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
                            className="overflow-hidden font-semibold text-3xl border-transparent hover:border-input"
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
