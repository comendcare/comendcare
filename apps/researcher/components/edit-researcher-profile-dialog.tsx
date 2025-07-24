"use client";

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
import {Ellipsis, Pencil} from "lucide-react";
import {useRouter} from "next/navigation";
import {editUser, updateResearcher} from "@comend/lib/actions";
import {Option, optionSchema} from "@comend/lib/types";
import {
    getUser,
    getResearcherFromUserId,
} from "@comend/lib/fetchers";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {Skeleton} from "@/packages/components/ui/skeleton";
import {badgeVariants} from "@/packages/components/ui/badge";
import {MILESTONE_TYPE_OPTIONS_WITH_VALUE} from "@/apps/web/components/cro-filters";
import LoadingDots from "@/packages/components/icons/loading-dots";

const formSchema = z.object({
    name: z.string().min(2),
    title: z.string().min(2),
    affiliations: z.array(optionSchema).optional(),
    researchInterests: z.array(optionSchema).optional(),
    genesOfInterest: z.array(optionSchema).optional(),
    conditionsOfInterest: z.array(optionSchema).optional(),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
});

export default function EditResearcherProfileDialog() {
    const {data: session} = useSession()
    const router = useRouter();
    const [initialData, setInitialData] = useState<z.infer<typeof formSchema>>();
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });

    useEffect(() => {
        async function fetchData() {
            const userRes = await getUser(session?.user.id, {
                id: true,
                name: true,
                notificationSettings: true,
                consentSettings: true,
            });
            const researcherRes = await getResearcherFromUserId(session?.user.id, {
                title: true,
                affiliations: {select: {institution: true}},
                researchInterests: true,
                conditionsOfInterest: true,
                genesOfInterest: true,
            });

            if (userRes.success && researcherRes.success) {
                const user = userRes.data;
                const researcher = researcherRes.data;
                form.reset({
                    name: user.name || "",
                    title: researcher.title || "",
                    affiliations: researcher.affiliations?.map((a: any) => ({
                        label: a.institution.name,
                        value: a.institution.id,
                    })) || [],
                    researchInterests: researcher.researchInterests?.map((r: string) => ({
                        label: r,
                        value: r,
                    })) || [],
                    conditionsOfInterest: researcher.conditionsOfInterest?.map((c: string) => ({
                        label: c,
                        value: c,
                    })) || [],
                    genesOfInterest: researcher.genesOfInterest?.map((g: string) => ({
                        label: g,
                        value: g,
                    })) || [],
                    notificationSettings: user.notificationSettings ?? false,
                    consentSettings: user.consentSettings ?? false,
                });
            }
        }

        fetchData();
    }, [session?.user.id, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const userUpdate = await editUser(session?.user.id, {
            name: values.name,
            notificationSettings: values.notificationSettings,
            consentSettings: values.consentSettings,
        });

        if (userUpdate?.error) {
            toast.error(userUpdate.error);
            return;
        }

        const {name, notificationSettings, consentSettings, ...researcherValues} = values;
        const res = await updateResearcher(session?.user.id, researcherValues);
        if (res?.error) {
            toast.error(res.error);
            return;
        }

        toast.success("User updated successfully");
        router.refresh();
    };

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
                    <DialogDescription>Update user profile information below.</DialogDescription>
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
            </DialogContent>
        </Dialog>
    );
}
