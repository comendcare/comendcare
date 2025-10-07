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
} from "@comend/components/ui/dialog"
import { BIOSAMPLE_TYPE_OPTIONS, DIAGNOSIS_SEVERITY_OPTIONS, DONOR_RACE_OPTIONS, DONOR_SEX_OPTIONS } from "@comend/lib/types"
import { Prisma } from "@prisma/client"
import {getDonorData, getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Plus, Trash, Info, Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import ProjectMultipleSelector from "./project-multiple-selector"
// import { DeleteAssetDialog } from "./delete-tool-dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { editBiosampleForm, Option } from "@comend/lib/types"
import { useRouter } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import { Separator } from "@/packages/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/components/ui/select"
import { createBiosample, updateBiosample } from "@/packages/lib/actions"
import { mixpanelTrack } from "@/packages/lib/mixpanel"
import { DeleteBiosampleDialog } from "./delete-biosample-dialog"
import { cn } from "@/packages/lib/utils"
import { Label } from "@/packages/components/ui/label"
import { Switch } from "@/packages/components/ui/switch"
import LoadingDots from "@/packages/components/icons/loading-dots"

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
    closeDialog
}: {
    toolData: any,
    closeDialog: (newBiosample?: any) => void
}) {
    const initializing = useRef(true)
    const router = useRouter()
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<z.infer<typeof editBiosampleForm>>({
        mode: "onChange",
        resolver: zodResolver(editBiosampleForm),
        defaultValues: {
            id: toolData?.id || undefined,
            description: toolData?.description || "",
            types: BIOSAMPLE_TYPE_OPTIONS
                        .filter(toolType => (toolData?.types || [])
                        .includes(toolType.value)),
            otherTypeDetails: typeof toolData?.metadata === 'object' ? (toolData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            attachments: toolData?.attachments || undefined,
            isPrivate: toolData?.private !== undefined ? toolData?.private : true,
            contacts: toolData?.contacts || undefined,
            milestones: (toolData?.milestones || []).map((milestone: any) => milestone.milestone) || [],

            // biosample properties
            institutions: toolData?.institution ? [{label: toolData.institution.name, value: toolData.institution.id}] : [],
            genes: toolData?.gene ? [{label: toolData.gene.symbol, value: toolData.gene.symbol}] : [],
            variant: toolData?.variant || undefined, 
            anatomicalSite: toolData?.anatomicalSite || undefined,
            preservationMethod: toolData?.preservationMethod|| undefined,
            methodOfTransport: toolData?.methodOfTransport || undefined,
            currentCountry: toolData?.currentCountry || undefined,
            countryOfCollection: toolData?.countryOfCollection || undefined,
            collectionDate: toolData?.collectionDate ? new Date(toolData?.collectionDate) : undefined,

            quantity: toolData?.quantity?.toString() || undefined,
            quantityUnit: toolData?.quantityUnit || 'ml',

            price: toolData?.price?.toString() || undefined,
            priceUnit: toolData?.priceUnit || 'usd',
            biosampleDiagnosis: toolData?.biosampleDiagnosis || undefined,
            ageAtExcision: toolData?.ageAtExcision?.toString() || undefined,

            // donor properties
            donorId: toolData?.donorId || undefined,
            internalDonorId: toolData?.internalId || undefined,
            donor: toolData?.donorId ? [{
                img: `https://api.dicebear.com/8.x/shapes/svg?seed=${toolData.donorId}`,
                label: toolData.donorId, 
                value: toolData.donorId
            }] : [],
            age: toolData?.donor?.age?.toString() || undefined,
            sex: toolData?.donor?.sex || undefined,
            gender: toolData?.donor?.gender || undefined,
            race: toolData?.donor?.race || undefined,
            ethnicity: toolData?.donor?.ethnicity || undefined,
            treatments: toolData?.donor?.treatments || undefined,
            diagnoses: toolData?.donor?.diagnoses?.map((diagnosis: any) => ({
                diagnosis: diagnosis.type ? [{label: diagnosis.type.label, value: diagnosis.type.id}] : [],
                severity: diagnosis.severity || undefined
            })),
            height: toolData?.donor?.height?.toString() || undefined,
            weight: toolData?.donor?.weight?.toString() || undefined,
            bmi: toolData?.donor?.bmi?.toString() || undefined,
            medications: toolData?.donor?.medications || undefined,
            genotype: toolData?.genotype || undefined,
            notes: toolData?.notes || undefined,
        }
    })

    const formData = {
        description: form.watch("description"),
        types: form.watch("types"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        attachments: form.watch("attachments"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones"),
        diagnoses: form.watch("diagnoses"),
        donorId: form.watch("donorId"),
        donor: form.watch("donor"),
    }

    const handleFormSubmit = async (values: z.infer<typeof editBiosampleForm>) => {
        setIsSaving(true)
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        console.log(`form submit values`, values)

        try {
            if (toolData.id) {
                const updatedAsset = await updateBiosample(session.user.organizationId, values, toolData.id)
                await revalidate("/app/tools/biosample")
                router.refresh()
                
                mixpanelTrack("Biosample Updated", {
                    "ID": updatedAsset.id,
                    "Linked Projects": (updatedAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (updatedAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    )
                })

                if (closeDialog) closeDialog(updatedAsset)

                toast.success(
                    "Tool updated successfully!",
                    {position: "bottom-left"}
                )
            } else {
                const newAsset = await createBiosample(session.user.organizationId, values)
                await revalidate("/app/tools/biosample")
                router.refresh()
                
                mixpanelTrack("Biosample Created", {
                    "ID": newAsset.id,
                    "Linked Projects": (newAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    "Linked Project Types": (newAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                        (milestone?.types || []).map((type: any)=> type.milestoneType.label || type.milestoneType.id)
                    )
                })

                if (closeDialog) closeDialog(newAsset)

                toast.success(
                    "Tool created successfully!",
                    {position: "bottom-left"}
                )
            }
        } catch (error) {
            console.error("Error creating or updating tool:", error);
            toast.error(
                "Failed to create or update tool.",
                {position: "bottom-left"}
            )
        }
    }

    useEffect(() => {
        async function fetchDonorData() {
            let donorData: any = undefined
            if (formData.donor && formData.donor.length > 0) {            
                const response = await getDonorData(formData.donor[0]?.value)
                donorData = response.data
            }

            form.setValue("age", donorData?.age?.toString() ?? "", {shouldDirty: true})
            form.setValue("sex", donorData?.sex ?? "", {shouldDirty: true})
            form.setValue("gender", donorData?.gender ?? "", {shouldDirty: true})
            form.setValue("race", donorData?.race ?? "", {shouldDirty: true})
            form.setValue("ethnicity", donorData?.ethnicity ?? "", {shouldDirty: true})
            form.setValue("treatments", donorData?.treatments || [], {shouldDirty: true})
            form.setValue("diagnoses", donorData?.diagnoses?.map((diagnosis: any) => ({
                    diagnosis: diagnosis.type ? [{label: diagnosis.type.label, value: diagnosis.type.id}] : [],
                    severity: diagnosis.severity ?? ""
                })) || [], {shouldDirty: true})
            form.setValue("height", donorData?.height?.toString() ?? "", {shouldDirty: true})
            form.setValue("weight", donorData?.weight?.toString() ?? "", {shouldDirty: true})
            form.setValue("bmi", donorData?.bmi?.toString() ?? "", {shouldDirty: true})
            form.setValue("medications", donorData?.medications || [], {shouldDirty: true})

            form.setValue("donorId", donorData?.id, {shouldDirty: true, shouldValidate: true})
            form.setValue("internalDonorId", donorData?.internalId?.toString() ?? "", {shouldDirty: true, shouldValidate: true})
        }

        console.log(`donor`, formData.donor)
        fetchDonorData()
    }, [formData.donor])

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
                    <AdditionalBiosampleFields form={form} formData={formData}/>

                    <Separator className="w-full"/>
                    <DonorFormFields form={form} />

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
                        <Button
                            disabled={!form.formState.isValid || isSaving}
                            variant={"cta"}
                            onClick={(e) => {
                                e.preventDefault()
                                handleFormSubmit(form.getValues())
                            }}
                        >
                            {isSaving 
                                ? (
                                    <div className="w-[81px] flex justify-center items-center">
                                        <LoadingDots/>
                                    </div>
                                ) 
                                : ("Save Changes")
                            }
                        </Button>
                    </span>
                </form>
            </ScrollArea>
        </Form>
    )
}

export const AdditionalBiosampleFields = ({form, formData}: {form: any, formData: any}) => {
    const handleGeneAsyncSearch = async (query: string) => {
        const res = await fetch(`/api/genes?search=${encodeURIComponent(query || "")}`);
        const genes = await res.json();
        return genes; // should be [{ label: "TP53", value: "TP53" }, ...]
    };

    const handleInstitutionAsyncSearch = async (query: string): Promise<Option[]> => {
        const response = await fetch(`/api/institutions?search=${query}`);
        const data = await response.json();
        return data;
    };

    return (
        <>
        <div className="flex-col space-y-4">
            {/* <h1 className="font-semibold text-md py-0 my-0">Biosample Information</h1> */}
            <FormItem className="flex gap-2 items-center">
                <FormLabel className="flex items-center gap-1 grow">
                    Visibility
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4"/>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-80 text-wrap text-left">
                            {`Private tools will not be shown to people outside of your organization.`}
                        </TooltipContent>
                    </Tooltip>
                </FormLabel>
                <PrivatePublicFormField form={form} formData={formData}/>
            </FormItem>

            <FormField
                control={form.control}
                name="types"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Biosample Type`}</FormLabel>
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

            {formData?.types?.map((type: any) => type?.value).includes("OTHER") && (
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

            <FormField
                control={form.control}
                name="genes"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">Related Gene</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <MultipleSelector
                                    {...field}
                                    onSearch={handleGeneAsyncSearch}
                                    placeholder="Search for genes..."
                                    triggerSearchOnFocus={true}
                                    hidePlaceholderWhenSelected={true}
                                    loadingIndicator={<p>Loading genes...</p>}
                                    emptyIndicator={<p>No genes found.</p>}
                                    showHoverCard={false}
                                    className="-mt-2 w-full min-h-[40px]"
                                />
                            </FormControl>
                            <FormMessage/>
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="genotype"
                render={({field}) => (
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel className="w-[100px]">{`Genotype`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Input
                                    id="genotype"
                                    className="-mt-2 w-full min-h-[40px]"
                                    placeholder={`Enter a genotype`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormItem className={cn("w-full flex gap-4 items-center")}>
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
                                    className="w-full min-h-[40px]"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    min="0"
                                    onInput={(e) => {
                                        const target = e.currentTarget;
                                        if (Number(target.value) < 0) {
                                        target.value = "0"; // reset to 0 if negative
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "-" || e.key === "e") {
                                        e.preventDefault(); // block typing "-" and "e" for exponent notation
                                        }
                                    }}
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
                                    <SelectTrigger className="-mt-2 w-[100px] min-h-[40px]">
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

            <FormField
                control={form.control}
                name="institutions"
                render={({field}) => (
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel className="w-[100px]">Storage Facility</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <MultipleSelector
                                    {...field}
                                    creatable={true}
                                    maxSelected={1}
                                    triggerSearchOnFocus={true}
                                    onSearch={handleInstitutionAsyncSearch}
                                    placeholder="Search for institutions..."
                                    hidePlaceholderWhenSelected={true}
                                    loadingIndicator={<p>Loading institutions...</p>}
                                    emptyIndicator={<p>No institutions found.</p>}
                                    showHoverCard={false}
                                    className="-mt-2 w-full min-h-[40px]"
                                />
                            </FormControl>
                            <FormMessage/>
                        </div>
                    </FormItem>
                )}
            />

            <ContactsFormField form={form} />
            <AttachmentsFormField form={form} />

            <FormField
                control={form.control}
                name="milestones"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Linked Projects`}</FormLabel>
                        <FormControl>
                            <ProjectMultipleSelector value={field.value} onChange={field.onChange}/>
                        </FormControl>
                        <FormMessage className="text-primary"/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Description`}</FormLabel>
                        <FormControl>
                            <Textarea
                                id="description"
                                placeholder={`Enter description...`}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <Separator />

            <FormField
                control={form.control}
                name="notes"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px] flex items-center">
                        <span>Internal Notes</span>
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

            {/* <Separator />
            <h1 className="font-semibold text-md py-0 my-0">Additional Biosample Information</h1>

            <FormField
                control={form.control}
                name="anatomicalSite"
                render={({field}) => (
                    <FormItem className={cn("w-full flex gap-4 items-center"}>
                        <FormLabel className="w-[100px]">{`Anatomical Site`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("anatomicalSite", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
                    <FormItem className={cn("w-full flex gap-4 items-center"}>
                        <FormLabel className="w-[100px]">{`Preservation Method`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("preservationMethod", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
                    <FormItem className={cn("w-full flex gap-4 items-center"}>
                        <FormLabel className="w-[100px]">{`Method of Transport`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("methodOfTransport", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
                    // <FormItem className="w-full flex gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center"}>
                        <FormLabel className="w-[100px]">{`Current Location`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("currentCountry", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
                    // <FormItem className="w-full flex gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center"}>
                        <FormLabel className="w-[100px]">{`Collection Location`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("countryOfCollection", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
                name="collectionDate"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[100px]">{`Collection Date`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal -mt-2 w-full min-h-[40px]",
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
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormItem className={cn("w-full flex gap-4 items-center")}>
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
                                        className="w-full min-h-[40px]"
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
                                    <SelectTrigger className="-mt-2 w-[100px] min-h-[40px]">
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
                name="ageAtExcision"
                render={({field}) => (
                    // <FormItem className="w-full flex gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel className="w-[100px]">{`Donor Age at Excision`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="ageAtExcision"
                                    className="w-full min-h-[40px]"
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
        </div>
        </>
    )
}

export const DonorFormFields = ({form}: {form: any}) => {
    const {data: session} = useSession()
    const [createNewDonor, setCreateNewDonor] = useState(false)

    const handleDonorAsyncSearch = async (query: string): Promise<Option[]> => {
        const response = await fetch(`/api/donors?search=${query}&organizationId=${session?.user.organizationId}`)
        const data = await response.json();
        return data
    }

    const handleDiagnosisTypesAsyncSearch = async (query: string): Promise<Option[]> => {
        const response = await fetch(`/api/diagnoses?search=${query}`)
        const data = await response.json();
        return data
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

        <FormField
            control={form.control}
            name="donor"
            render={({field}) => (
                <FormItem>
                    <div className="w-full flex items-center justify-end">
                        {!createNewDonor && (
                            <FormLabel className="flex items-center gap-1 grow"> 
                                Public Donor ID
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left">
                                        {`This is a unique de-identified ID assigned to the donor of this sample. This ID is public, and will appear in the marketplace.`}
                                    </TooltipContent>
                                </Tooltip>
                            </FormLabel>
                        )}
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="create-new-donor" 
                                checked={createNewDonor} 
                                onCheckedChange={(checked) => {
                                    setCreateNewDonor(checked)
                                    if (checked) form.setValue("donor", [])
                                }}
                            />
                            <Label htmlFor="create-new-donor">Create New Donor</Label>
                        </div>
                    </div>
                    {!createNewDonor && (
                        <FormControl>
                            <MultipleSelector
                                {...field}
                                onSearch={handleDonorAsyncSearch}
                                placeholder="Search for donors..."
                                triggerSearchOnFocus={true}
                                hidePlaceholderWhenSelected={true}
                                loadingIndicator={<p>Loading donors...</p>}
                                emptyIndicator={<p>No donors found.</p>}
                                showHoverCard={false}
                                maxSelected={1}
                            />
                        </FormControl>
                    )}
                    <FormMessage/>
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="internalDonorId"
            render={({field}) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-1 grow pb-3">
                        {`Internal Donor ID`}
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4"/>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-80 text-wrap text-left">
                                {`This ID is optional, and can be used to track donor IDs from any previously used donor identification system outside the Comend platform. This ID cannot be guaranteed to be unique across our platform, and will only be visible to members of your organization.`}
                            </TooltipContent>
                        </Tooltip>
                    </FormLabel>
                    <div className="w-full">
                        <FormControl className="w-full">
                            <Input
                                id="internalDonorId"
                                className="-mt-2 w-full min-h-[40px]"
                                placeholder={`Enter a donor ID`}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </div>
                </FormItem>
            )}
        />

        <div className="flex-col space-y-4">
            <div className="grid gap-x-8 gap-y-2 grid-cols-2">
            <FormField
                control={form.control}
                name="sex"
                render={({field}) => (
                    // <FormItem className="w-full gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel>{`Sex`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("sex", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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

            {/* <FormField
                control={form.control}
                name="gender"
                render={({field}) => (
                    // <FormItem className="w-full gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel>{`Gender`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("gender", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
            /> */}

            {/* Race selections from the National Center for Education Studies (US Gov) */}
            {/* https://nces.ed.gov/ipeds/report-your-data/race-ethnicity-definitions */}
            <FormField
                control={form.control}
                name="race"
                render={({field}) => (
                    // <FormItem className="w-full gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel>{`Race`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("race", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
            {/* <FormField
                control={form.control}
                name="ethnicity"
                render={({field}) => (
                    // <FormItem className="w-full gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel>{`Ethnicity`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select
                                    value={field.value} 
                                    onValueChange={(newVal) => form.setValue("ethnicity", newVal)}
                                >
                                <SelectTrigger className="-mt-2 w-full min-h-[40px]">
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
            /> */}

            {/* <FormField
                control={form.control}
                name="height"
                render={({field}) => (
                    // <FormItem className="w-full gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel className="w-[100px]">{`Height (cm)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="height"
                                    className="w-full min-h-[40px]"
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
                name="weight"
                render={({field}) => (
                    // <FormItem className="w-full gap-4 items-center">
                    <FormItem className={cn("w-full flex gap-4 items-center")}>
                        <FormLabel className="w-[100px]">{`Weight (kg)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="weight"
                                    className="w-full min-h-[40px]"
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
                name="bmi"
                render={({field}) => (
                    <FormItem className="w-full gap-4 items-center">
                        <FormLabel className="w-[100px]">{`BMI`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="bmi"
                                    className="w-full min-h-[40px]"
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
            </div>

            <FormField
                control={form.control}
                name="diagnoses"
                render={({field}) => (
                    // <FormItem>
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Diagnoses`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        className="h-[40px] w-[40px]"
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
                                    <span className="flex gap-2 w-full items-center">
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
                                        <SelectTrigger className="w-[200px] min-h-[40px]">
                                            <SelectValue placeholder="Select a value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DIAGNOSIS_SEVERITY_OPTIONS.map(option => (
                                                <SelectItem value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-[40px] w-[40px]" 
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

            {/* <FormField
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
                                        className="h-[40px] w-[40px]"
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
                                            className="w-full min-h-[40px]"
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
                                            className="row-start-1 col-start-3 lg:col-start-4 h-[40px] w-[40px]" 
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
            />  */}

            {/* <FormField
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
                                        className="h-[40px] w-[40px]"
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
                                    <span className="flex gap-2 w-full items-center">
                                        <div className="w-full">
                                        <Input
                                            id={`medication-${index}`}
                                            className="w-full min-h-[40px]"
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
                                            className="row-start-1 col-start-3 lg:col-start-4 h-[40px] w-[40px]" 
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
            />  */}
        </div>
        </>
    )
}
