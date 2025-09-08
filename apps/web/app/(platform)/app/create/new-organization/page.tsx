"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

// UI
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
import {Checkbox} from "@comend/components/ui/checkbox";
import {RadioGroup, RadioGroupItem} from "@comend/components/ui/radio-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {ToggleGroup, ToggleGroupItem} from "@comend/components/ui/toggle-group";
import {Separator} from "@comend/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@comend/components/ui/tooltip";
import LoadingDots from "@comend/components/icons/loading-dots";
import {Skeleton} from "@comend/components/ui/skeleton";
import MoneyInput from "@comend/components/money-input";
import {ScrollProgress} from "@comend/components/ui/scroll-progress";

// Domain helpers / types
import type {FileWithPreview} from "@comend/components/image-selector";
import {acceptedFiletypes, years, getPublicFile} from "@comend/lib/utils";
import {Option, optionSchema, MODALITIES, MOLECULAR_MECHANISMS} from "@comend/lib/types";

// Data
import {useDebounce} from "use-debounce";
import {useDropzone} from "react-dropzone";
import mixpanel from "mixpanel-browser";
import {toast} from "sonner";

// Actions / API
import {
    editUser,
    createMemberRequest,
    createOrganization,
    updateOrganization,
    connectOrganizationToCondition,
    createCondition,
} from "@comend/lib/actions";
import {
    getInvitations,
    getPublicOrganizationData,
    getUser,
    getAllNonMemberOrganizations,
    getOrganizationFromOrganizationId,
    checkSubdomainAvailability,
} from "@comend/lib/fetchers";
import {handleImageUpload} from "@comend/lib/upload";
import {mixpanelTrack} from "@comend/lib/mixpanel";
import {Textarea} from "@/packages/components/ui/textarea";

const safeMixpanel = {
    identify: (...args: any[]) => {
        try {
            if (typeof window !== "undefined" && (mixpanel as any)?.persistence) {
// @ts-ignore
                mixpanel.identify?.(...(args as any));
            }
        } catch (e) {
            console.warn("mixpanel identify skipped:", e);
        }
    },
    optIn: () => {
        try {
            if (typeof window !== "undefined" && (mixpanel as any)?.persistence) {
                mixpanel.opt_in_tracking?.();
            }
        } catch (e) {
            console.warn("mixpanel opt_in skipped:", e);
        }
    },
    optOut: () => {
        try {
            if (typeof window !== "undefined" && (mixpanel as any)?.persistence) {
                mixpanel.opt_out_tracking?.();
            }
        } catch (e) {
            console.warn("mixpanel opt_out skipped:", e);
        }
    },
};

/**************************************
 * Zod schema (ALL FIELDS IN ONE)
 **************************************/
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

const unifiedSchema = z.object({
    // USER
    name: z.string().min(2, {message: "Your name must be at least 2 characters."}),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
    userImage: z.string().optional(),

    // ORG MODE
    isNewOrganization: z.boolean().default(true),
    // join existing
    org: z.array(optionSchema).optional(), // id,label (max 1)
    // create new
    orgName: z.string().min(2).max(60).optional(),
    description: z.string().min(2, {
        message: "Your organization's description must be at least 2 characters long.",
    }).max(500, {
        message: "Your organization's description must less than 500 characters long.",
    }).optional(),
    subdomain: z.string().min(2).max(60).optional(),
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
    disorder: z.array(optionSchema).optional(),
    // associatedConditions: z.array(optionSchema),
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

    // const hasSelf = (vals.associatedConditions || [])
    //     .some(opt => normalized(opt?.label) === disorderLabel);

    // if (hasSelf) {
    //     ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         path: ["associatedConditions"],
    //         message: "A condition cannot be associated with itself."
    //     });
    // }
});

/**************************************
 * Component
 **************************************/
export default function CreateNewOrganizationPage() {
    const router = useRouter();
    const {data: session, status, update} = useSession();

    // Loading/initial state
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);

    // Files
    const [selectedUserFile, setSelectedUserFile] = useState<FileWithPreview | null>(null);
    const [selectedOrgFile, setSelectedOrgFile] = useState<FileWithPreview | null>(null);

    // Collections
    const [organizations, setOrganizations] = useState<Option[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const hasInvitations = invitations.length > 0;

    // Debounced subdomain check
    const form = useForm<z.infer<typeof unifiedSchema>>({
        mode: "onChange",
        resolver: zodResolver(refinedSchema),
        defaultValues: {
            name: session?.user?.name || "",
            notificationSettings: true,
            consentSettings: true,
            isNewOrganization: true,
        },
    });

    const [debouncedSubdomain] = useDebounce(form.watch("subdomain"), 500);

    // Derived helpers
    const isNewOrg = form.watch("isNewOrganization");

    /**************************************
     * Image drop handlers
     **************************************/
    const onDropUser = useCallback((files: any[]) => {
        const file = files?.[0];
        if (!file) return;
        if (file.type === "image/svg+xml") {
            toast.error("SVG files are not allowed. Please select a valid image.");
            return;
        }
        const withPreview = Object.assign(file, {preview: URL.createObjectURL(file)});
        setSelectedUserFile(withPreview);
    }, []);

    const onDropOrg = useCallback((files: any[]) => {
        const file = files?.[0];
        if (!file) return;
        if (file.type === "image/svg+xml") {
            toast.error("SVG files are not allowed. Please select a valid image.");
            return;
        }
        const withPreview = Object.assign(file, {preview: URL.createObjectURL(file)});
        setSelectedOrgFile(withPreview);
    }, []);

    const userDropzone = useDropzone({onDrop: onDropUser, accept: acceptedFiletypes});
    const orgDropzone = useDropzone({onDrop: onDropOrg, accept: acceptedFiletypes});

    /**************************************
     * Initialization: fetch user, orgs, invitations
     **************************************/
    useEffect(() => {
        (async () => {
            try {
                // Invitations (to decide where to redirect after user update)
                const invRes = await getInvitations({
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    accepted: true,
                    organizationId: true,
                });
                if (invRes.success && invRes.data) {
                    const withDetails = await Promise.all(
                        invRes.data.map(async (i: any) => {
                            const orgRes = await getPublicOrganizationData(i.organizationId, {
                                id: true,
                                name: true,
                                description: true,
                                image: true,
                                subdomain: true,
                            });
                            return {...i, organization: orgRes.success ? orgRes.data : null};
                        })
                    );
                    setInvitations(withDetails);
                }

                // Organizations (for joining)
                const orgsRes = await getAllNonMemberOrganizations({id: true, name: true, description: true});
                if (orgsRes.success && orgsRes.data) {
                    const opts: Option[] = orgsRes.data.map((org: any, idx: number) => ({
                        value: org.id || String(idx),
                        label: org.name || "",
                        description: org.description || "",
                    }));
                    setOrganizations(opts);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsInitializing(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id, session?.user?.organizationId]);

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
            // 1) Consent / mixpanel
            if (values.consentSettings) {
                if (session?.user?.id && session?.user?.email) {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") safeMixpanel.identify(session.user.email);
                    else safeMixpanel.identify(session.user.id);
                }
                safeMixpanel.optIn();
            } else {
                safeMixpanel.optOut();
            }

            // 2) User image upload (if changed)
            if (selectedUserFile && values.userImage && values.userImage !== (form.formState.defaultValues as any)?.userImage) {
                const imgUrl = await handleImageUpload(selectedUserFile as File, values.userImage);
                if (imgUrl) values.userImage = imgUrl;
            }

            // 3) Persist user fields (one-by-one, as before)
            if (session?.user?.id) {
                const userPayload: Record<string, any> = {
                    name: values.name,
                    notificationSettings: values.notificationSettings,
                    consentSettings: values.consentSettings,
                    image: values.userImage,
                };
                for (const [key, value] of Object.entries(userPayload)) {
                    const res: any = await editUser(session.user.id as string, {[key]: value});
                    if (res?.error) {
                        toast.error(res.error);
                        return;
                    }
                }
            }

            // Track
            mixpanelTrack("Onboarding: user saved", {name: values.name});

            // 4) Organization: join or create (and possibly update existing)
            let orgId = session?.user?.organizationId as string | undefined;

            if (!values.isNewOrganization) {
                // Joining existing org
                const orgValue = values.org?.[0]?.value;
                if (orgValue && typeof orgValue === "string") {
                    const resp = await createMemberRequest(orgValue);
                    if (!resp?.success) {
                        console.error(resp?.error);
                        toast.error(resp?.error || "Failed to request membership.");
                        return;
                    }
                    toast.success(`A membership request has been sent to ${values.org?.[0]?.label}`);
                }
            } else {
                // Create/update org
                const formData = new FormData();
                if (values.orgName) formData.append("orgName", values.orgName);
                if (values.description) formData.append("description", values.description);
                if (values.subdomain) formData.append("subdomain", values.subdomain);
                if (values.website) formData.append("website", values.website);
                if (values.contactEmail) formData.append("contactEmail", values.contactEmail);
                if (values.title) formData.append("title", values.title);
                if (values.founded) formData.append("founded", values.founded);
                // if (values.incorporationStatus) formData.append("incorporationStatus", values.incorporationStatus);

                // Upload org image only if changed
                if (selectedOrgFile && values.orgImage) {
                    const imgUrl = await handleImageUpload(selectedOrgFile as File, values.orgImage);
                    if (imgUrl) formData.set("image", imgUrl);
                } else if (values.orgImage) {
                    formData.set("image", values.orgImage);
                }

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
                    orgName: values.orgName,
                    looking: values.therapeuticsOfInterest?.map((x) => x.label).join(",")
                });
            }

            // 5) Condition (optional; only if disorder selected and we have an org)
            if (values.disorder?.length && orgId) {
                const cfd = new FormData();
                const conditionData = {
                    name: values.disorder?.[0]?.label || "",
                    // associatedConditions: values.associatedConditions?.map((g) => g.label).join(",") || "",
                    summary: values.summary || "",
                    diseaseCategories: values.categories?.map((c) => c.label).join(",") || "",
                    prevalenceNumerator: values.prevalenceNumerator || "",
                    prevalenceDenominator: values.prevalenceDenominator || "",
                    numberOfPatientsEngaged: values.engaged || "",
                    nationalEstimatedPopulation: values.national || "",
                    globalEstimatedPopulation: values.global || "",
                    relevantDiseaseMechanisms: values.mechanisms?.join(",") || "",
                    causalGenes: values.causal?.map((g) => g.label).join(",") || "",
                    associatedGenes: values.genes?.map((g) => g.label).join(",") || "",
                    associatedSystems: values.systems?.map((s) => s.label).join(",") || "",
                    metadata: JSON.stringify({
                        otherCategories: values.otherCategories,
                        otherSystems: values.otherSystems
                    }),
                };
                Object.entries(conditionData).forEach(([k, v]) => v && cfd.append(k, v as string));

                const condRes = await createCondition(cfd);
                if (condRes?.success && condRes?.data?.id) {
                    await connectOrganizationToCondition(orgId, condRes.data.id);
                    toast.success("Condition saved.");
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

    if (status === "loading" || isInitializing) {
        return (
            <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto py-8">
                <Skeleton className="h-[20px] w-full"/>
                <Skeleton className="h-[32px] w-full"/>
                <Skeleton className="mt-4 h-[80px] w-full"/>
                <Skeleton className="h-[80px] w-full"/>
                <Skeleton className="mt-4 h-[40px] w-full"/>
                <Skeleton className="h-[20px] w-full"/>
                <Skeleton className="h-[32px] w-full"/>
                <Skeleton className="mt-4 h-[80px] w-full"/>
                <Skeleton className="h-[80px] w-full"/>
                <Skeleton className="mt-4 h-[40px] w-full"/>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto py-8">
                <div>
                    <h1 className="text-2xl font-semibold">Welcome to Comend</h1>
                    <p className="text-sm text-muted-foreground">One simple form. We’ll use your answers to set up your
                        profile, organization, condition, and finances.</p>
                </div>
                <Separator/>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (e) => {
                        console.log(e);
                        toast.error("Please fix the highlighted errors.");
                    })} className="space-y-10">
                        {/* ORGANIZATION */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-semibold">Organization</h2>

                            <FormField
                                control={form.control}
                                name="isNewOrganization"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <ToggleGroup
                                                type="single"
                                                value={field.value ? "new" : "existing"}
                                                onValueChange={(v) => field.onChange(v === "new")}
                                                className="items-start self-start justify-start"
                                            >
                                                <ToggleGroupItem value="new" aria-label="Create a new organization"
                                                                 className={field.value ? "bg-gray-200" : ""}>
                                                    Create a new organization
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="existing"
                                                                 aria-label="Join an existing organization"
                                                                 className={!field.value ? "bg-gray-200" : ""}>
                                                    Join an existing organization
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {!isNewOrg ? (
                                <FormField
                                    control={form.control}
                                    name="org"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Organization name</FormLabel>
                                            <FormControl>
                                                <MultipleSelector
                                                    {...field}
                                                    maxSelected={1}
                                                    defaultOptions={organizations}
                                                    placeholder="Select your organization..."
                                                    emptyIndicator={<p
                                                        className="text-center text-sm text-muted-foreground">no results
                                                        found.</p>}
                                                    showHoverCard={false}
                                                />
                                            </FormControl>
                                            <FormDescription>Your request to join the organization will be
                                                sent.</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="orgName"
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
                                                <FormLabel>Organization Abbreviation (required)</FormLabel>
                                                <FormDescription>
                                                    Choose the URL for your custom profile site.
                                                    {form.watch("subdomain") && !form.formState.errors.subdomain && (
                                                        <div className="font-semibold">Your site will
                                                            be {form.watch("subdomain")?.toLowerCase()?.replace(/\s+/g, "-")}.comend.io</div>
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
                                                        defaultValue={field.value?.split("-")?.[0]}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue
                                                            placeholder="Select a year"/></SelectTrigger>
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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Therapeutics under development</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        defaultOptions={MODALITIES}
                                                        placeholder="Select modalities..."
                                                        hidePlaceholderWhenSelected
                                                        emptyIndicator={<p
                                                            className="text-center text-sm text-muted-foreground">no
                                                            results found.</p>}
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Therapeutics of interest</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        defaultOptions={MODALITIES}
                                                        placeholder="Select modalities..."
                                                        hidePlaceholderWhenSelected
                                                        emptyIndicator={<p
                                                            className="text-center text-sm text-muted-foreground">no
                                                            results found.</p>}
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
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
                                    <FormField
                                        control={form.control}
                                        name="orgImage"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Organization logo</FormLabel>
                                                <div {...orgDropzone.getRootProps({className: "border rounded-lg p-4 cursor-pointer"})}>
                                                    <input {...orgDropzone.getInputProps()} />
                                                    {selectedOrgFile ? (
                                                        <div className="flex items-center space-x-4">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={(selectedOrgFile as any).preview} alt="preview"
                                                                 className="h-16 w-16 rounded-md object-cover"/>
                                                            <span>Click to replace</span>
                                                        </div>
                                                    ) : (
                                                        <p>Drag & drop or click to upload</p>
                                                    )}
                                                </div>
                                                <FormDescription className="text-xs">PNG/JPG only (no
                                                    SVG).</FormDescription>
                                                {/*<FormControl>*/}
                                                {/*    <Input type="text" placeholder="Existing image path (optional)" {...field} />*/}
                                                {/*</FormControl>*/}
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </section>

                        {isNewOrg && (
                            <>
                                <Separator/>

                                {/* RESEARCH / CONDITION */}
                                <section className="space-y-6">
                                    <h2 className="text-xl font-semibold">Condition</h2>

                                    <FormField
                                        control={form.control}
                                        name="disorder"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Name of condition</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        creatable
                                                        maxSelected={1}
                                                        onSearch={handleConditionSearch}
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

                                    {/* <FormField
                                        control={form.control}
                                        name="associatedConditions"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Associated Conditions</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        creatable
                                                        maxSelected={5}
                                                        onSearch={handleConditionSearch}
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
                                    /> */}

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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Mechanisms of action</FormLabel>
                                                <FormDescription>What types of genetic effects are you investigating?
                                                    Select all that apply.</FormDescription>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        defaultOptions={MOLECULAR_MECHANISMS}
                                                        placeholder="Select categories..."
                                                        hidePlaceholderWhenSelected
                                                        emptyIndicator={<p
                                                            className="text-center text-sm text-muted-foreground">no
                                                            results found.</p>}
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Causal genes</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        onSearch={handleGeneSearch}
                                                        placeholder="Search for genes..."
                                                        triggerSearchOnFocus
                                                        hidePlaceholderWhenSelected
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
                                        control={form.control}
                                        name="genes"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Associated genes</FormLabel>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        onSearch={handleGeneSearch}
                                                        placeholder="Search for genes..."
                                                        triggerSearchOnFocus
                                                        hidePlaceholderWhenSelected
                                                        loadingIndicator={<p>Loading genes...</p>}
                                                        emptyIndicator={<p>No genes found.</p>}
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
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
                        )}
                        <div className="flex justify-between">
                            <div/>
                            <Button type="submit" disabled={loading}>
                                {loading ? <LoadingDots color="#808080"/> : "Complete sign-up"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </TooltipProvider>
    );
}
