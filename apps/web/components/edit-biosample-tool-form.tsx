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
import {Asset, optionSchema} from "@comend/lib/types"
import {Institution, MilestoneType, Prisma, ToolType} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Delete, Pin, Router } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import { ToolState, useToolStore } from "@/state/tool/toolStore"
import { useShallow } from "zustand/react/shallow"
import ProjectMultipleSelector from "./project-multiple-selector"
import { DeleteAssetDialog } from "./delete-asset-dialog"
import { badgeVariants } from "@comend/components/ui/badge"
// import { DeleteAssetDialog } from "./delete-tool-dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { JsonObject } from "@prisma/client/runtime/library"
import type { Option } from "@comend/lib/types"
import { useRouter } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import { Separator } from "@/packages/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/components/ui/select"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

const editAssetForm = z.object({
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
    types: z.array(optionSchema)
        .min(1, "Type is required")
        .max(1, "Max one type"),
    otherTypeDetails: z.string().optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPinned: z.boolean(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional(),

    // biosmaple properties
    institution: z.custom<Institution>().optional(),
    anatomicalSite: z.string().optional(),
    pathology: z.string().optional(),
    preservationMethod: z.string().optional(),
    preservation: z.string().optional(),
    methodOfTransport: z.string().optional(),
    clinicalData: z.string().optional(),
    country: z.string().optional(),
    pmi: z.string().optional(),
    volume: z.number().optional(),
    mass: z.number().optional(),
    area: z.number().optional(),
    repository: z.string().optional(),
    productCode: z.string().optional(),
    priceUSD: z.number().optional(),
    priceGBP: z.number().optional(),
    priceEUR: z.number().optional(),
    premiumGroup: z.string().optional(),
    countryOfCollection: z.string().optional(),
    caseId: z.string().optional(),
    specimenId: z.string().optional(),
    format: z.string().optional(),
    subFormat: z.string().optional(),
    biosampleDiagnosis: z.string().optional(),
    measurement: z.number().optional(),
    significantVariantPositive: z.string().optional(),
    significantVariantWildtype: z.string().optional(),
    fusionPositive: z.string().optional(),
    fusionWildtype: z.string().optional(),
    cnvAbnormal: z.boolean().optional(),
    cnvNormal: z.boolean().optional(),
    hlaType: z.string().optional(),
    icf: z.string().optional(),
    irbLetter: z.string().optional(),
    yearOfExcision: z.number().optional(),
    classifier: z.string().optional(),
    primaryTumorOrgan: z.string().optional(),
    stage: z.string().optional(),
    stageGroup: z.string().optional(),
    serology: z.string().optional(),
    clinicalTestResults: z.string().optional(),
    serumAvailable: z.boolean().optional(),
    plasmaAvailable: z.boolean().optional(),
    wholeBloodAvailable: z.boolean().optional(),
    ffpeTumorAvailable: z.boolean().optional(),
    frozenTumorAvailable: z.boolean().optional(),
    er: z.string().optional(),
    pr: z.string().optional(),
    hercepTest: z.string().optional(),
    matchedPairId: z.string().optional(),
    mirroredPairId: z.string().optional(),

    // donor properties
    age: z.number().optional(),
    sex: z.string().optional(),
    gender: z.string().optional(),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    treatments: z.array(z.string()),
    primaryDiagnosis: z.string().optional(),
    yearOfDeath: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    bmi: z.number().optional(),
    menopausalStatus: z.boolean().optional(),
    ageAtLastMenstualPeriod: z.number().optional(),
    numberOfPregnancies: z.number().optional(),
    numberOfLiveBirths: z.number().optional(),
    smokingStatus: z.boolean().optional(),
    cigarettesPerDay: z.number().optional(),
    alcoholStatus: z.boolean().optional(),
    drinksPerDay: z.number().optional(),
    alcoholDuration: z.number().optional(),
    medications: z.array(z.string()),
    causeOfDeath: z.string().optional(),
    conditionSeverity: z.string().optional(),
})

const toolSelector = (state: ToolState) => ({
    toolTypes: state.toolTypes,
    createTool: state.createTool,
    updateTool: state.updateTool
})

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

export function EditBiosampleToolForm({
    toolData,
    numAssetsPinned,
    closeDialog
}: {
    toolData: Partial<Asset>,
    numAssetsPinned: number,
    closeDialog?: () => void
}) {
    const initializing = useRef(true)
    const router = useRouter()
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const { toolTypes, createTool, updateTool } = useToolStore(useShallow(toolSelector))
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)

    const form = useForm<z.infer<typeof editAssetForm>>({
        mode: "onChange",
        resolver: zodResolver(editAssetForm),
        defaultValues: {
            title: toolData?.title || "",
            description: toolData?.description || "",
            types: toolTypes
                        .filter(type => type.type === 'biosample')
                        .filter(toolType => (toolData?.types || [])
                        .includes(toolType.id))
                        .map(toolType => ({value: toolType.id, label: toolType.label}) as Option),
            otherTypeDetails: typeof toolData?.metadata === 'object' ? (toolData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            attachments: toolData?.attachments || undefined,
            isPinned: toolData?.pinned || false,
            isPrivate: toolData?.private !== undefined ? toolData?.private : true,
            contacts: toolData?.contacts || undefined,
            milestones: (toolData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description"),
        types: form.watch("types"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        attachments: form.watch("attachments"),
        isPinned: form.watch("isPinned"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editAssetForm>) => {
        // console.log(`handle form submit`, values)
        const {
            title,
            description,
            types,
            otherTypeDetails,
            attachments,
            isPinned,
            isPrivate,
            contacts,
            milestones,
        } = values;

        const updateData: Partial<Asset> = {
            ...toolData,
            title,
            types: types.map(type => type.value),
            metadata: {
                ...(toolData?.metadata ? JSON.parse(JSON.stringify(toolData.metadata)) : undefined),
                otherTypeDetails: otherTypeDetails
            } as JsonObject,
            pinned: (!isPrivate && isPinned) || false, // only save pinned if tool is public
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    toolId: toolData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
        }

        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        try {
            if (toolData.id) {
                await updateTool(updateData, session.user.organizationId)
                toast.success(
                    "Tool updated successfully!",
                    {position: "bottom-left"}
                )
                await revalidate("/app/tools/biosample")
                router.refresh()
            } else {
                await createTool(updateData, session.user.organizationId)
                toast.success(
                    "Tool created successfully!",
                    {position: "bottom-left"}
                )
                await revalidate("/app/tools/biosample")
                router.refresh()
            }
            if (closeDialog) closeDialog()
        } catch (error) {
            console.error("Error creating or updating tool:", error);
            toast.error(
                "Failed to create or update tool.",
                {position: "bottom-left"}
            )
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
                    // address1                  String?
                    // address2                  String?
                    // formattedAddress          String?
                    // city                      String?
                    // region                    String?
                    // postalCode                String?
                    // country                   String?
                    // lat                       String?
                    // lng                       String?
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

            // trigger a form validation if we're editing an tool, if the imported data is not valid, let the user know right away
            if (Object.keys(toolData).length > 0) form.trigger()

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Form {...form}>
            <ScrollArea className={"max-h-[80vh] -mr-2 pr-3"} type={"always"}>
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

                    <FormField
                        control={form.control}
                        name="types"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormLabel>{`Type`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={
                                            toolTypes
                                                .filter(type => type.type === 'biosample')
                                                .map(toolType => ({value: toolType.id, label: toolType.label})) as Option[]
                                        }
                                        hidePlaceholderWhenSelected={true}
                                        showHoverCard={false}
                                        placeholder="Select a type..."
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                        groupBy="roadmapTitle"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
        
                    {formData.types.map((type: any) => type?.value).includes("OTHER") && (
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
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    <FormItem className="flex gap-4 items-center">
                        <div className="grow">
                        <FormLabel>Visibility</FormLabel>
                        <FormDescription>
                            {`Private tools will not be shown to people outside of your organization.`}
                        </FormDescription>
                        </div>
                        <div className="w-[90px]">
                        <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                        </div>
                    </FormItem>

                    {formData.isPrivate === false && (
                        <Tooltip>
                            <TooltipTrigger onClick={(e) => e.preventDefault()}>
                                <FormField 
                                    control={form.control}
                                    name="isPinned"
                                    render={({field}) => (
                                        <FormItem className="flex gap-2 items-center text-left">
                                            <div>
                                            <FormLabel>{`Pinned to Profile`}</FormLabel>
                                            <FormDescription>
                                                {`Showcase this Tool at the top of your organization’s Tool section so it's easy to find and stands out.`}
                                            </FormDescription>
                                            </div>
                                            <FormControl className="justify-self-end">
                                                <Button 
                                                    disabled={!toolData.pinned && numAssetsPinned >= 5}
                                                    variant="ghost" 
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        form.setValue("isPinned", !field.value)
                                                    }}
                                                >
                                                    {field.value ? <Pin fill="currentColor"/> : <Pin />}
                                                </Button>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TooltipTrigger>
                            {!toolData.pinned && numAssetsPinned >= 5 && (
                                <TooltipContent className="max-w-[200px]">
                                    <p>{`Pinning is limited to 5 tools. You already have 5 tools pinned. Please unpin another tool before pinning this tool.`}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )}

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full mt-2">
                                <FormLabel >{`Linked Projects`}</FormLabel>
                                <FormControl>
                                    <ProjectMultipleSelector value={field.value} onChange={field.onChange}/>
                                </FormControl>
                                <FormMessage className="text-primary"/>
                            </FormItem>
                        )}
                    />

                    <ContactsFormField form={form} />
                    <AttachmentsFormField form={form} />

                    <Separator className="w-full"/>
                    <h1 className="font-semibold text-md py-0 my-0">Donor Information</h1>
                    <FormField
                        control={form.control}
                        name="age"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[120px]">{`Age`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="-mt-2 w-full">
                                        <Input
                                            id="age"
                                            className="w-full"
                                            placeholder={`Enter a number`}
                                            type="number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sex"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[120px]">{`Sex`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Select>
                                        <SelectTrigger className="-mt-2 w-full h-[32px]">
                                            <SelectValue placeholder="Select a value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Male</SelectItem>
                                            <SelectItem value="F">Female</SelectItem>
                                            <SelectItem value="O">Other</SelectItem>
                                            <SelectItem value="NA">Not Applicable</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[120px]">{`Gender`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Select>
                                        <SelectTrigger className="-mt-2 w-full h-[32px]">
                                            <SelectValue placeholder="Select a value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Male</SelectItem>
                                            <SelectItem value="F">Female</SelectItem>
                                            <SelectItem value="NB">Non-Binary</SelectItem>
                                            <SelectItem value="O">Other</SelectItem>
                                            <SelectItem value="NA">Not Applicable</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="race"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[120px]">{`Race`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Select>
                                        <SelectTrigger className="-mt-2 w-full h-[32px]">
                                            <SelectValue placeholder="Select a value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Male</SelectItem>
                                            <SelectItem value="F">Female</SelectItem>
                                            <SelectItem value="NB">Non-Binary</SelectItem>
                                            <SelectItem value="O">Other</SelectItem>
                                            <SelectItem value="NA">Not Applicable</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ethnicity"
                        render={({field}) => (
                            <FormItem className="w-full flex flex-[120px-auto] gap-4 items-center">
                                <FormLabel>{`Ethnicity`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Select>
                                        <SelectTrigger className="-mt-2 w-full h-[32px]">
                                            <SelectValue placeholder="Select a value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Male</SelectItem>
                                            <SelectItem value="F">Female</SelectItem>
                                            <SelectItem value="NB">Non-Binary</SelectItem>
                                            <SelectItem value="O">Other</SelectItem>
                                            <SelectItem value="NA">Not Applicable</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="height"
                        render={({field}) => (
                            <FormItem className="w-full flex flex-[120px-auto] gap-4 items-center">
                                <FormLabel>{`Height`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="-mt-2 w-full">
                                        <Input
                                            id="height"
                                            className="w-full"
                                            placeholder={`Enter a number`}
                                            type="number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="weight"
                        render={({field}) => (
                            <FormItem className="w-full flex flex-[120px-auto] gap-4 items-center">
                                <FormLabel>{`Weight`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="-mt-2 w-full">
                                        <Input
                                            id="weight"
                                            className="w-full"
                                            placeholder={`Enter a number`}
                                            type="number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bmi"
                        render={({field}) => (
                            <FormItem className="w-full flex flex-[120px-auto] gap-4 items-center">
                                <FormLabel>{`BMI`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="-mt-2 w-full">
                                        <Input
                                            id="bmi"
                                            className="w-full"
                                            placeholder={`Enter a number`}
                                            type="number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <span className="flex gap-2 w-full justify-end">
                        <DialogClose asChild>
                            <Button 
                                variant={"secondary"} 
                                onClick={() => {if (closeDialog) closeDialog()}}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="button" variant="destructive" onClick={() => setDeleteIsOpen(true)}>
                            Delete Tool
                        </Button>
                        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                            <DeleteAssetDialog toolId={toolData.id} closeDialog={closeDialog}/>
                        </Dialog>
                        <DialogClose disabled={!form.formState.isValid}>
                            <Button
                                disabled={!form.formState.isValid}
                                variant={"cta"}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleFormSubmit(form.getValues())
                                    if (closeDialog) closeDialog()
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
