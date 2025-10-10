"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createMemberRequest, createOrganization} from "@comend/lib/actions";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {usePathname, useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@comend/components/ui/radio-group";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import React, {useCallback, useEffect, useState} from "react";
import {useOnboardingStore} from "@/state/onboarding/onboardingStore";
import {AddressType, MODALITIES, Option, optionSchema} from "@comend/lib/types";
import {useDebounce} from "use-debounce";
import {ToggleGroup, ToggleGroupItem} from "@comend/components/ui/toggle-group";
import {Bold, Info, Italic} from "lucide-react";
import {FileWithPreview} from "@comend/components/image-selector";
import {FileWithPath, useDropzone} from "react-dropzone";
import {acceptedFiletypes, getPublicFile, nameToInitials, years} from "@comend/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import {
    checkSubdomainAvailability,
    getAllNonMemberOrganizations,
    getOrganizationFromOrganizationId
} from "@comend/lib/fetchers";
import {handleImageUpload} from "@comend/lib/upload";
import LoadingDots from "@comend/components/icons/loading-dots";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import { mixpanelTrack } from "@comend/lib/mixpanel";

const joinOrgFormSchema = z.object({
    org: z.array(optionSchema).min(0).optional(),
})

export const newOrgFormSchema = z.object({
    orgName: z.string().min(2, {
        message: "Your organization's name must be at least 2 characters."
    }).max(60, {
        message: "Your organization's name must be a maximum of 60 characters."
    }),
    subdomain: z.string().min(2, {
        message: "Your organization's nickname must be at least 2 characters."
    }).max(60, {
        message: "Your organization's nickname must be a maximum of 50 characters."
    }),
    contactEmail: z.string().email({
        message: "Please enter a valid email address.",
    }).optional(),
    title: z.string().optional().or(z.literal("")), // Allow title to be empty or null
    looking: z.string().min(0).optional(),
    founded: z.string().optional(),
    description: z.string().min(2, {
        message: "Your organization's description must be at least 2 characters long.",
    }).max(500, {
        message: "Your organization's description must less than 500 characters long.",
    }).optional(),
    website: z.string().min(2, {
        message: "Your organization's website.",
    }).optional(),
    incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"], {
        required_error: "You need to select a 501(c)(3) status.",
    }).optional(),
    therapeuticsInDevelopment: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsInDevelopment: z.string().optional(),
    therapeuticsOfInterest: z.array(optionSchema).min(0).optional(),
    otherTherapeuticsOfInterest: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    formattedAddress: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    image: z.string().nullable().optional(),
    metadata: z.string().optional()
})

export default function OrganizationOnboardingForm(
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
    const {data: session} = useSession()
    const router = useRouter()
    const pathname = usePathname()
    // const [isNewOrganization, setIsNewOrganization] = useState(true)
    const [organizations, setOrganizations] = useState<Option[]>([])
    const [searchInput, setSearchInput] = useState("");
    const {isNewOrganization, toggleIsNewOrganization} = useOnboardingStore();
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null)
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<z.infer<typeof newOrgFormSchema> | undefined>(undefined);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            const file = acceptedFiles[0];
            if (!file) {
                toast.error("No file selected!");
                return;
            }

            // Additional check to exclude SVG
            if (file.type === "image/svg+xml") {
                toast.error("SVG files are not allowed. Please select a valid image.");
                return;
            }

            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            setSelectedFile(fileWithPreview);
            setDialogOpen(true);
        },
        []
    );

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        accept: acceptedFiletypes,
    });

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

    const newOrgForm = useForm<z.infer<typeof newOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(newOrgFormSchema),
        defaultValues: defaultOrganizationValues
    })

    const [debouncedNickname] = useDebounce(newOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    useEffect(() => {
        // Trigger validation whenever the debounced nickname changes
        const currentSubdomain = defaultOrganizationValues?.subdomain; // The current subdomain of the organization

        if (debouncedNickname === currentSubdomain) {
            // Clear errors since it's the same subdomain as before
            newOrgForm.clearErrors("subdomain");
            return;
        }

        if (debouncedNickname) {
            checkSubdomainAvailability(debouncedNickname).then((isAvailable) => {
                if (!isAvailable) {
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

    async function newOrgOnSubmit(values: z.infer<typeof newOrgFormSchema>) {
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

            // only upload image if it is not the same as the previous one
            if (selectedFile && values.image && values.image !== defaultOrganizationValues?.image) {
                try {
                    const imgUrl = await handleImageUpload(selectedFile as File, values.image)
                    if (imgUrl) {
                        formData.set('image', imgUrl)
                    }
                } catch (error) {
                    console.error("Failed to upload image:", error)
                    toast.error("Image upload failed")
                    return
                }
            }

            const data = {
                therapeuticsInDevelopment: values.therapeuticsInDevelopment?.map((therapeutic) => therapeutic.label).join(",") || "",
                therapeuticsOfInterest: values.therapeuticsOfInterest?.map((therapeutic) => therapeutic.label).join(",") || "",
                metadata: JSON.stringify({
                    // ...(organization?.metadata ? JSON.parse(JSON.stringify(organization.metadata)) : undefined),
                    otherTherapeuticsInDevelopment: values.otherTherapeuticsInDevelopment,
                    otherTherapeuticsOfInterest: values.otherTherapeuticsOfInterest
                })
            }
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            console.log(`create organization with metadata`, values.metadata)

            createOrganization(formData).then((res: any) => {
                if (res.error) {
                    toast.error(res.error)
                } else {
                    va.track("Created Organization")

                    if (newOrgForm.watch("looking")) {
                        mixpanelTrack(`User is looking for`, {
                            orgName: newOrgForm.watch("orgName"),
                            looking: newOrgForm.watch("looking")
                        })
                    }

                    // Update the session object with the newly created organizationId
                    router.refresh()
                    router.push(nextLink)
                    toast.success(`Successfully created organization!`)
                }
            })
        } catch (error) {
            toast.error("An error occurred while creating your organization.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function fetchOrganizationData() {
            if (session?.user?.organizationId && pathname === "/onboarding/organization") {
                let organizationData
                const response = await getOrganizationFromOrganizationId(session.user.organizationId, {
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
                if (response.success) {
                    organizationData = response.data
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                if (organizationData) {
                    // Find the current user's title from the members list
                    const currentUserMember = organizationData.members?.find(
                        (member: any) => member.userId === session.user.id
                    );
                    const currentUserTitle = currentUserMember?.title || "";

                    const fetchedValues = {
                        id: organizationData.id || "",
                        description: organizationData.description || "",
                        orgName: organizationData.name || "", // Map `name` to `orgName`
                        founded: organizationData.yearFounded ? organizationData.yearFounded.toString() : "",
                        title: currentUserTitle,  // Title of the user at the org
                        subdomain: organizationData.subdomain || "",
                        website: organizationData.website || "",
                        contactEmail: organizationData.contactEmail || "",
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
                        address1: organizationData.address1 || "",
                        address2: organizationData.address2 || "",
                        formattedAddress: organizationData.formattedAddress || "",
                        city: organizationData.city || "",
                        region: organizationData.region || "",
                        postalCode: organizationData.postalCode || "",
                        country: organizationData.country || "",
                        lat: parseFloat(organizationData.lat || "0"),
                        lng: parseFloat(organizationData.lng || "0"),
                        image: organizationData.image || "",
                        name: organizationData.name || "",
                        logo: organizationData.logo || "",
                        imageBlurhash: organizationData.imageBlurhash || "",
                        statedGoal: organizationData.statedGoal || null,
                        incorporationStatus: organizationData.incorporationStatus || undefined
                    };

                    if (organizationData.image) {
                        try {
                            const orgPhoto: File = await getPublicFile(organizationData.image)
                            if (orgPhoto) {
                                const fileWithPreview = Object.assign(orgPhoto, {
                                    preview: URL.createObjectURL(orgPhoto),
                                })
                                setSelectedFile(fileWithPreview)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }

                    setDefaultOrganizationValues(fetchedValues);
                    newOrgForm.reset(fetchedValues); // Reset form with fetched data
                }
            }
        }

        fetchOrganizationData();
    }, [session, newOrgForm]);

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
                                    name="orgName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Organization Name (required)`}</FormLabel>
                                            {/*<div className="w-full flex flex-row justify-between">*/}
                                            {/*    <FormDescription>*/}
                                            {/*        {`The name of your organization.`}*/}
                                            {/*    </FormDescription>*/}
                                            {/*    <FormDescription>*/}
                                            {/*        {`60 characters max.`}*/}
                                            {/*    </FormDescription>*/}
                                            {/*</div>*/}
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
                                            <FormLabel>{`Organization Abbreviation (required)`}</FormLabel>
                                            {/*<div className="w-full flex flex-row justify-between">*/}
                                            <FormDescription>
                                                {`Choose the URL for your custom profile site.`}
                                                <br/>
                                                {newOrgForm.watch("subdomain") &&
                                                    !newOrgForm.formState.errors.subdomain && (
                                                        <div className="font-semibold">
                                                            {`The custom site for your organization’s profile will be found at ${newOrgForm
                                                                .watch("subdomain")
                                                                .toLowerCase()
                                                                .replace(/\s+/g, "-")}.comend.io`}
                                                        </div>
                                                    )}
                                            </FormDescription>
                                            {/*    <FormDescription>*/}
                                            {/*        50 characters max.*/}
                                            {/*    </FormDescription>*/}
                                            {/*</div>*/}
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

                                <FormField
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
                                />

                                <FormField
                                    control={newOrgForm.control}
                                    name="founded"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Year Founded</FormLabel>
                                            {/*<FormDescription>*/}
                                            {/*    Select the year your organization was founded.*/}
                                            {/*</FormDescription>*/}
                                            <Select
                                                onValueChange={(value) => field.onChange(`${value}-01-01`)} // Convert year to a date string
                                                defaultValue={field.value?.split("-")[0]} // Extract the year from the date string for the default value
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a year"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem
                                                            key={year}
                                                            value={year.toString()}
                                                        >
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
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
                                                {`The treatment modalities your organization is interested in. Select all that apply.`}
                                                <Tooltip delayDuration={0}>
                                                    {/*disabled to make the tooltip unclickable*/}
                                                    <TooltipTrigger disabled>
                                                        <Info
                                                            className="text-black inline-block align-baseline mx-1 h-4 w-4"/>
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
                                            {/*<FormDescription>{`Whether you have incorporated your patient group as a non-profit yet.`}</FormDescription>*/}
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
