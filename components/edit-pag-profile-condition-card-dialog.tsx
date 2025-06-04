"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useEffect, useState} from "react";
import {updateCondition} from "@/lib/actions";
import {ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS, Option} from "@/lib/types";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import MultipleSelector from "@/components/ui/multiple-selector";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import { getConditionsFromOrganizationId } from "@/lib/fetchers";
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
import {researchFormSchema} from "@/components/research-onboarding-form";
import mixpanel from "mixpanel-browser";
import {Organization} from "@prisma/client";
import { Info, Pencil } from "lucide-react";
import { mixpanelTrack } from "@/app/mixpanel";

export default function EditPAGProfileConditionCardDialog({organization}: { organization: Organization }) {
    const {data: session} = useSession()
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otherModality, setOtherModality] = useState<string>("");
    const [otherCategories, setOtherCategories] = useState<string>("");
    const [otherSystem, setOtherSystem] = useState<string>("");
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
                            disorder: condition.name || "",
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
                name: values.disorder || "",
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

                // Mixpanel tracking for "Other" fields
                if (otherModality) {
                    mixpanelTrack("Org has other modality", {
                        orgName: organization?.name || "Unknown Org",
                        looking: otherModality,
                    });
                }

                if (otherCategories) {
                    mixpanelTrack("Org has other category", {
                        orgName: organization?.name || "Unknown Org",
                        looking: otherCategories,
                    });
                }

                if (otherSystem) {
                    mixpanelTrack("Org has other system", {
                        orgName: organization?.name || "Unknown Org",
                        looking: otherSystem,
                    });
                }

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
                    <Button
                        variant="ghost"
                        className="gap-x-2"
                    >
                        <Pencil />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                                        <FormLabel>{`Name of condition (required)`}</FormLabel>
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
                                                id="disorder"
                                                {...field}
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
                                                <TooltipContent>
                                                    <p>
                                                        {`Causal genes are those that are known to directly cause your disorder.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                onSearch={handleAsyncSearch}
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
                                                <TooltipContent>
                                                    <p>
                                                        {`Associated genes are those that may tangentially be related to your disorder.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                onSearch={handleAsyncSearch}
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
                                        {editResearchForm.watch("categories")?.some((item) => item.value === "OTHER") && (
                                            <div className="mt-2">
                                                <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>
                                                <Input
                                                    type="text"
                                                    id="categories-other"
                                                    value={otherCategories}
                                                    onChange={(e) => setOtherCategories(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

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
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}
