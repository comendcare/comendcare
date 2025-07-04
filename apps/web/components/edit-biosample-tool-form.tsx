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
import {MilestoneType, Prisma, ToolType} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Delete, Pin } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import { AssetState, useAssetStore } from "@/state/asset/assetStore"
import { useShallow } from "zustand/react/shallow"
import ProjectMultipleSelector from "./project-multiple-selector"
import { DeleteAssetDialog } from "./delete-asset-dialog"
import { badgeVariants } from "@/packages/components/ui/badge"
// import { DeleteAssetDialog } from "./delete-tool-dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { JsonObject } from "@prisma/client/runtime/library"
import type { Option } from "@comend/lib/types"

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
    milestones: z.array(z.custom<Milestone>()).optional()
})

const toolSelector = (state: AssetState) => ({
    toolTypes: state.toolTypes,
    createAsset: state.createAsset,
    updateAsset: state.updateAsset
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
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const { toolTypes, createAsset, updateAsset } = useAssetStore(useShallow(toolSelector))
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
                await updateAsset(updateData, session.user.organizationId)
                toast.success(
                    "Tool updated successfully!",
                    {position: "bottom-left"}
                )
            } else {
                await createAsset(updateData, session.user.organizationId)
                toast.success(
                    "Tool created successfully!",
                    {position: "bottom-left"}
                )
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
