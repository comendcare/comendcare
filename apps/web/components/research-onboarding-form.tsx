"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {connectOrganizationToCondition, createCondition} from "@comend/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@comend/components/ui/tooltip";
import React, {useEffect, useState} from "react";
import {faker} from "@faker-js/faker";
import LoadingDots from "@comend/components/icons/loading-dots";
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers";
import type {Organization} from "@prisma/client";
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

export default function ResearchOnboardingForm(
    {
        previousLink,
        nextLink,
        showSkip,
    }:
    {
        previousLink: string,
        nextLink: string,
        showSkip: boolean,
    }
) {
    faker.seed(123)
    const {data: session, status} = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>();

    const form = useForm<z.infer<typeof researchFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(researchFormSchema),
    })

    async function onSubmit(values: z.infer<typeof researchFormSchema>) {
        setLoading(true)

        try {

            // Create FormData object
            const formData = new FormData();

            // Map form values into FormData
            const data = {
                name: values.disorder?.[0]?.label || "", // Assume there is only one condition selected
                summary: values.summary || "",
                diseaseCategories: values.categories?.map((category) => category.label).join(",") || "",
                prevalenceNumerator: values.prevalenceNumerator ? values.prevalenceNumerator.toString() : "",
                prevalenceDenominator: values.prevalenceDenominator ? values.prevalenceDenominator.toString() : "",
                numberOfPatientsEngaged: values.engaged ? values.engaged.toString() : "",
                nationalEstimatedPopulation: values.national ? values.national.toString() : "",
                globalEstimatedPopulation: values.global ? values.global.toString() : "",
                relevantDiseaseMechanisms: values.mechanisms?.join(",") || "",
                causalGenes: values.causal?.map((gene) => gene.label).join(",") || "",
                associatedGenes: values.genes?.map((gene) => gene.label).join(",") || "",
                associatedSystems: values.systems?.map((symptom) => symptom.label).join(",") || "",
                metadata: JSON.stringify({
                    otherCategories: values.otherCategories
                })
            };

            // Append data to FormData
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            try {
                await createCondition(formData).then(async (response) => {
                    if (response.success && response.data) {
                        const conditionOrg = await connectOrganizationToCondition(session?.user.organizationId, response.data.id)
                        toast.success("Successfully created condition.")
                        router.push(nextLink)
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                })

            } catch (error) {
                console.error("Failed to create condition:", error)
                toast.error("An error occurred while creating the condition.")
            }
        } catch (error) {
            toast.error("An error occurred while creating the condition.")
        } finally {
            setLoading(false)
        }
    }

    const handleAsyncSearch = async (query: string) => {
        const res = await fetch(`/api/genes?search=${encodeURIComponent(query || "")}`);
        const genes = await res.json();

        return genes; // should be [{ label: "TP53", value: "TP53" }, ...]
    };

    useEffect(() => {
        const fetchOrganization = async () => {
            if (status === "loading") {
                // Wait until status is no longer "loading"
                return;
            }

            if (session?.user?.organizationId && status === "authenticated") {
                try {
                    console.log('Fetching organization data...');
                    const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {
                        id: true,
                        public: true,
                        verified: true,
                        published: true,
                        name: true,
                        description: true,
                        contactEmail: true,
                        logo: true,
                        image: true,
                        headerImage: true,
                        biopharmaConsentSettings: true,
                        subdomain: true,
                        customDomain: true,
                        statedGoal: true,
                        yearFounded: true,
                        incorporationStatus: true,
                        therapeuticsOfInterest: true,
                        therapeuticsInDevelopment: true,
                        website: true,
                        moneyRaised: true,
                        moneyDeployed: true,
                        researchBudget: true,
                        // address1                  String?
                        // address2                  String?
                        // formattedAddress          String?
                        // city                      String?
                        // region                    String?
                        // postalCode                String?
                        // country                   String?
                        // lat                       String?
                        // lng                       String?
                        createdAt: true,
                        updatedAt: true,
                        user: true,
                        userId: true,
                        roadmaps: true,
                        members: true,
                        clients: true,
                        invitations: true,
                        membershipRequests: true,
                        conditions: true,
                        kanban: true,
                        milestones: true,
                        platformNotifications: true,
                        reviews: true,
                        savedCompanies: true,
                        tools: true,
                        rfps: true,
                        metadata: true
                    });
                    console.log('API response:', response);

                    if (response.success) {
                        setOrganization(response.data);
                        console.log('Organization set:', response.data);
                    } else {
                        console.error('Error fetching organization:', response.error);
                        toast.error(response.error);
                    }
                } catch (error) {
                    console.error('Failed to fetch organization:', error);
                    toast.error('An error occurred while fetching organization data.');
                }
            } else if (status === "unauthenticated") {
                console.error('User is unauthenticated.');
                toast.error('User is unauthenticated.');
            } else {
                console.error('No organizationId provided in session.');
                toast.error('No organizationId provided.');
            }
        };

        fetchOrganization();
    }, [setOrganization, session?.user?.organizationId, status])

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
