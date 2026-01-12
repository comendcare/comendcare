"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Separator} from "@comend/components/ui/separator";
import LoadingDots from "@comend/components/icons/loading-dots";
import MoneyInput from "@comend/components/money-input";
import type {FileWithPreview} from "@comend/components/image-selector";
import {years, toKebabCase} from "@comend/lib/utils";
import {Option, optionSchema, MODALITIES, MOLECULAR_MECHANISMS} from "@comend/lib/types";
import {useDebounce} from "use-debounce";
import {toast} from "sonner";
import {
    createMemberRequest,
    createOrganization,
    updateOrganization,
    connectOrganizationToCondition,
    createCondition,
} from "@comend/lib/actions";
import {
    checkSubdomainAvailability,
} from "@comend/lib/fetchers";
import {handleImageUpload} from "@comend/lib/upload";
import {mixpanelTrack} from "@comend/lib/mixpanel";
import {Textarea} from "@comend/components/ui/textarea";
import {FormImageSelector} from "@comend/components/form-image-selector";
import {Invitation} from "@prisma/client";
import { badgeVariants } from "@comend/components/ui/badge";

/**************************************
 * Zod schema (ALL FIELDS IN ONE)
 **************************************/
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

const unifiedSchema = z.object({
    // join existing
    org: z.array(optionSchema).optional(), // id,label (max 1)
    // create new
    name: z.string({
        required_error: "Please enter your organization's name."
    }).min(2).max(60),
    description: z.string().min(2, {
        message: "Your organization's description must be at least 2 characters long.",
    }).max(500, {
        message: "Your organization's description must less than 500 characters long.",
    }).optional(),
    subdomain: z.string({
        required_error: "Your organization must claim a subdomain."
    }).min(2).max(60),
    website: z.string().optional(),
    contactEmail: z.string().email().optional(),
    title: z.string().optional(),
    founded: z.string().optional(), // year-01-01
    therapeuticsInDevelopment: z.array(optionSchema).optional(),
    otherTherapeuticsInDevelopment: z.string().optional(),
    therapeuticsOfInterest: z.array(optionSchema).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),
    // incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"]).optional(),
    orgImage: z.string().optional(),

    // RESEARCH / CONDITION
    disorder: z.array(optionSchema),
    associatedConditions: z.array(optionSchema).optional(),
    summary: emptyToUndefined(z.string().max(500)),
    categories: z.array(optionSchema).optional(),
    otherCategories: emptyToUndefined(z.string()),
    engaged: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    national: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    global: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    prevalenceNumerator: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    prevalenceDenominator: emptyToUndefined(z.string().regex(/^\d+$/, "Must be a positive integer")),
    mechanisms: z.array(z.string()).optional(),
    causal: z.array(optionSchema).optional(),
    genes: z.array(optionSchema).optional(),
    systems: z.array(optionSchema).optional(),
    otherSystems: emptyToUndefined(z.string()),
    symptoms: z.array(optionSchema).optional(),
    studies: z.array(optionSchema).optional(),
    tools: z.array(optionSchema).optional(),

    // FINANCES
    raised: z.number().optional(),
    budget: z.number().optional(),
    deployed: z.number().optional(),
});

const normalized = (s?: string) => (s || "").trim().toLowerCase();

const refinedSchema = unifiedSchema.superRefine((vals, ctx) => {
    const disorderLabel = normalized(vals.disorder?.[0]?.label);
    if (!disorderLabel) return;

    const hasSelf = (vals.associatedConditions || [])
        .some(opt => normalized(opt?.label) === disorderLabel);

    if (hasSelf) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["associatedConditions"],
            message: "A condition cannot be associated with itself."
        });
    }
});

/**************************************
 * Component
 **************************************/
export default function NewOrganizationForm({invitations, organizations}: {
    invitations: Invitation[],
    organizations: Option[]
}) {
    const router = useRouter();
    const {update} = useSession();

    // Loading/initial state
    const [loading, setLoading] = useState(false);
    const [isCropping, setIsCropping] = useState(false)

    // Files
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);

    // Collections
    const hasInvitations = invitations.length > 0;

    // Debounced subdomain check
    const form = useForm<z.infer<typeof unifiedSchema>>({
        mode: "onChange",
        resolver: zodResolver(refinedSchema),
    });

    const [debouncedSubdomain] = useDebounce(form.watch("subdomain"), 500);


    /**************************************
     * Subdomain availability check
     **************************************/
    useEffect(() => {
        const check = async () => {
            const sd = debouncedSubdomain;
            if (!sd) return;
            try {
                const ok = await checkSubdomainAvailability(sd);
                if (!ok) {
                    form.setError("subdomain", {
                        type: "manual",
                        message: "This nickname is already taken. Please choose another."
                    });
                } else {
                    form.clearErrors("subdomain");
                }
            } catch (e) {
                // ignore
            }
        };
        check();
    }, [debouncedSubdomain, form]);

    /**************************************
     * Submit handler (keeps original logic)
     **************************************/
    async function onSubmit(values: z.infer<typeof unifiedSchema>) {
        setLoading(true);

        try {

            // Create/update org
            const formData = new FormData();
            if (values.name) formData.append("name", values.name);
            if (values.description) formData.append("description", values.description);
            if (values.subdomain) formData.append("subdomain", values.subdomain);
            if (values.website) formData.append("website", values.website);
            if (values.contactEmail) formData.append("contactEmail", values.contactEmail);
            if (values.title) formData.append("title", values.title);
            if (values.founded) formData.append("founded", values.founded);
            // if (values.incorporationStatus) formData.append("incorporationStatus", values.incorporationStatus);

            // Upload org image only if changed
            if (selectedFile && values.orgImage && values.orgImage !== (form.formState.defaultValues as any)?.orgImage) {
                const imgUrl = await handleImageUpload(selectedFile as File, values.orgImage);
                if (imgUrl) values.orgImage = imgUrl;
            }

            if (values.orgImage) formData.append("image", values.orgImage);

            const extra = {
                therapeuticsInDevelopment: values.therapeuticsInDevelopment?.map((t) => t.label).join(",") || "",
                therapeuticsOfInterest: values.therapeuticsOfInterest?.map((t) => t.label).join(",") || "",
                metadata: JSON.stringify({
                    otherTherapeuticsInDevelopment: values.otherTherapeuticsInDevelopment,
                    otherTherapeuticsOfInterest: values.otherTherapeuticsOfInterest,
                }),
            };
            Object.entries(extra).forEach(([k, v]) => v && formData.append(k, v as string));

            const createRes: any = await createOrganization(formData);
            if (createRes?.error) {
                toast.error(createRes.error);
                return;
            }
            toast.success("Successfully created organization!");
            mixpanelTrack("Created Organization", {
                name: values.name,
                looking: values.therapeuticsOfInterest?.map((x) => x.label).join(",")
            });

            // 4) Organization: join or create (and possibly update existing)
            let orgId = createRes.organization.id

            // 5) Condition (optional; only if disorder selected and we have an org)
            const numOrNull = (s?: string | null) =>
                s && String(s).trim() !== "" ? parseInt(String(s), 10) : null;

            if (values.disorder?.length && orgId) {
                const cfd = new FormData();

                // Build the same mapped structure as the editor
                const mappedData: Record<string, any> = {
                    name: values.disorder?.[0]?.label || "",
                    // normalize to slugs like the editor
                    associatedConditions: (values.associatedConditions ?? []).map(o =>
                        toKebabCase(String(o.value || o.label || "").trim())
                    ),
                    summary: values.summary ?? "",
                    diseaseCategories: (values.categories ?? []).map(i => i.label),
                    prevalenceNumerator: numOrNull(values.prevalenceNumerator),
                    prevalenceDenominator: numOrNull(values.prevalenceDenominator),
                    numberOfPatientsEngaged: numOrNull(values.engaged),
                    nationalEstimatedPopulation: numOrNull(values.national),
                    globalEstimatedPopulation: numOrNull(values.global),
                    // keep mechanisms consistent with editor: it uses `categories` for UI and leaves `mechanisms` unused
                    relevantDiseaseMechanisms: values.mechanisms ?? [],
                    causalGenes: (values.causal ?? []).map(i => i.label),
                    associatedGenes: (values.genes ?? []).map(i => i.label),
                    associatedSystems: (values.systems ?? []).map(i => i.label),
                    // wire up optional fields you already have in the schema
                    associatedSignsAndSymptoms: (values.symptoms ?? []).map(i => i.label),
                    existingDatabasesAndStudies: (values.studies ?? []).map(i => i.label),
                    toolsUnderDevelopment: (values.tools ?? []).map(i => i.label),
                    metadata: {
                        otherCategories: values.otherCategories ?? null,
                        otherSystems: values.otherSystems ?? null,
                    },
                };

                const appendCsv = (fd: FormData, key: string, arr: string[]) => {
                    if (arr && arr.length) fd.append(key, arr.join(",")); // e.g. "ABCF1,BRCA1"
                };

                Object.entries(mappedData).forEach(([key, value]) => {
                    if (key === "metadata") {
                        cfd.append(key, JSON.stringify(value ?? {}));
                    } else if (Array.isArray(value)) {
                        appendCsv(cfd, key, value);
                    } else if (value === null || value === undefined || value === "") {
                        // skip null/empty so server falls back to []
                    } else {
                        cfd.append(key, String(value));
                    }
                });

                const condRes = await createCondition(cfd);
                if (condRes?.success && condRes?.data?.id) {
                    await connectOrganizationToCondition(orgId, condRes.data.id);
                    toast.success("Condition saved!");
                } else if (condRes?.error) {
                    console.error(condRes.error);
                    toast.error(condRes.error);
                }
            }

            // 6) Finances (optional; only if at least one is provided + orgId)
            if (orgId) {
                const financeMap: Record<string, number | undefined> = {
                    moneyRaised: values.raised,
                    researchBudget: values.budget,
                    moneyDeployed: values.deployed,
                };
                const ffd = new FormData();
                Object.entries(financeMap).forEach(([k, v]) => {
                    if (typeof v === "number" && !Number.isNaN(v)) ffd.append(k, String(v));
                });
                if ([values.raised, values.budget, values.deployed].some((x) => typeof x === "number")) {
                    await updateOrganization(orgId, ffd);
                }
            }

            // 7) Final route
            await update({})
            if (hasInvitations) router.push("/app/profile");
            else router.push("/app/dashboard");
            toast.success("Onboarding complete ✨");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while saving.");
        } finally {
            setLoading(false);
        }
    }

    /**************************************
     * Async gene + condition search (examples)
     **************************************/
    const handleGeneSearch = useCallback(async (query: string) => {
        if (!query) return [];
        const res = await fetch(`/api/genes?search=${encodeURIComponent(query)}`);
        return res.json();
    }, []);

    const handleConditionSearch = useCallback(async (query: string) => {
        if (!query) return [];
        const res = await fetch(`/api/conditions?search=${encodeURIComponent(query)}`);
        return res.json();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (e) => {
                console.log(e);
                toast.error("Please fix the highlighted errors.");
            })} className="space-y-10">
                {/* ORGANIZATION */}
                <section className="space-y-6">
                    <h2 className="text-xl font-semibold">
                        Organization
                    </h2>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Organization Name (required)</FormLabel>
                                    <FormControl><Input type="text" {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Describe your organization in a few sentences.</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={4}
                                            placeholder="Up to 500 characters"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subdomain"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Custom Comend URL (required)</FormLabel>
                                    <FormDescription>
                                        {`This will create your organization's unique Comend profile link (e.g., yourname.comend.io). Use a short name or abbreviation. This is not your external website.`}
                                        <br/>
                                        {form.watch("subdomain") &&
                                            !form.formState.errors.subdomain && (
                                                <>
                                                    {`Your profile URL will be: ${form
                                                        .watch("subdomain")
                                                        .toLowerCase()
                                                        .replace(/\s+/g, "-")}.comend.io`}
                                                </>
                                            )}
                                    </FormDescription>
                                    <FormControl>
                                        <Input {...field}
                                               onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="website"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl><Input type="email"
                                                            placeholder="name@example.com" {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Title of your role</FormLabel>
                                    <FormControl><Input type="text" {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="founded"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Year Founded</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(`${v}-01-01`)}
                                            defaultValue={field.value?.split('-')?.[0]}>
                                        <FormControl>
                                            <SelectTrigger data-testid="founded-select"
                                                           aria-label="Year Founded">
                                                <SelectValue placeholder="Select a year"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {years.map((y) => (
                                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="therapeuticsInDevelopment"
                            render={({field}) => {
                                const id = "ms-ther-dev";

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Therapeutics under development
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                placeholder="Select modalities..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Therapeutics under development", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                hidePlaceholderWhenSelected
                                                emptyIndicator={<p
                                                    className="text-center text-sm text-muted-foreground">no
                                                    results found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />

                        {form.watch("therapeuticsInDevelopment")?.some((i) => ["OTHER", "Other"].includes(i.value)) && (
                            <FormField
                                control={form.control}
                                name="otherTherapeuticsInDevelopment"
                                render={({field}) => (
                                    <FormItem>
                                        <FormDescription>(Optional) Other details for internal improvement
                                            only.</FormDescription>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="therapeuticsOfInterest"
                            render={({field}) => {
                                const id = "ms-ther-interest";

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Therapeutics of interest
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                placeholder="Select modalities..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Therapeutics of Interest", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                hidePlaceholderWhenSelected
                                                emptyIndicator={<p
                                                    className="text-center text-sm text-muted-foreground">no
                                                    results found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />

                        {form.watch("therapeuticsOfInterest")?.some((i) => ["OTHER", "Other"].includes(i.value)) && (
                            <FormField
                                control={form.control}
                                name="otherTherapeuticsOfInterest"
                                render={({field}) => (
                                    <FormItem>
                                        <FormDescription>(Optional) Other details for internal improvement
                                            only.</FormDescription>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}

                        {/*<FormField*/}
                        {/*    control={form.control}*/}
                        {/*    name="incorporationStatus"*/}
                        {/*    render={({field}) => (*/}
                        {/*        <FormItem className="space-y-3">*/}
                        {/*            <FormLabel>What is your 501(c)(3) status?</FormLabel>*/}
                        {/*            <FormControl>*/}
                        {/*                <RadioGroup onValueChange={field.onChange} value={field.value}*/}
                        {/*                            className="flex flex-col space-y-1">*/}
                        {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                        {/*                        <FormControl><RadioGroupItem value="YES"/></FormControl>*/}
                        {/*                        <FormLabel className="font-normal">Yes, I have a*/}
                        {/*                            501(c)(3)</FormLabel>*/}
                        {/*                    </FormItem>*/}
                        {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                        {/*                        <FormControl><RadioGroupItem*/}
                        {/*                            value="INPROGRESS"/></FormControl>*/}
                        {/*                        <FormLabel className="font-normal">*/}
                        {/*                            {`No, but I'm working on it`}*/}
                        {/*                        </FormLabel>*/}
                        {/*                    </FormItem>*/}
                        {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                        {/*                        <FormControl><RadioGroupItem value="NO"/></FormControl>*/}
                        {/*                        <FormLabel className="font-normal">*/}
                        {/*                            {`No, I don't have a 501(c)(3)`}*/}
                        {/*                        </FormLabel>*/}
                        {/*                    </FormItem>*/}
                        {/*                </RadioGroup>*/}
                        {/*            </FormControl>*/}
                        {/*            <FormMessage/>*/}
                        {/*        </FormItem>*/}
                        {/*    )}*/}
                        {/*/>*/}

                        {/* Org image */}
                        <FormImageSelector
                            form={form}
                            name="orgImage"
                            title="Organization Logo"
                            description="PNG/JPG only (no SVG)."
                            aspect={1}
                            img={form.watch("orgImage") || undefined}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            className=""
                            isCropping={isCropping}
                            setIsCropping={setIsCropping}
                        />

                    </div>
                </section>
                <>
                    <Separator/>

                    {/* RESEARCH / CONDITION */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold">Condition</h2>

                        <FormField
                            control={form.control}
                            name="disorder"
                            render={({field}) => {
                                const id = "ms-disorder"

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Name of condition
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                creatable
                                                maxSelected={1}
                                                onSearch={handleConditionSearch}
                                                placeholder="Search for conditions..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Name of condition", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                hidePlaceholderWhenSelected
                                                loadingIndicator={<p>Loading conditions...</p>}
                                                emptyIndicator={<p>No conditions found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="associatedConditions"
                            render={({field}) => {
                                const id = "ms-associated-conditions";

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Associated Conditions
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                creatable
                                                maxSelected={5}
                                                onSearch={handleConditionSearch}
                                                placeholder="Search for conditions..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Associated Conditions", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                hidePlaceholderWhenSelected
                                                loadingIndicator={<p>Loading conditions...</p>}
                                                emptyIndicator={<p>No conditions found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />

                        <FormField control={form.control} name="summary" render={({field}) => (
                            <FormItem>
                                <FormLabel>Describe your condition in a few sentences.</FormLabel>
                                <FormControl>
                                    <Textarea
                                        rows={4}
                                        placeholder="Up to 500 characters"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                        <FormField
                            control={form.control}
                            name="categories"
                            render={({field}) => {
                                const id = "ms-categories";

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Mechanisms of action
                                        </FormLabel>
                                        <FormDescription>What types of genetic effects are you investigating?
                                            Select all that apply.</FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MOLECULAR_MECHANISMS}
                                                placeholder="Select categories..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Mechanisms of action", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                hidePlaceholderWhenSelected
                                                emptyIndicator={<p
                                                    className="text-center text-sm text-muted-foreground">no
                                                    results found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />

                        {form.watch("categories")?.some((i) => ["OTHER", "Other"].includes(i.value)) && (
                            <FormField
                                control={form.control}
                                name="otherCategories"
                                render={({field}) => (
                                    <FormItem>
                                        <FormDescription>(Optional) Other details for internal improvement
                                            only.</FormDescription>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="engaged" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Number of patients engaged</FormLabel>
                                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                            <FormField control={form.control} name="national" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Estimated US patient population</FormLabel>
                                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="global" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Estimated global patient population</FormLabel>
                                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        </div>

                        <FormField
                            control={form.control}
                            name="causal"
                            render={({field}) => {
                                const id = "ms-causal-genes"

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Causal genes
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                badgeClassName={badgeVariants({variant: "teal"})}
                                                onSearch={handleGeneSearch}
                                                placeholder="Search for genes..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Causal genes", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                triggerSearchOnFocus
                                                hidePlaceholderWhenSelected
                                                loadingIndicator={<p>Loading genes...</p>}
                                                emptyIndicator={<p>No genes found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="genes"
                            render={({field}) => {
                                const id = "ms-associated-genes";

                                return (
                                    <FormItem>
                                        <FormLabel htmlFor={id} id={`${id}-label`}>
                                            Associated genes
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                badgeClassName={badgeVariants({variant: "teal"})}
                                                onSearch={handleGeneSearch}
                                                placeholder="Search for genes..."
                                                inputProps={{
                                                    id,
                                                    "aria-labelledby": `${id}-label`,
                                                    "aria-label": "Associated genes", // keep for a11y
                                                    "data-testid": id,
                                                }}
                                                triggerSearchOnFocus
                                                hidePlaceholderWhenSelected
                                                loadingIndicator={<p>Loading genes...</p>}
                                                emptyIndicator={<p>No genes found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
                    </section>

                    <Separator/>

                    {/* FINANCES */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold">Finances</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MoneyInput
                                form={form}
                                label="Total funds raised to date"
                                name="raised"
                            />

                            <MoneyInput
                                form={form}
                                label="Total funds deployed to date"
                                name="deployed"
                            />

                            <MoneyInput
                                form={form}
                                label="Total annual research budget"
                                name="budget"
                            />
                        </div>
                    </section>
                </>
                <div className="flex justify-between">
                    <div/>
                    <Button type="submit" disabled={loading || isCropping}>
                        {loading ? <LoadingDots color="#808080"/> : "Complete sign-up"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
