"use client";

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
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {editUser} from "@comend/lib/actions";
import {Checkbox} from "@comend/components/ui/checkbox";
import {AddressType, COUNTRIES, MODALITIES, Option} from "@comend/lib/types";
import React, {useEffect, useState} from "react";
import {FileWithPreview} from "@comend/components/image-selector";
import {
    getUser
} from "@comend/lib/fetchers";
import {handleImageUpload} from "@comend/lib/upload";
import LoadingDots from "@comend/components/icons/loading-dots";
import {getPublicFile, mapTitleToValue} from "@comend/lib/utils";
import mixpanel from "mixpanel-browser";
import {Skeleton} from "@comend/components/ui/skeleton";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Select, SelectContent, SelectTrigger, SelectValue, SelectItem} from "@comend/components/ui/select"
import {MILESTONE_TYPE_OPTIONS, ACADEMIC_ROLES} from "@comend/lib/types"
import {badgeVariants} from "@comend/components/ui/badge"
import {Textarea} from "@comend/components/ui/textarea";
import {Separator} from "@comend/components/ui/separator";
import {getResearcherFromUserId} from "~researcher/lib/fetchers";
import {updateResearcher} from "~researcher/lib/actions";
import { mixpanelTrack } from "@comend/lib/mixpanel";

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const userFormSchema = z.object({
    name: z.string().min(2, {message: "Your name must be at least 2 characters."}),
    title: z.string().optional(),
    website: z.string().optional(),
    country: z.string(),
    description: z.preprocess(
        (val) => {
            if (typeof val !== "string") return val;
            const trimmed = val.trim();
            // treat empty string as "not provided"
            return trimmed === "" ? undefined : trimmed;
        },
        z
            .string()
            .min(50, {
                message: "Your profile's description must be at least 50 characters long.",
            })
            .max(500, {
                message: "Your profile's description must less than 500 characters long.",
            })
            .optional()
    ),
    affiliations: z.array(optionSchema),
    groupName: z.preprocess(
        (val) => {
            if (typeof val !== "string") return val;
            const trimmed = val.trim();
            return trimmed === "" ? undefined : trimmed;
        },
        z.string().min(2).optional()
    ),
    orcid: z.preprocess(
        (val) => {
            if (typeof val !== "string") return val;
            const trimmed = val.trim();
            // treat empty string as "not provided"
            return trimmed === "" ? undefined : trimmed;
        },
        z
            .string()
            .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, {
                message:
                    "ORCID must be in the format 0000-0000-0000-0000, and end in a digit or 'X'",
            })
            .optional()
    ),
    researchInterests: z.array(optionSchema),
    conditionsOfInterest: z.array(optionSchema),
    therapeuticsOfInterest: z.array(optionSchema).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),
    genesOfInterest: z.array(optionSchema).optional(),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
    image: z.string().nullable().optional(),
});

export default function ResearcherOnboardingForm() {
    const router = useRouter();
    const {data: session} = useSession();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
    const [isInitializing, setIsInitializing] = useState(true)

    const [defaultValues, setDefaultValues] = useState<z.infer<typeof userFormSchema> | undefined>(undefined);

    const form = useForm<z.infer<typeof userFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(userFormSchema),
        defaultValues,
    });

    useEffect(() => {
        async function fetchResearcherData() {
            if (session?.user?.id) {
                let researcherData
                const researcherResponse = await getResearcherFromUserId(session.user.id, {
                    id: true,
                    orcid: true,
                    country: true,
                    description: true,
                    website: true,
                    title: true,
                    groupName: true,
                    researchInterests: true,
                    conditionsOfInterest: true,
                    genesOfInterest: true,
                    affiliations: {
                        select: {
                            institution: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            }
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                    metadata: true
                });
                if (researcherResponse.success) {
                    researcherData = researcherResponse.data
                } else {
                    console.error(researcherResponse.error)
                    toast.error(researcherResponse.error)
                }

                let userData
                const userResponse = await getUser(session.user.id, {
                    id: true,
                    name: true,
                    notificationSettings: true,
                    consentSettings: true,
                    image: true,
                });
                if (userResponse.success) {
                    userData = userResponse.data
                } else {
                    console.error(userResponse.error)
                    toast.error(userResponse.error)
                }

                if (userData) {
                    if (userData.image) {
                        try {
                            const userPhoto: File = await getPublicFile(userData.image)
                            if (userPhoto) {
                                const fileWithPreview = Object.assign(userPhoto, {
                                    preview: URL.createObjectURL(userPhoto),
                                })
                                setSelectedFile(fileWithPreview)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }

                if (researcherData && userData) {
                    const fetchedValues: z.infer<typeof userFormSchema> = {
                        name: userData.name || "",
                        title: mapTitleToValue(researcherData.title),
                        website: researcherData.website || "",
                        country: researcherData.country || "",
                        description: researcherData.description || "",
                        affiliations: researcherData.affiliations.map((affiliation: any) => ({
                            label: affiliation.institution.name,
                            value: affiliation.id
                        })) || [],
                        groupName: researcherData.groupName || undefined,
                        orcid: researcherData.orcid || "",
                        researchInterests:
                            (researcherData.researchInterests || []).map((stored: string) => {
                                const option = MILESTONE_TYPE_OPTIONS.find(
                                    o => o.value === stored || o.label === stored
                                );

                                return {
                                    label: option?.label ?? stored,
                                    value: option?.value ?? stored,
                                };
                            }),
                        therapeuticsOfInterest:
                            (researcherData.therapeuticsOfInterest || []).map((stored: string) => {
                                const option = MODALITIES.find(m => m.value === stored || m.label === stored);

                                return {
                                    label: option?.label ?? stored, // what user sees
                                    value: option?.value ?? stored, // what we store
                                };
                            }),
                        conditionsOfInterest: researcherData.conditionsOfInterest.map((condition: any) => ({
                            label: condition,
                            value: condition
                        })) || [],
                        genesOfInterest: researcherData.genesOfInterest.map((gene: any) => ({
                            label: gene,
                            value: gene
                        })) || [],
                        notificationSettings: userData.notificationSettings ?? true,
                        consentSettings: userData.consentSettings ?? true,
                    };

                    setDefaultValues(fetchedValues);
                    form.reset(fetchedValues); // Reset form with fetched data
                }
            }
            setIsInitializing(false)
        }

        fetchResearcherData();
    }, [session, form]);

    useEffect(() => {
        try {
            mixpanelTrack("Onboarding Started", {
                "User ID": session?.user?.id,
                "User Name": session?.user?.name,
            })
        } catch (e) {
            console.error("Error tracking mixpanel event:", e)
        }
    }, [])

    async function onSubmit(values: z.infer<typeof userFormSchema>) {
        setLoading(true);

        try {
            // handle mixpanel opt-in/opt-out
            try {
                if (values.consentSettings) {
                    console.log(`mixpanel opt-in`)
                    mixpanel.opt_in_tracking()

                    if (session?.user?.id && session?.user?.email && !(mixpanel as any)._disabled) {
                        // identify the user if we can, to ensure we have the proper distinct ID
                        if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") mixpanel.identify(session.user.email) // development & preview use email as distinct id
                        else mixpanel.identify(session.user.id) // production uses userID from DB (fetched from session)
                    } else {
                        console.warn("Tried to call identify while Mixpanel is disabled.");
                    }
                } else if (!values.consentSettings) {
                    console.log(`mixpanel opt-out`)
                    mixpanel.opt_out_tracking()
                }
            } catch (e) {
                console.error(`Failed to update mixpanel status`, e)
            }

            // handle image upload, only upload if the current image is not the same as the previous image
            if (selectedFile && values.image && values.image !== defaultValues?.image) {
                console.log(`selectedFile`, selectedFile)
                const imgUrl = await handleImageUpload(selectedFile as File, values.image)
                values.image = imgUrl || undefined
            }

            // Extract and update User fields
            const userFields = {
                name: values.name,
                notificationSettings: values.notificationSettings,
                consentSettings: values.consentSettings,
            };

            const userUpdateRes = await editUser(session?.user?.id as string, userFields);
            if (userUpdateRes?.error) {
                toast.error(userUpdateRes.error);
                return;
            }

            const {name, notificationSettings, consentSettings, ...researcherOnlyValues} = values;

            const fd = new FormData();

            fd.append("title", researcherOnlyValues.title ?? "");
            fd.append("country", researcherOnlyValues.country ?? "");
            fd.append("description", researcherOnlyValues.description ?? "");
            fd.append("website", researcherOnlyValues.website ?? "");
            fd.append("orcid", researcherOnlyValues.orcid ?? "");
            fd.append("groupName", researcherOnlyValues.groupName ?? "");

            fd.append(
                "affiliations",
                researcherOnlyValues.affiliations?.map(a => a.value).join(",") ?? ""
            );

            fd.append(
                "researchInterests",
                researcherOnlyValues.researchInterests?.map(r => r.value).join(",") ?? ""
            );

            fd.append(
                "conditionsOfInterest",
                researcherOnlyValues.conditionsOfInterest?.map(c => c.label).join(",") ?? ""
            );

            fd.append(
                "therapeuticsOfInterest",
                researcherOnlyValues.therapeuticsOfInterest?.map(t => t.value).join(",") ?? ""
            );

            fd.append(
                "genesOfInterest",
                researcherOnlyValues.genesOfInterest?.map(g => g.label).join(",") ?? ""
            );

            const res = await updateResearcher(session?.user?.id, fd);
            if (res?.error) {
                toast.error(res.error);
                return;
            }

            try {
                mixpanelTrack("Onboarding Completed", {
                    "User ID": session?.user?.id,
                    "User Name": session?.user?.name,
                    "Name": res.name,
                    "ID": res.id,
                })
            } catch (e) {
                console.error("Error tracking mixpanel event:", e)
            }

            toast.success("Successfully updated researcher profile!");
            router.push("/profile");
        } catch (error) {
            toast.error("An error occurred while updating your profile.");
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const handleInstitutionAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        setLoading(true);

        try {
            const response = await fetch(`/api/institutions?search=${query}`);
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Failed to fetch institutions:", error);
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

    if (isInitializing) {
        return (
            <div className="w-screen h-screen overflow-auto p-8 flex flex-col items-center">
                <div className="h-full w-full flex flex-col gap-2">
                    <Skeleton className="h-[20px] w-full"/>
                    <Skeleton className="h-[32px] w-full"/>
                    <Skeleton className="mt-4 h-[80px] w-full"/>
                    <Skeleton className="h-[80px] w-full"/>
                    <Skeleton className="mt-4 h-[40px] w-full"/>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto">
            <div
                className="flex flex-col space-y-1.5 text-center sm:text-left"
            >
                <div>
                    <h1 className="text-2xl font-semibold">
                        Welcome to Comend
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This should only take a few minutes. You can return to update this at any time.
                    </p>
                </div>
            </div>

            <Separator/>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(
                        onSubmit,
                        (errors) => {
                            console.log("Validation errors:", errors);
                            if (Object.keys(errors).length > 0) {
                                toast.error("Please correct the highlighted errors.");
                            }
                        }
                    )}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your Full Name (required)</FormLabel>
                                {/*<FormDescription>This is your public display name.</FormDescription>*/}
                                <FormControl>
                                    <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your role</FormLabel>
                                <FormDescription>Your primary title or role.</FormDescription>
                                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                    <FormControl>
                                        <SelectTrigger
                                            aria-label="Select title or role"
                                        >
                                            <SelectValue placeholder="Role"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {ACADEMIC_ROLES.map((role: any) => (
                                            <SelectItem key={role.id} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

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
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        maxSelected={1}
                                        defaultOptions={COUNTRIES}
                                        placeholder="Search for countries..."
                                        hidePlaceholderWhenSelected={true}
                                        loadingIndicator={<p>Loading countries...</p>}
                                        emptyIndicator={<p>No countries found.</p>}
                                        showHoverCard={false}
                                        value={
                                            field.value
                                                ? [{
                                                    // handle both existing stored code *or* name
                                                    label:
                                                        COUNTRIES.find(
                                                            c => c.value === field.value || c.label === field.value
                                                        )?.label ?? field.value,
                                                    value:
                                                        COUNTRIES.find(
                                                            c => c.value === field.value || c.label === field.value
                                                        )?.value ?? field.value,
                                                }]
                                                : []
                                        }
                                        onChange={(items) => {
                                            const selectedCode = items?.[0]?.value ?? "";
                                            field.onChange(selectedCode); // store code in form state
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="affiliations"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Affiliations</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        creatable={true}
                                        maxSelected={5}
                                        onSearch={handleInstitutionAsyncSearch}
                                        placeholder="Search for institutions..."
                                        hidePlaceholderWhenSelected={true}
                                        loadingIndicator={<p>Loading institutions...</p>}
                                        emptyIndicator={<p>No institutions found.</p>}
                                        showHoverCard={false}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="groupName"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Group name
                                </FormLabel>
                                <FormDescription>
                                    {`Name of your department, lab, or team.`}
                                </FormDescription>
                                <FormControl>
                                    <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="orcid"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your ORCID</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...field}
                                        onChange={(e) => {
                                            // Remove all non-digit characters, EXCEPT allow X at the end
                                            let raw = e.target.value.toUpperCase().replace(/[^0-9X]/g, "");

                                            // Limit to 16 characters (15 digits + optional trailing X)
                                            raw = raw.substring(0, 16);

                                            // Add dash every 4 characters
                                            const formatted = raw.match(/.{1,4}/g)?.join("-") || "";

                                            field.onChange(formatted);
                                        }}
                                        value={field.value}
                                        placeholder="0000-0000-0000-0000"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="researchInterests"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Research interests</FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            badgeClassName={badgeVariants({variant: "lightBlue"})}
                                            defaultOptions={MILESTONE_TYPE_OPTIONS}
                                            hidePlaceholderWhenSelected={true}
                                            placeholder="Select research interests..."
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
                                        <FormDescription>
                                            (Optional) Other details for internal improvement only.
                                        </FormDescription>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="conditionsOfInterest"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Conditions of interest</FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            creatable={true}
                                            maxSelected={5}
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
                            name="genesOfInterest"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Genes of interest</FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
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
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Description
                                </FormLabel>
                                <FormDescription>
                                    Tell people about you — your background, projects, interests or anything else you’d like to share
                                </FormDescription>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="notificationSettings"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Allow platform updates & notifications</FormLabel>
                                        <FormDescription>You can change this later in
                                            settings.</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="consentSettings"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>I consent to data collection to improve Comend</FormLabel>
                                        <FormDescription>Analytics preferences can be updated
                                            anytime.</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? <LoadingDots color="#808080"/> : "Save"}
                    </Button>
                </form>
            </Form>

        </div>
    )
}
