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
import {updateCondition, updateEntityTags} from "@comend/lib/actions";
import {ASSOCIATED_SYSTEMS, BIOMARKER_TYPES, MODALITIES, MOLECULAR_MECHANISMS, Option} from "@comend/lib/types";
import {Input} from "@comend/components/ui/input";
import {Textarea} from "@comend/components/ui/textarea";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Button} from "@comend/components/ui/button";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {getConditionsFromOrganizationId, getTagsForEntity } from "@comend/lib/fetchers";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader, DialogPortal,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {formatNumberWithCommas, toKebabCase} from "@comend/lib/utils"; // ← added to normalize creatable values
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@comend/components/ui/tooltip";
import {TaggableType} from "@prisma/client";
import {Info, Pencil} from "lucide-react";
import {BiomarkersFormField, researchFormSchema} from "./research-onboarding-form";
import { badgeVariants } from "@comend/components/ui/badge";
import {ConditionForCard} from "~web/components/pag-profile-conditions-card";
import LoadingDots from "@comend/components/icons/loading-dots";
import { ScrollArea, ScrollBar } from "@comend/components/ui/scroll-area";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

export default function EditPAGProfileConditionCardDialog({
    condition,
    conditionTags,
}: {
    condition?: ConditionForCard | null;
    conditionTags?: string[];
}) {
    const {data: session, status} = useSession()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [unsavedChangesIsOpen, setUnsavedChangesIsOpen] = useState(false)
    const [defaultResearchValues, setDefaultResearchValues] = useState<z.infer<typeof researchFormSchema> | undefined>(undefined);
    const isOwner = ["owner", "support"].includes(session?.user?.membership?.role);

    const editResearchForm = useForm<z.infer<typeof researchFormSchema>>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        resolver: zodResolver(researchFormSchema),
    })

    useEffect(() => {
        if (!condition || !conditionTags) return;

        const defaultValues: z.infer<typeof researchFormSchema> = {
            disorder: condition.name ? [{ label: condition.name, value: condition.name }] : [],
            associatedConditions: (condition.associatedConditions ?? []).map((name) => ({
                label: name,
                value: name,
            })),
            summary: condition.summary ?? "",
            categories: (condition.diseaseCategories ?? []).map((cat) => ({ label: cat, value: cat })),
            causal: (condition.causalGenes ?? []).map((gene) => ({ label: gene, value: gene })),
            genes: (condition.associatedGenes ?? []).map((gene) => ({ label: gene, value: gene })),
            systems: (condition.associatedSystems ?? []).map((system) => ({
                label: system,
                value: system,
            })),
            associatedSignsAndSymptoms: (condition.associatedSignsAndSymptoms ?? []).map((s) => ({
                label: s,
                value: s,
            })),
            biomarkers: (condition.biomarkers ?? []).map((b) => ({
                name: b.name ?? "",
                type: b.type ? [{ label: b.type, value: b.type }] : [],
            })),
            // tags are stored as comma-separated string in your form:
            tags: conditionTags.join(", "),
            prevalenceNumerator: condition.prevalenceNumerator?.toString() ?? "",
            prevalenceDenominator: condition.prevalenceDenominator?.toString() ?? "",
            engaged: condition.numberOfPatientsEngaged?.toString() ?? "",
            national: condition.nationalEstimatedPopulation?.toString() ?? "",
            global: condition.globalEstimatedPopulation?.toString() ?? "",
            otherCategories: undefined,
            otherMechanisms: undefined,
            otherSystems: undefined,
        };

        setDefaultResearchValues(defaultValues);
        editResearchForm.reset(defaultValues);
    }, [condition, conditionTags, editResearchForm]);

    const normalizeType = (t: any): string => {
        if (!t) return "";
        if (typeof t === "string") return t;
        if (Array.isArray(t)) return t[0]?.value ?? t[0]?.label ?? "";
        return t.value ?? t.label ?? "";
    };

    async function onResearchFormSubmit(values: z.infer<typeof researchFormSchema>) {
        const isValid = editResearchForm.trigger()
        if (!isValid) return // stops submission
        
        setIsSaving(true)
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const tagStrings = (values.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        setLoading(true); // Show loading state

        try {
            const numOrNull = (s?: string | null) =>
                s && String(s).trim() !== "" ? parseInt(String(s), 10) : null;

            const mappedData: Record<string, any> = {
                name: values.disorder?.[0]?.label || "",
                // Normalize to slugs even for creatable values
                associatedConditions: (values.associatedConditions ?? []).map(o =>
                    String(o.label || o.value || "").trim()
                ),
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
                associatedSignsAndSymptoms: (values.associatedSignsAndSymptoms ?? []).map(i => i.label),
                existingDatabasesAndStudies: (values.studies ?? []).map(i => i.label),
                toolsUnderDevelopment: (values.tools ?? []).map(i => i.label),
                metadata: {
                    otherCategories: values.otherCategories ?? null,
                    otherMechanisms: values.otherMechanisms ?? null,
                    otherSystems: values.otherSystems ?? null,
                },
                biomarkers: (values.biomarkers ?? [])
                    .map((b) => ({
                        name: (b.name ?? "").trim(),
                        type: normalizeType(b.type),
                    }))
                    .filter((b) => b.name && b.type),
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
                const conditionId = response.data?.id; // assuming updateCondition returns the Condition

                // Only call the tag action if we have a Condition id
                if (conditionId && tagStrings.length > 0) {
                    const tagResult =   await updateEntityTags(
                        TaggableType.CONDITION,
                        conditionId,
                        tagStrings
                    );


                if (!tagResult.success) {
                        console.error(tagResult.error);
                        // optional: toast a softer warning instead of erroring the whole flow
                        toast.error(tagResult.error || "Tags were not saved.");
                    }
                } else if (conditionId && tagStrings.length === 0) {
                    // clear tags if user removed them all
                    await updateEntityTags(TaggableType.CONDITION, conditionId, []);
                }

                toast.success("Condition updated successfully!");
                setOpen(false);
                closeDialog()
                window.location.reload();
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

    const closeDialog = () => {
        setOpen(false)
        setIsClosing(false)
        setUnsavedChangesIsOpen(false)

        setDefaultResearchValues(defaultResearchValues);
        editResearchForm.reset(defaultResearchValues); // Reset form with fetched data
    }

    const handleClose = ({showUnsavedChanges}: {showUnsavedChanges?: boolean}) => {
        if (showUnsavedChanges && Object.keys(editResearchForm.formState.dirtyFields).length > 0) {
            // form is dirty, give user the option to save/discard unsaved changes
            setUnsavedChangesIsOpen(true)
        } else {
            // form is not dirty, close regularly
            closeDialog()
        }
    }

    useEffect(() => {
        if (isClosing) handleClose({showUnsavedChanges: true}) // external close, handle closing with option for saving unsaved changes
    }, [isClosing])

    useEffect(() => {
        // if the user has closed the unsaved changes dialog, end the isClosing state of all other dialogs
        // all dialogs should be either fully closed or fully open
        if (!unsavedChangesIsOpen) setIsClosing(false)
    }, [unsavedChangesIsOpen])

    const handleHpoAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return [];
        setLoading(true);
        try {
            const res = await fetch(`/api/hpo/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data?.items) ? data.items : [];
        } catch (e) {
            console.error("Failed to fetch HPO terms:", e);
            return [];
        } finally {
            setLoading(false);
        }
    };

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
        <Dialog 
            open={open} 
            onOpenChange={(open) => {
                if (!open) setIsClosing(true)
                else setOpen(true)
            }}
        >

            <Tooltip>
                <TooltipTrigger asChild>
                    {isOwner ? (
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Edit" data-testid="conditions-edit-btn">
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
            <DialogPortal>
                <DialogContent data-testid="dialog">
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
                            className="flex max-h-[80vh] flex-col overflow-hidden"
                        >
                            <ScrollArea type={"always"}>
                                <ScrollBar />
                                <div className="flex flex-col gap-4 pr-4 space-y-8">
                                <FormField
                                    control={editResearchForm.control}
                                    name="disorder"
                                    render={({field}) => {
                                        const id = "ms-disorder";

                                        return (
                                            <FormItem>
                                                <FormLabel htmlFor={id} id={`${id}-label`}>
                                                    Name of condition (required)
                                                </FormLabel>
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
                                                        inputProps={{
                                                            id,
                                                            "aria-labelledby": `${id}-label`,
                                                            "aria-label": "Name of condition",
                                                            "data-testid": id,
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )
                                    }}
                                />

                                <FormField
                                    control={editResearchForm.control}
                                    name="associatedConditions"
                                    render={({field}) => (
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
                                            <FormDescription className="flex flex-row items-baseline">
                                                {`Causal genes are those that directly cause your disorder. Select all that apply.`}
                                            </FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable={true}
                                                    badgeClassName={badgeVariants({variant: "teal"})}
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
                                                {`Associated genes are those that may be indirectly related to your disorder. Select all that apply.`}
                                            </FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable={true}
                                                    badgeClassName={badgeVariants({variant: "teal"})}
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
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormDescription>
                                                Enter tags separated by commas. Example: <code>#neuro, #rare, metabolism</code>
                                            </FormDescription>

                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="#neuro, #ultrarare, #rna"
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                    name="associatedSignsAndSymptoms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Symptoms</FormLabel>
                                            <FormDescription>
                                                Search Symptoms and select all that apply.
                                            </FormDescription>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    creatable={false}
                                                    onSearch={handleHpoAsyncSearch}
                                                    placeholder="Search HPO symptoms..."
                                                    hidePlaceholderWhenSelected
                                                    loadingIndicator={<p>Searching HPO...</p>}
                                                    emptyIndicator={<p>No symptoms found.</p>}
                                                    showHoverCard={false}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <BiomarkersFormField form={editResearchForm} />

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
                                </div>
                            </ScrollArea>
                                
                            <DialogFooter className="pt-4">
                                <Button 
                                    type="button"
                                    variant={"secondary"}
                                    onClick={() => {handleClose({showUnsavedChanges: false})}}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant={"cta"}
                                    type="submit"
                                    data-testid="dialog-save-btn"
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
                            </DialogFooter>

                            <UnsavedChangesDialog 
                                isSaving={isSaving}
                                isClosing={isClosing}
                                setIsClosing={setIsClosing}
                                isOpen={unsavedChangesIsOpen}
                                setIsOpen={setUnsavedChangesIsOpen}
                                closeDialog={closeDialog}
                                form={editResearchForm}
                                formSubmit={onResearchFormSubmit}
                            />
                        </form>
                    </Form>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}
