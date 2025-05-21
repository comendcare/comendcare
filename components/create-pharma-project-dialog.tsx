"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useEffect, useState} from "react";
import {createPharmaProject, updateCondition} from "@/lib/actions";
import {ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS, Option} from "@/lib/types";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import MultipleSelector from "@/components/ui/multiple-selector";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {getConditionsFromOrganizationId} from "@/lib/fetchers";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {formatNumberWithCommas} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {optionSchema} from "@/components/research-onboarding-form";
import mixpanel from "mixpanel-browser";
import {Organization} from "@prisma/client";
import {SidebarMenuButton} from "@/components/ui/sidebar"
import {mixpanelTrack} from "@/app/mixpanel";
import {Info, Plus} from "lucide-react";

const newPharmaProjectSchema = z.object({
    name: z.string()
        .min(2, {
            message: "The name of your project needs to be longer than 2 characters",
        })
        .max(60, {
            message: "The name of your project needs to be shorter than 60 characters",
        }),
    summary: z.string()
        // .min(30, {
        //     message: "The summary of your condition needs to be longer than 30 characters",
        // })
        .max(500, {
            message: "The name of your condition needs to be shorter than 500 characters",
        })
        .optional(),
    categories: z.array(optionSchema).optional(),
    prevalenceNumerator: z.string().min(1, {
        message: "Your prevalence numerator must be at least 1",
    }).optional(),
    prevalenceDenominator: z.string().min(1, {
        message: "Your prevalence denominator must be at least 1",
    }).optional(),
    engaged: z.string().min(1, {  // These need to be strings because
        message: "The number of patients your organization has engaged with must be at least 1.",
    }).optional(),
    national: z.string().optional(),
    global: z.string().optional(),
    // mechanisms: z.array(optionSchema).min(0),
    mechanisms: z.array(z.string()).optional(),
    modalities: z.array(optionSchema).optional(),
    biomarkers: z.array(optionSchema).optional(),
    systems: z.array(optionSchema).optional(),
    symptoms: z.array(optionSchema).optional(),
    studies: z.array(optionSchema).optional(),
    assets: z.array(optionSchema).optional(),
})


export default function CreatePharmaProjectDialog() {
    const {data: session} = useSession()
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otherModality, setOtherModality] = useState<string>("");
    const [otherCategories, setOtherCategories] = useState<string>("");
    const [otherSystem, setOtherSystem] = useState<string>("");
    const [defaultResearchValues, setDefaultResearchValues] = useState<z.infer<typeof newPharmaProjectSchema> | undefined>(undefined);

    const editResearchForm = useForm<z.infer<typeof newPharmaProjectSchema>>({
        mode: "onChange",
        resolver: zodResolver(newPharmaProjectSchema),
    })

    async function onCreatePharmProjectSubmit(values: z.infer<typeof newPharmaProjectSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        setLoading(true); // Show loading state

        try {
            // Create a new FormData object
            const formData = new FormData();

            // Map the form values to match the Condition schema
            const mappedData: Record<string, any> = {
                name: values.name || "",
            };

            // Add mapped data to FormData
            Object.entries(mappedData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            });

            // Call the `updateCondition` function
            const response = await createPharmaProject(formData);

            if (response.success && response.data) {
                toast.success("Pharma project created successfully!");

                setOpen(false)
                router.push(`/pharma/project/${response.data.id}`); // Redirect to new project page
            } else {
                console.error(response.error);
                toast.error(response.error || "Failed to create pharma project.");
            }
        } catch (error) {
            console.error("Unexpected error creating pharma project:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false); // Hide loading state
        }
    }

    const onCloseForm = () => {
        setDefaultResearchValues(defaultResearchValues);
        editResearchForm.reset(defaultResearchValues); // Reset form with fetched data
    }

    const handleAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        setLoading(true);

        try {
            const response = await fetch(`/api/genes?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    onCloseForm();
                }
            }}>
                <DialogTrigger asChild>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                        <Plus className="text-sidebar-foreground/70"/>
                        <span>New project</span>
                    </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] min-w-[50vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Create a new project
                        </DialogTitle>
                        <DialogDescription>
                            {`Creating a project with more details helps us find relevant biosamples, tools, and patient groups for you.`}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editResearchForm}>
                        <form onSubmit={editResearchForm.handleSubmit(onCreatePharmProjectSubmit)}
                              className="space-y-8">

                            <FormField
                                control={editResearchForm.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Name of project (required)`}</FormLabel>
                                        {/*<div className="w-full flex flex-row justify-between">*/}
                                        {/*    <FormDescription>*/}
                                        {/*        {`The name of your rare condition/disorder.`}*/}
                                        {/*    </FormDescription>*/}
                                        {/*    <FormDescription>*/}
                                        {/*        60 characters max.*/}
                                        {/*    </FormDescription>*/}
                                        {/*</div>*/}
                                        <FormControl>
                                            <Input
                                                type="text"
                                                id="name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editResearchForm.control}
                                name="modalities"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Modalities of interest
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                hidePlaceholderWhenSelected={true}
                                                placeholder="Select modalities..."
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*<FormField*/}
                            {/*    control={editResearchForm.control}*/}
                            {/*    name="categories"*/}
                            {/*    render={({field}) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>*/}
                            {/*                Mechanisms of action*/}
                            {/*            </FormLabel>*/}
                            {/*            <FormDescription className="flex items-center">*/}
                            {/*                {`What types of genetic effects are you investigating? Select all that apply.`}*/}
                            {/*            </FormDescription>*/}
                            {/*            <FormControl>*/}
                            {/*                <MultipleSelector*/}
                            {/*                    {...field}*/}
                            {/*                    defaultOptions={MOLECULAR_MECHANISMS}*/}
                            {/*                    placeholder="Select categories that apply to you..."*/}
                            {/*                    hidePlaceholderWhenSelected={true}*/}
                            {/*                    emptyIndicator={*/}
                            {/*                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">*/}
                            {/*                            no results found.*/}
                            {/*                        </p>*/}
                            {/*                    }*/}
                            {/*                    showHoverCard={false}*/}
                            {/*                />*/}
                            {/*            </FormControl>*/}
                            {/*            <FormMessage/>*/}
                            {/*            {editResearchForm.watch("categories")?.some((item) => item.value === "OTHER") && (*/}
                            {/*                <div className="mt-2">*/}
                            {/*                    <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>*/}
                            {/*                    <Input*/}
                            {/*                        type="text"*/}
                            {/*                        id="categories-other"*/}
                            {/*                        value={otherCategories}*/}
                            {/*                        onChange={(e) => setOtherCategories(e.target.value)}*/}
                            {/*                    />*/}
                            {/*                </div>*/}
                            {/*            )}*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}

                            <FormField
                                control={editResearchForm.control}
                                name="systems"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Associated systems</FormLabel>
                                        <FormDescription>{`The systems affected by your condition. Select all that apply.`}</FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={ASSOCIATED_SYSTEMS}
                                                hidePlaceholderWhenSelected={true}
                                                placeholder="Select the associated systems of your condition..."
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                        {editResearchForm.watch("systems")?.some((item) => item.value === "OTHER") && (
                                            <div className="mt-2">
                                                <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>
                                                <Input
                                                    type="text"
                                                    id="systems-other"
                                                    value={otherSystem}
                                                    onChange={(e) => setOtherSystem(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">
                                Save
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}
