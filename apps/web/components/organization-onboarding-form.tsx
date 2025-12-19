"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createMemberRequest, createOrganization, updateOrganization} from "@comend/lib/actions";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@comend/components/ui/radio-group";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import React, {useEffect, useState} from "react";
import {useOnboardingStore} from "@/state/onboarding/onboardingStore";
import {editOrgFormSchema, MODALITIES, Option, optionSchema} from "@comend/lib/types";
import {useDebounce} from "use-debounce";
import {ToggleGroup, ToggleGroupItem} from "@comend/components/ui/toggle-group";
import {years} from "@comend/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import {
    checkSubdomainAvailability,
    getAllNonMemberOrganizations,
} from "@comend/lib/fetchers";
import LoadingDots from "@comend/components/icons/loading-dots";
import {TooltipProvider} from "@comend/components/ui/tooltip";

const joinOrgFormSchema = z.object({
    org: z.array(optionSchema).min(0).optional(),
})

export default function OrganizationOnboardingForm({
    organizationData,
    previousLink,
    nextLink,
    showSkip,
} : {
    organizationData?: any,
    previousLink: string,
    nextLink: string,
    showSkip: boolean,
}) {
    const router = useRouter()
    const [organizations, setOrganizations] = useState<Option[]>([])
    const {isNewOrganization, toggleIsNewOrganization} = useOnboardingStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                await getAllNonMemberOrganizations({
                    id: true,
                    name: true,
                    description: true
                }).then((response) => {
                    if (response.success && response.data) {
                        const options: Option[] = response.data.map((org, index) => ({
                            value: org.id || index.toString(),
                            label: org.name || "",
                            description: org.description || "",
                        }))

                        setOrganizations(options)
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                })
            } catch (error) {
                console.error("Error fetching organizations:", error);
                toast.error("Couldn't get organizations");
            }
        };

        fetchOrganizations();
    }, [])

    const joinOrgForm = useForm<z.infer<typeof joinOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(joinOrgFormSchema),
    })

    const newOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: {
            description: organizationData.description || "",
            name: organizationData.name || "",
            yearFounded: organizationData.yearFounded || "",
            contactEmail: organizationData.contactEmail || "",
            subdomain: organizationData.subdomain || "",
            incorporationStatus: organizationData.incorporationStatus || undefined,
            website: organizationData.website || "",
            therapeuticsInDevelopment: organizationData.therapeuticsInDevelopment?.map((therapeutic: any) => ({
                label: therapeutic,
                value: therapeutic
            })),
            otherTherapeuticsInDevelopment: typeof organizationData?.metadata == 'object' ? (organizationData?.metadata as {
                [key: string]: any
            })?.otherTherapeuticsInDevelopment : undefined,
            therapeuticsOfInterest: organizationData.therapeuticsOfInterest?.map((modality: any) => ({
                label: modality,
                value: modality
            })),
            otherTherapeuticsOfInterest: typeof organizationData?.metadata == 'object' ? (organizationData?.metadata as {
                [key: string]: any
            })?.otherTherapeuticsOfInterest : undefined,
        }
    })

    const [debouncedNickname] = useDebounce(newOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    useEffect(() => {
        // Trigger validation whenever the debounced nickname changes
        const currentSubdomain = organizationData?.subdomain; // The current subdomain of the organization

        if (debouncedNickname === currentSubdomain) {
            // Clear errors since it's the same subdomain as before
            newOrgForm.clearErrors("subdomain");
            return;
        }

        if (debouncedNickname) {
            checkSubdomainAvailability(debouncedNickname).then((isAvailable) => {
                // if the subdomain is taken by an org that is not the current org
                if (!isAvailable && debouncedNickname !== currentSubdomain) {
                    newOrgForm.setError("subdomain", {
                        type: "manual",
                        message: "This nickname is already taken. Please choose another.",
                    });
                    console.log("Not available")
                } else {
                    newOrgForm.clearErrors("subdomain");
                    console.log("Available")
                }
            });
        }
    }, [debouncedNickname, checkSubdomainAvailability, newOrgForm])

    async function joinOrgOnSubmit() {
        setLoading(true)
        try {
            const orgValue = joinOrgForm.watch("org")?.[0]?.value;
            if (typeof orgValue === "string") {
                const response = await createMemberRequest(orgValue);

                if (response.success) {
                    toast.success(`A membership request has been sent to ${joinOrgForm.watch("org")?.[0]?.label}`)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                router.push("/app/profile")
            } else {
                console.error("Organization value is undefined or invalid.");
                toast.error("Organization value is undefined or invalid.")
            }
        } catch (error) {
            toast.error("An error occurred while sending a member request.");
        } finally {
            setLoading(false);
        }
    }

    async function newOrgOnSubmit(values: z.infer<typeof editOrgFormSchema>) {
        setLoading(true)
        try {
            const formData = new FormData()

            Object.entries(values).forEach(([key, value]) => {
                if (key === "therapeuticsInDevelopment") return
                if (key === "otherTherapeuticsInDevelopment") return
                if (key === "therapeuticsOfInterest") return
                if (key === "otherTherapeuticsOfInterest") return

                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            const data = {
                therapeuticsInDevelopment: values.therapeuticsInDevelopment?.map((therapeutic) => therapeutic.label).join(",") || "",
                therapeuticsOfInterest: values.therapeuticsOfInterest?.map((therapeutic) => therapeutic.label).join(",") || "",
                metadata: JSON.stringify({
                    otherTherapeuticsInDevelopment: values.otherTherapeuticsInDevelopment,
                    otherTherapeuticsOfInterest: values.otherTherapeuticsOfInterest
                })
            }
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            if (organizationData?.id) {
                // organization already exists, just update data, don't create a new org
                updateOrganization(organizationData.id, formData).then((res: any) => {
                    if (res.error) {
                        toast.error(res.error)
                    } else {
                        va.track("Updated Organization")
                        // Update the session object with the newly created organizationId
                        router.refresh()
                        router.push(nextLink)
                        toast.success(`Successfully updated organization!`)
                    }
                })

            } else {
                createOrganization(formData).then((res: any) => {
                    if (res.error) {
                        toast.error(res.error)
                    } else {
                        va.track("Created Organization")
                        // Update the session object with the newly created organizationId
                        router.refresh()
                        router.push(nextLink)
                        toast.success(`Successfully created organization!`)
                    }
                })
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while creating your organization.");
        }
    }

    return (
        <TooltipProvider>
            <div className="relative grid grid-cols-2 gap-x-8">
                <div className="space-y-4 col-span-1">

                    <ToggleGroup
                        type="single"
                        value={isNewOrganization ? "new" : "existing"}
                        onValueChange={(value) => {
                            if (value === "new") {
                                toggleIsNewOrganization();
                            } else {
                                toggleIsNewOrganization();
                            }
                        }}
                        className="flex justify-start space-x-2"
                    >
                        <ToggleGroupItem
                            value="new"
                            aria-label="Create a new organization"
                            className={isNewOrganization ? "bg-gray-200" : ""}
                        >
                            Create a new organization
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="existing"
                            aria-label="Join an existing organization"
                            className={isNewOrganization ? "" : "bg-gray-200"}
                        >
                            Join an existing organization
                        </ToggleGroupItem>
                    </ToggleGroup>

                    {/* Conditionally render newOrgForm based on the toggle state */}
                    {isNewOrganization ? (
                        // Form to create a new organization
                        <Form {...newOrgForm}>
                            <form onSubmit={newOrgForm.handleSubmit(newOrgOnSubmit)} className="space-y-8">

                                <FormField
                                    control={newOrgForm.control}
                                    name="name"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Organization Name (required)`}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    id="name"
                                                    autoComplete="name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={newOrgForm.control}
                                    name="subdomain"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Custom Comend URL (required)`}</FormLabel>
                                            <FormDescription>
                                                {`This will create your organization's unique Comend profile link (e.g., yourname.comend.io). Use a short name or abbreviation. This is not your external website.`}
                                                <br/>
                                                {newOrgForm.watch("subdomain") &&
                                                    !newOrgForm.formState.errors.subdomain && (
                                                        <>
                                                            {`Your profile URL will be: ${newOrgForm
                                                                .watch("subdomain")
                                                                .toLowerCase()
                                                                .replace(/\s+/g, "-")}.comend.io`}
                                                        </>
                                                    )}
                                            </FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    id="name"
                                                    autoComplete="name"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
                                                        field.onChange(value); // Update the form state with processed value
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={newOrgForm.control}
                                    name="website"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Website`}</FormLabel>
                                            <FormDescription>{`Your patient group's website URL (with the URL extension like http or https).`}</FormDescription>
                                            <FormControl>
                                                <Input
                                                    id="website"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={newOrgForm.control}
                                    name="contactEmail"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Contact Email</FormLabel>
                                            <FormDescription>
                                                The main email contact for your organization.
                                            </FormDescription>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    id="contactEmail"
                                                    placeholder="name@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={newOrgForm.control}
                                    name="title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <FormDescription>Your role or title at your patient
                                                organization.</FormDescription>
                                            <FormControl>
                                                <Input type="text" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                /> */}

                                <FormField
                                    control={newOrgForm.control}
                                    name="yearFounded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year Founded</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    console.log("Year selected:", value);
                                                    field.onChange(`${value}-01-01`);
                                                }}
                                                defaultValue={field.value?.split("-")[0]}
                                                value={field.value?.split("-")[0]}
                                            >
                                                <FormControl>
                                                    <SelectTrigger data-testid="founded-select-trigger">
                                                        <SelectValue placeholder="Select a year" />
                                                    </SelectTrigger>
                                                </FormControl>

                                                {/* Radix renders this in a portal */}
                                                <SelectContent data-testid="founded-select-content">
                                                    {years.map((year) => (
                                                        <SelectItem
                                                            key={year}
                                                            value={year.toString()}
                                                            data-testid={`founded-option-${year}`}
                                                        >
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={newOrgForm.control}
                                    name="therapeuticsInDevelopment"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>
                                                Therapeutics under development
                                            </FormLabel>
                                            <FormDescription className="flex items-center">
                                                {`What types of treatments is your organization currently developing? Select all that apply.`}
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

                                {newOrgForm.watch("therapeuticsInDevelopment")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                    <FormField
                                        control={newOrgForm.control}
                                        name="otherTherapeuticsInDevelopment"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormDescription className="flex items-center">
                                                    {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        id="modalities-other"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={newOrgForm.control}
                                    name="therapeuticsOfInterest"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>
                                                Therapeutics of interest
                                            </FormLabel>
                                            <FormDescription className="flex items-center">
                                                {`Select all treatment modalities your organization is interested in. This helps us match you with experts in those specific areas.`}
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

                                {newOrgForm.watch("therapeuticsOfInterest")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                    <FormField
                                        control={newOrgForm.control}
                                        name="otherTherapeuticsOfInterest"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormDescription className="flex items-center">
                                                    {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        id="modalities-other"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={newOrgForm.control}
                                    name="incorporationStatus"
                                    render={({field}) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>{`What is your 501(c)(3) status?`}</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="YES"/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {`Yes, I have a 501(c)(3)`}
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="INPROGRESS"/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {`No, but I'm working on it`}
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="NO"/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {`No, I don't have a 501(c)(3)`}
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-row space-x-2">
                                        {previousLink &&
                                            <Button onClick={() => router.push(previousLink)}>
                                                Previous
                                            </Button>
                                        }
                                        <Button type="submit" disabled={loading}>
                                            {loading ? <LoadingDots color="#808080"/> : "Next"}
                                        </Button>
                                    </div>
                                    {showSkip &&
                                        <Button variant="ghost"
                                                onClick={() => router.push("/app/marketplace/service-providers")}>
                                            Skip for now
                                        </Button>
                                    }
                                </div>
                            </form>
                        </Form>
                    ) : (
                        // Form to join an existing organization
                        <div>
                            <Form {...joinOrgForm}>
                                <form onSubmit={joinOrgForm.handleSubmit(joinOrgOnSubmit)} className="space-y-8">
                                    <FormField
                                        control={joinOrgForm.control}
                                        name="org"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Organization Name
                                                </FormLabel>
                                                <FormControl>
                                                    <>
                                                        {organizations.length > 0 ? (
                                                            <MultipleSelector
                                                                {...field}
                                                                maxSelected={1}
                                                                defaultOptions={organizations}
                                                                placeholder="Select your organization..."
                                                                emptyIndicator={
                                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                        no results found.
                                                                    </p>
                                                                }
                                                            />
                                                        ) : (
                                                            <p>Loading organizations...</p>
                                                        )}
                                                    </>
                                                </FormControl>
                                                <FormDescription>
                                                    Your request to join the organization will be sent.
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-row justify-between">
                                        <Button
                                            type="submit"
                                            disabled={loading || !joinOrgForm.formState.isDirty || !joinOrgForm.formState.isDirty}
                                        >
                                            {loading ? <LoadingDots color="#808080"/> : "Join Organization"}
                                        </Button>
                                        {showSkip &&
                                            <Button variant="ghost"
                                                    onClick={() => router.push("/app/marketplace/service-providers")}>
                                                Skip for now
                                            </Button>
                                        }
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}
