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
} from "@comend/components/ui/dialog"
import {TOOL_TYPE_OPTIONS} from "@comend/lib/types"
import {CreateFacilityRequest, Prisma} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Info, Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import ProjectMultipleSelector from "./project-multiple-selector"
import { DeleteClinicalDatasetDialog } from "./delete-clinical-dataset-dialog"
import { Badge, badgeVariants } from "@comend/components/ui/badge"
import MultipleSelector, { MultipleSelectorRef } from "@comend/components/ui/multiple-selector"
import { editDataToolForm, Option } from "@comend/lib/types"
import { revalidate } from "@comend/lib/revalidate"
import { useRouter } from "next/navigation"
import { createClinicalDataset, createCreateFacilityRequest, updateClinicalDataset, updateCreateFacilityRequest } from "@comend/lib/actions"
import { Separator } from "@comend/components/ui/separator"
import { cn } from "@comend/lib/utils"
import LoadingDots from "@comend/components/icons/loading-dots"
import { mixpanelTrack } from "@comend/lib/mixpanel"
import { SubmitCreateRequest } from "./create-facility-request-button"
import { Session } from "next-auth"
import { UnsavedChangesDialog } from "./unsaved-changes-dialog"

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

export const createOrUpdateClinicalDataset = async (
    session: Session, 
    toolData: any, 
    values: z.infer<typeof editDataToolForm>, 
    createFacilityRequests: CreateFacilityRequest[]
) => {
    try {
        if (toolData.id) {
            // const updatedTool = await updateTool(updateData, session.user.organizationId)
            const updatedTool = await updateClinicalDataset(session.user.organizationId, values, toolData.id)
            await revalidate('/app/tools/data')
            // router.refresh() // call refresh to update UI after revalidatePath() call marks cache as stale

            mixpanelTrack("Clinical Dataset Updated", {
                "ID": updatedTool.id,
                // "Linked Projects": (updatedAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                // we flatten them into a single list that can be parsed
                // "Linked Project Types": (updatedAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                //     (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                // )
            })
            
            // if (closeDialog) closeDialog(updatedTool)

            toast.success(
                "Clinical Dataset updated successfully!",
                {position: "bottom-left"}
            )

            return updatedTool
        } else {
            // const newTool = await createTool(updateData, session.user.organizationId)
            const newTool = await createClinicalDataset(session.user.organizationId, values)
            for (let i = 0; i < createFacilityRequests?.length; i++) {
                await updateCreateFacilityRequest(
                    session?.user?.organizationId,
                    {
                        id: createFacilityRequests[i].id,
                        name: createFacilityRequests[i].name,
                        clinicalDatasetId: newTool.id
                    }
                )
            }
            await revalidate('/app/tools/data')
            // router.refresh() // call refresh to update UI after revalidatePath() call marks cache as stale
            
            mixpanelTrack("Clinical Dataset Created", {
                "ID": newTool.id,
                // "Linked Projects": (newAsset?.milestones || []).map(({ milestone }: {milestone: any}) => milestone),
                // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                // we flatten them into a single list that can be parsed
                // "Linked Project Types": (newAsset?.milestones || []).flatMap(({ milestone }: {milestone: any}) =>
                //     (milestone?.types || []).map((type: any)=> type.milestoneType.label || type.milestoneType.id)
                // )
            })

            // if (closeDialog) closeDialog(newTool)

            toast.success(
                "Clinical Dataset created successfully!",
                {position: "bottom-left"}
            )

            return newTool
        }
    } catch (error) {
        console.error("Error creating or updating tool:", error);
        toast.error(
            "Failed to create or update tool.",
            {position: "bottom-left"}
        )
    }
}

export function EditClincalDatasetForm({
    toolData,
    closeDialog,
    isClosing,
    setIsClosing,
}: {
    toolData: any,
    closeDialog: (newAsset?: any) => void,
    isClosing: boolean,
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const initializing = useRef(true)
    const router = useRouter()
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [unsavedChangesIsOpen, setUnsavedChangesIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [createRequests, setCreateRequests] = useState<CreateFacilityRequest[]>(toolData.createFacilityRequests || [])
    const storageFacilityRef = React.useRef<MultipleSelectorRef>(null);

    const form = useForm<z.infer<typeof editDataToolForm>>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        resolver: zodResolver(editDataToolForm),
        defaultValues: {
            id: toolData?.id || undefined,
            title: toolData?.title || "",
            description: toolData?.description || "",
            types: TOOL_TYPE_OPTIONS
                .filter(toolType => (toolData?.types || [])
                .includes(toolType.value)),
            otherTypeDetails: typeof toolData?.metadata === 'object' ? (toolData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            attachments: toolData?.attachments || undefined,
            isPrivate: toolData?.private !== undefined ? toolData?.private : true,
            contacts: toolData?.contacts || undefined,
            milestones: (toolData?.milestones || []).map((milestone: any) => milestone.milestone) || [],

            // genes: toolData?.gene ? [{label: toolData.gene.symbol, value: toolData.gene.symbol}] : [],
            genes: (toolData?.genes || []).map((gene: any) => ({label: gene, value: gene})) || [],
            cohortSize: toolData?.cohortSize?.toString() || undefined,
            storageFacility: (toolData?.company || toolData?.institution) ? (
                (toolData?.company ? ([{
                    value: toolData.company.id,
                    label: `${toolData.company.title}`
                } as Option]) : []).concat(
                    toolData?.institution ? ([{
                        value: toolData.institution.id,
                        label: `${toolData.institution.name}`
                    } as Option]) : []
                )
            ) : undefined,
            notes: toolData?.notes || undefined,
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description"),
        types: form.watch("types"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        attachments: form.watch("attachments"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editDataToolForm>, createFacilityRequests: CreateFacilityRequest[]) => {
        const isValid = form.trigger()
        if (!isValid) return // stops submission
        
        setIsSaving(true)
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        const createdOrUpdatedClinicalDataset = await createOrUpdateClinicalDataset(session, toolData, values, createFacilityRequests)
        closeDialog(createdOrUpdatedClinicalDataset)
    }

    const handleClose = ({showUnsavedChanges}: {showUnsavedChanges?: boolean}) => {
        if (showUnsavedChanges && Object.keys(form.formState.dirtyFields)?.length > 0) {
            // form is dirty, give user the option to save/discard unsaved changes
            setUnsavedChangesIsOpen(true)
        } else {
            // form is not dirty, close regularly
            closeDialog()
        }
    }

    useEffect(() => {
        if (isClosing) handleClose({showUnsavedChanges: true}) // external close, handle closing with option for saving unsaved changes
    }, [isClosing])

    useEffect(() => {
        // if the user has closed the unsaved changes dialog, end the isClosing state of all other dialogs
        // all dialogs should be either fully closed or fully open
        if (!unsavedChangesIsOpen) setIsClosing(false)
    }, [unsavedChangesIsOpen])

    const handleGeneAsyncSearch = async (query: string) => {
        const res = await fetch(`/api/genes?search=${encodeURIComponent(query || "")}`);
        const genes = await res.json();
        return genes; // should be [{ label: "TP53", value: "TP53" }, ...]
    };

    const handleStorageFacilityAsyncSearch = async (query: string): Promise<Option[]> => {
        const institutionsResponse = await fetch(`/api/institutions?search=${query}`)
        const institutionsData = await institutionsResponse.json()

        const companiesResponse = await fetch(`/api/companies?search=${query}`)
        const companiesData = await companiesResponse.json()

        return companiesData.concat(institutionsData)
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
            if (toolData.id && Object.keys(toolData)?.length > 0) form.trigger()

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((values) => handleFormSubmit(values, createRequests))}
                className="flex max-h-[80vh] flex-col overflow-hidden"
            >
                <ScrollArea type={"always"}>
                <ScrollBar />
                <div className="flex flex-col gap-4 pr-4">
                    <FormItem className="flex gap-2 items-center">
                        <FormLabel className="flex items-center gap-1 grow">
                            Visibility
                            <Tooltip>
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
                        name="title"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[100px]">{`Title`}</FormLabel>
                                <FormControl>
                                    <div className="w-full">
                                        <Input
                                            id="title"
                                            placeholder={`Enter a title`}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="types"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[100px]">{`Type`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value}
                                        onChange={field.onChange}
                                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                                        options={TOOL_TYPE_OPTIONS}
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
                        <FormField
                            control={form.control}
                            name="otherTypeDetails"
                            render={({field}) => (
                                <FormItem className="w-full flex gap-4 items-center">
                                    <FormLabel className="w-[100px]">{`Type Description`}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="otherTypeDetails"
                                                placeholder={`Please add a short note about your clinical dataset type — it helps us make the platform better.`}
                                                {...field}
                                            />
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="cohortSize"
                        render={({field}) => (
                            <FormItem className={cn("w-full flex gap-4 items-center")}>
                                <FormLabel className="w-[100px]">{`Cohort size`}</FormLabel>
                                <div className="w-full">
                                    <FormControl className="-mt-2 w-full">
                                        <Input
                                            id="cohortSize"
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
                    />

                    <FormField
                        control={form.control}
                        name="genes"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[100px]">Related genes</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <MultipleSelector
                                            {...field}
                                            onSearch={handleGeneAsyncSearch}
                                            badgeClassName={badgeVariants({variant: "teal"})}
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
                        name="storageFacility"
                        render={({field}) => (
                            <FormItem className={cn("w-full flex gap-4 items-center")}>
                                <FormLabel className="w-[100px]">Stored with</FormLabel>
                                <div className="w-full">
                                    <FormControl className="w-full">
                                        <MultipleSelector
                                            {...field}
                                            ref={storageFacilityRef}
                                            creatable={true}
                                            createOnBlur={false}
                                            creatableItemOverride={(props) => (
                                                <SubmitCreateRequest
                                                    {...props}
                                                    parentRef={storageFacilityRef}
                                                    onClickCallback={async (e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        const newRequest = await createCreateFacilityRequest(
                                                            session?.user.organizationId,
                                                            {
                                                                name: props.inputValue,
                                                                clinicalDatasetId: toolData.id
                                                            }
                                                        )
                                                        setCreateRequests(prev => [...prev, newRequest])
                                                    }}
                                                />
                                            )}
                                            maxSelected={1}
                                            triggerSearchOnFocus={true}
                                            onSearch={handleStorageFacilityAsyncSearch}
                                            placeholder="Search..."
                                            hidePlaceholderWhenSelected={true}
                                            loadingIndicator={<p>Loading results...</p>}
                                            emptyIndicator={<p>No results found. Try a different search.</p>}
                                            showHoverCard={false}
                                            className="-mt-2 w-full min-h-[40px]"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col gap-2">
                        {createRequests.map((request, index) => (
                            <Badge className="w-full text-sm font-normal" key={index}>{`Creation request for "${request?.name}" submitted.`}</Badge>
                        ))}
                    </div>

                    <ContactsFormField form={form} />
                    <AttachmentsFormField form={form} />

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full flex gap-4 items-center">
                                <FormLabel className="w-[100px]">{`Linked projects`}</FormLabel>
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
                                <FormLabel className="w-[100px]">{`Notes`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="description"
                                        placeholder={`Enter notes...`}
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
                </div>
                </ScrollArea>

                <DialogFooter className="pt-4">
                    <Button 
                        type="button"
                        variant={"secondary"} 
                        onClick={() => {handleClose({showUnsavedChanges: false})}}
                    >
                        Cancel
                    </Button>

                    {toolData.id && (
                        <>
                        <Button type="button" variant="destructive" onClick={() => setDeleteIsOpen(true)}>
                            Delete tool
                        </Button>

                        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                            <DeleteClinicalDatasetDialog toolIds={[toolData.id]} closeDialog={() => handleClose({showUnsavedChanges: false})}/>
                        </Dialog>
                        </>
                    )}

                    <div className="bg-white rounded-md p-0">
                        <Button
                            variant={"cta"}
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving 
                                ? (
                                    <div className="w-[81px] flex justify-center items-center">
                                        <LoadingDots/>
                                    </div>
                                ) 
                                : ("Save changes")
                            }
                        </Button>
                    </div>
                </DialogFooter>

                <UnsavedChangesDialog 
                    isSaving={isSaving}
                    isClosing={isClosing}
                    setIsClosing={setIsClosing}
                    isOpen={unsavedChangesIsOpen}
                    setIsOpen={setUnsavedChangesIsOpen}
                    closeDialog={closeDialog}
                    form={form}
                    formSubmit={handleFormSubmit}
                />
            </form>
        </Form>
    )
}