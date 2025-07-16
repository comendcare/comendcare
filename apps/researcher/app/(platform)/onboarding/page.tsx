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
import {editUser, updateResearcher} from "@comend/lib/actions";
import {Checkbox} from "@comend/components/ui/checkbox";
import {AddressType, Option} from "@comend/lib/types";
import React, {useEffect, useState} from "react";
import {FileWithPreview} from "@comend/components/image-selector";
import {
    getResearcherFromUserId,
    getUser
} from "@comend/lib/fetchers";
import {handleImageUpload} from "@comend/lib/upload";
import LoadingDots from "@comend/components/icons/loading-dots";
import {getPublicFile} from "@comend/lib/utils";
import mixpanel from "mixpanel-browser";
import {Skeleton} from "@comend/components/ui/skeleton";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Select, SelectContent, SelectTrigger, SelectValue, SelectItem} from "@comend/components/ui/select"
import {MILESTONE_TYPE_OPTIONS} from "@comend/lib/types"
import {badgeVariants} from "@comend/components/ui/badge"

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map(option => ({
    ...option,
    value: option.id,
}));

const userFormSchema = z.object({
    name: z.string().min(2, {message: "Your name must be at least 2 characters."}),
    title: z.string().min(2, {message: "Your title must be at least 2 characters."}),
    affiliations: z.array(optionSchema).optional(),
    researchInterests: z.array(optionSchema).optional(),
    genesOfInterest: z.array(optionSchema).optional(),
    conditionsOfInterest: z.array(optionSchema).optional(),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
    image: z.string().optional(),
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
                let userData
                const response = await getResearcherFromUserId(session.user.id, {
                    id: true,
                    orcid: true,
                    email: true,
                    emailHash: true,
                    title: true,
                    name: true,
                    researchInterests: true,
                    conditionsOfInterest: true,
                    genesOfInterest: true,
                    affiliations: true,
                    createdAt: true,
                    updatedAt: true,
                    metadata: true
                });
                if (response.success) {
                    userData = response.data
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                if (userData) {
                    const fetchedValues = {
                        name: userData.name || "",
                        title: userData.name || "",
                        affiliations: userData.affiliations.map((affiliation: any) => ({
                            label: affiliation,
                            value: affiliation
                        })) || [],
                        researchInterests: userData.researchInterests.map((interests: any) => ({
                            label: interests,
                            value: interests
                        })) || [],
                        conditionsOfInterest: userData.conditionsOfInterest.map((condition: any) => ({
                            label: condition,
                            value: condition
                        })) || [],
                        genesOfInterest: userData.genesOfInterest.map((gene: any) => ({
                            label: gene,
                            value: gene
                        })) || [],
                        notificationSettings: userData.notificationSettings ?? true,
                        consentSettings: userData.consentSettings ?? true,
                        image: userData.image || "",
                    };

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

                    setDefaultValues(fetchedValues);
                    form.reset(fetchedValues); // Reset form with fetched data
                }
            }
            setIsInitializing(false)
        }

        async function fetchUserData() {
            if (session?.user?.id) {
                let userData
                const response = await getUser(session.user.id, {
                    id: true,
                    name: true,
                });
                if (response.success) {
                    userData = response.data
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                if (userData) {
                    const fetchedValues = {
                        name: userData.name || "",
                    };

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

                    form.setValue("name", fetchedValues.name);
                }
            }
            setIsInitializing(false)
        }

        fetchUserData();
        fetchResearcherData();
    }, [session, form]);

    async function onSubmit(values: z.infer<typeof userFormSchema>) {
        setLoading(true);

        try {
            // handle mixpanel opt-in/opt-out
            if (values.consentSettings) {
                console.log(`mixpanel opt-in`)
                if (session?.user?.id && session?.user?.email) {
                    // identify the user if we can, to ensure we have the proper distinct ID
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") mixpanel.identify(session.user.email) // development & preview use email as distinct id
                    else mixpanel.identify(session.user.id) // production uses userID from DB (fetched from session)
                }
                mixpanel.opt_in_tracking()
            } else if (!values.consentSettings) {
                console.log(`mixpanel opt-out`)
                mixpanel.opt_out_tracking()
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

            const { name, notificationSettings, consentSettings, ...researcherOnlyValues } = values;

            console.log(researcherOnlyValues)
            const res: any = await updateResearcher(session?.user?.id, researcherOnlyValues);
            if (res?.error) {
                toast.error(res.error);
                return;
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
            <div className="h-full w-full flex flex-col gap-2">
                <Skeleton className="h-[20px] w-full"/>
                <Skeleton className="h-[32px] w-full"/>
                <Skeleton className="mt-4 h-[80px] w-full"/>
                <Skeleton className="h-[80px] w-full"/>
                <Skeleton className="mt-4 h-[40px] w-full"/>
            </div>
        )
    }

    return (
        <div className="w-screen h-screen overflow-auto p-8 flex flex-col items-center">
            <div className="flex flex-col items-start space-y-4">
                <div
                    className="flex flex-col space-y-1.5 text-center sm:text-left"
                >
                    <div
                        className="text-lg font-semibold leading-none tracking-tight"
                    >
                        Welcome to Comend
                    </div>
                    <div
                        className="text-sm text-muted-foreground"
                    >
                        We have a few questions about you to get started.
                    </div>
                </div>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger
                                                aria-label="Select title or role"
                                            >
                                                <SelectValue placeholder="Role"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="researcher">Researcher</SelectItem>
                                            <SelectItem value="pm">Project Manager</SelectItem>
                                            <SelectItem value="pi">Principal Investigator</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                            placeholder="Select associated project types..."
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

                        <Button type="submit" disabled={loading}>
                            {loading ? <LoadingDots color="#808080"/> : "Next"}
                        </Button>
                    </form>
                </Form>

            </div>
        </div>
    )
}
