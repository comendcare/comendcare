"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createMemberRequest, createOrganization} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {usePathname, useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector from "@/components/ui/multiple-selector";
import React, {useCallback, useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Separator} from "@/components/ui/separator";
import {useOnboardingStore} from "@/state/onboarding/onboardingStore";
import {AutocompleteComponent} from "@/components/autocomplete";
import {AddressType, MODALITIES, Option} from "@/lib/types";
import {useDebounce} from "use-debounce";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Bold, Info, Italic} from "lucide-react";
import {FileWithPreview} from "@/components/image-selector";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FileWithPath, useDropzone} from "react-dropzone";
import {acceptedFiletypes, getPublicFile, nameToInitials, years} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    checkSubdomainAvailability,
    getAllNonMemberOrganizations,
    getAllOrganizations,
    getOrganizationFromOrganizationId
} from "@/lib/fetchers";
import {handleImageUpload} from "@/lib/upload";
import LoadingDots from "@/components/icons/loading-dots";
import mixpanel from "mixpanel-browser";
import {Member, Organization} from "@prisma/client";
import {Calendar, Building2} from "lucide-react";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import { mixpanelTrack } from "@/app/mixpanel";

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

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
    image: z.string().optional(),
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
    const {data: session, update} = useSession()
    const router = useRouter()
    const pathname = usePathname()
    // const [isNewOrganization, setIsNewOrganization] = useState(true)
    const [organizations, setOrganizations] = useState<Option[]>([])
    const [address, setAddress] = useState<AddressType>({
        address1: "",
        address2: "",
        formattedAddress: "",
        city: "",
        region: "",
        postalCode: "",
        country: "",
        lat: 0,
        lng: 0,
    });
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
                await getAllNonMemberOrganizations().then((response) => {
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

    useEffect(() => {
        newOrgForm.setValue("address1", address.address1);
        newOrgForm.setValue("address2", address.address2);
        newOrgForm.setValue("formattedAddress", address.formattedAddress);
        newOrgForm.setValue("city", address.city);
        newOrgForm.setValue("region", address.region);
        newOrgForm.setValue("postalCode", address.postalCode);
        newOrgForm.setValue("country", address.country);
        newOrgForm.setValue("lat", address.lat);
        newOrgForm.setValue("lng", address.lng);
    }, [address, newOrgForm]);

    async function updateSession(response: { organization: Organization, membership: Member }) {
        await update({
            ...session,
            organizationId: response.organization.id,
            membership: response.membership
        })
    }

    async function joinOrgOnSubmit() {
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
    }

    async function newOrgOnSubmit(values: z.infer<typeof newOrgFormSchema>) {
        setLoading(true)
        try {
            const formData = new FormData()

            Object.entries(values).forEach(([key, value]) => {
                if (key === "therapeuticsInDevelopment") return
                if (key === "therapeuticsOfInterest") return

                if (value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            // Append address fields from state
            if (address) {
                formData.append("address1", address.address1 || "");
                formData.append("address2", address.address2 || "");
                formData.append("formattedAddress", address.formattedAddress || "");
                formData.append("city", address.city || "");
                formData.append("region", address.region || "");
                formData.append("postalCode", address.postalCode || "");
                formData.append("country", address.country || "");
                formData.append("lat", address.lat.toString());
                formData.append("lng", address.lng.toString());
            }

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
            }
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            createOrganization(formData).then((res: any) => {
                if (res.error) {
                    toast.error(res.error)

                    // // Mixpanel tracking for "Other" fields
                    // if (otherModality) {
                    //     mixpanelTrack("Org has other modality", {
                    //         orgName: newOrgForm.watch("orgName") || "Unknown Org",
                    //         looking: otherModality,
                    //     });
                    // }
                } else {
                    va.track("Created Organization")

                    if (newOrgForm.watch("looking")) {
                        mixpanelTrack(`User is looking for`, {
                            orgName: newOrgForm.watch("orgName"),
                            looking: newOrgForm.watch("looking")
                        })
                    }

                    // Update the session object with the newly created organizationId
                    updateSession(res)
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
                const response = await getOrganizationFromOrganizationId(session.user.organizationId);
                if (response.success) {
                    organizationData = response.data
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                if (organizationData) {
                    // Find the current user's title from the members list
                    const currentUserMember = organizationData.members?.find(
                        (member) => member.userId === session.user.id
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
                        therapeuticsInDevelopment: organizationData.therapeuticsInDevelopment?.map((therapeutic) => ({
                            label: therapeutic,
                            value: therapeutic
                        })),
                        otherTherapeuticsInDevelopment: organizationData.otherTherapeuticsInDevelopment || undefined,
                        therapeuticsOfInterest: organizationData.therapeuticsOfInterest?.map((modality) => ({
                            label: modality,
                            value: modality
                        })),
                        otherTherapeuticsOfInterest: organizationData.otherTherapeuticsOfInterest || undefined,
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
                        font: organizationData.font || "",
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
                    // setAddress(fetchedValues); // Set address state as well
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

                    {/* Toggle between joining or creating an organization*/}
                    {/*<div className="flex items-center space-x-2">*/}
                    {/*    <Switch*/}
                    {/*        id="new-organization"*/}
                    {/*        checked={isNewOrganization}*/}
                    {/*        onCheckedChange={toggleIsNewOrganization}*/}
                    {/*    />*/}
                    {/*    <Label*/}
                    {/*        htmlFor="new-organization"*/}
                    {/*        className="text-base"*/}
                    {/*    >*/}
                    {/*        {isNewOrganization ? "Join an existing organization instead" : "Create a new organization instead"}*/}
                    {/*    </Label>*/}
                    {/*</div>*/}

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

                                {/*<FormField*/}
                                {/*    control={newOrgForm.control}*/}
                                {/*    name="founded"*/}
                                {/*    render={({field}) => (*/}
                                {/*        <FormItem>*/}
                                {/*            <FormLabel>{`Year founded (required)`}</FormLabel>*/}
                                {/*            <FormDescription>{`The year your organization was founded.`}</FormDescription>*/}
                                {/*            <FormControl>*/}
                                {/*                <Input*/}
                                {/*                    type="text"*/}
                                {/*                    id="name"*/}
                                {/*                    autoComplete="name"*/}
                                {/*                    {...field}*/}
                                {/*                />*/}
                                {/*            </FormControl>*/}
                                {/*            <FormMessage/>*/}
                                {/*        </FormItem>*/}
                                {/*    )}*/}
                                {/*/>*/}

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

                                {newOrgForm.watch("therapeuticsInDevelopment")?.some((item) => item.value === "OTHER") && (
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
                                                            className="text-black h-4 inline-block align-baseline mx-1 h-4 w-4"/>
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

                                {newOrgForm.watch("therapeuticsOfInterest")?.some((item) => item.value === "OTHER") && (
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

                                {/*<FormField*/}
                                {/*    control={newOrgForm.control}*/}
                                {/*    name="description"*/}
                                {/*    render={({field}) => (*/}
                                {/*        <FormItem>*/}
                                {/*            <FormLabel>Description (required)</FormLabel>*/}
                                {/*            /!*<div className="w-full flex flex-row justify-between">*!/*/}
                                {/*            /!*    <FormDescription>*!/*/}
                                {/*            /!*        This will be the public description of your organization.*!/*/}
                                {/*            /!*    </FormDescription>*!/*/}
                                {/*            /!*    <FormDescription>*!/*/}
                                {/*            /!*        500 characters max.*!/*/}
                                {/*            /!*    </FormDescription>*!/*/}
                                {/*            /!*</div>*!/*/}
                                {/*            <FormControl>*/}
                                {/*                <Textarea*/}
                                {/*                    placeholder="Tell us a little bit about yourself"*/}
                                {/*                    className="resize-none"*/}
                                {/*                    {...field}*/}
                                {/*                />*/}
                                {/*            </FormControl>*/}
                                {/*            <FormMessage/>*/}
                                {/*        </FormItem>*/}
                                {/*    )}*/}
                                {/*/>*/}

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

                                {/*<FormField*/}
                                {/*    control={newOrgForm.control}*/}
                                {/*    name="formattedAddress"*/}
                                {/*    render={({field}) => (*/}
                                {/*        <FormItem>*/}
                                {/*            <FormLabel>Patient Group Address</FormLabel>*/}
                                {/*            /!*<FormDescription>*!/*/}
                                {/*            /!*    {`Your organization's address.`}*!/*/}
                                {/*            /!*</FormDescription>*!/*/}
                                {/*            <FormControl>*/}
                                {/*                <AutocompleteComponent*/}
                                {/*                    address={address}*/}
                                {/*                    setAddress={setAddress}*/}
                                {/*                    searchInput={searchInput}*/}
                                {/*                    setSearchInput={setSearchInput}*/}
                                {/*                />*/}
                                {/*            </FormControl>*/}
                                {/*            <FormMessage/>*/}
                                {/*        </FormItem>*/}
                                {/*    )}*/}
                                {/*/>*/}

                                {/*<FormField*/}
                                {/*    control={newOrgForm.control}*/}
                                {/*    name="looking"*/}
                                {/*    render={({field}) => (*/}
                                {/*        <FormItem>*/}
                                {/*            <FormLabel>{`What your organization is looking for and hoping to get from joining Comend.`}</FormLabel>*/}
                                {/*            <FormDescription>{`What are your organization’s priorities over the next year? How might Comend help?`}</FormDescription>*/}
                                {/*            <FormControl>*/}
                                {/*                <Input*/}
                                {/*                    type="text"*/}
                                {/*                    id="looking"*/}
                                {/*                    {...field}*/}
                                {/*                />*/}
                                {/*            </FormControl>*/}
                                {/*            <FormMessage/>*/}
                                {/*        </FormItem>*/}
                                {/*    )}*/}
                                {/*/>*/}

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
                                            disabled={!joinOrgForm.formState.isDirty || !joinOrgForm.formState.isDirty}
                                        >
                                            Join Organization
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

                {/*{isNewOrganization &&*/}
                {/*    <div*/}
                {/*        className="sticky top-8 col-span-1 space-y-4 border-2 rounded-lg h-[calc(100vh-250px)] overflow-y-auto">*/}
                {/*        <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-8">*/}
                {/*            <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-gray-900 mb-4">*/}
                {/*                Organization profile preview*/}
                {/*            </h1>*/}

                {/*            <div*/}
                {/*                className="h-10 w-full bg-white text-gray-800 text-left px-4 flex items-center border border-gray-300 rounded-md shadow-sm">*/}
                {/*                {newOrgForm.watch("subdomain") && `${newOrgForm.watch("subdomain")}.comend.io`}*/}
                {/*            </div>*/}

                {/*            <div className="w-full flex flex-col space-y-8 my-8">*/}
                {/*                <div>*/}
                {/*                    <div>*/}
                {/*                        /!* <img className="object-cover h-24 w-full lg:h-36"*/}
                {/*                             src={'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}*/}
                {/*                             alt=""*/}
                {/*                        /> *!/*/}
                {/*                        <div className="h-32 w-full object-cover lg:h-48 bg-secondary"></div>*/}
                {/*                    </div>*/}

                {/*                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">*/}
                {/*                        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">*/}

                {/*                            <div className="flex">*/}
                {/*                                {selectedFile?.preview ?*/}
                {/*                                    <img*/}
                {/*                                        className="object-cover h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18"*/}
                {/*                                        src={selectedFile?.preview}*/}
                {/*                                        alt=""/>*/}
                {/*                                    :*/}
                {/*                                    <p*/}
                {/*                                        className={"flex items-center justify-center bg-muted h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18 text-2xl"}*/}
                {/*                                    >*/}
                {/*                                        {nameToInitials(newOrgForm.watch("orgName"))}*/}
                {/*                                    </p>*/}
                {/*                                }*/}
                {/*                            </div>*/}

                {/*                            <div*/}
                {/*                                className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"*/}
                {/*                            >*/}
                {/*                                <div className="mt-6 min-w-0 flex-1 sm:hidden md:block space-y-1">*/}
                {/*                                    <h1 className="mt-6 min-w-0 flex-1 truncate text-xl font-bold text-gray-900">*/}
                {/*                                        {newOrgForm.watch("orgName") || <Skeleton className="h-4 w-full"/>}*/}
                {/*                                    </h1>*/}
                {/*                                    <div className="flex flex-row space-x-2">*/}
                {/*                                        {newOrgForm.watch("founded") ?*/}
                {/*                                            <div*/}
                {/*                                                className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-xs">*/}
                {/*                                                <div className="mt-1 flex items-center text-gray-500">*/}
                {/*                                                    <Calendar*/}
                {/*                                                        className="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"*/}
                {/*                                                        aria-hidden="true"/>*/}
                {/*                                                    Founded in {newOrgForm.watch("founded")?.split("-")[0]}*/}
                {/*                                                </div>*/}
                {/*                                            </div> :*/}
                {/*                                            <Skeleton className="h-2 w-1/4"/>*/}
                {/*                                        }*/}
                {/*                                        {newOrgForm.watch("incorporationStatus") === "YES" &&*/}
                {/*                                            <div*/}
                {/*                                                className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-xs">*/}
                {/*                                                <div className="mt-1 flex items-center text-gray-500">*/}
                {/*                                                    <Building2 */}
                {/*                                                        className="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"*/}
                {/*                                                        aria-hidden="true"/>*/}
                {/*                                                    {"501c3"}*/}
                {/*                                                </div>*/}
                {/*                                            </div>*/}
                {/*                                        }*/}
                {/*                                    </div>*/}
                {/*                                </div>*/}
                {/*                            </div>*/}

                {/*                        </div>*/}
                {/*                        <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">*/}
                {/*                            <h1 className="truncate text-2xl font-bold text-gray-900">*/}
                {/*                                {newOrgForm.watch("orgName")}*/}
                {/*                            </h1>*/}
                {/*                        </div>*/}
                {/*                    </div>*/}
                {/*                </div>*/}

                {/*                <div className="grid grid-cols-6 gap-2">*/}
                {/*                    <div className="col-span-2 space-y-2">*/}
                {/*                        <Card>*/}
                {/*                            <CardHeader*/}
                {/*                                className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
                {/*                                <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>*/}
                {/*                                    About*/}
                {/*                                </CardTitle>*/}
                {/*                            </CardHeader>*/}

                {/*                            <CardContent>*/}
                {/*                                <div className="flex flex-col space-y-4">*/}
                {/*                                    <div className="flex-shrink-0 space-y-4">*/}
                {/*                                        <div className="flex-grow space-y-4">*/}
                {/*                                            <div className="space-y-2">*/}
                {/*                                                {newOrgForm.watch("description") ?*/}
                {/*                                                    <p className="text-xs line-clamp-6">*/}
                {/*                                                        {newOrgForm.watch("description")}*/}
                {/*                                                    </p> : <Skeleton className="h-4 w-full"/>*/}
                {/*                                                }*/}
                {/*                                            </div>*/}
                {/*                                            <div className="space-y-2">*/}
                {/*                                                <h3 className={cn("scroll-m-20 text-md tracking-tight font-semibold")}>*/}
                {/*                                                    Website*/}
                {/*                                                </h3>*/}
                {/*                                                {newOrgForm.watch("website") ?*/}
                {/*                                                    <p className="text-xs truncate">*/}
                {/*                                                        {newOrgForm.watch("website")}*/}
                {/*                                                    </p> : <Skeleton className="h-4 w-full"/>*/}
                {/*                                                }*/}
                {/*                                            </div>*/}
                {/*                                        </div>*/}
                {/*                                    </div>*/}
                {/*                                </div>*/}

                {/*                            </CardContent>*/}
                {/*                        </Card>*/}
                {/*                    </div>*/}

                {/*                    <div className="col-span-4 flex flex-col space-y-2">*/}
                {/*                        <Card>*/}
                {/*                            <CardHeader className="flex flex-row items-center justify-between space-y-0">*/}
                {/*                                <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>*/}
                {/*                                    Milestones*/}
                {/*                                </CardTitle>*/}
                {/*                            </CardHeader>*/}
                {/*                            <CardContent className="grid grid-cols-2 gap-x-2">*/}
                {/*                                <div className="flex flex-col gap-y-2">*/}
                {/*                                    <Skeleton className="h-4 w-full"/>*/}
                {/*                                    <Skeleton className="h-4 w-1/2"/>*/}
                {/*                                </div>*/}
                {/*                                <div className="flex flex-col gap-y-2">*/}
                {/*                                    <Skeleton className="h-4 w-full"/>*/}
                {/*                                    <Skeleton className="h-4 w-1/2"/>*/}
                {/*                                    <Skeleton className="h-4 w-1/2"/>*/}
                {/*                                </div>*/}
                {/*                            </CardContent>*/}
                {/*                        </Card>*/}
                {/*                        <Card>*/}
                {/*                            <CardHeader*/}
                {/*                                className="w-full flex flex-row items-center justify-between space-y-0">*/}
                {/*                                <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>*/}
                {/*                                    Research Plan*/}
                {/*                                </CardTitle>*/}
                {/*                            </CardHeader>*/}
                {/*                            <CardContent className="space-y-4">*/}
                {/*                                <Skeleton className="h-4 w-full"/>*/}
                {/*                                <Skeleton className="h-4 w-[200px]"/>*/}
                {/*                                <Skeleton className="h-4 w-[200px]"/>*/}
                {/*                            </CardContent>*/}
                {/*                        </Card>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*}*/}
            </div>
        </TooltipProvider>
    )
}
