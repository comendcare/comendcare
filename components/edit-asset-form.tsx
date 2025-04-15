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
} from "./ui/form"
import {Input} from "./ui/input"
import {Textarea} from "./ui/textarea"
import {Button} from "./ui/button"
import {ScrollArea, ScrollBar} from "./ui/scroll-area"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog"
import {Asset, Milestone} from "@/lib/types"
import {Prisma} from "@prisma/client"
import {getMilestones, getOrganizationFromOrganizationId} from "@/lib/fetchers"
import {useSession} from "next-auth/react"
import {cn} from "@/lib/utils"
import MultipleSelector from "./ui/multiple-selector"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createOrUpdateAsset, deleteAsset } from "@/lib/actions"
import { Option } from "@/lib/types"
import { Pin } from "lucide-react"


type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional()
    // disable: z.boolean().optional(),
});

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
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPinned: z.boolean(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional()
})

export function EditAssetForm({
    assetData,
    closeDialog
}: {
    assetData: Partial<Asset>,
    closeDialog?: () => void
}) {
    const router = useRouter()
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    const form = useForm<z.infer<typeof editAssetForm>>({
        mode: "onChange",
        resolver: zodResolver(editAssetForm),
        defaultValues: {
            title: assetData?.title || "",
            description: assetData?.description || "",
            attachments: assetData?.attachments || undefined,
            isPinned: assetData?.pinned || false,
            isPrivate: assetData?.private !== undefined ? assetData?.private : true,
            contacts: assetData?.contacts || undefined,
            milestones: (assetData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description"),
        attachments: form.watch("attachments"),
        isPinned: form.watch("isPinned"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editAssetForm>) => {
        console.log(`handle form submit`, values)
        const {
            title,
            description,
            attachments,
            isPinned,
            isPrivate,
            contacts,
            milestones,
        } = values;

        console.log(`save`, values)

        const updateData: Partial<Asset> = {
            ...assetData,
            title,
            pinned: isPinned || false,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    assetId: assetData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
        }

        console.log(`updateData`, updateData)

        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        try {
            await createOrUpdateAsset(updateData, session.user.organizationId);
            toast.success("Asset created or updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error creating or updating asset:", error);
            toast.error("Failed to create or update asset.");
        }
    }

    const handleDeleteAsset = async () => {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.")
            return
        }

        if (!assetData.id) {
            toast.error("This asset does not have an id.")
            return
        }

        try {
            await deleteAsset(assetData.id)
            if (closeDialog) closeDialog()
            toast.success("Asset deleted successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error deleting asset:", error);
            toast.error("Failed to delete asset.");
        }
    }

    // Initialization - Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {
                const response = await getOrganizationFromOrganizationId(session.user.organizationId)
                if (response.success && response.data) {
                    setOrgIsPublished(response.data.published)
                }
            }

            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined)
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse?.data as Milestone[])
            } else {
                console.error(milestonesResponse.error)
            }

            // trigger a form validation if we're editing an asset, if the imported data is not valid, let the user know right away
            if (Object.keys(assetData).length > 0) form.trigger()

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
                        name="isPinned"
                        render={({field}) => (
                            <FormItem className="flex justify-between items-center">
                                <div>
                                    <FormLabel>{`Pinned to profile`}</FormLabel>
                                    <FormDescription>
                                        {`Pinning an asset to your profile highlights it in the assets section of your organization profile.`}
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Button 
                                        variant="ghost" 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            form.setValue("isPinned", !field.value)
                                        }}
                                    >
                                        {field.value ? <Pin fill="currentColor"/> : <Pin />}
                                    </Button>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormItem className="flex justify-between items-center">
                        <div>
                            <FormLabel>Visibility</FormLabel>
                            <FormDescription>
                                {`Changing the visiblity of your asset allows you show or hide it from people outside your organization.`}
                            </FormDescription>
                        </div>
                        <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full mt-2">
                                <FormLabel >{`Linked Projects`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value?.map(milestone => ({...milestone, value: milestone.id, label: milestone.title} as Option))}
                                        onChange={field.onChange}
                                        defaultOptions={fetchedMilestones.map(milestone => ({...milestone, value: milestone.id, label: milestone.title} as Option))}
                                        options={fetchedMilestones.map(milestone => ({...milestone, value: milestone.id, label: milestone.title} as Option))}
                                        hidePlaceholderWhenSelected={true}
                                        showHoverCard={false}
                                        placeholder="Link projects"
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
                        <Dialog>
                            <DialogTrigger asChild className={cn(assetData.id ? "" : "hidden")}>
                                <Button type="button" variant="destructive">
                                    Delete Asset
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`This action cannot be undone. This will permanently delete your Asset and it's data.`}
                                    </DialogDescription>
                                    <DialogFooter>
                                        <DialogClose>
                                            <Button type="button">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <DialogClose>
                                            <Button
                                                type="button"
                                                variant={"destructive"}
                                                onClick={handleDeleteAsset}
                                            >
                                                Delete Asset
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogHeader>
                            </DialogContent>
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
