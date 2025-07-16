"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useEffect, useRef, useState} from "react"
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
import {Asset, COUNTRY_OPTIONS, DONOR_ETHNICITY_OPTIONS, DONOR_GENDER_OPTIONS, DONOR_RACE_OPTIONS, DONOR_SEX_OPTIONS, optionSchema, SAMPLE_PRESERVATION_METHOD_OPTIONS, SAMPLE_TRANSPORT_METHOD_OPTIONS} from "@comend/lib/types"
import {Biosample, Donor, Institution, MilestoneType, Prisma, ToolType} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Delete, Pin, Plus, Router, Trash } from "lucide-react"
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
import { map } from "lodash"
import { createOrUpdateAsset } from "@/packages/lib/actions"
import { mixpanelTrack } from "@/packages/lib/mixpanel"

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
    currentCountry: z.string().optional(),
    countryOfCollection: z.string().optional(),
    pmi: z.string().optional(),
    volume: z.string().optional(),
    mass: z.string().optional(),
    area: z.string().optional(),
    repository: z.string().optional(),
    productCode: z.string().optional(),
    priceUSD: z.string().optional(),
    priceGBP: z.string().optional(),
    priceEUR: z.string().optional(),
    premiumGroup: z.string().optional(),
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
    yearOfExcision: z.string().optional(),
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
    donorAgeAtExcision: z.string().optional(),

    // donor properties
    age: z.string().optional(),
    sex: z.string().optional(),
    gender: z.string().optional(),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    treatments: z.array(z.string()).optional(),
    primaryDiagnosis: z.string().optional(),
    diagnoses: z.array(z.string()).optional(),
    yearOfDeath: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    menopausalStatus: z.boolean().optional(),
    ageAtLastMenstualPeriod: z.string().optional(),
    numberOfPregnancies: z.string().optional(),
    numberOfLiveBirths: z.string().optional(),
    smokingStatus: z.boolean().optional(),
    cigarettesPerDay: z.string().optional(),
    alcoholStatus: z.boolean().optional(),
    drinksPerDay: z.string().optional(),
    alcoholDuration: z.string().optional(),
    medications: z.array(z.string()).optional(),
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
    toolData: any,
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

            // biosmaple properties
            // institution: toolData?.biosample?.institution?.name || undefined,
            anatomicalSite: toolData?.biosample?.anatomicalSite || undefined,
            pathology: toolData?.biosample?.pathology || undefined,
            preservationMethod: toolData?.biosample?.preservationMethod|| undefined,
            methodOfTransport: toolData?.biosample?.methodOfTransport || undefined,
            clinicalData: toolData?.biosample?.clinicalData || undefined,
            currentCountry: toolData?.biosample?.currentCountry || undefined,
            countryOfCollection: toolData?.biosample?.countryOfCollection || undefined,
            pmi: toolData?.biosample?.pmi?.toString() || undefined,
            volume: toolData?.biosample?.volume?.toString() || undefined,
            mass: toolData?.biosample?.mass?.toString() || undefined,
            area: toolData?.biosample?.area?.toString() || undefined,
            repository: toolData?.biosample?.repository || undefined,
            // productCode: toolData?.biosample?.anatomicalSite || undefined,
            priceUSD: toolData?.biosample?.priceUSD?.toString() || undefined,
            priceGBP: toolData?.biosample?.priceGBP?.toString() || undefined,
            priceEUR: toolData?.biosample?.priceEUR?.toString() || undefined,
            // premiumGroup: toolData?.biosample?.anatomicalSite || undefined,
            // caseId: toolData?.biosample?.anatomicalSite || undefined,
            // specimenId: toolData?.biosample?.anatomicalSite || undefined,
            // format: toolData?.biosample?.anatomicalSite || undefined,
            // subFormat: toolData?.biosample?.anatomicalSite || undefined,
            biosampleDiagnosis: toolData?.biosample?.biosampleDiagnosis || undefined,
            // measurement: toolData?.biosample?.anatomicalSite || undefined,
            // significantVariantPositive: toolData?.biosample?.anatomicalSite || undefined,
            // significantVariantWildtype: toolData?.biosample?.anatomicalSite || undefined,
            // fusionPositive: toolData?.biosample?.anatomicalSite || undefined,
            // fusionWildtype: toolData?.biosample?.anatomicalSite || undefined,
            // cnvAbnormal: toolData?.biosample?.anatomicalSite || undefined,
            // cnvNormal: toolData?.biosample?.anatomicalSite || undefined,
            // hlaType: toolData?.biosample?.anatomicalSite || undefined,
            // icf: toolData?.biosample?.anatomicalSite || undefined,
            // irbLetter: toolData?.biosample?.anatomicalSite || undefined,
            yearOfExcision: toolData?.biosample?.yearOfExcision?.toString() || undefined,
            // classifier: toolData?.biosample?.anatomicalSite || undefined,
            // primaryTumorOrgan: toolData?.biosample?.anatomicalSite || undefined,
            // stage: toolData?.biosample?.anatomicalSite || undefined,
            // stageGroup: toolData?.biosample?.anatomicalSite || undefined,
            // serology: toolData?.biosample?.anatomicalSite || undefined,
            // clinicalTestResults: toolData?.biosample?.anatomicalSite || undefined,
            // serumAvailable: toolData?.biosample?.anatomicalSite || undefined,
            // plasmaAvailable: toolData?.biosample?.anatomicalSite || undefined,
            // wholeBloodAvailable: toolData?.biosample?.anatomicalSite || undefined,
            // ffpeTumorAvailable: toolData?.biosample?.anatomicalSite || undefined,
            // frozenTumorAvailable: toolData?.biosample?.anatomicalSite || undefined,
            // er: toolData?.biosample?.anatomicalSite || undefined,
            // pr: toolData?.biosample?.anatomicalSite || undefined,
            // hercepTest: toolData?.biosample?.anatomicalSite || undefined,
            // matchedPairId: toolData?.biosample?.anatomicalSite || undefined,
            // mirroredPairId: toolData?.biosample?.anatomicalSite || undefined,
            donorAgeAtExcision: toolData?.biosample?.donorAgeAtExcision?.toString() || undefined,

            // donor properties
            age: toolData?.biosample?.donor?.age?.toString() || undefined,
            sex: toolData?.biosample?.donor?.sex || undefined,
            gender: toolData?.biosample?.donor?.gender || undefined,
            race: toolData?.biosample?.donor?.race || undefined,
            ethnicity: toolData?.biosample?.donor?.ethnicity || undefined,
            treatments: toolData?.biosample?.donor?.treatments || undefined,
            primaryDiagnosis: toolData?.biosample?.donor?.primaryDiagnosis || undefined,
            diagnoses: toolData?.biosample?.donor?.diagnoses || undefined,
            yearOfDeath: toolData?.biosample?.donor?.yearOfDeath?.toString() || undefined,
            height: toolData?.biosample?.donor?.height?.toString() || undefined,
            weight: toolData?.biosample?.donor?.weight?.toString() || undefined,
            bmi: toolData?.biosample?.donor?.bmi?.toString() || undefined,
            // menopausalStatus: z.boolean().optional(),
            // ageAtLastMenstualPeriod: z.string().optional(),
            // numberOfPregnancies: z.string().optional(),
            // numberOfLiveBirths: z.string().optional(),
            // smokingStatus: z.boolean().optional(),
            // cigarettesPerDay: z.string().optional(),
            // alcoholStatus: z.boolean().optional(),
            // drinksPerDay: z.string().optional(),
            // alcoholDuration: z.string().optional(),
            medications: toolData?.biosample?.donor?.medications || undefined,
            causeOfDeath: toolData?.biosample?.donor?.causeOfDeath || undefined,
            conditionSeverity: toolData?.biosample?.donor?.conditionSeverity || undefined,
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
            anatomicalSite,
            pathology,
            preservationMethod,
            methodOfTransport,
            clinicalData,
            currentCountry,
            countryOfCollection,
            pmi,
            volume,
            mass,
            area,
            repository,
            priceUSD,
            priceGBP,
            priceEUR,
            biosampleDiagnosis,
            yearOfExcision,
            donorAgeAtExcision,
            age,
            sex,
            gender,
            race,
            ethnicity,
            treatments,
            primaryDiagnosis,
            diagnoses,
            yearOfDeath,
            height,
            weight,
            bmi,
            medications,
            causeOfDeath,
            conditionSeverity
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

        const biosampleData: Partial<Biosample> = {
            anatomicalSite,
            pathology,
            preservationMethod,
            methodOfTransport,
            clinicalData,
            currentCountry,
            countryOfCollection,
            pmi: typeof pmi == 'string' ? parseInt(pmi, 10) : pmi,
            volume: typeof volume === 'string' ? parseInt(volume, 10) : volume,
            mass: typeof mass === 'string' ? parseInt(mass, 10) : mass,
            area: typeof area === 'string' ? parseInt(area, 10) : area,
            repository,
            priceUSD: typeof priceUSD === 'string' ? parseInt(priceUSD, 10) : priceUSD,
            priceGBP: typeof priceGBP === 'string' ? parseInt(priceGBP, 10) : priceGBP,
            priceEUR: typeof priceEUR === 'string' ? parseInt(priceEUR, 10) : priceEUR,
            biosampleDiagnosis,
            yearOfExcision: typeof yearOfExcision === 'string' ? parseInt(yearOfExcision, 10) : yearOfExcision,
            donorAgeAtExcision: typeof donorAgeAtExcision === 'string' ? parseInt(donorAgeAtExcision, 10) : donorAgeAtExcision,
        }


        const donorData: Partial<Donor> = {
            age: typeof age === 'string' ? parseInt(age, 10) : age,
            sex,
            gender,
            race,
            ethnicity,
            treatments,
            primaryDiagnosis,
            diagnoses,
            yearOfDeath: typeof yearOfDeath === 'string' ? parseInt(yearOfDeath, 10) : yearOfDeath,
            height: typeof height === 'string' ? parseInt(height, 10) : height,
            weight: typeof weight === 'string' ? parseInt(weight, 10) : weight,
            bmi: typeof bmi === 'string' ? parseInt(bmi, 10) : bmi,
            medications,
            causeOfDeath,
            conditionSeverity
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
                // await updateTool(updateData, session.user.organizationId)
                const updatedAsset = await createOrUpdateAsset(session.user.organizationId, updateData, biosampleData, donorData)
                mixpanelTrack("Tool Updated", {
                    "ID": updatedAsset.id,
                    "Tool Name": updatedAsset.title,
                    "Linked Projects": (updatedAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (updatedAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })
                toast.success(
                    "Tool updated successfully!",
                    {position: "bottom-left"}
                )
                await revalidate("/app/tools/biosample")
                router.refresh()
            } else {
                // await createTool(updateData, session.user.organizationId)
                const newAsset = await createOrUpdateAsset(session.user.organizationId, updateData, biosampleData, donorData)
                mixpanelTrack("Tool Created", {
                    "ID": newAsset.id,
                    "Name": newAsset.title,
                    "Linked Projects": (newAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (newAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any)=> type.milestoneType.label || type.milestoneType.id)
                    )
                })
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

                    {/* temporarily hide additional tool form fields on production until this feature is ready... */}
                    {process.env.NEXT_PUBLIC_NODE_ENV !== "production" && (
                        <>
                        <Separator className="w-full"/>
                        <AdditionalBiosampleFields form={form} />

                        <Separator className="w-full"/>
                        <DonorFormFields form={form} />
                        </>
                    )}

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

export const AdditionalBiosampleFields = ({form}: {form: any}) => {
    return (
        <>
        <h1 className="font-semibold text-md py-0 my-0">Biosample Information</h1>
        <div className="flex-col space-y-4">
            <FormField
                control={form.control}
                name="anatomicalSite"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Anatomical Site`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="anatomicalSite"
                                    className="w-full"
                                    placeholder={`Enter a value`}
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
                name="pathology"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Pathology`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="pathology"
                                    className="w-full"
                                    placeholder={`Enter a value`}
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
                name="preservationMethod"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Preservation Method`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("preservationMethod", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SAMPLE_PRESERVATION_METHOD_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
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
                name="methodOfTransport"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Method of Transport`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("methodOfTransport", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SAMPLE_TRANSPORT_METHOD_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
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
                name="clinicalData"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Clinical Data`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="clinicalData"
                                    className="w-full"
                                    placeholder={`Enter a value`}
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
                name="currentCountry"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Current Location`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("currentCountry", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRY_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
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
                name="countryOfCollection"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Collection Location`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("countryOfCollection", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRY_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
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
                name="pmi"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`PMI (in hours)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="pmi"
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
                name="volume"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Volume (in ml)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="volume"
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
                name="mass"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Mass (in mg)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="mass"
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
                name="area"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Area (in square mm)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="area"
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
                name="repository"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Repository`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="weight"
                                    className="w-full"
                                    placeholder={`Enter a value`}
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
                name="priceUSD"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Price USD`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="priceUSD"
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
                name="priceGBP"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Price GBP`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="priceGBP"
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
                name="priceEUR"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Price EUR`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="priceEUR"
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
                name="yearOfExcision"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Year of Excision`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="yearOfExcision"
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
                name="donorAgeAtExcision"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Donor Age at Excision`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="donorAgeAtExcision"
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
                name="biosampleDiagnosis"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Biosample Diagnosis`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="biosampleDiagnosis"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        </div>
        </>
    )
}

export const DonorFormFields = ({form}: {form: any}) => {
    return (
        <>
        <h1 className="font-semibold text-md py-0 my-0">Donor Information</h1>
        <div className="flex-col space-y-4">
            <FormField
                control={form.control}
                name="age"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Age`}</FormLabel>
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
                        <FormLabel className="w-[80px]">{`Sex`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("sex", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DONOR_SEX_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
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
                        <FormLabel className="w-[80px]">{`Gender`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("gender", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DONOR_GENDER_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {/* Race selections from the National Center for Education Studies (US Gov) */}
            {/* https://nces.ed.gov/ipeds/report-your-data/race-ethnicity-definitions */}
            <FormField
                control={form.control}
                name="race"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Race`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("race", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DONOR_RACE_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {/* Ethnicity selections from the National Center for Education Studies (US Gov) */}
            {/* https://nces.ed.gov/ipeds/report-your-data/race-ethnicity-definitions */}
            <FormField
                control={form.control}
                name="ethnicity"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Ethnicity`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("ethnicity", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DONOR_ETHNICITY_OPTIONS.map(option => (
                                        <SelectItem value={option.value}>{option.label}</SelectItem>
                                    ))}
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
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Height`}</FormLabel>
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
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Weight`}</FormLabel>
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
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`BMI`}</FormLabel>
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

            <FormField
                control={form.control}
                name="primaryDiagnosis"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Primary Diagnosis`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="primaryDiagnosis"
                                    className="w-full"
                                    placeholder={`Enter a value`}
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
                name="diagnoses"
                render={({field}) => (
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Diagnoses`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        // size={"icon"}
                                        className="h-full w-[34px]"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("diagnoses", [...(field.value || []),""])
                                        }}
                                    >
                                        <Plus/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                    {`Add a diagnosis`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {field?.value && field.value.length > 0 && (
                            <ol className="flex flex-col gap-2">
                                {field.value.map((value: string, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                        <Input
                                            id={`diagnosis-${index}`}
                                            className="w-full"
                                            placeholder={`Enter a value`}
                                            value={value}
                                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                let newValue = field.value
                                                newValue[index] = event.currentTarget.value
                                                form.setValue("diagnoses", newValue)
                                            }}
                                        />
                                        </div>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const newValue = field.value
                                                newValue.splice(index, 1)
                                                form.setValue("diagnoses", newValue)
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </span>
                                ))}
                            </ol>
                        )}

                        <FormMessage />

                    </FormItem>
                )}
            />  

            <FormField
                control={form.control}
                name="treatments"
                render={({field}) => (
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Treatments`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        // size={"icon"}
                                        className="h-full w-[34px]"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("treatments", [...(field.value || []),""])
                                        }}
                                    >
                                        <Plus/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                    {`Add a treatment`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {field?.value && field.value.length > 0 && (
                            <ol className="flex flex-col gap-2">
                                {field.value.map((value: string, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                        <Input
                                            id={`treatment-${index}`}
                                            className="w-full"
                                            placeholder={`Enter a value`}
                                            value={value}
                                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                let newValue = field.value
                                                newValue[index] = event.currentTarget.value
                                                form.setValue("treatments", newValue)
                                            }}
                                        />
                                        </div>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const newValue = field.value
                                                newValue.splice(index, 1)
                                                form.setValue("treatments", newValue)
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </span>
                                ))}
                            </ol>
                        )}

                        <FormMessage />

                    </FormItem>
                )}
            /> 


            <FormField
                control={form.control}
                name="medications"
                render={({field}) => (
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Medications`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        className="h-full w-[34px]"
                                        // size={"icon"}
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("medications", [...(field.value || []),""])
                                        }}
                                    >
                                        <Plus/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                    {`Add a medication`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {field?.value && field.value.length > 0 && (
                            <ol className="flex flex-col gap-2">
                                {field.value.map((value: string, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                        <Input
                                            id={`medication-${index}`}
                                            className="w-full"
                                            placeholder={`Enter a value`}
                                            value={value}
                                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                let newValue = field.value
                                                newValue[index] = event.currentTarget.value
                                                form.setValue("medications", newValue)
                                            }}
                                        />
                                        </div>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const newValue = field.value
                                                newValue.splice(index, 1)
                                                form.setValue("medications", newValue)
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </span>
                                ))}
                            </ol>
                        )}

                        <FormMessage />

                    </FormItem>
                )}
            /> 

            <FormField
                control={form.control}
                name="conditionSeverity"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Condition Severity`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="conditionSeverity"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {/* <FormField
                control={form.control}
                name="menopausalStatus"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Menopausal Status`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="menopausalStatus"
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
            /> */}

            {/* <FormField
                control={form.control}
                name="ageAtLastMenstrualPeriod"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Age at last Menstrual Period`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="ageAtLastMenstrualPeriod"
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
                name="numberOfPregnancies"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Number of Pregnancies`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="numberOfPregnancies"
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
                name="numberOfLiveBirths"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Number if Live Births`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="numberOfLiveBirths"
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
            /> */}

            {/* <FormField
                control={form.control}
                name="smokingStatus"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Smoking Status`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="smokingStatus"
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
            /> */}

            {/* <FormField
                control={form.control}
                name="cigarettesPerDay"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Cigarettes Per Day`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="cigarettesPerDay"
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
            /> */}

            {/* <FormField
                control={form.control}
                name="alcoholStatus"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Alcohol Status`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="alcoholStatus"
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
            /> */}

            {/* <FormField
                control={form.control}
                name="drinksPerDay"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Drinks Per Day`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="drinksPerDay"
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
                name="alcoholDuration"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Alcohol Duration (in years)`}</FormLabel>
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
            /> */}

            <FormField
                control={form.control}
                name="causeOfDeath"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Cause Of Death`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="causeOfDeath"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        </div>
        </>
    )
}
