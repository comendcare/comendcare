"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@comend/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@comend/components/ui/input";
import {Textarea} from "@comend/components/ui/textarea";
import {Button} from "@comend/components/ui/button";
import {updateOrganization} from "@comend/lib/actions";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import type {Organization} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {Info, Pencil} from "lucide-react";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {MODALITIES, optionSchema} from "@comend/lib/types";
import {Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import LoadingDots from "@comend/components/icons/loading-dots";
import { ScrollArea, ScrollBar } from "@comend/components/ui/scroll-area";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

const editOrgFormSchema = z.object({
    description: z.string().max(500, {
        message: "Your organization's description must be less than 500 characters long."
    }).optional(),
    website: z.preprocess(
        (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
        z.string().url({
            message: "Enter a valid URL for your organization's website."
        }).optional()
    ),
    therapeuticsInDevelopment: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsInDevelopment: z.string().optional(),
    therapeuticsOfInterest: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),
});

export default function EditPagProfileAboutCardDialog({
    organization
}: { 
    organization: Partial<Organization>
}) {
    const {data: session} = useSession();
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [unsavedChangesIsOpen, setUnsavedChangesIsOpen] = useState(false)
    const isOwner = ["owner", "support"].includes(session?.user?.membership?.role);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: {
            description: organization.description || "",
            website: organization.website || "",
            therapeuticsInDevelopment: organization.therapeuticsInDevelopment?.map((ther) => ({
                label: ther,
                value: ther
            })) || [],
            otherTherapeuticsInDevelopment: typeof organization.metadata == 'object' ? (organization?.metadata as {
                [key: string]: any
            })?.otherTherapeuticsInDevelopment : undefined,
            therapeuticsOfInterest: organization.therapeuticsOfInterest?.map((ther) => ({
                label: ther,
                value: ther
            })) || [],
            otherTherapeuticsOfInterest: typeof organization.metadata == 'object' ? (organization?.metadata as {
                [key: string]: any
            })?.otherTherapeuticsOfInterest : undefined,
        }
    });

    useEffect(() => {
        editOrgForm.reset({
            description: organization.description || "",
            website: organization.website || "",
            therapeuticsInDevelopment: organization.therapeuticsInDevelopment?.map((ther) => ({
                label: ther,
                value: ther
            })) || [],
            otherTherapeuticsInDevelopment: typeof organization.metadata == 'object' ? (organization?.metadata as {
                [key: string]: any
            })?.otherTherapeuticsInDevelopment : undefined,
            therapeuticsOfInterest: organization.therapeuticsOfInterest?.map((ther) => ({
                label: ther,
                value: ther
            })) || [],
            otherTherapeuticsOfInterest: typeof organization.metadata == 'object' ? (organization?.metadata as {
                [key: string]: any
            })?.otherTherapeuticsOfInterest : undefined,
        });
    }, [organization, editOrgForm]);

    const formData = editOrgForm.watch()

    async function onProfileFormSubmit(values: z.infer<typeof editOrgFormSchema>) {
        setIsSaving(true)
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (key === "therapeuticsInDevelopment") return
            if (key === "otherTherapeuticsInDevelopment") return
            if (key === "therapeuticsOfInterest") return
            if (key === "otherTherapeuticsOfInterest") return

            if (value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        const data = {
            therapeuticsInDevelopment: values.therapeuticsInDevelopment?.map((therapeutic) => therapeutic.label).join(",") || "",
            therapeuticsOfInterest: values.therapeuticsOfInterest?.map((therapeutic) => therapeutic.label).join(",") || "",
            metadata: JSON.stringify({
                ...(organization?.metadata ? JSON.parse(JSON.stringify(organization.metadata)) : undefined),
                otherTherapeuticsInDevelopment: values.otherTherapeuticsInDevelopment,
                otherTherapeuticsOfInterest: values.otherTherapeuticsOfInterest
            })
        }
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value)
            }
        });

        try {
            await updateOrganization(session.user.organizationId, formData);
            toast.success("Organization profile updated successfully!");
            setOpen(false);
            closeDialog()
            window.location.reload()
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    const closeDialog = () => {
        setOpen(false)
        setIsClosing(false)
        setUnsavedChangesIsOpen(false)

        editOrgForm.reset({
            description: organization.description || "",
            website: organization.website || "",
            therapeuticsInDevelopment: organization.therapeuticsInDevelopment?.map((ther) => ({
                label: ther,
                value: ther
            })) || [],
            otherTherapeuticsInDevelopment:
                typeof organization.metadata == "object"
                    ? (organization.metadata as any)?.otherTherapeuticsInDevelopment
                    : undefined,
            therapeuticsOfInterest: organization.therapeuticsOfInterest?.map((ther) => ({
                label: ther,
                value: ther
            })) || [],
            otherTherapeuticsOfInterest:
                typeof organization.metadata == "object"
                    ? (organization.metadata as any)?.otherTherapeuticsOfInterest
                    : undefined,
        });
    }

    const handleClose = () => {
        if (Object.keys(editOrgForm.formState.dirtyFields).length > 0) {
            // form is dirty, give user the option to save/discard unsaved changes
            setUnsavedChangesIsOpen(true)
        } else {
            // form is not dirty, close regularly
            closeDialog()
        }
    }

    useEffect(() => {
        if (isClosing) handleClose() // external close, handle closing with option for saving unsaved changes
    }, [isClosing])

    useEffect(() => {
        // if the user has closed the unsaved changes dialog, end the isClosing state of all other dialogs
        // all dialogs should be either fully closed or fully open
        if (!unsavedChangesIsOpen) setIsClosing(false)
    }, [unsavedChangesIsOpen])

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) setIsClosing(true)
                else setOpen(true)

                // Reset the form to original values when dialog closes (e.g. cancel)
                // editOrgForm.reset({
                //     description: organization.description || "",
                //     website: organization.website || "",
                //     therapeuticsInDevelopment: organization.therapeuticsInDevelopment?.map((ther) => ({
                //         label: ther,
                //         value: ther
                //     })) || [],
                //     otherTherapeuticsInDevelopment:
                //         typeof organization.metadata == "object"
                //             ? (organization.metadata as any)?.otherTherapeuticsInDevelopment
                //             : undefined,
                //     therapeuticsOfInterest: organization.therapeuticsOfInterest?.map((ther) => ({
                //         label: ther,
                //         value: ther
                //     })) || [],
                //     otherTherapeuticsOfInterest:
                //         typeof organization.metadata == "object"
                //             ? (organization.metadata as any)?.otherTherapeuticsOfInterest
                //             : undefined,
                // });
            }}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    {isOwner ? (
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Edit" data-testid="about-edit-btn">
                                <Pencil className="h-4 w-4"/>
                            </Button>
                        </DialogTrigger>
                    ) : (
                        <div>
                            <Button variant="ghost" size="icon" aria-label="Owners only" disabled>
                                <Pencil className="h-4 w-4"/>
                            </Button>
                        </div>
                    )}
                </TooltipTrigger>

                {!isOwner && (
                    <TooltipContent className="max-w-80">
                        Editing is owners-only. Visit the Team page to manage members.
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent data-testid="dialog">
                <DialogHeader>
                    <DialogTitle>Edit Organization Profile</DialogTitle>
                    <DialogDescription>
                        {`Update your organization's description and website.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...editOrgForm}>
                    <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 pb-12"} type={"always"}>
                        <ScrollBar />
                        <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                            <FormField
                                control={editOrgForm.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Tell us about your organization"
                                                data-testid="about-description-input"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editOrgForm.control}
                                name="website"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Website`}</FormLabel>
                                        <FormDescription>
                                            {`Your patient group's website URL (with the URL extension like http or https).`}
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                id="website"
                                                data-testid="website-input"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editOrgForm.control}
                                name="therapeuticsInDevelopment"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Therapeutics under development
                                        </FormLabel>
                                        <FormDescription className="flex items-center">
                                            {`What types of treatments is your organization currently developing? Select all that apply.`}
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                placeholder="Select modalities you like..."
                                                hidePlaceholderWhenSelected={true}
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {formData.therapeuticsInDevelopment?.some((item) => item.value === "Other" || item.value === "OTHER") && (
                                <FormField
                                    control={editOrgForm.control}
                                    name="otherTherapeuticsInDevelopment"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormDescription className="flex items-center">
                                                {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                            </FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    id="modalities-other"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={editOrgForm.control}
                                name="therapeuticsOfInterest"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Therapeutics of interest
                                        </FormLabel>
                                        <FormDescription className="flex items-center">
                                            {`Select all treatment modalities your organization is interested in. This helps us match you with experts in those specific areas.`}
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                placeholder="Select modalities you like..."
                                                hidePlaceholderWhenSelected={true}
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {editOrgForm.watch("therapeuticsOfInterest")?.some((item) => item.value === "Other" || item.value === "OTHER") && (
                                <FormField
                                    control={editOrgForm.control}
                                    name="otherTherapeuticsOfInterest"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormDescription className="flex items-center">
                                                {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                            </FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    id="modalities-other"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="absolute right-4 bottom-0 flex gap-2">
                            <DialogClose asChild>
                                <Button 
                                    variant={"secondary"}
                                    onClick={() => {handleClose()}}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                variant={"cta"}
                                type="submit"
                                data-testid="dialog-save-btn"
                                disabled={!editOrgForm.formState.isValid || isSaving}
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
                        </form>
                    </ScrollArea>

                    <UnsavedChangesDialog 
                        isSaving={isSaving}
                        isClosing={isClosing}
                        setIsClosing={setIsClosing}
                        isOpen={unsavedChangesIsOpen}
                        setIsOpen={setUnsavedChangesIsOpen}
                        closeDialog={closeDialog}
                        form={editOrgForm}
                        formSubmit={onProfileFormSubmit}
                    />
                </Form>
            </DialogContent>
        </Dialog>
    );
}
