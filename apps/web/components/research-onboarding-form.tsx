"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {connectOrganizationToCondition, createCondition, updateCondition} from "@comend/lib/actions";
import {toast} from "sonner";
import {usePathname, useRouter} from "next/navigation";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {TooltipProvider} from "@comend/components/ui/tooltip";
import React, {useState} from "react";
import {faker} from "@faker-js/faker";
import LoadingDots from "@comend/components/icons/loading-dots";
import {MOLECULAR_MECHANISMS, Option, optionSchema} from "@comend/lib/types";
import { badgeVariants } from "@comend/components/ui/badge";

export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (v) => (v === "" || v === null ? undefined : v),
        schema.optional()
    );

export const researchFormSchema = z.object({
    disorder: z.array(optionSchema).optional(),     // MultipleSelector; empty array = cleared
    associatedConditions: z.array(optionSchema).optional(),
    summary: emptyToUndefined(z.string().max(500)),
    categories: z.array(optionSchema).optional(),
    otherCategories: emptyToUndefined(z.string()),
    tags: z.string().optional(),
    engaged: emptyToUndefined(
        z.string().regex(/^\d+$/, "Must be a positive integer")
    ),
    national: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    global: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    prevalenceNumerator: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    prevalenceDenominator: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    mechanisms: z.array(z.string()).optional(),     // treat [] as cleared
    otherMechanisms: emptyToUndefined(z.string()),
    causal: z.array(optionSchema).optional(),
    genes: z.array(optionSchema).optional(),
    biomarkers: z.array(optionSchema).optional(),
    systems: z.array(optionSchema).optional(),
    otherSystems: emptyToUndefined(z.string()),
    symptoms: z.array(optionSchema).optional(),
    studies: z.array(optionSchema).optional(),
    tools: z.array(optionSchema).optional(),
});

const handleAsyncSearch = async (query: string) => {
    const res = await fetch(`/api/genes?search=${encodeURIComponent(query || "")}`);
    const genes = await res.json();

    return genes; // should be [{ label: "TP53", value: "TP53" }, ...]
};

const handleConditionAsyncSearch = async (query: string): Promise<Option[]> => {
    if (!query) return []; // Return empty if no input

    try {
        const response = await fetch(`/api/conditions?search=${query}`);
        const data = await response.json();

        // Return the fetched options
        return data;
    } catch (error) {
        console.error("Failed to fetch conditions:", error);
        return [];
    }
};

export default function ResearchOnboardingForm(
    {
        organizationId,
        conditionData,
        previousLink,
        nextLink,
        showSkip,
    }:
    {
        organizationId?: string | undefined,
        conditionData?: any,
        previousLink: string,
        nextLink: string,
        showSkip: boolean,
    }
) {
    faker.seed(123)
    const {data: session} = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof researchFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(researchFormSchema),
        defaultValues: {
            disorder: conditionData.name ? [{ label: conditionData.name, value: conditionData.name }] : [],
            // associatedConditions: (conditionData.associatedConditions ?? []).map((name: string) => ({
            //     label: name,
            //     value: name,
            // })),
            // summary: conditionData.summary ?? "",
            categories: (conditionData.diseaseCategories ?? []).map((cat: string) => ({ label: cat, value: cat })),
            causal: (conditionData.causalGenes ?? []).map((gene: string) => ({ label: gene, value: gene })),
            // genes: (conditionData.associatedGenes ?? []).map((gene: string) => ({ label: gene, value: gene })),
            // systems: (conditionData.associatedSystems ?? []).map((system: string) => ({
            //     label: system,
            //     value: system,
            // })),
            // tags are stored as comma-separated string in your form:
            // tags: conditionTags.join(", "),
            // prevalenceNumerator: conditionData.prevalenceNumerator?.toString() ?? "",
            // prevalenceDenominator: conditionData.prevalenceDenominator?.toString() ?? "",
            engaged: conditionData.numberOfPatientsEngaged?.toString() ?? "",
            // national: conditionData.nationalEstimatedPopulation?.toString() ?? "",
            // global: conditionData.globalEstimatedPopulation?.toString() ?? "",
            otherCategories: undefined,
            // otherMechanisms: undefined,
            // otherSystems: undefined,
        }
    })

    console.log(`condition data`, conditionData)

    async function onSubmit(values: z.infer<typeof researchFormSchema>) {
        setLoading(true)
        try {
            const numOrNull = (s?: string | null) =>
                s && String(s).trim() !== "" ? parseInt(String(s), 10) : null;

            const mappedData: Record<string, any> = {
                name: values.disorder?.[0]?.label || "",
                // Normalize to slugs even for creatable values
                // associatedConditions: (values.associatedConditions ?? []).map(o =>
                //     String(o.label || o.value || "").trim()
                // ),
                // summary: values.summary ?? "",
                diseaseCategories: (values.categories ?? []).map(i => i.label),
                // prevalenceNumerator: numOrNull(values.prevalenceNumerator),
                // prevalenceDenominator: numOrNull(values.prevalenceDenominator),
                numberOfPatientsEngaged: numOrNull(values.engaged),
                // nationalEstimatedPopulation: numOrNull(values.national),
                // globalEstimatedPopulation: numOrNull(values.global),
                // relevantDiseaseMechanisms: values.mechanisms ?? [],
                causalGenes: (values.causal ?? []).map(i => i.label),
                // associatedGenes: (values.genes ?? []).map(i => i.label),
                // associatedSystems: (values.systems ?? []).map(i => i.label),
                // associatedSignsAndSymptoms: (values.symptoms ?? []).map(i => i.label),
                // existingDatabasesAndStudies: (values.studies ?? []).map(i => i.label),
                // toolsUnderDevelopment: (values.tools ?? []).map(i => i.label),
                // metadata: {
                //     otherCategories: values.otherCategories ?? null,
                //     otherMechanisms: values.otherMechanisms ?? null,
                //     otherSystems: values.otherSystems ?? null,
                // },
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

            try {
                if (conditionData?.id && organizationId) {
                    await updateCondition(organizationId, formData).then(async (response) => {
                        if (response.success && response.data) {
                            // const conditionOrg = await connectOrganizationToCondition(session?.user.organizationId, response.data.id)
                            toast.success("Successfully updated condition.")
                            router.push(nextLink)
                        } else {
                            console.error(response.error)
                            toast.error(response.error)
                        }
                    })
                } else {
                    await createCondition(formData).then(async (response) => {
                        if (response.success && response.data) {
                            const conditionOrg = await connectOrganizationToCondition(
                                organizationId ? organizationId : session?.user.organizationId, 
                                response.data.id
                            )
                            toast.success("Successfully created condition.")
                            router.push(nextLink)
                        } else {
                            console.error(response.error)
                            toast.error(response.error)
                        }
                    })
                }

            } catch (error) {
                console.error("Failed to create condition:", error)
                toast.error("An error occurred while creating the condition.")
            }
        } catch (error) {
            toast.error("An error occurred while creating the condition.")
        }
    }

    return (
        <TooltipProvider>
            <div className="relative grid grid-cols-2 gap-x-8">
                <div className="space-y-4 col-span-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="causal"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Causal genes</FormLabel>
                                        {/*<FormDescription>{`The genes associated with your condition.`}</FormDescription>*/}
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                badgeClassName={badgeVariants({variant: "teal"})}
                                                onSearch={handleAsyncSearch}
                                                placeholder="Search for genes..."
                                                triggerSearchOnFocus={true}
                                                hidePlaceholderWhenSelected={true}
                                                loadingIndicator={
                                                <p
                                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                                >
                                                    Loading genes...
                                                </p>}
                                                emptyIndicator={<p>No genes found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
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

                            {form.watch("categories")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                <FormField
                                    control={form.control}
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
                                control={form.control}
                                name="engaged"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Number of patients engaged`}</FormLabel>
                                        <FormDescription>{`An estimated number of diagnosed patients engaged with your organization.`}</FormDescription>
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

                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row space-x-2">
                                    <Button type="button" onClick={() => router.push(previousLink)}>
                                        Previous
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <LoadingDots color="#808080"/> : "Next"}
                                    </Button>
                                </div>
                                {showSkip &&
                                    <Button variant="ghost" onClick={() => router.push("/app/finances")}>
                                        Skip for now
                                    </Button>
                                }
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </TooltipProvider>
    );
}
