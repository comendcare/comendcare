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
} from "@comend/components/ui/form"
import {Input} from "@comend/components/ui/input"
import {AutosizeTextarea, Textarea} from "@comend/components/ui/textarea"
import {Button} from "@comend/components/ui/button"
import {ScrollArea} from "@comend/components/ui/scroll-area"
import StatusButton from "./milestone-status-button"
import {RoadmapState, useRoadmapStore} from "~web/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@comend/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog"
import {DeleteMilestoneDialogContent} from "./delete-milestone-dialog-content"
import {PrivateBadge} from "./private-badge"
import {debounce} from "lodash"
import {monthsList} from "@comend/lib/data";
import {
    Asset,
    Milestone,
    NODE_TYPE_OPTIONS,
    RFP,
    RFP_OPEN_TO_TYPE_OPTIONS,
    StatusType,
    Option,
    BIOSAMPLE_TYPE_OPTIONS,
    DISEASE_MODEL_TYPE_OPTIONS
} from "@comend/lib/types"
import {
    Biosample,
    DiseaseModel,
    MilestoneType,
    Organization,
    PlatformNotification,
    Prisma,
    SavedCompany,
    Tool
} from "@prisma/client"
import {useSession} from "next-auth/react"
import {ToggleGroup, ToggleGroupItem} from "@comend/components/ui/toggle-group"
import {ExternalContactField} from "./external-contact-field"
import {ExternalAttachmentField} from "./external-attachment-field"
import {Popover, PopoverContent, PopoverTrigger} from "@comend/components/ui/popover"
import {cn, sleep} from "@comend/lib/utils"
import {format} from "date-fns"
import {Calendar} from "@comend/components/ui/calendar"
import {Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import MoneyInput from "@comend/components/money-input";
import MultipleSelector from "@comend/components/ui/multiple-selector"
import {RadioGroup, RadioGroupItem} from "@comend/components/ui/radio-group"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@comend/components/ui/tabs"
import {CROSearchState, Recommendation, useCROSearchStore} from "@/state/search/croSearchStore"
import {Card, CardContent} from "@comend/components/ui/card"
import Image from "next/image"
import {CROMarketplaceCard} from "./marketplace/marketplace-cro-card"
import Link from "next/link"
import Loading from "@/loading";
import {getMilestoneTypes} from "@comend/lib/fetchers"
import {NotificationsState, useNotificationsStore} from "@/state/notifications/notificationsStore"
import {Globe, Lock, Plus, X, Share, Trash} from "lucide-react"
import {badgeVariants} from "@comend/components/ui/badge"
import {ResearchPlanOnbordaState, useOnbordaStore} from "@/state/onborda/onbordaStore"
import {mixpanelTrack} from "@comend/lib/mixpanel"
import ShareDialog from "./share-dialog"
import {JsonObject} from "@prisma/client/runtime/library"
import EditMilestoneDetailsPublicationsTab from "~web/components/edit-milestone-details-publications-tab";
import {Skeleton} from "@comend/components/ui/skeleton"
import {useOnborda} from "./onborda/OnbordaContext"
import {EditRFPForm} from "./edit-rfp-form"
import {CommandItem} from "@/packages/components/ui/command"
import {usePathname} from "next/navigation"
import {nanoid} from "nanoid"
import {EditBiosampleToolForm} from "./edit-biosample-tool-form"
import {EditDiseaseModelToolForm} from "./edit-disease-model-tool-form"
import {EditClincalDatasetForm} from "./edit-clinical-dataset-form"
import {MilestoneTypeBadge} from "@/packages/components/milestone-type-badge"
import {Separator} from "@/packages/components/ui/separator"
import dynamic from "next/dynamic";

type PlateEditorProps = {
    value: any[];
    onChange: (v: any[]) => void;
};

const PlateEditor = dynamic<PlateEditorProps>(
    () =>
        import("@comend/components/editor/plate-editor").then(
            (m) => m.PlateEditor   // ← pick the named export
        ),
    {
        ssr: false, loading: () =>
            <Skeleton className="w-full h-[200px]"/>
    }
);

const EditMilestoneDetailsProjectsTab = dynamic(
    () =>
        import("./edit-milestone-details-projects-tab").then(
            (m) => m.default   // ← pick the named export
        ),
    {
        ssr: false, loading: () =>
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full h-[230px]"/>
                <Skeleton className="w-full h-[230px]"/>
                <Skeleton className="w-full h-[230px]"/>
            </div>
    }
);

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

// const onbordaSelector = (state: ResearchPlanOnbordaState) => ({
//     step: state.step
// })

const selector = (state: RoadmapState) => ({
    setMilestone: state.setMilestone,
    selectedNodeIds: state.selectedNodeIds
})

// const recommendationsSelector = (state: CROSearchState) => ({
//     recommendations: state.recommendations,
//     setRecommendations: state.setRecommendations
// })

// const notificationsSelector = (state: NotificationsState) => ({
//     initialized: state.initialized,
//     notifications: state.notifications,
//     addNotification: state.addNotification,
//     setNotificationsViewed: state.setNotificationsViewed
// })

const nilOrEmptyToUndef = <T extends z.ZodTypeAny>(inner: T) =>
    z.preprocess(v => (v === "" || v === null ? undefined : v), inner.optional());


const editMilestoneForm = z.object({
    nodeType: z.string(),
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
    types: z.array(z.custom<MilestoneType>()).optional(),
    otherTypeDetails: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: nilOrEmptyToUndef(z.number().max(2147483647).min(0)),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    status: z.string(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.array(z.string()).optional(),
    tools: z.array(z.custom<Option>()).optional(),
    rfps: z.array(z.custom<RFP>()).optional(),
    notes: z.array(z.record(z.any()))
}).refine(
    (m) => m.startDate && m.endDate ? m.startDate?.getTime() <= m.endDate?.getTime() : true,
    {
        message: "Error: Please adjust the dates so the start date comes before the end date.",
        path: ["endDate"]
    }
)

type SimpleAttachment = { name: string; link: string };

// function addAttachmentToForm(form: any, att: SimpleAttachment) {
//     const prev = form.getValues("attachments") ?? [];
//     const norm = (s: string) => s.trim().toLowerCase();

//     const already = prev.some((a: any) => norm(a.link) === norm(att.link));
//     if (already) return false;

//     form.setValue("attachments", [...prev, att], { shouldValidate: true, shouldDirty: true });
//     return true;
// }

export function EditMilestoneForm({
                                      organization,
                                      milestoneData,
                                      orgIsPublished,
                                      biosampleOptions,
                                      diseaseModelOptions,
                                      clinicalDatasetOptions,
                                      rfpOptions,
                                      milestoneTypeOptions,
                                      onClose
                                  }: {
    organization: Organization | undefined
    milestoneData: Milestone
    orgIsPublished: boolean
    biosampleOptions: Partial<Biosample>[],
    diseaseModelOptions: Partial<DiseaseModel>[],
    clinicalDatasetOptions: Partial<Tool>[],
    rfpOptions: Partial<RFP>[],
    milestoneTypeOptions: Partial<MilestoneType>[],
    onClose: () => void
}) {
    const {setMilestone} = useRoadmapStore(useShallow(selector))
    // const {recommendations, setRecommendations} = useCROSearchStore(useShallow(recommendationsSelector))
    // const {
    //     initialized: notificationsInitialized,
    //     notifications,
    //     addNotification,
    //     setNotificationsViewed,
    // } = useNotificationsStore(useShallow(notificationsSelector))
    const initializing = useRef(true)
    const {data: session, status} = useSession()
    const pathname = usePathname()
    // const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)
    const [fetchedTools, setFetchedTools] = useState<Option[]>([])
    const [tab, setTab] = useState<string>("edit")
    // const {step} = useOnbordaStore(useShallow(onbordaSelector))
    // const {isOnbordaVisible} = useOnborda()
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const [createRFPIsOpen, setCreateRFPIsOpen] = useState(false)
    const [createBiosampleIsOpen, setCreateBiosampleIsOpen] = useState(false)
    const [createDiseaseModelIsOpen, setCreateDiseaseModelIsOpen] = useState(false)
    const [createClincalDatasetIsOpen, setCreateClinicalDatasetIsOpen] = useState(false)
    // const [recommendationsViewed, setRecommendationsViewed] = useState(tab === "recommendations")
    // const [savedCompanyIds, setSavedCompanyIds] = useState<Set<string>>(new Set());

    // useEffect(() => {
    //     async function fetchSavedCompanies() {
    //         const res = await getSavedCompaniesFromOrganizationId(
    //             session?.user?.organizationId,
    //             { companyId: true }
    //         );

    //         if (res.success && res.data) {
    //             setSavedCompanyIds(new Set(res.data.map((c: SavedCompany) => c.companyId)));
    //         }
    //     }

    //     fetchSavedCompanies();
    // }, [session, status]);

    // state for adding fields
    const [hasBudget, setHasBudget] = useState(milestoneData?.budget || false)
    const [hasStartDate, setHasStartDate] = useState(milestoneData?.startDate || false)
    const [hasEndDate, setHasEndDate] = useState(milestoneData?.endDate || false)

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            nodeType: milestoneData?.nodeType || "PROJECT",
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            types: ((milestoneData?.types || []).map((type: any) => ({
                ...type.milestoneType,
                value: type.milestoneTypeId
            })) || []),
            otherTypeDetails: typeof milestoneData?.metadata === 'object' ? (milestoneData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            startDate: milestoneData?.startDate || undefined,
            endDate: milestoneData?.endDate || undefined,
            budget: milestoneData?.budget || undefined,
            attachments: milestoneData?.attachments || undefined,
            status: milestoneData?.status || "PLANNED",
            isPrivate: milestoneData?.private || false,
            contacts: milestoneData?.contacts || undefined,
            openTo: milestoneData?.openTo || [],
            tools: [
                ...(milestoneData?.biosamples || []).map(({biosample}) => {
                    return (
                        {
                            value: biosample.id,
                            type: 'Biosamples',
                            icon: 'test-tube-diagonal',
                            // img: `https://api.dicebear.com/8.x/shapes/svg?seed=${biosample.donorId}`,
                            label: `${biosample.id}`,
                            biosample
                        }
                    )
                }),
                ...(milestoneData?.diseaseModels || []).map(({diseaseModel}) => {
                    return (
                        {
                            value: diseaseModel.id,
                            label: `${diseaseModel.id}`,
                            icon: 'rat',
                            type: 'Disease Models',
                            diseaseModel
                        }
                    )
                }),
                ...(milestoneData?.tools || []).map(({tool}) => {
                    return (
                        {
                            value: tool?.id,
                            label: `${tool?.id}`,
                            icon: 'database',
                            type: 'Clinical Datasets',
                            datasample: tool,
                        }
                    )
                })
            ],
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
        tools: form.watch("tools"),
        rfps: form.watch("rfps"),
        notes: form.watch("notes")
    }

    const handleMilestoneFormSubmit = async (values: z.infer<typeof editMilestoneForm>) => {
        // if form state is not valid, don't submit
        if (!form.formState.isValid) return

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
            tools,
            rfps,
            notes
        } = values;

        const updateData: any = {
            ...milestoneData,
            nodeType,
            title,
            ...(description !== undefined && description !== null ? {description} : undefined),
            // ...(startDate ? {startDate} : undefined),
            // ...(endDate ? {endDate} : undefined),
            // ...(budget ? {budget} : undefined),
            startDate: startDate || null,
            endDate: endDate || null,
            budget: budget || null,
            ...(attachments ? {attachments} : undefined),
            types: (types || []).map((type) => {
                return ({
                    milestoneId: milestoneData.id,
                    milestoneTypeId: type.id,
                    milestoneType: type
                })
            }).filter((type) => type !== undefined),
            // ...(otherTypeDetails !== undefined && otherTypeDetails !== null ? {otherTypeDetails} : undefined),
            metadata: {
                ...(milestoneData?.metadata ? JSON.parse(JSON.stringify(milestoneData.metadata)) : undefined),
                otherTypeDetails: values.otherTypeDetails
            } as JsonObject,
            status,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            ...(contacts ? {contacts} : undefined),
            ...(openTo ? {openTo} : undefined),
            // tools: (tools || []).map((tool) => {
            //     return ({
            //         milestoneId: milestoneData.id,
            //         toolId: tool.id,
            //         tool: tool
            //     })
            // }).filter((tool) => tool !== undefined),
            biosamples: (tools || []).filter(tool => tool.type === "Biosamples").map((tool) => {
                return ({
                    milestoneId: milestoneData.id,
                    biosampleId: tool.value,
                    biosample: tool.biosample
                })
            }),
            diseaseModels: (tools || []).filter(tool => tool.type === "Disease Models").map((tool) => {
                return ({
                    milestoneId: milestoneData.id,
                    diseaseModelId: tool.value,
                    diseaseModel: tool.diseaseModel
                })
            }),
            tools: (tools || []).filter(tool => tool.type === "Clinical Datasets").map((tool) => {
                return ({
                    milestoneId: milestoneData.id,
                    toolId: tool.value,
                    tool: tool.datasample
                })
            }),
            rfps: (rfps || []).map((rfp) => {
                return ({
                    milestoneId: milestoneData.id,
                    rfpId: rfp.id,
                    rfp: rfp
                })
            }).filter((rfp) => rfp !== undefined),
            ...(notes !== undefined && notes !== null ? {notes: JSON.stringify(notes)} : undefined)
        }

        if (milestoneData?.nodeId) setMilestone(milestoneData.nodeId, updateData)

        // update recommendations
        // if (milestoneData) {
        //     await setRecommendations([{
        //         ...milestoneData,
        //         ...updateData
        //     } as Milestone], {limit: 3})
        // }

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
        [milestoneData, setMilestone, milestoneTypeOptions]
    )

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    // memo ensures we're not creating a new debounce every time this is called
    const debounceUpdates = useMemo(() =>
            debounce((updatedValues) => handleMilestoneFormSubmitCallback(updatedValues), 500),
        [handleMilestoneFormSubmitCallback]
    )

    const debounceMixpanelTrackBudget = useMemo(() =>
            debounce((updatedBudget) => {
                mixpanelTrack("Project Budget Updated", {
                    "ID": milestoneData.id,
                    "Title": formData.title,
                    "Budget": updatedBudget
                })
            }, 500),
        []
    )

    const init = async () => {
        if (session?.user.organizationId) {
            const formattedBiosamples: Option[] = (biosampleOptions || []).map((biosample: Partial<Biosample>,) => {
                return (
                    {
                        value: biosample.id || '',
                        type: 'Biosamples',
                        icon: "test-tube-diagonal",
                        // img: `https://api.dicebear.com/8.x/shapes/svg?seed=${biosample.donorId}`,
                        label: `${biosample.id}`,
                        biosample
                    }
                )
            })
            const formattedDiseaseModels: Option[] = (diseaseModelOptions || []).map((diseaseModel: Partial<DiseaseModel>) => {
                return (
                    {
                        value: diseaseModel.id || '',
                        label: `${diseaseModel.id}`,
                        icon: 'rat',
                        type: 'Disease Models',
                        diseaseModel
                    }
                )
            })
            const formattedDatasamples: Option[] = (clinicalDatasetOptions || []).map((datasample: Partial<Tool>) => {
                return (
                    {
                        value: datasample.id || '',
                        label: `${datasample.id}`,
                        icon: 'database',
                        type: 'Clinical Datasets',
                        datasample
                    }
                )
            })
            setFetchedTools([...formattedBiosamples, ...formattedDiseaseModels, ...formattedDatasamples])
        }

        // if (milestoneData) {
        //     await setRecommendations([milestoneData as Milestone], {limit: 3})
        // }

        // trigger a form validation, if the imported data is not valid, let the user know right away
        form.trigger()

        initializing.current = false
    }

    // Initialization - Allow update once form is initialized
    useEffect(() => {

        init()

        // missing dependencies disabled - we only want to run this once on initialization
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // useEffect(() => {
    //     if (tab === "recommendations") setRecommendationsViewed(true)
    // }, [tab])

    // Watch form changes, don't watch while initializing
    useEffect(() => {
        const subscription = form.watch((values) => debounceUpdates(values))
        return () => subscription.unsubscribe();
    }, [form.watch, debounceUpdates, form])

    useEffect(() => {
        // Forces re-validation whenever the startDate or endDate changes
        if (!initializing.current) form.trigger()
    }, [formData.startDate, formData.endDate])

    // // handle onborda steps
    // useEffect(() => {
    //     if (step === ".onborda-recommendations" && isOnbordaVisible) {
    //         setTab("recommendations")
    //     }
    // }, [step])

    return (
        <>
            <Form {...form}>
                <ScrollArea className="px-8 pb-4 h-full">
                    <form
                        onKeyDown={handleKeyDown}
                        onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}
                        className="flex flex-col gap-4 mt-2 px-1 pb-12"
                    >
                        <Button className="absolute top-0 right-0 mx-4 my-2" variant="secondary" onClick={(e) => {
                            e.preventDefault()
                            onClose()
                        }}>
                            <X/>
                        </Button>

                        <EditTitle form={form}/>

                        <Tabs value={tab} onValueChange={(value) => setTab(value)}
                              className="space-y-4 w-full h-full">
                            <div className="flex gap-4 items-center justify-between">
                                <TabsList className="flex flex-wrap h-fit gap-2 bg-white">
                                    <TabsTrigger value="edit" className="data-[state=active]:bg-secondary">
                                        Edit
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="data-[state=active]:bg-secondary">
                                        Notes
                                    </TabsTrigger>
                                    {/* <TabsTrigger
                                        className="relative data-[state=active]:bg-secondary"
                                        value="recommendations"
                                    >
                                        <div className="relative z-10 flex gap-2 items-center">
                                            Relevant vendors
                                        </div>
                                        <div className={cn("absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-inherit")} />
                                    </TabsTrigger> */}
                                    {/*<TabsTrigger className="relative data-[state=active]:bg-secondary" value="publications">*/}
                                    {/*    Publications*/}
                                    {/*</TabsTrigger>*/}
                                    <TabsTrigger className="relative data-[state=active]:bg-secondary" value="projects">
                                        Similar projects
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            {isMigrating ? (
                                <Loading/>
                            ) : (
                                <>
                                    <Separator/>
                                    <TabsContent value="edit" className="space-y-6 w-full h-full">
                                        <div className="w-full grid grid-cols-[100px_auto] gap-2 items-center">
                                            <FormLabel>Visibility</FormLabel>
                                            <div className="flex gap-2 justify-between items-center">
                                                <PrivatePublicFormField
                                                    form={form}
                                                    formData={formData}
                                                    // disabled={!orgIsPublished}
                                                    mixpanelTrackCallback={(updatedIsPrivate) => {
                                                        mixpanelTrack("Project Visibility Updated", {
                                                            "ID": milestoneData.id,
                                                            "Title": formData.title,
                                                            "Visibility": updatedIsPrivate ? "Private" : "Published"
                                                        })
                                                    }}
                                                />
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            <Button
                                                                disabled={formData.isPrivate}
                                                                onClick={(e) => {
                                                                    if (formData.isPrivate) return
                                                                    e.preventDefault()
                                                                    handleShare()
                                                                }}
                                                                variant={'secondary'}
                                                            >
                                                                <Share/>
                                                                Share
                                                            </Button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {formData.isPrivate && (
                                                        <TooltipContent side={"top"}>
                                                            <p>This project is private. Make it public to share.</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({field}) => (
                                                    <>
                                                        <FormLabel>{`Description`}</FormLabel>
                                                        <div className="flex flex-col gap-2">
                                                            <FormControl>
                                                                <Textarea
                                                                    id="description"
                                                                    placeholder={`Enter a description...`}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </div>
                                                    </>
                                                )}
                                            />

                                            <div>
                                                <FormLabel>{`Project Type`}</FormLabel>
                                                {formData?.types?.length === 3 &&
                                                    <FormDescription>{`Maximum selection is 3 types.`}</FormDescription>}
                                            </div>
                                            <MilestoneTypeFormField form={form} milestoneTypes={milestoneTypeOptions}/>

                                            <FormLabel>{`Project Status`}</FormLabel>
                                            <StatusFormField
                                                form={form}
                                                mixpanelTrackCallback={(updatedStatus) => {
                                                    mixpanelTrack("Project Status Updated", {
                                                        "ID": milestoneData.id,
                                                        "Title": formData.title,
                                                        "Status": updatedStatus
                                                    })
                                                }}
                                            />

                                            <FormLabel>Linked Tools</FormLabel>
                                            <FormField
                                                control={form.control}
                                                name="tools"
                                                render={({field}) => (
                                                    <FormItem className="w-full">
                                                        <FormControl>
                                                            <MultipleSelector
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                defaultOptions={fetchedTools}
                                                                options={fetchedTools}
                                                                hidePlaceholderWhenSelected={true}
                                                                showHoverCard={false}
                                                                placeholder="Link tools"
                                                                badgeClassName="border-transparent bg-green-100 text-green-900"
                                                                emptyIndicator={
                                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                        no results found.
                                                                    </p>
                                                                }
                                                                groupBy={'type'}
                                                                creatable={true}
                                                                creatableItemOverride={() => (
                                                                    <div
                                                                        className="w-full p-1 bg-white flex flex-col gap-1">
                                                                        <Separator/>
                                                                        <Button
                                                                            value={undefined}
                                                                            variant={'ghost'}
                                                                            className="hover:cursor-pointer w-full justify-start max-h-8 p-0 text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                            onClick={() => setCreateBiosampleIsOpen(true)}
                                                                        >
                                                                            {`+ Create Biosample`}
                                                                        </Button>
                                                                        <Button
                                                                            value={undefined}
                                                                            variant={'ghost'}
                                                                            className="hover:cursor-pointer w-full justify-start max-h-8 p-0 text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                            onClick={() => setCreateDiseaseModelIsOpen(true)}
                                                                        >
                                                                            {`+ Create Disease Model`}
                                                                        </Button>
                                                                        <Button
                                                                            value={undefined}
                                                                            variant={'ghost'}
                                                                            className="hover:cursor-pointer w-full justify-start max-h-8 p-0 text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                            onClick={() => setCreateClinicalDatasetIsOpen(true)}
                                                                        >
                                                                            {`+ Create Clinical Dataset`}
                                                                        </Button>
                                                                    </div>
                                                                )}
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
                                                                value={field.value?.map(rfp => ({
                                                                    ...rfp,
                                                                    value: rfp.id,
                                                                    label: rfp.title,
                                                                    icon: 'megaphone'
                                                                } as Option))}
                                                                onChange={field.onChange}
                                                                defaultOptions={rfpOptions?.map(rfp => ({
                                                                    ...rfp,
                                                                    value: rfp.id,
                                                                    label: rfp.title,
                                                                } as Option))}
                                                                options={rfpOptions?.map(rfp => ({
                                                                    ...rfp,
                                                                    value: rfp.id,
                                                                    label: rfp.title
                                                                } as Option))}
                                                                hidePlaceholderWhenSelected={true}
                                                                badgeClassName="border-transparent bg-orange-100 text-orange-900"
                                                                showHoverCard={false}
                                                                placeholder="Link RFPs"
                                                                emptyIndicator={
                                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                        no results found.
                                                                    </p>
                                                                }
                                                                creatable={true}
                                                                creatableItemOverride={() => (
                                                                    <div
                                                                        className="w-full px-1 pb-1 flex flex-col gap-1">
                                                                        <Separator/>
                                                                        <Button
                                                                            value={undefined}
                                                                            variant={'ghost'}
                                                                            className="hover:cursor-pointer w-full justify-start max-h-8 p-0 text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                            onClick={() => setCreateRFPIsOpen(true)}
                                                                        >
                                                                            {`+ Create RFP`}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-primary"/>
                                                    </FormItem>
                                                )}
                                            />

                                            {hasBudget && (
                                                <>
                                                    <FormLabel>{`Budget`}</FormLabel>
                                                    <span className="w-full flex gap-2">
                                                        <div className="w-full grow">
                                                            <BudgetFormField
                                                                form={form}
                                                                mixpanelTrackCallback={(updatedBudget) =>
                                                                    debounceMixpanelTrackBudget(updatedBudget)
                                                                }
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="secondary"
                                                            size={'icon'}
                                                            className="h-[32px] min-w-[32px]"
                                                            onClick={() => {
                                                                form.setValue('budget', undefined, {shouldValidate: true})
                                                                setHasBudget(false)
                                                            }}
                                                        >
                                                            <Trash/>
                                                        </Button>
                                                    </span>
                                                </>
                                            )}

                                            {hasStartDate && (
                                                <FormField
                                                    control={form.control}
                                                    name="startDate"
                                                    render={({field}) => (
                                                        <>
                                                            <FormLabel>{'Start Date'}</FormLabel>
                                                            <div className="flex gap-2">
                                                                <Select
                                                                    defaultValue={field.value ? monthsList[new Date(field.value).getMonth()] : undefined}
                                                                    onValueChange={(value) => {
                                                                        const previousStartDate: Date = field.value ? new Date(field.value) : new Date()
                                                                        const monthIndex = monthsList.indexOf(value)
                                                                        const newStartDate: Date = new Date(previousStartDate.setMonth(monthIndex))
                                                                        form.setValue('startDate', newStartDate, {shouldValidate: true})
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
                                                                        form.setValue('startDate', newStartDate, {shouldValidate: true})
                                                                    }}
                                                                />

                                                                <Button
                                                                    variant={'secondary'}
                                                                    size={'icon'}
                                                                    className="h-[32px] min-w-[32px]"
                                                                    onClick={() => {
                                                                        form.setValue('startDate', undefined, {shouldValidate: true})
                                                                        setHasStartDate(false)
                                                                    }}
                                                                >
                                                                    <Trash/>
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                />
                                            )}

                                            {hasEndDate && (
                                                <FormField
                                                    control={form.control}
                                                    name="endDate"
                                                    render={({field}) => (
                                                        <>
                                                            <FormLabel>{'End Date'}</FormLabel>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex gap-2">
                                                                    <Select
                                                                        defaultValue={field.value ? monthsList[new Date(field.value).getMonth()] : undefined}
                                                                        onValueChange={(value) => {
                                                                            const previousEndDate: Date = field.value ? new Date(field.value) : new Date()
                                                                            const monthIndex = monthsList.indexOf(value)
                                                                            const newEndDate: Date = new Date(previousEndDate.setMonth(monthIndex))
                                                                            form.setValue('endDate', newEndDate, {shouldValidate: true})
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
                                                                            form.setValue('endDate', newEndDate, {shouldValidate: true})
                                                                        }}
                                                                    />

                                                                    <Button
                                                                        variant={'secondary'}
                                                                        size={'icon'}
                                                                        className="h-[32px] min-w-[32px]"
                                                                        onClick={() => {
                                                                            form.setValue('endDate', undefined, {shouldValidate: true})
                                                                            setHasEndDate(false)
                                                                        }}
                                                                    >
                                                                        <Trash/>
                                                                    </Button>
                                                                </div>
                                                                <FormMessage/>
                                                            </div>
                                                        </>
                                                    )}
                                                />
                                            )}
                                        </div>
                                        {(formData?.contacts && formData?.contacts.length > 0) && (
                                            <ContactsFormField form={form}/>
                                        )}

                                        {(formData?.attachments && formData?.attachments.length > 0) && (
                                            <AttachmentsFormField form={form}/>
                                        )}

                                        {(
                                            !hasBudget ||
                                            !hasStartDate ||
                                            !hasEndDate ||
                                            !(formData?.contacts && formData?.contacts.length > 0) ||
                                            !(formData?.attachments && formData?.attachments.length > 0)
                                        ) && (
                                            <>
                                                {/* <FormLabel>Additional Properties</FormLabel> */}
                                                <span className="flex flex-wrap gap-2">
                                                    {(!hasBudget) && (
                                                        <Button
                                                            onClick={() => setHasBudget(true)}
                                                            variant={'secondary'}
                                                            className="p-2 max-h-[28px]"
                                                        >
                                                            {'+ Add Budget'}
                                                        </Button>
                                                    )}
                                                    {(!hasStartDate) && (
                                                        <Button
                                                            onClick={() => setHasStartDate(true)}
                                                            variant={'secondary'}
                                                            className="p-2 max-h-[28px]"
                                                        >
                                                            {'+ Add Start Date'}
                                                        </Button>
                                                    )}
                                                    {(!hasEndDate) && (
                                                        <Button
                                                            onClick={() => setHasEndDate(true)}
                                                            variant={'secondary'}
                                                            className="p-2 max-h-[28px]"
                                                        >
                                                            {'+ Add End Date'}
                                                        </Button>
                                                    )}
                                                    {(!formData?.contacts || formData?.contacts.length <= 0) && (
                                                        <Button
                                                            onClick={() => {
                                                                form.setValue("contacts", [
                                                                    {name: "", email: "", role: null}
                                                                ])
                                                            }}
                                                            variant={'secondary'}
                                                            className="p-2 max-h-[28px]"
                                                        >
                                                            {'+ Add Contacts'}
                                                        </Button>
                                                    )}
                                                    {(!formData?.attachments || formData?.attachments.length <= 0) && (
                                                        <Button
                                                            onClick={() => {
                                                                form.setValue("attachments", [
                                                                    {name: '', link: ''} as any
                                                                ])
                                                            }}
                                                            variant={'secondary'}
                                                            className="p-2 max-h-[28px]"
                                                        >
                                                            {'+ Add Links'}
                                                        </Button>
                                                    )}
                                                </span>
                                            </>
                                        )}

                                        <span className="h-8"/>

                                        <span
                                            className="flex justify-end gap-4 flex-wrap absolute bottom-2 right-0 m-4">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="destructive">
                                                        Delete Project
                                                    </Button>
                                                </DialogTrigger>
                                                <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
                                            </Dialog>
                                            <Button
                                                disabled={!form.formState.isValid}
                                                variant={"cta"}
                                                id="edit-milestone-scroll-area"
                                                className="onborda-save-project"
                                                onClick={() => {
                                                    handleMilestoneFormSubmit(form.getValues())
                                                    onClose()
                                                }}
                                            >
                                                Save Changes
                                            </Button>
                                        </span>
                                    </TabsContent>
                                    <TabsContent value="notes" className="space-y-6 w-full h-full">
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({field}) => (
                                                <FormItem className="w-full">
                                                    <FormLabel className="flex gap-2 items-center">
                                                        {`Notes`}
                                                        <PrivateBadge className="font-normal text-gray-500"
                                                                      iconOnly={true}/>
                                                    </FormLabel>
                                                    <FormDescription>
                                                        {`Add any internal notes about this project. Notes are always private, and will never be shown on your profile.`}
                                                    </FormDescription>
                                                    <FormControl>
                                                        <div className="w-full col-span-2 z-10" data-registry="plate">
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
                                    </TabsContent>
                                    {/* <TabsContent value="recommendations" className="space-y-4 w-full">
                                        {!recommendations && (
                                            <div className="flex flex-col gap-4">
                                                <Skeleton className="w-full h-[230px]"/>
                                                <Skeleton className="w-full h-[230px]"/>
                                                <Skeleton className="w-full h-[230px]"/>
                                            </div>
                                        )}

                                        {(recommendations && recommendations.length === 0) && (
                                            <Card
                                                className="w-full flex flex-col mx-auto justify-center items-center align-center">
                                                <CardContent className="flex flex-col gap-4 p-4">
                                                    <h2 className="text-xl">{`Sorry, we don't have any recommendations for this project`}</h2>
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
                                                        {`Please add more information to your project to generate some recommendations.`}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {recommendations && recommendations.length > 0 && (
                                            <>
                                                <div className={cn("w-full grid gap-4 grid-cols-1")}>
                                                    {(recommendations || []).map((result: Recommendation, index) => (
                                                        <CROMarketplaceCard
                                                            cro={result.content}
                                                            key={index}
                                                            milestone={milestoneData}
                                                            location={"Research Planner"}
                                                            savedCompanyIds={savedCompanyIds}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        <Link
                                            href={`/app/marketplace/service-providers?milestoneTypes=${(formData?.types || [])
                                                .map((t: any) => t?.value || t?.id)
                                                .join(",")}`}
                                        >
                                            <Button className="pl-0" variant={"link"}>
                                                <Store/>
                                                Explore Marketplace
                                            </Button>
                                        </Link>
                                    </TabsContent> */}
                                    {/*<TabsContent value="publications" className="space-y-4 w-full">*/}
                                    {/*    <EditMilestoneDetailsPublicationsTab*/}
                                    {/*        onAttach={(att) => addAttachmentToForm(form, att)}*/}
                                    {/*    />*/}
                                    {/*</TabsContent>*/}
                                    <TabsContent value="projects" className="space-y-4 w-full">
                                        <EditMilestoneDetailsProjectsTab projectId={milestoneData.id}/>
                                    </TabsContent>
                                </>
                            )}
                        </Tabs>
                    </form>
                </ScrollArea>
            </Form>

            <Dialog open={createBiosampleIsOpen} onOpenChange={setCreateBiosampleIsOpen}>
                <DialogContent className="gap-0">
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            Create Biosample Tool
                        </DialogTitle>
                        <DialogDescription>
                            {`Create your Tool here. Click save when you're done.`}
                        </DialogDescription>
                    </DialogHeader>
                    <EditBiosampleToolForm
                        toolData={{}}
                        closeDialog={(newBiosample) => {
                            setCreateBiosampleIsOpen(false)

                            if (newBiosample) {
                                form.setValue("tools", [
                                    ...(form.getValues("tools") || []),
                                    {
                                        value: newBiosample.id,
                                        type: 'Biosamples',
                                        // img: `https://api.dicebear.com/8.x/shapes/svg?seed=${newBiosample.donorId}`,
                                        label: `${newBiosample.id}`,
                                        biosample: newBiosample
                                    }
                                ])
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={createDiseaseModelIsOpen} onOpenChange={setCreateDiseaseModelIsOpen}>
                <DialogContent className="gap-0">
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            Create Disease Model Tool
                        </DialogTitle>
                        <DialogDescription>
                            {`Create your Tool here. Click save when you're done.`}
                        </DialogDescription>
                    </DialogHeader>
                    <EditDiseaseModelToolForm
                        toolData={{}}
                        closeDialog={(newDiseaseModel) => {
                            setCreateDiseaseModelIsOpen(false)

                            if (newDiseaseModel) {
                                form.setValue("tools", [
                                    ...(form.getValues("tools") || []),
                                    {
                                        value: newDiseaseModel.id,
                                        label: `${newDiseaseModel.id}`,
                                        type: 'Disease Models',
                                        diseaseModel: newDiseaseModel
                                    }
                                ])
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={createClincalDatasetIsOpen} onOpenChange={setCreateClinicalDatasetIsOpen}>
                <DialogContent className="gap-0">
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            Create Data Tool
                        </DialogTitle>
                        <DialogDescription>
                            {`Create your Tool here. Click save when you're done.`}
                        </DialogDescription>
                    </DialogHeader>
                    <EditClincalDatasetForm
                        toolData={{}}
                        closeDialog={(newDatasample) => {
                            setCreateClinicalDatasetIsOpen(false)

                            if (newDatasample) {
                                form.setValue("tools", [
                                    ...(form.getValues("tools") || []),
                                    {
                                        value: newDatasample.id,
                                        label: newDatasample.id,
                                        type: 'Clinical Datasets',
                                        datasample: newDatasample
                                    }
                                ])
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={createRFPIsOpen} onOpenChange={setCreateRFPIsOpen}>
                <DialogContent className="gap-0">
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            Create an RFP
                        </DialogTitle>
                        <DialogDescription>
                            {`Create your RFP here. Click save when you're done.`}
                        </DialogDescription>
                    </DialogHeader>
                    <EditRFPForm
                        rfpData={{
                            milestones: [
                                {
                                    milestoneId: milestoneData.id,
                                    rfpId: nanoid(),
                                    milestone: milestoneData
                                } as any
                            ]
                        }}
                        closeDialog={(newRFP) => {
                            setCreateRFPIsOpen(false)

                            if (newRFP) {
                                form.setValue("rfps", [
                                    ...(form.getValues("rfps") || []),
                                    newRFP as any
                                ])
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
                <DialogContent className="min-w-fit">
                    {organization && "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestoneData.roadmapId}?project=${milestoneData.id}`}
                            organization={organization}
                            postMessage={`A new project ${formData.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestoneData.roadmapId}?project=${milestoneData.id}`}
                            postSubject={`A new project ${formData.title} has been added to ${organization.name}`}
                            embeddedProjectData={{
                                embeddedProjectLink: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization.subdomain}/research-plan/${milestoneData.roadmapId}/project/${milestoneData.id}`,
                                projectId: milestoneData.id,
                                projectTitle: milestoneData.title
                            }}
                            // trackShareEvent={(socialOption: string) => {
                            //     mixpanelTrack(`Project Shared`, {
                            //         "Platform": socialOption,
                            //         ...(organization ? {
                            //             "Organization ID": organization.id,
                            //             "Organization Name": organization.name,
                            //             "Project ID": milestoneData.id,
                            //             "Project Title": milestoneData.title
                            //         } : undefined)
                            //     })
                            // }}
                            trackShareEvent={{
                                title: `Project Shared`,
                                additonalProperties: {
                                    "Project ID": milestoneData.id,
                                    "Project Title": milestoneData.title
                                }
                            }}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">Loading organization...</div>
                    )}
                </DialogContent>
            </Dialog>
        </>
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
                    <FormItem className="w-full">
                        <FormControl>
                            <MultipleSelector
                                {...field}
                                maxSelected={3}
                                badgeClassName={badgeVariants({variant: "lightBlue"})}
                                defaultOptions={milestoneTypes?.map(type => ({...type, value: type.id}))}
                                options={milestoneTypes?.map(type => ({...type, value: type.id}))}
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

            {types?.map((type: any) => type?.value).includes("OTHER") && (
                <>
                    <div>
                        <FormLabel className="text-sm">{`Type Description`}</FormLabel>
                    </div>
                    <FormField
                        control={form.control}
                        name="otherTypeDetails"
                        render={({field}) => (
                            <FormItem className="flex flex-col grow">
                                <FormControl>
                                    <Textarea
                                        id="otherTypeDetails"
                                        placeholder={`Please add a short note about your project type — it helps us make the platform better.`}
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

export const PrivatePublicFormField = ({
                                           form,
                                           formData,
                                           //    disabled = false,
                                           mixpanelTrackCallback
                                       }: {
    form: any,
    formData: any,
    // disabled?: boolean,
    mixpanelTrackCallback?: (isPrivate: boolean) => void
}) => {
    // if (disabled) {
    //     return (
    //         <FormField
    //             control={form.control}
    //             name="isPrivate"
    //             render={({field}) => (
    //                 <div className="h-full items-center flex flex-row justify-end gap-4">
    //                     <FormControl>
    //                         <Tooltip>
    //                             <TooltipTrigger>
    //                                 <RadioGroup
    //                                     onValueChange={(value) => {
    //                                         if (mixpanelTrackCallback) mixpanelTrackCallback(value === "PRIVATE")
    //                                         form.setValue("isPrivate", value === "PRIVATE", {shouldValidate: true})
    //                                     }}
    //                                     defaultValue={field.value ? "PRIVATE" : "PUBLIC"}
    //                                     className={cn("flex flex-wrap space-y-0", disabled ? "opacity-50" : "")}
    //                                     disabled={disabled}
    //                                 >
    //                                     <FormItem className="flex items-center space-y-0">
    //                                         <FormControl>
    //                                         <span className="flex gap-2">
    //                                             <RadioGroupItem value="PRIVATE"/>
    //                                                 <FormLabel className="font-normal flex gap-1 items-center">
    //                                                     <Lock className="h-4 w-4"/>
    //                                                     {`Private`}
    //                                                 </FormLabel>
    //                                         </span>
    //                                         </FormControl>
    //                                     </FormItem>
    //                                     <FormItem className="flex items-center space-y-0">
    //                                         <FormControl>
    //                                         <span className="flex gap-2">
    //                                             <RadioGroupItem value="PUBLIC"/>
    //                                             <FormLabel className="font-normal flex gap-1 items-center">
    //                                                 <Globe className="h-4 w-4"/>
    //                                                 {`Published`}
    //                                             </FormLabel>
    //                                         </span>
    //                                         </FormControl>
    //                                     </FormItem>
    //                                 </RadioGroup>
    //                             </TooltipTrigger>
    //                             {disabled && (
    //                                 <TooltipContent className="max-w-80 text-wrap text-left">
    //                                     {`Publish your organization to create public projects.`}
    //                                 </TooltipContent>
    //                             )}
    //                         </Tooltip>
    //                     </FormControl>
    //                     <FormMessage/>
    //                 </div>
    //             )}
    //         />
    //     )
    // }

    return (
        <FormField
            control={form.control}
            name="isPrivate"
            render={({field}) => (
                <span className="h-full items-center flex flex-row justify-end gap-4">
                <FormControl className="-mt-2">
                        <RadioGroup
                            onValueChange={(value) => {
                                if (mixpanelTrackCallback) mixpanelTrackCallback(value === "PRIVATE")
                                form.setValue("isPrivate", value === "PRIVATE")
                            }}
                            defaultValue={field.value ? "PRIVATE" : "PUBLIC"}
                            className={cn("flex flex-wrap space-y-0")}
                            // className={cn("flex flex-wrap space-y-0", disabled ? "opacity-50" : "")}
                            // disabled={disabled}
                        >
                            <FormItem className="flex items-center space-y-0">
                                <FormControl>
                                    <span className="flex gap-2">
                                        <RadioGroupItem value="PRIVATE"/>
                                        <Tooltip
                                            // disableHoverableContent={disabled}
                                        >
                                            <TooltipTrigger
                                                // disabled={disabled} 
                                                asChild
                                            >
                                                <FormLabel className="font-normal flex gap-1 items-center">
                                                    <Lock className="h-4 w-4"/>
                                                    {`Private`}
                                                </FormLabel>
                                            </TooltipTrigger>
                                            {/* {!disabled && (
                                                <TooltipContent className="max-w-80 text-wrap text-left">
                                                    {`Private projects are only visible to your team.`}
                                                </TooltipContent>
                                            )} */}
                                        </Tooltip>
                                    </span>
                                </FormControl>
                            </FormItem>
                            <FormItem className="flex items-center space-y-0">
                                <FormControl>
                                    <span className="flex gap-2">
                                        <RadioGroupItem value="PUBLIC"/>
                                        <Tooltip
                                            // disableHoverableContent={disabled}
                                        >
                                        <TooltipTrigger
                                            // disabled={disabled} 
                                            asChild
                                        >
                                            <FormLabel className="font-normal flex gap-1 items-center">
                                                <Globe className="h-4 w-4"/>
                                                {`Published`}
                                            </FormLabel>
                                        </TooltipTrigger>
                                            {/* {!disabled && (
                                                <TooltipContent className="max-w-80 text-wrap text-left">
                                                    {`Published projects are visible on your profile and discoverable in the marketplace.`}
                                                </TooltipContent>
                                            )} */}
                                    </Tooltip>
                                    </span>
                                </FormControl>
                            </FormItem>
                        </RadioGroup>
                </FormControl>
                <FormMessage/>
            </span>
            )}
        />
    )
}

const StatusFormField = ({form, mixpanelTrackCallback}: {
    form: any,
    mixpanelTrackCallback?: (newValue: string) => void
}) => {
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
                            onStatusChange={(status) => {
                                if (mixpanelTrackCallback) mixpanelTrackCallback(status)
                                field.onChange(status)
                            }}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export const BudgetFormField = ({
                                    form,
                                    mixpanelTrackCallback
                                }: {
    form: any,
    mixpanelTrackCallback?: (budget: number) => void
}) => {
    return (
        <MoneyInput
            className="-mt-2"
            form={form}
            name="budget"
            mixpanelTrackCallback={mixpanelTrackCallback}
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
            <FormField
                control={form.control}
                name="startDate"
                render={({field}) => (
                    <>
                        <FormLabel>{startLabel ? startLabel : `Start`}</FormLabel>
                        <div className="flex gap-2">
                            <Select
                                defaultValue={field.value ? monthsList[new Date(field.value).getMonth()] : undefined}
                                onValueChange={(value) => {
                                    const previousStartDate: Date = field.value ? new Date(field.value) : new Date()
                                    const monthIndex = monthsList.indexOf(value)
                                    const newStartDate: Date = new Date(previousStartDate.setMonth(monthIndex))
                                    form.setValue('startDate', newStartDate, {shouldValidate: true})
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
                                    form.setValue('startDate', newStartDate, {shouldValidate: true})
                                }}
                            />
                        </div>
                    </>
                )}
            />

            <FormField
                control={form.control}
                name="endDate"
                render={({field}) => (
                    <>
                        <FormLabel>{endLabel ? endLabel : `End`}</FormLabel>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <Select
                                    defaultValue={field.value ? monthsList[new Date(field.value).getMonth()] : undefined}
                                    onValueChange={(value) => {
                                        const previousEndDate: Date = field.value ? new Date(field.value) : new Date()
                                        const monthIndex = monthsList.indexOf(value)
                                        const newEndDate: Date = new Date(previousEndDate.setMonth(monthIndex))
                                        form.setValue('endDate', newEndDate, {shouldValidate: true})
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
                                        form.setValue('endDate', newEndDate, {shouldValidate: true})
                                    }}
                                />
                            </div>
                            <FormMessage/>
                        </div>
                    </>
                )}
            />
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
                    <FormLabel>{`Open to`}</FormLabel>
                    <FormDescription>{`Specify which parties you wish to source proposals from.`}</FormDescription>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export function AttachmentsFormField({form}: { form: UseFormReturn<any> }) {
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
                                            <Plus/>
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
                                    <Plus/>
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
