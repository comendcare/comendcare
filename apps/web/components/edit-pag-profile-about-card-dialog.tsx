"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import {Organization} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {Info, Pencil} from "lucide-react";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {MODALITIES, optionSchema} from "@comend/lib/types";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";

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

export default function EditPagProfileAboutCardDialog({organization}: { organization: Partial<Organization> }) {
    const {data: session} = useSession();
    const [open, setOpen] = useState(false);
    const isOwner = session?.user?.membership?.role === "owner";

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
            window.location.reload()
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        <TooltipProvider>
            <Dialog
                open={open}
                onOpenChange={(state) => {
                    if (!state) {
                        // Reset the form to original values when dialog closes (e.g. cancel)
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
                    setOpen(state);
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
                            Editing is owners-only. See Organization Settings → Memberships.
                        </TooltipContent>
                    )}
                </Tooltip>
                <DialogContent className="max-h-[80vh] overflow-y-auto" data-testid="dialog">
                    <DialogHeader>
                        <DialogTitle>Edit Organization Profile</DialogTitle>
                        <DialogDescription>
                            {`Update your organization's description and website.`}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editOrgForm}>
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
                                            {`The treatment modalities your organization is interested in. Select all that apply.`}
                                            <Tooltip delayDuration={0}>
                                                {/*disabled to make the tooltip unclickable*/}
                                                <TooltipTrigger disabled>
                                                    <Info
                                                        className="text-black h-4 inline-block align-baseline mx-1 h-4 w-4"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {`This will help us match you with the experts of your particular modality.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
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

                            <Button
                                type="submit"
                                data-testid="dialog-save-btn"
                            >
                                Save
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
