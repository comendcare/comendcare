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
import {ANATOMICAL_SITE_OPTIONS, Asset, BIOSAMPLE_TYPE_OPTIONS, COUNTRY_OPTIONS, DONOR_ETHNICITY_OPTIONS, DONOR_GENDER_OPTIONS, DONOR_RACE_OPTIONS, DONOR_SEX_OPTIONS, optionSchema, SAMPLE_PRESERVATION_METHOD_OPTIONS, SAMPLE_TRANSPORT_METHOD_OPTIONS, TOOL_TYPE_OPTIONS} from "@comend/lib/types"
import {Biosample, Donor, DonorDiagnosis, Institution, MilestoneType, Prisma} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Delete, Pin, Plus, Router, Trash, Info } from "lucide-react"
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
import { createOrUpdateAsset, createOrUpdateBiosample } from "@/packages/lib/actions"
import { mixpanelTrack } from "@/packages/lib/mixpanel"
import { DeleteBiosampleDialog } from "./delete-biosample-dialog"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

export const diagnosisSchema = z.object({
    diagnosis: z.array(optionSchema),
    severity: z.string().optional(),
})

export const editBiosampleForm = z.object({
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
    genes: z.array(optionSchema).optional(),
    variant: z.string().optional(),
    institution: z.custom<Institution>().optional(),
    anatomicalSite: z.string().optional(),
    preservationMethod: z.string().optional(),
    preservation: z.string().optional(),
    methodOfTransport: z.string().optional(),
    currentCountry: z.string().optional(),
    countryOfCollection: z.string().optional(),
    // volume: z.string().optional(),
    // mass: z.string().optional(),
    // area: z.string().optional(),
    quantity: z.string().optional(),
    quantityUnit: z.string(),
    productCode: z.string().optional(),
    // priceUSD: z.string().optional(),
    // priceGBP: z.string().optional(),
    // priceEUR: z.string().optional(),
    price: z.string().optional(),
    priceUnit: z.string(),
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
    ageAtExcision: z.string().optional(),

    // donor properties
    age: z.string().optional(),
    sex: z.string().optional(),
    gender: z.string().optional(),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    treatments: z.array(z.string()).optional(),
    diagnoses: z.array(diagnosisSchema).optional(),
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
})

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

const QUANTITY_OPTIONS: Option[] = [
    {
        value: 'ml',
        label: 'ml'
    },
    {
        value: 'mg',
        label: 'mg'
    },
    {
        value: 'sqmm',
        label: 'mm'
    }
]

const PRICE_OPTIONS: Option[] = [
    {
        value: 'usd',
        label: 'USD'
    },
    {
        value: 'gbp',
        label: 'GBP'
    },
    {
        value: 'eur',
        label: 'EUR'
    }
]

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
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)

    const form = useForm<z.infer<typeof editBiosampleForm>>({
        mode: "onChange",
        resolver: zodResolver(editBiosampleForm),
        defaultValues: {
            description: toolData?.description || "",
            types: BIOSAMPLE_TYPE_OPTIONS
                        .filter(toolType => (toolData?.types || [])
                        .includes(toolType.value)),
            otherTypeDetails: typeof toolData?.metadata === 'object' ? (toolData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            attachments: toolData?.attachments || undefined,
            isPinned: toolData?.pinned || false,
            isPrivate: toolData?.private !== undefined ? toolData?.private : true,
            contacts: toolData?.contacts || undefined,
            milestones: (toolData?.milestones || []).map((milestone: any) => milestone.milestone) || [],

            // biosmaple properties
            // institution: toolData?.institution?.name || undefined,
            genes: toolData?.gene ? [{label: toolData.gene.uuid, value: toolData.gene.uuid}] : [],
            variant: toolData?.variant || undefined, 
            anatomicalSite: toolData?.anatomicalSite || undefined,
            preservationMethod: toolData?.preservationMethod|| undefined,
            methodOfTransport: toolData?.methodOfTransport || undefined,
            currentCountry: toolData?.currentCountry || undefined,
            countryOfCollection: toolData?.countryOfCollection || undefined,

            quantity: toolData?.quantity?.toString() || undefined,
            quantityUnit: toolData?.quantityUnit || 'ml',

            price: toolData?.price?.toString() || undefined,
            priceUnit: toolData?.priceUnit || 'usd',
            biosampleDiagnosis: toolData?.biosampleDiagnosis || undefined,
            yearOfExcision: toolData?.yearOfExcision?.toString() || undefined,
            ageAtExcision: toolData?.ageAtExcision?.toString() || undefined,

            // donor properties
            age: toolData?.donor?.age?.toString() || undefined,
            sex: toolData?.donor?.sex || undefined,
            gender: toolData?.donor?.gender || undefined,
            race: toolData?.donor?.race || undefined,
            ethnicity: toolData?.donor?.ethnicity || undefined,
            treatments: toolData?.donor?.treatments || undefined,
            diagnoses: toolData?.donor?.diagnoses?.map((diagnosis: any) => ({
                diagnosis: [{label: diagnosis.type.label, value: diagnosis.type.id}],
                severity: diagnosis.severity || undefined
            })),
            height: toolData?.donor?.height?.toString() || undefined,
            weight: toolData?.donor?.weight?.toString() || undefined,
            bmi: toolData?.donor?.bmi?.toString() || undefined,
            medications: toolData?.donor?.medications || undefined,
        }
    })

    const formData = {
        description: form.watch("description"),
        types: form.watch("types"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        attachments: form.watch("attachments"),
        isPinned: form.watch("isPinned"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones"),
        diagnoses: form.watch("diagnoses")
    }

    const handleFormSubmit = async (values: z.infer<typeof editBiosampleForm>) => {
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        try {
            if (toolData.id) {
                const updatedAsset = await createOrUpdateBiosample(session.user.organizationId, values, toolData.id)
                mixpanelTrack("Biosample Updated", {
                    "ID": updatedAsset.id,
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
                const newAsset = await createOrUpdateBiosample(session.user.organizationId, values)
                mixpanelTrack("Biosample Created", {
                    "ID": newAsset.id,
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

    useEffect(() => {
        if (formData.isPrivate) form.setValue("isPinned", false)
    }, [formData.isPrivate])

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
                                        options={BIOSAMPLE_TYPE_OPTIONS}
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

                    <FormItem className="flex gap-2 items-center">
                        <FormLabel className="flex items-center gap-1 grow">
                            Visibility
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4"/>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left">
                                    {`Private tools will not be shown to people outside of your organization.`}
                                </TooltipContent>
                            </Tooltip>
                        </FormLabel>
                        <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                        <Tooltip>
                            <TooltipTrigger onClick={(e) => e.preventDefault()}>
                                <FormField 
                                    control={form.control}
                                    name="isPinned"
                                    render={({field}) => (
                                        <FormControl className="-mt-2">
                                            <Button 
                                                disabled={formData.isPrivate || (!toolData.pinned && numAssetsPinned >= 5)}
                                                variant="ghost" 
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    form.setValue("isPinned", !field.value)
                                                }}
                                                className="p-2"
                                            >
                                                {field.value ? <Pin fill="currentColor"/> : <Pin />}
                                                Pinned to profile
                                            </Button>
                                        </FormControl>
                                    )}
                                />
                            </TooltipTrigger>
                            {!toolData.pinned && numAssetsPinned >= 5 && (
                                <TooltipContent className="max-w-[200px]">
                                    <p>{`Pinning is limited to 5 tools. You already have 5 tools pinned. Please unpin another tool before pinning this tool.`}</p>
                                </TooltipContent>
                            )}
                            {formData.isPrivate && (
                                <TooltipContent className="max-w-[200px]">
                                    <p>{`Pinning is only available on public tools. Make this tool public to pin it to your profile.`}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </FormItem>

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
                            <DeleteBiosampleDialog toolId={toolData.id} closeDialog={closeDialog}/>
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
                        <FormLabel className="w-[100px]">{`Anatomical Site`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("anatomicalSite", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ANATOMICAL_SITE_OPTIONS.map(option => (
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
                name="preservationMethod"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Preservation Method`}</FormLabel>
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
                        <FormLabel className="w-[100px]">{`Method of Transport`}</FormLabel>
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
                name="currentCountry"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Current Location`}</FormLabel>
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
                        <FormLabel className="w-[100px]">{`Collection Location`}</FormLabel>
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

            <FormItem className="w-full flex gap-4 items-center">
                <FormLabel className="w-[100px]">{'Available Quantity'}</FormLabel>
                <div className="w-full gap-2 flex">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({field}) => (
                            <FormControl className="-mt-2 w-full">
                                <div className="w-full"> 
                                <Input
                                    id="quantity"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                                </div>
                            </FormControl>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="quantityUnit"
                        render={({ field }) => (
                            <FormControl>
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("quantityUnit", newVal)}
                                >
                                    <SelectTrigger className="-mt-2 w-[100px] h-[32px]">
                                        <SelectValue placeholder="Select a value" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {QUANTITY_OPTIONS.map(option => (
                                            <SelectItem value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        )}
                    />
                </div>
                <FormMessage />
            </FormItem>

            <FormItem className="w-full flex gap-4 items-center">
                <FormLabel className="w-[100px]">{'Price Per Unit'}</FormLabel>
                <div className="w-full gap-2 flex">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({field}) => (
                            <FormControl className="-mt-2 w-full">
                                <div className="w-full">
                                    <Input
                                        id="price"
                                        className="w-full"
                                        placeholder={`Enter a number`}
                                        type="number"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="priceUnit"
                        render={({ field }) => (
                            <FormControl>
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("priceUnit", newVal)}
                                >
                                    <SelectTrigger className="-mt-2 w-[100px] h-[32px]">
                                        <SelectValue placeholder="Select a value" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRICE_OPTIONS.map(option => (
                                            <SelectItem value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        )}
                    />
                </div>
                <FormMessage />
            </FormItem>

            <FormField
                control={form.control}
                name="yearOfExcision"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Year of Excision`}</FormLabel>
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
                name="ageAtExcision"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Donor Age at Excision`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="ageAtExcision"
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
        </div>
        </>
    )
}

export const DonorFormFields = ({form}: {form: any}) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleAsyncSearch = async (query: string) => {
        const res = await fetch(`/api/genes?search=${encodeURIComponent(query || "")}`);
        const genes = await res.json();

        return genes; // should be [{ label: "TP53", value: "TP53" }, ...]
    };

    const handleDiagnosisTypesAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        setIsLoading(true)

        try {
            const response = await fetch(`/api/diagnoses?search=${query}`)
            const data = await response.json();

            // Return the fetched options
            return data
        } catch (error) {
            console.error("Failed to fetch conditions:", error)
            return [];
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
        <div className="flex gap-1 items-center">
            <h1 className="font-semibold text-md py-0 my-0">Donor Information</h1>
            <Tooltip delayDuration={0}>
                <TooltipTrigger>
                    <Info className="h-4 w-4"/>
                </TooltipTrigger>
                <TooltipContent className="max-w-80 text-wrap text-left">
                    {`Donor information (PHI) is kept confidential and only shared with the requestor upon your group’s approval.`}
                </TooltipContent>
            </Tooltip>
        </div>
        <div className="flex-col space-y-4">
            <div className="grid gap-x-8 gap-y-2 grid-cols-2">
            <FormField
                control={form.control}
                name="sex"
                render={({field}) => (
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel>{`Sex`}</FormLabel>
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
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel>{`Gender`}</FormLabel>
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
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel>{`Race`}</FormLabel>
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
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel>{`Ethnicity`}</FormLabel>
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
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Height`}</FormLabel>
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
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Weight`}</FormLabel>
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
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel className="w-[100px]">{`BMI`}</FormLabel>
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
            </div>

            <FormField
                control={form.control}
                name="genes"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Related Gene</FormLabel>
                        {/*<FormDescription>{`The genes associated with your condition.`}</FormDescription>*/}
                        <FormControl>
                            <MultipleSelector
                                {...field}
                                onSearch={handleAsyncSearch}
                                placeholder="Search for genes..."
                                triggerSearchOnFocus={true}
                                hidePlaceholderWhenSelected={true}
                                loadingIndicator={
                                <p
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                >
                                    Loading genes...
                                </p>}
                                emptyIndicator={<p>No genes found.</p>}
                                showHoverCard={false}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="variant"
                render={({field}) => (
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Variant`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="variant"
                                    className="w-full"
                                    placeholder={`Enter a variant`}
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
                                        className="h-full w-[34px]"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("diagnoses", [...(field.value || []), {diagnosis: undefined, severity: undefined}])
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
                                {field.value.map((value: any, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                            <MultipleSelector
                                                value={value.diagnosis}
                                                onChange={(value) => {
                                                    let newValue = field.value
                                                    newValue[index] = {
                                                        ...newValue[index],
                                                        diagnosis: value.map(val => ({
                                                            ...val,
                                                            value: val?.value?.toUpperCase()?.replace(/[^0-9a-z]/gi, '')
                                                        }))
                                                    }
                                                    form.setValue("diagnoses", newValue)
                                                }}
                                                creatable={true}
                                                maxSelected={1}
                                                onSearch={handleDiagnosisTypesAsyncSearch}
                                                placeholder="Search for conditions..."
                                                hidePlaceholderWhenSelected={true}
                                                loadingIndicator={<p>Loading diagnoses...</p>}
                                                emptyIndicator={<p>No diagnoses found.</p>}
                                                showHoverCard={false}
                                            />
                                        </div>
                                        <Select
                                            value={value.severity} 
                                            onValueChange={(value) => {
                                                let newValue = field.value
                                                newValue[index] = {
                                                    ...newValue[index],
                                                    severity: value
                                                }
                                                form.setValue("diagnoses", newValue)
                                            }}
                                        >
                                        <SelectTrigger className="w-[200px] h-[32px]">
                                            <SelectValue placeholder="Select a value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={'mild'}>Mild</SelectItem>
                                            <SelectItem value={'moderate'}>Moderate</SelectItem>
                                            <SelectItem value={'severe'}>Severe</SelectItem>
                                            <SelectItem value={'critical'}>Life-threatening/Critical</SelectItem>
                                            <SelectItem value={'terminal'}>Terminal</SelectItem>
                                        </SelectContent>
                                        </Select>
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
        </div>
        </>
    )
}
