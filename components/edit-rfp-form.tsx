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
import {Milestone, RFP} from "@/lib/types"
import {Prisma} from "@prisma/client"
import {getMilestones, getOrganizationFromOrganizationId} from "@/lib/fetchers"
import {useSession} from "next-auth/react"
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover"
import {cn} from "@/lib/utils"
import {format} from "date-fns"
import {Calendar} from "./ui/calendar"
import MultipleSelector from "./ui/multiple-selector"
import { Calendar as CalendarIcon, Pencil, Pin } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createOrUpdateRFP, deleteRFP } from "@/lib/actions"
import { Option } from "@/lib/types"
import { AttachmentsFormField, ContactsFormField, OpenToFormField, PrivatePublicFormField } from "./edit-milestone-form"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

const HEADER_IMAGE_OPTIONS = [
    // {
    //     label: "Yellow",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-yellow.svg"
    // },
    // {
    //     label: "Pink",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-pink.png"
    // },
    // {
    //     label: "Purple",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-purple.png"
    // },
    // {
    //     label: "Red",
    //     path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-pattern-red.png"
    // }
    {
        label: "Yellow",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-yellow.png"
    },
    {
        label: "Pink",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-red.png"
    },
    {
        label: "Blue",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-blue.png"
    },
    {
        label: "Green",
        path: "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-green.png"
    }
]

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional()
    // disable: z.boolean().optional(),
});

const editRFPForm = z.object({
    headerImage: z.string().optional(),
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
    openTo: z.array(z.string()).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    milestones: z.array(z.custom<Milestone>()).optional()
}).refine(
    (rfp) => rfp.startDate && rfp.endDate ? rfp.startDate?.getTime() <= rfp.endDate?.getTime() : true, 
    {
        message: "Error: Please adjust the dates so the acceptance date comes before the deadline.",
        path: ["endDate"]
    }
)

export function EditRFPForm({
    rfpData,
    closeDialog
}: {
    rfpData: Partial<RFP>,
    closeDialog?: () => void
}) {
    const router = useRouter()
    const initializing = useRef(true)
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    const form = useForm<z.infer<typeof editRFPForm>>({
        mode: "onChange",
        resolver: zodResolver(editRFPForm),
        defaultValues: {
            headerImage: rfpData?.headerImage || "https://storage.googleapis.com/comend-app-public-permanent/zebra-light-blue.png",
            // headerImage: rfpData?.headerImage || undefined,
            title: rfpData?.title || "",
            description: rfpData?.description || "",
            attachments: rfpData?.attachments || undefined,
            isPinned: rfpData?.pinned || false,
            isPrivate: rfpData?.private !== undefined ? rfpData?.private : true,
            contacts: rfpData?.contacts || undefined,
            openTo: rfpData?.openTo || [],
            startDate: rfpData?.startDate || undefined,
            endDate: rfpData?.endDate || undefined,
            milestones: (rfpData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
        }
    })

    const formData = {
        headerImage: form.watch("headerImage"),
        title: form.watch("title"),
        description: form.watch("description"),
        attachments: form.watch("attachments"),
        isPinned: form.watch("isPinned"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        openTo: form.watch("openTo"),
        startDate: form.watch("startDate"),
        endDate: form.watch("endDate"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editRFPForm>) => {
        console.log(`handle form submit`, values)
        const {
            headerImage,
            title,
            description,
            attachments,
            isPinned,
            isPrivate,
            contacts,
            openTo,
            startDate,
            endDate,
            milestones
        } = values;

        const updateData: Partial<RFP> = {
            ...rfpData,
            headerImage,
            title,
            pinned: isPinned || false,
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    rfpId: rfpData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
            ...(openTo ? {openTo} : undefined),
            ...(startDate ? {startDate} : undefined),
            ...(endDate ? {endDate} : undefined)
        }

        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        try {
            await createOrUpdateRFP(updateData, session.user.organizationId);
            toast.success("RFP created or updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error updating or createing RFP:", error);
            toast.error("Failed to update or create RFP.");
        }
    }

    const handleDeleteRFP = async () => {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.")
            return
        }

        if (!rfpData.id) {
            toast.error("This RFP does not have an id.")
            return
        }

        try {
            await deleteRFP(rfpData.id)
            if (closeDialog) closeDialog()
            toast.success("Organization profile updated successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
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

            // trigger a form validation if we're editing an RFP, if the imported data is not valid, let the user know right away
            if (Object.keys(rfpData).length > 0) form.trigger()

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // Forces re-validation whenever startDate or endDate changes
        if (initializing.current === false) form.trigger()
    }, [formData.startDate, formData.endDate])

    return (
        <Form {...form}>
            <FormField
                control={form.control}
                name="headerImage"
                render={({field}) => (
                    <div className="absolute top-0 w-full h-[80px] left-0 flex justify-end items-end absolute -top-px -left-px w-[calc(100%+4px)] bg-blue-light">
                        <img
                            src={field.value}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center"
                            }}
                            className="absolute w-full"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="relative bottom-0 right-0 hover:bg-transparent" variant="ghost">
                                    <Pencil />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32">
                            <DropdownMenuRadioGroup value={field.value} onValueChange={(value) => form.setValue("headerImage", value, {shouldValidate: true})}>
                                {
                                    HEADER_IMAGE_OPTIONS.map(({label, path}) => (
                                        <DropdownMenuRadioItem value={path} className="flex justify-between">
                                            {label}
                                            <img
                                                src={path}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    objectPosition: "start"
                                                }}
                                                className="h-4 w-4 rounded-full"
                                            />
                                        </DropdownMenuRadioItem>
                                    ))
                                }
                            </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            />

            {/* <div className="h-[100px]"/> */}

            <ScrollArea className={"max-h-[600px] -mr-2 pr-3"} type={"always"}>
                <ScrollBar />
                {/* <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="space-y-6 m-1"
                > */}
                <div
                    // onSubmit={form.handleSubmit(handleFormSubmit)}
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

                    <FormItem className="flex gap-4 items-center">
                        <div className="grow">
                        <FormLabel>Visibility</FormLabel>
                        <FormDescription>
                            {`Private RFPs will not be shown to people outside of your organization.`}
                        </FormDescription>
                        </div>
                        <div className="w-[90px]">
                        <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                        </div>
                    </FormItem>

                    <FormField 
                        control={form.control}
                        name="isPinned"
                        render={({field}) => (
                            <FormItem className="flex gap-2 items-center">
                                <div>
                                <FormLabel>{`Pinned to profile`}</FormLabel>
                                <FormDescription>
                                    {`Pinning an RFP to your profile highlights it in the assets section of your organization profile.`}
                                </FormDescription>
                                </div>
                                <FormControl className="justify-self-end">
                                    <Button 
                                        variant="ghost" 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            form.setValue("isPinned", !field.value, {shouldValidate: true})
                                        }}
                                    >
                                        {field.value ? <Pin fill="currentColor"/> : <Pin />}
                                    </Button>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full mt-2">
                                <FormLabel >{`Linked Projects`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value?.map(milestone => ({...milestone, value: milestone.id, label: milestone.title})) as Option[]}
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

                    <OpenToFormField form={form}/>
                    <ProposalTimelineInput form={form}/>

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
                            <DialogTrigger asChild className={cn(rfpData.id ? "" : "hidden")}>
                                <Button type="button" variant="destructive">
                                    Delete RFP
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`This action cannot be undone. This will permanently delete your RFP and it's data.`}
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
                                                onClick={handleDeleteRFP}
                                            >
                                                Delete RFP
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
                {/* </form> */}
                </div>
            </ScrollArea>
        </Form>
    )
}

const ProposalTimelineInput = ({form}: {form: any}) => {
    return (
        <>
        <FormField
            control={form.control}
            name="startDate"
            render={({field}) => (
                <FormItem>
                    <FormLabel>{`Request Opens`}</FormLabel>
                    <FormDescription>{`The date you'll begin accepting proposals.`}</FormDescription>
                    <div>
                        <Popover >
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
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
                    </div>
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="endDate"
            render={({field}) => (
                <FormItem>
                    <FormLabel>{`Deadline for Proposals`}</FormLabel>
                    <FormDescription>{`The last day you will be accepting proposals.`}</FormDescription>
                    <Popover >
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
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
                    <FormMessage />
                </FormItem>
            )}
        />
        </>
    )
}
