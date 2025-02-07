"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useDebounce} from "use-debounce";
import React, {useCallback, useEffect, useState} from "react";
import {updateOrganization, updateCondition} from "@/lib/actions";
import {AddressType, ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS} from "@/lib/types";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FileWithPreview, ImageCropper} from "@/components/image-cropper";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {Button} from "@/components/ui/button";
import {AutocompleteComponent} from "@/components/autocomplete";
import {FileWithPath, useDropzone} from "react-dropzone";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {
    checkSubdomainAvailability, getConditionsFromOrganizationId,
    getOrganizationFromOrganizationId,
} from "@/lib/fetchers";
import {FaPen, FaUpload} from "react-icons/fa6";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {cn, formatMoney, formatNumberWithCommas, getPublicFile, years} from "@/lib/utils";
import {handleImageUpload} from "@/lib/upload";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Slider} from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {FaQuestionCircle} from "react-icons/fa";
import {financesFormSchema} from "@/components/finances-onboarding-form";
import {researchFormSchema} from "@/components/research-onboarding-form";
import mixpanel from "mixpanel-browser";
import {Organization} from "@prisma/client";
import MoneyInput from "@/components/money-input";

const OPTIONS: Option[] = [
    {
        id: '1',
        label: 'nextjs',
        value: 'Nextjs',
        description: 'A React framework for building server-side rendered (SSR) and static web applications. It simplifies routing, API handling, and rendering optimizations.',
        strengths: 'Out-of-the-box SSR and static site generation (SSG), built-in API routes, and strong developer tooling with performance optimizations.',
    },
    {
        id: '2',
        label: 'React',
        value: 'react',
        description: 'A popular JavaScript library for building user interfaces, especially for single-page applications (SPAs). React focuses on the component-based architecture.',
        strengths: 'Highly reusable components, vast community support, and strong performance with Virtual DOM rendering.',
    },
    {
        id: '3',
        label: 'Remix',
        value: 'remix',
        description: 'A modern framework focused on seamless data fetching and SSR for web applications. Remix emphasizes web standards and progressive enhancement.',
        strengths: 'Provides full-stack capabilities with SSR, optimized for caching and streaming, and excellent support for nested routing.',
    },
];

const accept = {
    "image/*": [".jpg", ".jpeg", ".png"],
};

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const editOrgFormSchema = z.object({
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
    looking: z.array(optionSchema).min(0).optional(),
    founded: z.string().optional(),
    description: z.string().max(500, {
        message: "Your organization's description must less than 500 characters long.",
    }).optional(),
    website: z.string().min(2, {
        message: "Your organization's website.",
    }).optional(),
    incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"], {
        required_error: "You need to select a 501c3 status.",
    }).optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    formattedAddress: z.string(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    image: z.string().optional(),
    headerImage: z.string().optional()
})

export default function EditPAGProfileDialog({organization}: { organization: Organization }) {
    const {data: session, update} = useSession()
    const router = useRouter()
    const [searchInput, setSearchInput] = useState("");
    const [selectedFileProfile, setSelectedFileProfile] = useState<FileWithPreview | null>(null);
    const [selectedFileHeader, setSelectedFileHeader] = useState<FileWithPreview | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otherModality, setOtherModality] = useState<string>("");
    const [otherCategories, setOtherCategories] = useState<string>("");
    const [otherSystem, setOtherSystem] = useState<string>("");
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
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<z.infer<typeof editOrgFormSchema> | undefined>(undefined);
    const [defaultFinancesValues, setDefaultFinancesValues] = useState<z.infer<typeof financesFormSchema> | undefined>(undefined);
    const [defaultResearchValues, setDefaultResearchValues] = useState<z.infer<typeof researchFormSchema> | undefined>(undefined);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: defaultOrganizationValues
    })

    const [debouncedNickname] = useDebounce(editOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    async function updateSession(organizationId: string) {
        // await update({
        //     ...session,
        //     organizationId: organizationId,
        // })
    }

    useEffect(() => {
        if (debouncedNickname) {
            const currentSubdomain = defaultOrganizationValues?.subdomain; // The current subdomain of the organization

            if (debouncedNickname === currentSubdomain) {
                // Clear errors since it's the same subdomain as before
                editOrgForm.clearErrors("subdomain");
                return;
            }

            checkSubdomainAvailability(debouncedNickname).then((isAvailable) => {
                if (!isAvailable) {
                    editOrgForm.setError("subdomain", {
                        type: "manual",
                        message: "This nickname is already taken. Please choose another.",
                    });
                    console.log("Not available");
                } else {
                    editOrgForm.clearErrors("subdomain");
                    console.log("Available");
                }
            });
        }
    }, [debouncedNickname, defaultOrganizationValues?.subdomain, editOrgForm])

    useEffect(() => {
        editOrgForm.setValue("address1", address.address1);
        editOrgForm.setValue("address2", address.address2);
        editOrgForm.setValue("formattedAddress", address.formattedAddress);
        editOrgForm.setValue("city", address.city);
        editOrgForm.setValue("region", address.region);
        editOrgForm.setValue("postalCode", address.postalCode);
        editOrgForm.setValue("country", address.country);
        editOrgForm.setValue("lat", address.lat);
        editOrgForm.setValue("lng", address.lng);
    }, [address, editOrgForm]);

    async function onProfileFormSubmit(values: z.infer<typeof editOrgFormSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        // Map form values to Prisma schema fields
        const fieldMapping: Record<string, string> = {
            orgName: "name",
            subdomain: "subdomain",
            looking: "interestedModalities",
            founded: "yearFounded",
            description: "description",
            website: "website",
            incorporationStatus: "incorporationStatus",
            image: "image",
            headerImage: "headerImage"
        };

        // Populate FormData with mapped fields
        Object.entries(values).forEach(([key, value]) => {
            const mappedKey = fieldMapping[key];
            if (mappedKey && value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    // Handle array fields (e.g., `interestedModalities`)
                    formData.append(mappedKey, JSON.stringify(value));
                } else {
                    formData.append(mappedKey, value.toString());
                }
            }

            // special case for images, make sure the image is removed is the value is not defined
            if ((mappedKey === "image" || mappedKey === "headerImage") && !value) {
                formData.append(mappedKey, "") // empty string is falsey, see actions.ts, updateOrganization() for useage
            }
        });

        // Handle the selected profile image upload
        // only upload if the image has changed
        if (selectedFileProfile && values.image && values.image !== defaultOrganizationValues?.image) {
            try {
                const imgUrl = await handleImageUpload(selectedFileProfile as File, values.image);
                if (imgUrl) {
                    formData.set("image", imgUrl); // Update the FormData with the uploaded image URL
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                toast.error("Image upload failed.");
                return;
            }
        }

        // Handle the selected header image upload
        // only upload if the image has changed
        if (selectedFileHeader && values.headerImage && values.headerImage !== defaultOrganizationValues?.headerImage) {
            try {
                const imgUrl = await handleImageUpload(selectedFileHeader as File, values.headerImage);
                if (imgUrl) {
                    formData.set("headerImage", imgUrl); // Update the FormData with the uploaded imageHeader URL
                }
            } catch (error) {
                console.error("Failed to upload header image:", error);
                toast.error("Image upload failed.");
                return;
            }
        }

        try {
            await updateOrganization(formData, session.user.organizationId);
            toast.success("Organization profile updated successfully!");
            setOpen(false)
            // router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    useEffect(() => {
        async function fetchOrganizationData() {
            if (session?.user?.organizationId) {
                let organizationData
                const response = await getOrganizationFromOrganizationId(session.user.organizationId);
                if (response.success) {
                    organizationData = response.data
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                if (organizationData) {
                    const fetchedValues = {
                        id: organizationData.id || "",
                        description: organizationData.description || "",
                        orgName: organizationData.name || "", // Map `name` to `orgName`
                        founded: organizationData.yearFounded ? organizationData.yearFounded.toString() : "",
                        subdomain: organizationData.subdomain || "",
                        website: organizationData.website || "",
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
                        headerImage: organizationData.headerImage || "",
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
                                setSelectedFileProfile(fileWithPreview)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }

                    if (organizationData.headerImage) {
                        try {
                            const orgHeader: File = await getPublicFile(organizationData.headerImage)
                            if (orgHeader) {
                                const fileWithPreview = Object.assign(orgHeader, {
                                    preview: URL.createObjectURL(orgHeader),
                                })
                                setSelectedFileHeader(fileWithPreview)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }

                    setAddress({
                        address1: fetchedValues.address1,
                        address2: fetchedValues.address2,
                        formattedAddress: fetchedValues.formattedAddress,
                        city: fetchedValues.city,
                        region: fetchedValues.region,
                        postalCode: fetchedValues.postalCode,
                        country: fetchedValues.country,
                        lat: fetchedValues.lat,
                        lng: fetchedValues.lng,
                    });

                    setDefaultOrganizationValues(fetchedValues);
                    // setAddress(fetchedValues); // Set address state as well
                    editOrgForm.reset(fetchedValues); // Reset form with fetched data
                }
            }
        }

        fetchOrganizationData();
    }, [session, editOrgForm]);

    const editFinancesForm = useForm<z.infer<typeof financesFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(financesFormSchema)
    })

    useEffect(() => {
        async function fetchFinancesData() {
            if (session?.user?.organizationId) {
                try {
                    const response = await getOrganizationFromOrganizationId(session.user.organizationId);

                    if (response.success) {
                        const orgData = response.data;

                        if (orgData) {
                            const fetchedValues = {
                                // raising: orgData.raising || undefined,
                                raised: orgData.moneyRaised || 0,
                                budget: orgData.researchBudget || 0,
                                deployed: orgData.moneyDeployed || 0,
                            };

                            // Populate form with fetched data
                            setDefaultFinancesValues(fetchedValues);
                            editFinancesForm.reset(fetchedValues);
                        }
                    } else {
                        console.error(response.error);
                        toast.error(response.error);
                    }
                } catch (error) {
                    console.error("Failed to fetch finances data:", error);
                    toast.error("An error occurred while fetching finances data.");
                }
            }
        }

        fetchFinancesData();
    }, [session?.user?.organizationId, editFinancesForm]);

    async function onFinancesFormSubmit(values: z.infer<typeof financesFormSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        const databaseMap: Partial<Record<keyof typeof values, string>> = {
            raised: "moneyRaised",
            budget: "researchBudget",
            deployed: "moneyDeployed",
            // raising: "raising",
        };

        Object.entries(values).forEach(([key, value]) => {
            const mappedKey = databaseMap[key as keyof typeof databaseMap]; // Explicitly cast key
            if (mappedKey && value !== undefined) {
                formData.append(mappedKey, value.toString());
            }
        });

        try {
            await updateOrganization(formData, session.user.organizationId);
            toast.success("Organization updated successfully!");
            setOpen(false)
            // router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            toast.error("Failed to update organization.");
        }
    }

    const editResearchForm = useForm<z.infer<typeof researchFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(researchFormSchema),
    })

    useEffect(() => {
        async function fetchResearchData() {
            if (!session?.user?.organizationId) {
                toast.error("You must be signed into an organization.");
                return;
            }

            try {
                // Fetch conditions for the given organization ID
                const response = await getConditionsFromOrganizationId(session.user.organizationId);

                if (response.success) {
                    const conditions = response.data;

                    if (conditions && conditions.length > 0) {
                        const fetchedValues = conditions.map((condition) => ({
                            disorder: condition.name || "",
                            summary: condition.summary || "",
                            categories: condition.diseaseCategories.map((cat) => ({label: cat, value: cat})) || [],
                            modalities: condition.interestedModalities.map((mod) => ({label: mod, value: mod})) || [],
                            genes: condition.associatedGenes.map((gene) => ({label: gene, value: gene})) || [],
                            systems: condition.associatedSystems.map((system) => ({
                                label: system,
                                value: system
                            })) || [],
                            prevalenceNumerator: condition.prevalenceNumerator?.toString() || "",
                            prevalenceDenominator: condition.prevalenceDenominator?.toString() || "",
                            engaged: condition.numberOfPatientsEngaged?.toString() || "",
                            national: condition.nationalEstimatedPopulation?.toString() || "",
                            global: condition.globalEstimatedPopulation?.toString() || "",
                        }));

                        // Assuming you're working with one condition at a time (e.g., the first condition)
                        const defaultValues = fetchedValues[0] || {};

                        setDefaultResearchValues(defaultValues);
                        editResearchForm.reset(defaultValues);
                    } else {
                        toast.error("No conditions found for this organization.");
                    }
                } else {
                    console.error(response.error);
                    toast.error(response.error);
                }
            } catch (error) {
                console.error("Failed to fetch research data:", error);
                toast.error("An error occurred while fetching research data.");
            }
        }

        fetchResearchData();
    }, [session?.user?.organizationId, editResearchForm]);

    async function onResearchFormSubmit(values: z.infer<typeof researchFormSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        setLoading(true); // Show loading state

        try {
            // Create a new FormData object
            const formData = new FormData();

            // Map the form values to match the Condition schema
            const mappedData: Record<string, any> = {
                name: values.disorder || "",
                summary: values.summary || "",
                therapeuticsInDevelopment: values.therapeutics?.map((item) => item.label) || [],
                interestedModalities: values.modalities?.map((item) => item.label) || [],
                diseaseCategories: values.categories?.map((item) => item.label) || [],
                prevalenceNumerator: values.prevalenceNumerator ? values.prevalenceNumerator : null,
                prevalenceDenominator: values.prevalenceDenominator ? values.prevalenceDenominator : null,
                numberOfPatientsEngaged: values.engaged ? parseInt(values.engaged, 10) : null,
                relevantDiseaseMechanisms: values.mechanisms || [],
                causalGenes: values.causal?.map((item) => item.label) || [],
                associatedGenes: values.genes?.map((item) => item.label) || [],
                associatedSystems: values.systems?.map((item) => item.label) || [],
                associatedSignsAndSymptoms: values.symptoms?.map((item) => item.label) || [],
                existingDatabasesAndStudies: values.studies?.map((item) => item.label) || [],
                assetsUnderDevelopment: values.assets?.map((item) => item.label) || [],
            };

            // Add mapped data to FormData
            Object.entries(mappedData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            });

            // Call the `updateCondition` function
            const response = await updateCondition(formData, session.user.organizationId);

            if (response.success) {
                toast.success("Condition updated successfully!");

                // Mixpanel tracking for "Other" fields
                if (otherModality) {
                    mixpanel.track("Org has other modality", {
                        orgName: organization?.name || "Unknown Org",
                        looking: otherModality,
                    });
                }

                if (otherCategories) {
                    mixpanel.track("Org has other category", {
                        orgName: organization?.name || "Unknown Org",
                        looking: otherCategories,
                    });
                }

                if (otherSystem) {
                    mixpanel.track("Org has other system", {
                        orgName: organization?.name || "Unknown Org",
                        looking: otherSystem,
                    });
                }

                setOpen(false)
                // router.refresh(); // Refresh the page to reflect changes
            } else {
                console.error(response.error);
                toast.error(response.error || "Failed to update condition.");
            }
        } catch (error) {
            console.error("Unexpected error updating condition:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false); // Hide loading state
        }
    }

    const onCloseForm = () => {
        setDefaultOrganizationValues(defaultOrganizationValues);
        editOrgForm.reset(defaultOrganizationValues); // Reset form with fetched data
        setDefaultFinancesValues(defaultFinancesValues);
        editFinancesForm.reset(defaultFinancesValues); // Reset form with fetched data
        setDefaultResearchValues(defaultResearchValues);
        editResearchForm.reset(defaultResearchValues); // Reset form with fetched data
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

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    onCloseForm();
                }
            }}>
                <DialogTrigger asChild>
                    <Button
                        variant="secondary"
                        className="gap-x-2 organization-profile-tour-step2"
                    >
                        <FaPen/>
                        Edit profile
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[800px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Edit organization profile
                        </DialogTitle>
                        <DialogDescription>
                            {`Make changes to your profile here. Click save when you're done.`}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="organization" className="w-full">
                        <TabsList>
                            <TabsTrigger value="organization">
                                Organization
                            </TabsTrigger>
                            <TabsTrigger value="research">
                                Condition
                            </TabsTrigger>
                            <TabsTrigger value="finances">
                                Finances
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="organization">
                            <Form {...editOrgForm}>
                                <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-8">

                                    <FormField
                                        control={editOrgForm.control}
                                        name="orgName"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Organization name`}</FormLabel>
                                                {/*<FormDescription>{`The name of your organization`}</FormDescription>*/}
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
                                        control={editOrgForm.control}
                                        name="subdomain"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Organization Abbreviation (required)`}</FormLabel>
                                                <FormDescription>
                                                    {`Enter an acronym, short form, or nickname for your organization.`}
                                                    <br/>
                                                    {editOrgForm.watch("subdomain") &&
                                                        !editOrgForm.formState.errors.subdomain && (
                                                            <>
                                                                {`The custom site for your organization’s profile will be found at ${editOrgForm
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
                                        control={editOrgForm.control}
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
                                        control={editOrgForm.control}
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
                                        control={editOrgForm.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                {/*<div className="w-full flex flex-row justify-between">*/}
                                                {/*    <FormDescription>*/}
                                                {/*        This will be the public description of your organization.*/}
                                                {/*    </FormDescription>*/}
                                                {/*    <FormDescription>*/}
                                                {/*        500 characters max.*/}
                                                {/*    </FormDescription>*/}
                                                {/*</div>*/}
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us a little bit about yourself"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editOrgForm.control}
                                        name="incorporationStatus"
                                        render={({field}) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>{`What is your 501c3 status`}</FormLabel>
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
                                                                Yes I have a 501c3
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
                                                                {`No I don't have a 501c3`}
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editOrgForm.control}
                                        name="formattedAddress"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Patient Group Address</FormLabel>
                                                {/*<FormDescription>*/}
                                                {/*    {`Your organization's address.`}*/}
                                                {/*</FormDescription>*/}
                                                <FormControl>
                                                    <AutocompleteComponent
                                                        address={address}
                                                        setAddress={setAddress}
                                                        searchInput={searchInput}
                                                        setSearchInput={setSearchInput}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormImageCropper
                                        form={editOrgForm}
                                        name="image"
                                        title={"Organization Logo"}
                                        // description={"This will be used as your organization profile's image."}
                                        aspect={1}
                                        selectedFile={selectedFileProfile}
                                        setSelectedFile={setSelectedFileProfile}
                                    />

                                    <FormImageCropper
                                        form={editOrgForm}
                                        name="headerImage"
                                        title={"Profile Header"}
                                        description={"This will be used as the header image on your organization's profile. (16x4)"}
                                        aspect={16 / 4}
                                        selectedFile={selectedFileHeader}
                                        setSelectedFile={setSelectedFileHeader}
                                        className="rounded h-[100px] w-[400px]"
                                    />

                                    {/*<FormField*/}
                                    {/*    control={editOrgForm.control}*/}
                                    {/*    name="looking"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormLabel>{`Looking for`}</FormLabel>*/}
                                    {/*            <FormDescription>{`What your organization is looking for and hoping to get from joining Comend.`}</FormDescription>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <MultipleSelector*/}
                                    {/*                    {...field}*/}
                                    {/*                    defaultOptions={OPTIONS}*/}
                                    {/*                    placeholder="Select options that appeal to you..."*/}
                                    {/*                    hidePlaceholderWhenSelected={true}*/}
                                    {/*                    emptyIndicator={*/}
                                    {/*                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">*/}
                                    {/*                            no results found.*/}
                                    {/*                        </p>*/}
                                    {/*                    }*/}
                                    {/*                />*/}
                                    {/*            </FormControl>*/}
                                    {/*            <FormMessage/>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}

                                    <Button type="submit">Save</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="research">

                            <Form {...editResearchForm}>
                                <form onSubmit={editResearchForm.handleSubmit(onResearchFormSubmit)}
                                      className="space-y-8">

                                    <FormField
                                        control={editResearchForm.control}
                                        name="disorder"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Name of condition (required)`}</FormLabel>
                                                {/*<div className="w-full flex flex-row justify-between">*/}
                                                {/*    <FormDescription>*/}
                                                {/*        {`The name of your rare condition/disorder.`}*/}
                                                {/*    </FormDescription>*/}
                                                {/*    <FormDescription>*/}
                                                {/*        60 characters max.*/}
                                                {/*    </FormDescription>*/}
                                                {/*</div>*/}
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
                                        control={editResearchForm.control}
                                        name="summary"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Summary of condition`}</FormLabel>
                                                {/*<div className="w-full flex flex-row justify-between">*/}
                                                {/*    <FormDescription>*/}
                                                {/*        {`A few lines describing your condition and what makes it unique`}*/}
                                                {/*    </FormDescription>*/}
                                                {/*    <FormDescription>*/}
                                                {/*        500 characters max.*/}
                                                {/*    </FormDescription>*/}
                                                {/*</div>*/}
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
                                        control={editResearchForm.control}
                                        name="causal"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Causal genes</FormLabel>
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
                                        control={editResearchForm.control}
                                        name="genes"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Associated genes</FormLabel>
                                                {/*<FormDescription>{`The genes associated with your condition.`}</FormDescription>*/}
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
                                        control={editResearchForm.control}
                                        name="categories"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Mechanisms of action
                                                </FormLabel>
                                                <FormDescription className="flex items-center">
                                                    {`What types of genetic effects are you investigating?`}
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
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                                {editResearchForm.watch("categories")?.some((item) => item.value === "OTHER") && (
                                                    <div className="mt-2">
                                                        <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>
                                                        <Input
                                                            type="text"
                                                            id="categories-other"
                                                            value={otherCategories}
                                                            onChange={(e) => setOtherCategories(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editResearchForm.control}
                                        name="systems"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Associated systems</FormLabel>
                                                <FormDescription>{`The systems affected by your condition.`}</FormDescription>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        defaultOptions={ASSOCIATED_SYSTEMS}
                                                        hidePlaceholderWhenSelected={true}
                                                        placeholder="Select the associated systems of your condition..."
                                                        emptyIndicator={
                                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                no results found.
                                                            </p>
                                                        }
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                                {editResearchForm.watch("systems")?.some((item) => item.value === "OTHER") && (
                                                    <div className="mt-2">
                                                        <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>
                                                        <Input
                                                            type="text"
                                                            id="systems-other"
                                                            value={otherSystem}
                                                            onChange={(e) => setOtherSystem(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editResearchForm.control}
                                        name="therapeutics"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Therapeutics under development
                                                </FormLabel>
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
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                                {editResearchForm.watch("therapeutics")?.some((item) => item.value === "OTHER") && (
                                                    <div className="mt-2">
                                                        <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>
                                                        <Input
                                                            type="text"
                                                            id="modalities-other"
                                                            value={otherModality}
                                                            onChange={(e) => setOtherModality(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editResearchForm.control}
                                        name="modalities"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Therapeutics of interest
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
                                                        hidePlaceholderWhenSelected={true}
                                                        placeholder="Select modalities you like..."
                                                        emptyIndicator={
                                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                no results found.
                                                            </p>
                                                        }
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                                {editResearchForm.watch("modalities")?.some((item) => item.value === "OTHER") && (
                                                    <div className="mt-2">
                                                        <FormDescription>{`Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}</FormDescription>
                                                        <Input
                                                            type="text"
                                                            id="modalities-other"
                                                            value={otherModality}
                                                            onChange={(e) => setOtherModality(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editResearchForm.control}
                                        name="prevalenceNumerator"
                                        render={({field: numeratorField}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {`Estimated total prevalence`} - {`${formatNumberWithCommas(numeratorField.value)} in ${formatNumberWithCommas(editResearchForm.watch("prevalenceDenominator"))}`}
                                                </FormLabel>
                                                <FormDescription>
                                                    {`The estimated global prevalence ratio of your condition.`}
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
                                                            control={editResearchForm.control}
                                                            name="prevalenceDenominator"
                                                            render={({field: denominatorField}) => (
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        id="prevalenceDenominator"
                                                                        {...denominatorField}
                                                                        className="w-32"
                                                                        min={0}
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
                                        control={editResearchForm.control}
                                        name="engaged"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Number of patients engaged`} - {formatNumberWithCommas(field.value)}</FormLabel>
                                                <FormDescription>{`The number of patients your organization has been in touch with.`}</FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        id="engaged"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editResearchForm.control}
                                        name="national"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Estimated number of patients in the US`} - {formatNumberWithCommas(field.value)}</FormLabel>
                                                {/*<FormDescription>{`The estimated number of patients in the US.`}</FormDescription>*/}
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        id="national"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editResearchForm.control}
                                        name="global"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Estimated number of patients in the world`} - {formatNumberWithCommas(field.value)}</FormLabel>
                                                {/*<FormDescription>{`The estimated number of patients in the world.`}</FormDescription>*/}
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        id="global"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit">
                                        Save
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="finances">

                            <Form {...editFinancesForm}>
                                <form onSubmit={editFinancesForm.handleSubmit(onFinancesFormSubmit)}
                                      className="space-y-8">

                                    {/*<FormField*/}
                                    {/*    control={editFinancesForm.control}*/}
                                    {/*    name="raising"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem className="space-y-3">*/}
                                    {/*            <FormLabel className="flex items-center">*/}
                                    {/*                {`Are you currently raising money?`}*/}
                                    {/*                <Tooltip delayDuration={0}>*/}
                                    {/*                    <TooltipTrigger>*/}
                                    {/*                        <FaQuestionCircle*/}
                                    {/*                            className="text-black h-4 inline-block align-baseline mx-1"/>*/}
                                    {/*                    </TooltipTrigger>*/}
                                    {/*                    <TooltipContent*/}
                                    {/*                        className="max-w-[400px] break-words text-sm z-50">*/}
                                    {/*                        <p>*/}
                                    {/*                            {`If raising money for your organization is a priority, we'll match you with grants.`}*/}
                                    {/*                        </p>*/}
                                    {/*                    </TooltipContent>*/}
                                    {/*                </Tooltip>*/}
                                    {/*            </FormLabel>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <RadioGroup*/}
                                    {/*                    onValueChange={field.onChange}*/}
                                    {/*                    defaultValue={field.value}*/}
                                    {/*                    className="flex flex-col space-y-1"*/}
                                    {/*                >*/}
                                    {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                                    {/*                        <FormControl>*/}
                                    {/*                            <RadioGroupItem value="yes"/>*/}
                                    {/*                        </FormControl>*/}
                                    {/*                        <FormLabel className="font-normal">*/}
                                    {/*                            {`Yes I'm currently raising`}*/}
                                    {/*                        </FormLabel>*/}
                                    {/*                    </FormItem>*/}
                                    {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                                    {/*                        <FormControl>*/}
                                    {/*                            <RadioGroupItem value="no-but"/>*/}
                                    {/*                        </FormControl>*/}
                                    {/*                        <FormLabel className="font-normal">*/}
                                    {/*                            {`No, but I'm planning to soon`}*/}
                                    {/*                        </FormLabel>*/}
                                    {/*                    </FormItem>*/}
                                    {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                                    {/*                        <FormControl>*/}
                                    {/*                            <RadioGroupItem value="no"/>*/}
                                    {/*                        </FormControl>*/}
                                    {/*                        <FormLabel className="font-normal">*/}
                                    {/*                            {`No I'm not raising money`}*/}
                                    {/*                        </FormLabel>*/}
                                    {/*                    </FormItem>*/}
                                    {/*                </RadioGroup>*/}
                                    {/*            </FormControl>*/}
                                    {/*            <FormMessage/>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}

                                    {/*<FormField*/}
                                    {/*    control={form.control}*/}
                                    {/*    name="raised"*/}
                                    {/*    render={({field}) => (*/}
                                    {/*        <FormItem>*/}
                                    {/*            <FormLabel>{`Total raised`}</FormLabel>*/}
                                    {/*            <FormDescription>{`The total amount of funding raised to date by your patient group.`}</FormDescription>*/}
                                    {/*            <FormControl>*/}
                                    {/*                <Input*/}
                                    {/*                    variant="currency"*/}
                                    {/*                    type="url"*/}
                                    {/*                    id="website"*/}
                                    {/*                    {...field}*/}
                                    {/*                />*/}
                                    {/*            </FormControl>*/}
                                    {/*            <FormMessage/>*/}
                                    {/*        </FormItem>*/}
                                    {/*    )}*/}
                                    {/*/>*/}

                                    <MoneyInput
                                        form={editFinancesForm}
                                        label="Total funds raised to date"
                                        description="The total amount of funding raised to date by your patient group."
                                        name="raised"
                                    />

                                    <MoneyInput
                                        form={editFinancesForm}
                                        label="Total funds deployed to research"
                                        description="The total amount of money deployed to research to date."
                                        name="deployed"
                                    />

                                    <MoneyInput
                                        form={editFinancesForm}
                                        label="Annual research budget"
                                        description="The amount of money allocated to advancing research this year."
                                        name="budget"
                                    />

                                    <Button type="submit">
                                        Save
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}

export const FormImageCropper = ({
                                     className = "",
                                     form,
                                     name,
                                     title,
                                     description,
                                     aspect,
                                     selectedFile,
                                     setSelectedFile
                                 }: {
    className?: string,
    form: any,
    name: string,
    title: string,
    description?: string,
    aspect: number,
    selectedFile: FileWithPreview | null,
    setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>
}) => {
    const [isDialogOpen, setDialogOpen] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            const file = acceptedFiles[0];
            if (!file) {
                // toast.error("No file selected!")
                console.error("No file selected!")
                return
            }

            // Additional check to exclude SVG
            if (file.type !== "image/jpg" && file.type !== "image/jpeg" && file.type !== "image/png") {
                toast.error("Only .jpg, .jpeg, and .png files are allowed. Please select a valid image format.")
                console.error("Only .jpg, .jpeg, and .png files are allowed. Please select a valid image format.")
                return
            }

            // Check file size (5 MB limit), image upload size is limited by the next server actions bodySizeLimit
            // defined in next.config.js
            const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSizeInBytes) {
                toast.error("File size exceeds 5 MB. Please select a smaller image.")
                console.error("File size exceeds 5 MB. Please select a smaller image.")
                return
            }

            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file),
            })

            setSelectedFile(fileWithPreview)
            setDialogOpen(true)
        },
        []
    );

    const {getRootProps, getInputProps} = useDropzone({
        onDrop: onDrop,
        accept,
    });


    return (
        <FormField
            control={form.control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>
                        {title}
                    </FormLabel>
                    {description &&
                        <FormDescription>
                            {description}
                        </FormDescription>
                    }
                    <FormControl>
                        <div className="flex flex-col items-start space-y-4">
                            {selectedFile ? (
                                <ImageCropper
                                    aspect={aspect}
                                    dialogOpen={isDialogOpen}
                                    setDialogOpen={setDialogOpen}
                                    selectedFile={selectedFile}
                                    setSelectedFile={(file: FileWithPreview | null) => {
                                        console.log(`set selected file`, file)
                                        if (!file) {
                                            setSelectedFile(null)
                                        } else {
                                            setSelectedFile(file)
                                        }

                                        field.onChange(file?.preview) // Update form field value
                                    }}
                                    className={className}
                                />
                            ) : (
                                <Avatar
                                    {...getRootProps()}
                                    className={cn("size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200", className)}
                                >
                                    <input {...getInputProps()} />
                                    <AvatarFallback
                                        className={cn("text-center flex flex-col justify-center gap-y-4", className)}>
                                        <FaUpload/>
                                        Click or drop!
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}
