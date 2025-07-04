"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useEffect, useState} from "react";
import {updateCondition} from "@comend/lib/actions";
import {ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS, Option} from "@comend/lib/types";
import {Input} from "@comend/components/ui/input";
import {Textarea} from "@comend/components/ui/textarea";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Button} from "@comend/components/ui/button";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {getConditionsFromOrganizationId} from "@comend/lib/fetchers";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader, DialogPortal,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {formatNumberWithCommas} from "@comend/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@comend/components/ui/tooltip";
import {Organization} from "@prisma/client";
import {Info, Pencil} from "lucide-react";
import { researchFormSchema } from "./research-onboarding-form";

export default function EditPAGProfileConditionCardDialog({organization}: { organization: Partial<Organization> }) {
    const {data: session} = useSession()
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [otherModality, setOtherModality] = useState<string>("");
    // const [otherCategories, setOtherCategories] = useState<string>("");
    // const [otherSystem, setOtherSystem] = useState<string>("");
    const [defaultResearchValues, setDefaultResearchValues] = useState<z.infer<typeof researchFormSchema> | undefined>(undefined);

    const editResearchForm = useForm<z.infer<typeof researchFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(researchFormSchema),
    })

    useEffect(() => {
        async function fetchResearchData() {
            if (!session?.user?.organizationId) {
                toast.error("You must be signed into an organization.");
                return;
            }

            try {
                // Fetch conditions for the given organization ID
                const response = await getConditionsFromOrganizationId(session.user.organizationId);

                if (response.success) {
                    const conditions = response.data;

                    if (conditions && conditions.length > 0) {
                        const fetchedValues = conditions.map((condition: any) => ({
                            disorder: condition.name ? [{ label: condition.name, value: condition.name }] : [],
                            summary: condition.summary || "",
                            categories: condition.diseaseCategories.map((cat: any) => ({label: cat, value: cat})) || [],
                            causal: condition.causalGenes.map((gene: any) => ({label: gene, value: gene})) || [],
                            genes: condition.associatedGenes.map((gene: any) => ({label: gene, value: gene})) || [],
                            systems: condition.associatedSystems.map((system: any) => ({
                                label: system,
                                value: system
                            })) || [],
                            prevalenceNumerator: condition.prevalenceNumerator?.toString() || "",
                            prevalenceDenominator: condition.prevalenceDenominator?.toString() || "",
                            engaged: condition.numberOfPatientsEngaged?.toString() || "",
                            national: condition.nationalEstimatedPopulation?.toString() || "",
                            global: condition.globalEstimatedPopulation?.toString() || "",
                            otherCategories: typeof condition.metadata == 'object'? (condition.metadata as { [key: string]: any })?.otherCategories : undefined,
                            otherMechanisms: typeof condition.metadata == 'object'? (condition.metadata as { [key: string]: any })?.otherMechanisms : undefined,
                            otherSystems: typeof condition.metadata == 'object'? (condition.metadata as { [key: string]: any })?.otherSystems : undefined,
                        }));

                        // Assuming you're working with one condition at a time (e.g., the first condition)
                        const defaultValues = fetchedValues[0] || {};

                        setDefaultResearchValues(defaultValues);
                        editResearchForm.reset(defaultValues);
                    } else {
                        toast.error("No conditions found for this organization.");
                    }
                } else {
                    console.error(response.error);
                    toast.error(response.error);
                }
            } catch (error) {
                console.error("Failed to fetch research data:", error);
                toast.error("An error occurred while fetching research data.");
            }
        }

        fetchResearchData();
    }, [session?.user?.organizationId, editResearchForm]);

    async function onResearchFormSubmit(values: z.infer<typeof researchFormSchema>) {
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
                name: values.disorder?.[0]?.label || "", // Assume there is only one condition selected
                summary: values.summary || "",
                diseaseCategories: values.categories?.map((item) => item.label) || [],
                prevalenceNumerator: values.prevalenceNumerator ? values.prevalenceNumerator : null,
                prevalenceDenominator: values.prevalenceDenominator ? values.prevalenceDenominator : null,
                numberOfPatientsEngaged: values.engaged ? parseInt(values.engaged, 10) : null,
                nationalEstimatedPopulation: values.national ? parseInt(values.national, 10) || null : null,
                globalEstimatedPopulation: values.global ? parseInt(values.global, 10) || null : null,
                relevantDiseaseMechanisms: values.mechanisms || [],
                causalGenes: values.causal?.map((item) => item.label) || [],
                associatedGenes: values.genes?.map((item) => item.label) || [],
                associatedSystems: values.systems?.map((item) => item.label) || [],
                associatedSignsAndSymptoms: values.symptoms?.map((item) => item.label) || [],
                existingDatabasesAndStudies: values.studies?.map((item) => item.label) || [],
                toolsUnderDevelopment: values.tools?.map((item) => item.label) || [],
                metadata: JSON.stringify({
                    otherCategories: values.otherCategories,
                    otherMechanisms: values.otherMechanisms,
                    otherSystems: values.otherSystems
                })
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
            const response = await updateCondition(session.user.organizationId, formData);

            if (response.success) {
                toast.success("Condition updated successfully!");
                setOpen(false)
                router.refresh(); // Refresh the page to reflect changes
            } else {
                console.error(response.error);
                toast.error(response.error || "Failed to update condition.");
            }
        } catch (error) {
            console.error("Unexpected error updating condition:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false); // Hide loading state
        }
    }

    const onCloseForm = () => {
        setDefaultResearchValues(defaultResearchValues);
        editResearchForm.reset(defaultResearchValues); // Reset form with fetched data
    }

    const handleGeneAsyncSearch = async (query: string): Promise<Option[]> => {
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

    const handleConditionAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        setLoading(true);

        try {
            const response = await fetch(`/api/conditions?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch conditions:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                onCloseForm();
            }
        }}>
            <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="gap-x-2"
                            disabled={session?.user?.membership?.role !== "owner"}
                        >
                            <Pencil/>
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {session?.user?.membership?.role !== "owner" && (
                    <TooltipContent className="max-w-80">
                        <p>Condition editing is only enabled for organization owners. Please contact the owners of your organization. Owners are visible in the Organization Settings tab in the memberships section.</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogPortal>
                <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-visible">
                    <TooltipProvider>
                        <DialogHeader>
                            <DialogTitle>
                                Edit condition
                            </DialogTitle>
                            <DialogDescription>
                                {`Make changes to your condition here. Click save when you're done.`}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...editResearchForm}>
                            <form onSubmit={editResearchForm.handleSubmit(onResearchFormSubmit)}
                                  className="space-y-8">

                                <FormField
                                    control={editResearchForm.control}
                                    name="disorder"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Name of condition (required)</FormLabel>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable={true}
                                                    maxSelected={1}
                                                    onSearch={handleConditionAsyncSearch}
                                                    placeholder="Search for conditions..."
                                                    hidePlaceholderWhenSelected={true}
                                                    loadingIndicator={<p>Loading conditions...</p>}
                                                    emptyIndicator={<p>No conditions found.</p>}
                                                    showHoverCard={false}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="summary"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Summary of condition`}</FormLabel>
                                            {/*<div className="w-full flex flex-row justify-between">*/}
                                            {/*    <FormDescription>*/}
                                            {/*        {`A few lines describing your condition and what makes it unique`}*/}
                                            {/*    </FormDescription>*/}
                                            {/*    <FormDescription>*/}
                                            {/*        500 characters max.*/}
                                            {/*    </FormDescription>*/}
                                            {/*</div>*/}
                                            <FormControl>
                                                <Textarea
                                                    id="summary"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="causal"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Causal genes</FormLabel>
                                            <FormDescription>
                                                {`Select all that apply.`}
                                                <Tooltip delayDuration={0}>
                                                    {/*disabled to make the tooltip unclickable*/}
                                                    <TooltipTrigger disabled>
                                                        <Info
                                                            className="text-black inline-block align-baseline mx-1 h-4 w-4"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="right"
                                                        sideOffset={8}
                                                        avoidCollisions={false}
                                                        className="z-[9999] max-w-xs overflow-visible"
                                                    >
                                                        <p>
                                                            {`Causal genes are those that are known to directly cause your disorder.`}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable={true}
                                                    onSearch={handleGeneAsyncSearch}
                                                    placeholder="Search for genes..."
                                                    hidePlaceholderWhenSelected={true}
                                                    loadingIndicator={<p>Loading genes...</p>}
                                                    emptyIndicator={<p>No genes found.</p>}
                                                    showHoverCard={false}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="genes"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Associated genes</FormLabel>
                                            <FormDescription>
                                                {`Select all that apply.`}
                                                <Tooltip delayDuration={0}>
                                                    {/*disabled to make the tooltip unclickable*/}
                                                    <TooltipTrigger disabled>
                                                        <Info
                                                            className="text-black inline-block align-baseline mx-1 h-4 w-4"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="right"
                                                        sideOffset={8}
                                                        avoidCollisions={false}
                                                        className="z-[9999] max-w-xs overflow-visible"
                                                    >
                                                        <p>
                                                            {`Associated genes are those that may tangentially be related to your disorder.`}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable={true}
                                                    onSearch={handleGeneAsyncSearch}
                                                    placeholder="Search for genes..."
                                                    hidePlaceholderWhenSelected={true}
                                                    loadingIndicator={<p>Loading genes...</p>}
                                                    emptyIndicator={<p>No genes found.</p>}
                                                    showHoverCard={false}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="categories"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>
                                                Mechanisms of action
                                            </FormLabel>
                                            <FormDescription className="flex items-center">
                                                {`What types of genetic effects are you investigating? Select all that apply.`}
                                            </FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    defaultOptions={MOLECULAR_MECHANISMS}
                                                    placeholder="Select categories that apply to you..."
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

                                {editResearchForm.watch("categories")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                    <FormField
                                        control={editResearchForm.control}
                                        name="otherCategories"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormDescription className="flex items-center">
                                                    {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        id="categories-other"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}

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
                                        </FormItem>
                                    )}
                                />

                                {editResearchForm.watch("systems")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                    <FormField
                                        control={editResearchForm.control}
                                        name="otherSystems"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormDescription className="flex items-center">
                                                    {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        id="systems-other"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={editResearchForm.control}
                                    name="prevalenceNumerator"
                                    render={({field: numeratorField}) => (
                                        <FormItem>
                                            <FormLabel>
                                                {`Estimated total prevalence`} - {`${formatNumberWithCommas(numeratorField.value)} in ${formatNumberWithCommas(editResearchForm.watch("prevalenceDenominator"))}`}
                                            </FormLabel>
                                            <FormDescription>
                                                {`The estimated global prevalence ratio of your condition.`}
                                            </FormDescription>
                                            <FormControl>
                                                <div className="flex flex-row items-end justify-start space-x-2">
                                                    <Input
                                                        type="number"
                                                        id="prevalenceNumerator"
                                                        {...numeratorField}
                                                        className="w-16"
                                                        min={0}
                                                    />
                                                    <span>in</span>
                                                    <FormField
                                                        control={editResearchForm.control}
                                                        name="prevalenceDenominator"
                                                        render={({field: denominatorField}) => (
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    id="prevalenceDenominator"
                                                                    {...denominatorField}
                                                                    className="w-32"
                                                                    min={0}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="engaged"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Number of patients engaged`}</FormLabel>
                                            <FormDescription>{`The number of patients your organization has been in touch with.`}</FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    id="engaged"
                                                    {...field}
                                                    min={0}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="national"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Estimated number of patients in the US`}</FormLabel>
                                            {/*<FormDescription>{`The estimated number of patients in the US.`}</FormDescription>*/}
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    id="national"
                                                    {...field}
                                                    min={0}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="global"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Estimated number of patients in the world`}</FormLabel>
                                            {/*<FormDescription>{`The estimated number of patients in the world.`}</FormDescription>*/}
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    id="global"
                                                    {...field}
                                                    min={0}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit">
                                    Save
                                </Button>
                            </form>
                        </Form>
                    </TooltipProvider>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}
