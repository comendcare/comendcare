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
import {Plus} from "lucide-react";
import { Trash2 } from "lucide-react";
import { BIOMARKER_TYPES } from "@comend/lib/types";

export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess(
        (v) => (v === "" || v === null ? undefined : v),
        schema.optional()
    );

const biomarkerSchema = z.object({
    name: z.string().optional(),
    type: z.array(optionSchema).optional(), // single-select via maxSelected=1
});

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
    biomarkers: z.array(biomarkerSchema).optional(),
    systems: z.array(optionSchema).optional(),
    otherSystems: emptyToUndefined(z.string()),
    studies: z.array(optionSchema).optional(),
    tools: z.array(optionSchema).optional(),
    associatedSignsAndSymptoms: z.array(optionSchema).optional(),
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
            disorder: conditionData?.name ? [{ label: conditionData.name, value: conditionData.name }] : [],
            categories: (conditionData?.diseaseCategories ?? []).map((cat: string) => ({ label: cat, value: cat })),
            causal: (conditionData?.causalGenes ?? []).map((gene: string) => ({ label: gene, value: gene })),
            engaged: conditionData?.numberOfPatientsEngaged?.toString() ?? "",
        }
    })

    async function onSubmit(values: z.infer<typeof researchFormSchema>) {
        setLoading(true)
        try {
            const numOrNull = (s?: string | null) =>
                s && String(s).trim() !== "" ? parseInt(String(s), 10) : null;

            const mappedData: Record<string, any> = {
                name: values.disorder?.[0]?.label || "",
                diseaseCategories: (values.categories ?? []).map(i => i.label),
                numberOfPatientsEngaged: numOrNull(values.engaged),
                causalGenes: (values.causal ?? []).map(i => i.label),
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


type BiomarkerType = {
    name: string;
    types: Option[]; // max 1
};

export const BiomarkersFormField = ({ form, title }: { form: any; title?: string }) => {
    return (
        <FormField
            control={form.control}
            name="biomarkers"
            render={({ field }) => (
                <FormItem>
                    <div className="flex flex-row justify-between gap-2 items-center">
                        <div className="flex flex-col">
                            <FormLabel>{title || `Biomarkers`}</FormLabel>
                            <FormDescription>{`Any available biomarkers for your condition that you are aware of.`}</FormDescription>
                            <FormMessage />
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault();
                                form.setValue("biomarkers", [
                                    ...(field.value || []),
                                    { name: "", types: [] } satisfies BiomarkerType,
                                ], { shouldDirty: true, shouldValidate: true });
                            }}
                        >
                            <Plus />
                        </Button>
                    </div>

                    {field?.value && field.value.length > 0 && (
                        <ol className="flex flex-col gap-4 mt-4">
                            {field.value.map((bm: BiomarkerType, index: number) => (
                                <BiomarkerRow
                                    key={index}
                                    value={bm}
                                    onDelete={() => {
                                        form.setValue(
                                            "biomarkers",
                                            field.value.filter((_: BiomarkerType, i: number) => i !== index),
                                            { shouldDirty: true, shouldValidate: true }
                                        );
                                    }}
                                    onValueChange={(newValue) => {
                                        form.setValue(
                                            "biomarkers",
                                            field.value.map((curr: BiomarkerType, i: number) => (i === index ? newValue : curr)),
                                            { shouldDirty: true, shouldValidate: true }
                                        );
                                    }}
                                />
                            ))}
                        </ol>
                    )}
                </FormItem>
            )}
        />
    );
};

export const BiomarkerRow = ({
                                 value,
                                 onDelete,
                                 onValueChange,
                             }: {
    value: BiomarkerType;
    onDelete: () => void;
    onValueChange: (next: BiomarkerType) => void;
}) => {
    return (
        <li className="flex flex-col gap-3 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Biomarker name */}
                    <FormItem>
                        <FormLabel>Biomarker name</FormLabel>
                        <FormControl>
                            <Input
                                value={value.name ?? ""}
                                placeholder="e.g., Creatine (CSF), CK, Lactate..."
                                onChange={(e) => onValueChange({ ...value, name: e.target.value })}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    {/* Biomarker type (single select) */}
                    <FormItem>
                        <FormLabel>Biomarker type</FormLabel>
                        <FormControl>
                            <MultipleSelector
                                value={value.types ?? []}
                                onChange={(next) => onValueChange({ ...value, types: next })}
                                defaultOptions={BIOMARKER_TYPES}
                                maxSelected={1}
                                creatable={false}
                                placeholder="Select a type..."
                                hidePlaceholderWhenSelected
                                showHoverCard={false}
                                emptyIndicator={<p className="text-center text-sm text-muted-foreground">no results found.</p>}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </div>

                <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label="Remove biomarker">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
};
