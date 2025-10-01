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
} from "@comend/components/ui/dialog"
import { DISEASE_MODEL_TYPE_OPTIONS, editDiseaseModelForm } from "@comend/lib/types"
import { Prisma } from "@prisma/client"
import { getDonorData, getOrganizationFromOrganizationId } from "@comend/lib/fetchers"
import { useSession } from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Info, Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { Option } from "@comend/lib/types"
import { useRouter } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import { Separator } from "@/packages/components/ui/separator"
import { mixpanelTrack } from "@/packages/lib/mixpanel"
import { createDiseaseModel, updateDiseaseModel } from "@/packages/lib/actions"
import { cn } from "@/packages/lib/utils"
import LoadingDots from "@/packages/components/icons/loading-dots"
import ProjectMultipleSelector from "./project-multiple-selector"

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

export function EditDiseaseModelToolForm({
    toolData,
    closeDialog
}: {
    toolData: any,
    closeDialog: (newDiseaseModel?: any) => void
}) {
    const initializing = useRef(true)
    const router = useRouter()
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<z.infer<typeof editDiseaseModelForm>>({
        mode: "onChange",
        resolver: zodResolver(editDiseaseModelForm),
        defaultValues: {
            id: toolData?.id || undefined,
            description: toolData?.description || "",
            types: DISEASE_MODEL_TYPE_OPTIONS
                .filter(toolType => (toolData?.types || [])
                .includes(toolType.value)),
            otherTypeDetails: typeof toolData?.metadata === 'object' ? (toolData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            attachments: toolData?.attachments || undefined,
            isPrivate: toolData?.private !== undefined ? toolData?.private : true,
            contacts: toolData?.contacts || undefined,
            institutions: toolData?.institution ? [{label: toolData.institution.name, value: toolData.institution.id}] : [],
            genes: toolData?.gene ? [{label: toolData.gene.symbol, value: toolData.gene.symbol}] : [],
            milestones: (toolData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
            genotype: toolData?.genotype || undefined,
            strain: toolData?.strain || undefined,
            notes: toolData?.notes || undefined
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
    }

    const handleFormSubmit = async (values: z.infer<typeof editDiseaseModelForm>) => {
        setIsSaving(true)
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        try {
            if (toolData.id) {
                const updatedAsset = await updateDiseaseModel(session.user.organizationId, values, toolData.id)
                await revalidate("/app/tools/disease-model")
                router.refresh()

                mixpanelTrack("Disease Model Updated", {
                    "ID": updatedAsset.id,
                    // "Linked Projects": (updatedAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    // "Linked Project Types": (updatedAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                    //     (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                    // )
                })

                if (closeDialog) closeDialog(updatedAsset)
                toast.success(
                    "Tool updated successfully!",
                    {position: "bottom-left"}
                )
            } else {
                const newAsset = await createDiseaseModel(session.user.organizationId, values)
                await revalidate("/app/tools/disease-model")
                router.refresh()

                mixpanelTrack("Disease Model Created", {
                    "ID": newAsset.id,
                    // "Linked Projects": (newAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                    // we flatten them into a single list that can be parsed
                    // "Linked Project Types": (newAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                    //     (milestone?.types || []).map((type: any)=> type.milestoneType.label || type.milestoneType.id)
                    // )
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
                        <PrivatePublicFormField 
                            form={form} 
                            formData={formData} 
                            // disabled={!orgIsPublished}
                        />
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="types"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[100px]">{`Disease Model Type`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={DISEASE_MODEL_TYPE_OPTIONS}
                                        hidePlaceholderWhenSelected={true}
                                        showHoverCard={false}
                                        placeholder="Select a type..."
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                        groupBy="group"
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
                        name="strain"
                        render={({field}) => (
                            <FormItem className={cn("w-full flex gap-4 items-center")}>
                                <FormLabel className="w-[100px]">{`Strain`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Input
                                            id="strain"
                                            className="-mt-2 w-full min-h-[40px]"
                                            placeholder={`Enter a strain`}
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

                    {/* <FormField
                        control={form.control}
                        name="phenotype"
                        render={({field}) => (
                            <FormItem className={cn("w-full flex gap-4 items-center")}>
                                <FormLabel className="w-[100px]">{`Phenotype`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Input
                                            id="phenotype"
                                            className="-mt-2 w-full min-h-[40px]"
                                            placeholder={`Enter a phenotype`}
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
                        name="patientId"
                        render={({field}) => (
                            <FormItem className={cn("w-full flex gap-4 items-center")}>
                                <FormLabel className="w-[100px]">{`Linked Patient ID`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <Input
                                            id="patientId"
                                            className="-mt-2 w-full min-h-[40px]"
                                            placeholder={`Enter a phenotype`}
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
                        name="institutions"
                        render={({field}) => (
                            // <FormItem className="w-full flex gap-4 items-center">
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
                                        placeholder={`Enter a description...`}
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
                            {/* <DeleteBiosampleDialog toolId={toolData.id} closeDialog={closeDialog}/> */}
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
