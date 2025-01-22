"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {connectOrganizationToCondition, createCondition, updateOrganization} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {Slider} from "@/components/ui/slider";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Separator} from "@/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {FaQuestionCircle} from "react-icons/fa";
import {CalendarDays, Timer} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {cn, nameToInitials} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FaBuildingNgo, FaCalendar, FaUserPlus, FaUsersViewfinder} from "react-icons/fa6";
import {Badge} from "@/components/ui/badge";
import React, {useEffect, useState} from "react";
import {faker} from "@faker-js/faker";
import LoadingDots from "@/components/icons/loading-dots";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {Organization} from "@prisma/client";
import {concat} from "lodash";
import { ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS } from "@/lib/types";

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

export const researchFormSchema = z.object({
    disorder: z.string()
        .min(2, {
            message: "The name of your condition needs to be longer than 2 characters",
        })
        .max(60, {
            message: "The name of your condition needs to be shorter than 60 characters",
        })
        .optional(),
    summary: z.string()
        .min(30, {
            message: "The summary of your condition needs to be longer than 30 characters",
        })
        .max(500, {
            message: "The name of your condition needs to be shorter than 500 characters",
        })
        .optional(),
    modalities: z.array(optionSchema).min(0).optional(),
    categories: z.array(optionSchema).optional(),
    prevalenceNumerator: z.string().min(1, {
        message: "Your organization's prevalence.",
    }).optional(),
    prevalenceDenominator: z.number().min(1, {
        message: "Your organization's prevalence.",
    }).optional(),
    population: z.string().min(1, {
        message: "Your organization's description.",
    }).optional(),
    // mechanisms: z.array(optionSchema).min(0),
    mechanisms: z.array(z.string()).optional(),
    genes: z.array(optionSchema).optional(),
    biomarkers: z.array(optionSchema).optional(),
    systems: z.array(optionSchema).optional(),
    symptoms: z.array(optionSchema).optional(),
    studies: z.array(optionSchema).optional(),
    assets: z.array(optionSchema).optional(),
})

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
        defaultValues: {
            prevalenceDenominator: 1000000
        }
    })

    async function onSubmit(values: z.infer<typeof researchFormSchema>) {
        setLoading(true)

        try {

            // Create FormData object
            const formData = new FormData();

            // Map form values into FormData
            const data = {
                interestedModalities: values.modalities?.map((modality) => modality.label).join(",") || "",
                name: values.disorder || "",
                summary: values.summary || "",
                diseaseCategories: values.categories?.map((category) => category.label).join(",") || "",
                prevalenceNumerator: values.prevalenceNumerator ? values.prevalenceNumerator.toString() : "",
                prevalenceDenominator: values.prevalenceDenominator ? values.prevalenceDenominator.toString() : "",
                numberOfIdentifiedPatients: values.population ? values.population.toString() : "",
                relevantDiseaseMechanisms: values.mechanisms?.join(",") || "",
                associatedGenes: values.genes?.map((gene) => gene.label).join(",") || "",
                associatedSystems: values.systems?.map((symptom) => symptom.label).join(",") || "",
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

    const handleAsyncSearch = async (query: string): Promise<Option[]> => {
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

    useEffect(() => {
        const fetchOrganization = async () => {
            if (status === "loading") {
                // Wait until status is no longer "loading"
                return;
            }

            if (session?.user?.organizationId && status === "authenticated") {
                try {
                    console.log('Fetching organization data...');
                    const response = await getOrganizationFromOrganizationId(session?.user.organizationId);
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
                                        <FormLabel>{`Name of condition`}</FormLabel>
                                        <div className="w-full flex flex-row justify-between">
                                            <FormDescription>
                                                {`The name of your rare condition/disorder.`}
                                            </FormDescription>
                                            <FormDescription>
                                                60 characters max.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                id="disorder"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="summary"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Summary of condition`}</FormLabel>
                                        <div className="w-full flex flex-row justify-between">
                                            <FormDescription>
                                                {`A few lines describing your condition and what makes it unique`}
                                            </FormDescription>
                                            <FormDescription>
                                                500 characters max.
                                            </FormDescription>
                                        </div>
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
                                control={form.control}
                                name="genes"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Associated genes</FormLabel>
                                        <FormDescription>{`The genes associated with your condition.`}</FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                onSearch={handleAsyncSearch}
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
                                control={form.control}
                                name="systems"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Associated systems</FormLabel>
                                        <FormDescription>{`The systems affected by your condition.`}</FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={ASSOCIATED_SYSTEMS}
                                                placeholder="Select the associated systems of your condition..."
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

                            <FormField
                                control={form.control}
                                name="categories"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Mechanisms of action
                                        </FormLabel>
                                        <FormDescription className="flex items-center">
                                            {`What type of condition is ${'disoder name'}`}
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger>
                                                    <FaQuestionCircle
                                                        className="text-black h-4 inline-block align-baseline mx-1"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {`This will help us match you with the experts of your particular modality.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
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

                            <FormField
                                control={form.control}
                                name="modalities"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Modalities of interest
                                        </FormLabel>
                                        <FormDescription className="flex items-center">
                                            {`The treatment modalities of interest of your organization.`}
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger>
                                                    <FaQuestionCircle
                                                        className="text-black h-4 inline-block align-baseline mx-1"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {`This will help us match you with the experts of your particular modality.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                placeholder="Select modalities you like..."
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

                            {/*<FormField*/}
                            {/*    control={form.control}*/}
                            {/*    name="mechanisms"*/}
                            {/*    render={({field}) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>Relevant disease mechanisms</FormLabel>*/}
                            {/*            <FormDescription>{`The relevant mechanisms of your condition.`}</FormDescription>*/}
                            {/*            <FormControl>*/}
                            {/*                <ToggleGroup*/}
                            {/*                    type="multiple"*/}
                            {/*                    variant="outline"*/}
                            {/*                    value={field.value}*/}
                            {/*                    onValueChange={*/}
                            {/*                        field.onChange*/}
                            {/*                    }*/}
                            {/*                    className="w-fit flex flex-wrap gap-2 justify-start"*/}
                            {/*                >*/}
                            {/*                    {mechanisms.map(type => (*/}
                            {/*                        <ToggleGroupItem*/}
                            {/*                            key={type.id}*/}
                            {/*                            value={type.id}*/}
                            {/*                        >*/}
                            {/*                            {type.name}*/}
                            {/*                        </ToggleGroupItem>*/}
                            {/*                    ))}*/}
                            {/*                </ToggleGroup>*/}
                            {/*            </FormControl>*/}
                            {/*            <FormMessage/>*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}

                            <FormField
                                control={form.control}
                                name="prevalenceNumerator"
                                render={({field: numeratorField}) => (
                                    <FormItem>
                                        <FormLabel>{`Estimated total prevalence`}</FormLabel>
                                        <FormDescription>
                                            {`The estimated total number of patients in the world.`}
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
                                                    control={form.control}
                                                    name="prevalenceDenominator"
                                                    render={({field: denominatorField}) => (
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                id="prevalenceDenominator"
                                                                {...denominatorField}
                                                                value={1000000}
                                                                className="w-32"
                                                                min={0}
                                                                disabled
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
                                control={form.control}
                                name="population"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Number of patients identified`}</FormLabel>
                                        <FormDescription>{`The number of known patients (not the estimated total). The people in this count should be reachable by your organization.`}</FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                id="population"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row space-x-2">
                                    <Button onClick={() => router.push(previousLink)}>
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

                <div className="sticky top-8 col-span-1 space-y-4 border-2 rounded-lg h-[calc(100vh-250px)] overflow-y-auto">
                    <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-8">
                        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-gray-900 mb-4">
                            Organization profile preview
                        </h1>

                        <div
                            className="h-10 w-full bg-white text-gray-800 text-left px-4 flex items-center border border-gray-300 rounded-md shadow-sm">
                            {organization?.subdomain && `${organization?.subdomain}.comend.io`}
                        </div>

                        <div className="w-full flex flex-col space-y-8 my-8">
                            <div>
                                <div>
                                    <img className="object-cover h-24 w-full lg:h-36"
                                         src={'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                                         alt=""/>
                                </div>

                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                                        <div className="flex">
                                            {organization?.image ?
                                                <img
                                                    className="object-cover h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18"
                                                    src={organization?.image}
                                                    alt=""/>
                                                :
                                                <p
                                                    className={"flex items-center justify-center bg-muted h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18 text-2xl"}
                                                >
                                                    {nameToInitials(organization?.name)}
                                                </p>
                                            }
                                        </div>

                                        <div
                                            className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                                        >
                                            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block space-y-1">
                                                <h1 className="mt-6 min-w-0 flex-1 truncate text-xl font-bold text-gray-900">
                                                    {organization?.name || <Skeleton className="h-4 w-full"/>}
                                                </h1>
                                                <div className="flex flex-row space-x-2">
                                                    {organization?.yearFounded ?
                                                        <div
                                                            className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-xs">
                                                            <div className="mt-1 flex items-center text-gray-500">
                                                                <FaCalendar
                                                                    className="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                                                                    aria-hidden="true"/>
                                                                Founded in {organization?.yearFounded.split("-")[0]}
                                                            </div>
                                                        </div> :
                                                        <Skeleton className="h-2 w-1/4"/>
                                                    }
                                                    {organization?.incorporationStatus === "YES" &&
                                                        <div
                                                            className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-xs">
                                                            <div className="mt-1 flex items-center text-gray-500">
                                                                <FaBuildingNgo
                                                                    className="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"
                                                                    aria-hidden="true"/>
                                                                {"501c3"}
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                        <h1 className="truncate text-2xl font-bold text-gray-900">
                                            {organization?.name}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-2">
                                <div className="col-span-2 space-y-2">
                                    <Card>
                                        <CardHeader
                                            className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                                About
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex-shrink-0 space-y-4">
                                                    <div className="flex-grow space-y-4">
                                                        <div className="space-y-2">
                                                            {organization?.description ?
                                                                <p className="text-xs line-clamp-6">
                                                                    {organization?.description}
                                                                </p> : <Skeleton className="h-4 w-full"/>
                                                            }
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className={cn("scroll-m-20 text-md tracking-tight font-semibold")}>
                                                                Website
                                                            </h3>
                                                            {organization?.website ?
                                                                <p className="text-xs truncate">
                                                                    {organization?.website}
                                                                </p> : <Skeleton className="h-4 w-full"/>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader
                                            className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                                Condition
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex-shrink-0 space-y-4">
                                                    <div className="flex-grow space-y-4">
                                                        <div className="space-y-2">
                                                            {form.watch("summary") ?
                                                                <p className="text-xs line-clamp-6">
                                                                    {form.watch("summary")}
                                                                </p> : <Skeleton className="h-4 w-full"/>
                                                            }
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div
                                                                className="flex flex-row items-center justify-between w-full">
                                                                <h4 className="scroll-m-20 text-base font-semibold">
                                                                    Statistics
                                                                </h4>
                                                            </div>
                                                            {(form.watch("prevalenceNumerator") && form.watch("prevalenceDenominator") && form.watch("population")) ? (
                                                                <ul className="flex flex-col list-disc list-inside">
                                                                    {form.watch("prevalenceNumerator") && form.watch("prevalenceDenominator") && (
                                                                        <li>
                                                                            {`${form.watch("prevalenceNumerator")} in ${form.watch("prevalenceDenominator")} prevalence`}
                                                                        </li>
                                                                    )}
                                                                    {form.watch("population") && (
                                                                        <li>
                                                                            {`${form.watch("population")} patients identified`}
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-gray-400 text-xs">
                                                                    {`No data available.`}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div
                                                                className="flex flex-row items-center justify-between w-full">
                                                                <h4 className="scroll-m-20 text-base font-semibold">
                                                                    Relevant topics
                                                                </h4>
                                                            </div>
                                                            <div
                                                                className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-1">
                                                                {(() => {
                                                                    // Combine and flatten all selected options from the form
                                                                    const combinedItems = [
                                                                        ...(form.watch("categories") || []).map((item) => item.label),
                                                                        ...(form.watch("modalities") || []).map((item) => item.label),
                                                                        ...(form.watch("systems") || []).map((item) => item.label),
                                                                        ...(form.watch("genes") || []).map((item) => item.label),
                                                                    ];

                                                                    // Filter out any empty or invalid entries
                                                                    const filteredItems = combinedItems.filter((item) => item && item.trim() !== "");

                                                                    // Handle the case where no topics are available
                                                                    if (filteredItems.length === 0) {
                                                                        return (
                                                                            <p className="text-gray-400 text-xs">
                                                                                {`No relevant topics.`}
                                                                            </p>
                                                                        );
                                                                    }

                                                                    // Map and display filtered items as badges
                                                                    return filteredItems.map((item, index) => (
                                                                        <Badge key={index} className="flex text-xs">
                                                                            {item.charAt(0).toUpperCase() + item.slice(1)}
                                                                        </Badge>
                                                                    ));
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="col-span-4 flex flex-col space-y-2">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                            <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                                Milestones
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-x-2">
                                            <div className="flex flex-col gap-y-2">
                                                <Skeleton className="h-4 w-full"/>
                                                <Skeleton className="h-4 w-1/2"/>
                                            </div>
                                            <div className="flex flex-col gap-y-2">
                                                <Skeleton className="h-4 w-full"/>
                                                <Skeleton className="h-4 w-1/2"/>
                                                <Skeleton className="h-4 w-1/2"/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="w-full flex flex-row items-center justify-between space-y-0">
                                            <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                            Research Plan
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Skeleton className="h-4 w-full"/>
                                            <Skeleton className="h-4 w-[200px]"/>
                                            <Skeleton className="h-4 w-[200px]"/>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
