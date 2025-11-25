"use client";

import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog";

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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Pencil} from "lucide-react";
import {useRouter} from "next/navigation";
import {editUser, updateResearcher} from "@comend/lib/actions";
import {ACADEMIC_ROLES, COUNTRIES, MILESTONE_TYPE_OPTIONS, MODALITIES, Option, optionSchema} from "@comend/lib/types";
import {useSession} from "next-auth/react";
import {badgeVariants} from "@comend/components/ui/badge";
import LoadingDots from "@comend/components/icons/loading-dots";
import {Textarea} from "@comend/components/ui/textarea";
import {TitleEnum} from "~researcher/lib/utils";
import type {Prisma} from "@prisma/client";
import {FormImageSelector} from "@comend/components/form-image-selector";
import {FileWithPreview} from "@comend/components/image-selector";
import {getPublicFile} from "@comend/lib/utils";
import {handleImageDelete, handleImageUpload} from "@comend/lib/upload";
import mixpanel from "mixpanel-browser";

export const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map(option => ({
    ...option,
    value: option.id,
}));

const formSchema = z.object({
    name: z.string().min(2),
    title: z.preprocess(
        (v) => (v === "" ? undefined : v),
        TitleEnum.optional()
    ),
    image: z.string().nullable().optional(),
    website: z.string().optional(),
    country: z.string(),
    description: z.string().min(50, {
        message: "Your profile's description must be at least 50 characters long.",
    }).max(500, {
        message: "Your profile's description must less than 500 characters long.",
    }).optional(),
    affiliations: z.array(optionSchema),
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
    therapeuticsOfInterest: z.array(optionSchema).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),
    genesOfInterest: z.array(optionSchema).optional(),
    conditionsOfInterest: z.array(optionSchema),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
});

type ResearcherWithRelations = Prisma.ResearcherGetPayload<{
    include: {
        user: true;
        affiliations: {
            include: {
                institution: true;
            };
        };
    };
}>;

export default function EditResearcherProfileDialog({researcher}: { researcher: ResearcherWithRelations }) {
    const {data: session} = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
    const [defaultValues, setDefaultValues] = useState<z.infer<typeof formSchema> | undefined>(undefined);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        async function fetchData() {
            if (researcher && researcher.user) {
                const fetchedValues: z.infer<typeof formSchema> = {
                    name: researcher.user?.name || "",
                    title: researcher.title as any,
                    country: researcher.country || "",
                    description: researcher.description || undefined,
                    website: researcher.website || undefined,
                    affiliations: researcher.affiliations?.map((a: any) => ({
                        label: a.institution?.name,
                        value: a.institution?.id,
                    })) || [],
                    orcid: researcher.orcid || "",
                    researchInterests:
                        (researcher.researchInterests || []).map((stored: string) => {
                            const option = MILESTONE_TYPE_OPTIONS_WITH_VALUE.find(
                                o => o.value === stored || o.label === stored
                            );

                            return {
                                label: option?.label ?? stored,
                                value: option?.value ?? stored,
                            };
                        }),
                    therapeuticsOfInterest:
                        (researcher.therapeuticsOfInterest || []).map((stored: string) => {
                            const option = MODALITIES.find(m => m.value === stored || m.label === stored);

                            return {
                                label: option?.label ?? stored,
                                value: option?.value ?? stored,
                            };
                        }),
                    conditionsOfInterest: researcher.conditionsOfInterest?.map((c: string) => ({
                        label: c,
                        value: c,
                    })) || [],
                    genesOfInterest: researcher.genesOfInterest?.map((g: string) => ({
                        label: g,
                        value: g,
                    })) || [],
                    notificationSettings: researcher.user?.notificationSettings ?? false,
                    consentSettings: researcher.user?.consentSettings ?? false,
                    image: researcher.user?.image || undefined,
                    otherTherapeuticsOfInterest: undefined,
                };

                setDefaultValues(fetchedValues);
                form.reset(fetchedValues);

                if (researcher.user.image) {
                    try {
                        const userPhoto: File = await getPublicFile(researcher.user.image);
                        if (userPhoto) {
                            const fileWithPreview = Object.assign(userPhoto, {
                                preview: URL.createObjectURL(userPhoto),
                            }) as FileWithPreview;
                            setSelectedFile(fileWithPreview);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [researcher?.id]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            // mixpanel consent handling
            try {
                if (values.consentSettings) {
                    mixpanel.opt_in_tracking();
                    if (session?.user?.id && session?.user?.email && !(mixpanel as any)._disabled) {
                        if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
                            mixpanel.identify(session.user.email);
                        } else {
                            mixpanel.identify(session.user.id);
                        }
                    } else {
                        console.warn("Tried to call identify while Mixpanel is disabled.");
                    }
                } else {
                    mixpanel.opt_out_tracking();
                }
            } catch (e) {
                console.error(`Failed to update mixpanel status`, e)
            }

            // handle image upload / delete on User (not Researcher)
            if (selectedFile && values.image && values.image !== defaultValues?.image) {
                const imgUrl = await handleImageUpload(selectedFile as File, values.image);
                values.image = imgUrl || undefined;
            }

            if (values.image !== defaultValues?.image && defaultValues?.image) {
                await handleImageDelete(defaultValues.image);
            }

            // update user model (name, notification/consent, image)
            const userPayload: {[key: string]: unknown} = {
                name: values.name,
                notificationSettings: values.notificationSettings,
                consentSettings: values.consentSettings,
            };

            if (values.image === null || values.image === undefined) {
                userPayload.image = null;
            } else {
                userPayload.image = values.image;
            }

            const userRes: any = await editUser(session?.user?.id as string, userPayload);
            if (userRes?.error) {
                toast.error(userRes.error);
                return;
            }

            // update researcher model
            const fd = new FormData();

            fd.append("title", values.title ?? "");
            fd.append("country", values.country ?? "");
            fd.append("description", values.description ?? "");
            fd.append("website", values.website ?? "");
            fd.append(
                "orcid",
                values.orcid?.trim() || ""
            );
            fd.append(
                "therapeuticsOfInterest",
                values.therapeuticsOfInterest?.map(t => t.value).join(",") ?? ""
            );
            fd.append(
                "genesOfInterest",
                values.genesOfInterest?.map(g => g.label).join(",") ?? ""
            );
            fd.append(
                "conditionsOfInterest",
                values.conditionsOfInterest?.map(c => c.label).join(",") ?? ""
            );
            fd.append(
                "researchInterests",
                values.researchInterests?.map(r => r.value).join(",") ?? ""
            );
            fd.append(
                "metadata",
                JSON.stringify({
                    otherTherapeuticsOfInterest: values.otherTherapeuticsOfInterest
                })
            );

            console.log(`update data`, fd)

            const res = await updateResearcher(session?.user?.id, fd);
            if (res?.error) {
                toast.error(res.error);
                return;
            }

            toast.success("User updated successfully");
            router.refresh();
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while updating your profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleInstitutionAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return [];

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
        if (!query) return [];

        setLoading(true);

        try {
            const response = await fetch(`/api/conditions?search=${query}`);
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Failed to fetch conditions:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleGeneAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return [];

        setLoading(true);

        try {
            const response = await fetch(`/api/genes?search=${query}`);
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Pencil className="mr-2 h-4 w-4"/>
                    Edit Profile
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Researcher</DialogTitle>
                    <DialogDescription>Update your researcher profile information below.</DialogDescription>
                </DialogHeader>

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
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormImageSelector
                            form={form}
                            name="image"
                            title="Your Profile Picture"
                            description="PNG/JPG only (no SVG)."
                            aspect={1}
                            img={defaultValues?.image || undefined}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            setIsCropping={setIsCropping}
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
                                            <SelectTrigger aria-label="Select title or role">
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
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Describe your research in a few sentences.</FormLabel>
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
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Country
                                    </FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            maxSelected={1}
                                            defaultOptions={COUNTRIES}
                                            placeholder="Search for countries..."
                                            hidePlaceholderWhenSelected={true}
                                            loadingIndicator={<p>Loading countries...</p>}
                                            emptyIndicator={<p>No countries found.</p>}
                                            showHoverCard={false}
                                            value={field.value ? [{label: field.value, value: field.value}] : []}
                                            onChange={(items) => {
                                                const selected = items?.[0]?.value ?? "";
                                                field.onChange(selected);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
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
                            name="orcid"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Your ORCID
                                    </FormLabel>
                                    <FormDescription>
                                        {`We'll use APIs to find your research metrics and publications.`}
                                    </FormDescription>
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
                                            defaultOptions={MILESTONE_TYPE_OPTIONS_WITH_VALUE}
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
                                                    "aria-label": "Therapeutics of Interest",
                                                    "data-testid": id,
                                                }}
                                                hidePlaceholderWhenSelected
                                                emptyIndicator={
                                                    <p className="text-center text-sm text-muted-foreground">
                                                        no results found.
                                                    </p>
                                                }
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                );
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
                                    <FormDescription>
                                        Select all that apply.
                                    </FormDescription>
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

                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="notificationSettings"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {`Allow us to contact you regarding platform changes and notifications.`}
                                            </FormLabel>
                                            <FormDescription>
                                                {`You can manage your notifications in your user settings page.`}
                                            </FormDescription>
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
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {`I consent for Comend to collect data to help improve the platform.`}
                                            </FormLabel>
                                            <FormDescription>
                                                {`You can change these settings in your user settings page.`}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isCropping || loading}>
                                {loading ? <LoadingDots color="#808080"/> : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
