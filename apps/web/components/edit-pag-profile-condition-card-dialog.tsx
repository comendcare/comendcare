"use client"

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
import React, {useEffect, useState} from "react";
import {updateCondition} from "@comend/lib/actions";
import {ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS, Option} from "@comend/lib/types";
import {Input} from "@comend/components/ui/input";
import {Textarea} from "@comend/components/ui/textarea";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Button} from "@comend/components/ui/button";
import {toast} from "sonner";
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
import {researchFormSchema} from "./research-onboarding-form";

export default function EditPAGProfileConditionCardDialog({organization}: { organization: Partial<Organization> }) {
    const {data: session, status} = useSession()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [otherModality, setOtherModality] = useState<string>("");
    // const [otherCategories, setOtherCategories] = useState<string>("");
    // const [otherSystem, setOtherSystem] = useState<string>("");
    const [defaultResearchValues, setDefaultResearchValues] = useState<z.infer<typeof researchFormSchema> | undefined>(undefined);
    const isOwner = session?.user?.membership?.role === "owner";

    const editResearchForm = useForm<z.infer<typeof researchFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(researchFormSchema),
    })

    useEffect(() => {
        async function fetchResearchData() {
            if (status === "authenticated" && !organization.id) {
                toast.error("You're not a part of an organization.");
                return;
            }

            try {
                // Fetch conditions for the given organization ID
                const response = await getConditionsFromOrganizationId(organization.id);

                if (response.success) {
                    const conditions = response.data;

                    if (conditions && conditions.length > 0) {
                        const fetchedValues = conditions.map((condition: any) => ({
                            disorder: condition.name ? [{label: condition.name, value: condition.name}] : [],
                            // associatedConditions:
                            //     (condition.associatedConditions ?? []).map((c: any) => ({
                            //         label: c.name,
                            //         value: c.slug,
                            //     })),
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
                            otherCategories: typeof condition.metadata == 'object' ? (condition.metadata as {
                                [key: string]: any
                            })?.otherCategories : undefined,
                            otherMechanisms: typeof condition.metadata == 'object' ? (condition.metadata as {
                                [key: string]: any
                            })?.otherMechanisms : undefined,
                            otherSystems: typeof condition.metadata == 'object' ? (condition.metadata as {
                                [key: string]: any
                            })?.otherSystems : undefined,
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
            const numOrNull = (s?: string | null) =>
                s && String(s).trim() !== "" ? parseInt(String(s), 10) : null;

            const mappedData: Record<string, any> = {
                name: values.disorder?.[0]?.label || "",
                // associatedConditions: (values.associatedConditions ?? []).map(o => o.value),
                summary: values.summary ?? "",
                diseaseCategories: (values.categories ?? []).map(i => i.label),
                prevalenceNumerator: numOrNull(values.prevalenceNumerator),
                prevalenceDenominator: numOrNull(values.prevalenceDenominator),
                numberOfPatientsEngaged: numOrNull(values.engaged),
                nationalEstimatedPopulation: numOrNull(values.national),
                globalEstimatedPopulation: numOrNull(values.global),
                relevantDiseaseMechanisms: values.mechanisms ?? [],
                causalGenes: (values.causal ?? []).map(i => i.label),
                associatedGenes: (values.genes ?? []).map(i => i.label),
                associatedSystems: (values.systems ?? []).map(i => i.label),
                associatedSignsAndSymptoms: (values.symptoms ?? []).map(i => i.label),
                existingDatabasesAndStudies: (values.studies ?? []).map(i => i.label),
                toolsUnderDevelopment: (values.tools ?? []).map(i => i.label),
                metadata: {
                    otherCategories: values.otherCategories ?? null,
                    otherMechanisms: values.otherMechanisms ?? null,
                    otherSystems: values.otherSystems ?? null,
                },
            };

            const formData = new FormData();
            Object.entries(mappedData).forEach(([key, value]) => {
                if (key === "metadata") {
                    formData.append(key, JSON.stringify(value ?? {}));
                } else if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (value === null) {
                    formData.append(key, "null"); // tell the server to clear
                } else {
                    formData.append(key, String(value));
                }
            });

            // Call the `updateCondition` function
            const response = await updateCondition(session.user.organizationId, formData);

            if (response.success) {
                toast.success("Condition updated successfully!");
                setOpen(false)
                window.location.reload()
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
                <TooltipTrigger asChild>
                    {isOwner ? (
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Edit">
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
                            <form
                                onSubmit={editResearchForm.handleSubmit(
                                    onResearchFormSubmit,
                                    (errors) => {
                                        console.error("Form validation errors:", errors);
                                        // surface the first error so it's visible
                                        const first = Object.values(errors)[0] as any;
                                        const msg = first?.message || first?.root?.message || "Please fix the highlighted fields.";
                                        toast.error(msg);
                                    }
                                )}
                                className="space-y-8"
                            >

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

                                {/* <FormField
                                    control={editResearchForm.control}
                                    name="associatedConditions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Associated conditions</FormLabel>
                                            <FormDescription>Select any related conditions.</FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable
                                                    maxSelected={5}
                                                    onSearch={handleConditionAsyncSearch}
                                                    placeholder="Search for conditions..."
                                                    hidePlaceholderWhenSelected
                                                    loadingIndicator={<p>Loading conditions...</p>}
                                                    emptyIndicator={<p>No conditions found.</p>}
                                                    showHoverCard={false}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

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
                                            <FormDescription className="flex flex-row items-baseline">
                                                {`Select all that apply.`}
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div tabIndex={0} role="button"
                                                             aria-label="What is a causal gene?">
                                                            <Info className="mx-1 inline-block h-4 w-4"/>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" sideOffset={8} avoidCollisions={false}>
                                                        <p>Causal genes are those that directly cause your disorder.</p>
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
                                            <FormDescription className="flex flex-row items-baseline">
                                                {`Select all that apply.`}
                                                <Tooltip delayDuration={0}>
                                                    {/*disabled to make the tooltip unclickable*/}
                                                    <TooltipTrigger asChild>
                                                        <div tabIndex={0} role="button"
                                                             aria-label="What is an associated gene?">
                                                            <Info className="mx-1 inline-block h-4 w-4"/>
                                                        </div>
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
                                            <FormDescription>
                                                {`The systems affected by your condition. Select all that apply.`}
                                            </FormDescription>
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
                                                {`Estimated total prevalence`} –{" "}
                                                {formatNumberWithCommas(numeratorField.value)}
                                                {editResearchForm.watch("prevalenceDenominator") && (
                                                    <> in {formatNumberWithCommas(editResearchForm.watch("prevalenceDenominator"))}</>
                                                )}
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
