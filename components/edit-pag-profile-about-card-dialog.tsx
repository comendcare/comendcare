"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {updateOrganization} from "@/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Member, Organization, User} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {Info, Pencil} from "lucide-react";
import MultipleSelector from "@/components/ui/multiple-selector";
import {MODALITIES} from "@/lib/types";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const editOrgFormSchema = z.object({
    description: z.string().max(500, {
        message: "Your organization's description must be less than 500 characters long."
    }).optional(),
    website: z.string().url({
        message: "Enter a valid URL for your organization's website."
    }).optional(),
    therapeuticsInDevelopment: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsInDevelopment: z.string().optional(),
    therapeuticsOfInterest: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),
});

export default function EditPagProfileAboutCardDialog({organization}: { organization: Organization & { members: (Member & { user: User })[] }}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    console.log(organization.therapeuticsInDevelopment)
    console.log(organization.therapeuticsOfInterest)

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: {
            description: organization.description || "",
            website: organization.website || "",
            therapeuticsInDevelopment: organization.therapeuticsInDevelopment.map((ther) => ({label: ther, value: ther})) || [],
            otherTherapeuticsInDevelopment: typeof organization.metadata == 'object' ? (organization?.metadata as { [key: string]: any })?.otherTherapeuticsInDevelopment : undefined,
            therapeuticsOfInterest: organization.therapeuticsOfInterest.map((ther) => ({label: ther, value: ther})) || [],
            otherTherapeuticsOfInterest: typeof organization.metadata == 'object'? (organization?.metadata as { [key: string]: any })?.otherTherapeuticsOfInterest : undefined,
        }
    });

    useEffect(() => {
        editOrgForm.reset({
            description: organization.description || "",
            website: organization.website || "",
            therapeuticsInDevelopment: organization.therapeuticsInDevelopment.map((ther) => ({label: ther, value: ther})) || [],
            otherTherapeuticsInDevelopment: typeof organization.metadata == 'object' ? (organization?.metadata as { [key: string]: any })?.otherTherapeuticsInDevelopment : undefined,
            therapeuticsOfInterest: organization.therapeuticsOfInterest.map((ther) => ({label: ther, value: ther})) || [],
            otherTherapeuticsOfInterest: typeof organization.metadata == 'object'? (organization?.metadata as { [key: string]: any })?.otherTherapeuticsOfInterest : undefined,
        });
    }, [organization, editOrgForm]);

    const formData = editOrgForm.watch()

    useEffect(() => {
        console.log(`form data`, formData)
    }, [formData])

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
            router.refresh();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                >
                    <Pencil />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                                        <Textarea placeholder="Tell us about your organization" {...field} />
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
                                            id="website"
                                            {...field}
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

                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
