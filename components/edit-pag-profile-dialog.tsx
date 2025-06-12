"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useDebounce} from "use-debounce";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {updateOrganization, updateCondition} from "@/lib/actions";
import {AddressType, ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS} from "@/lib/types";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {FileWithPreview, ImageSelector} from "@/components/image-selector";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {Button} from "@/components/ui/button";
import {AutocompleteComponent} from "@/components/autocomplete";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {
    checkSubdomainAvailability, getConditionsFromOrganizationId,
    getOrganizationFromOrganizationId,
} from "@/lib/fetchers";
import {Pen, Upload, MessageCircleQuestion} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {acceptedFiletypes, cn, formatNumberWithCommas, getPublicFile, sleep, years} from "@/lib/utils";
import {handleImageUpload} from "@/lib/upload";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Slider} from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {financesFormSchema} from "@/components/finances-onboarding-form";
import {researchFormSchema} from "@/components/research-onboarding-form";
import mixpanel from "mixpanel-browser";
import {Organization} from "@prisma/client";
import MoneyInput from "@/components/money-input";
import {FormImageSelector} from "./form-image-selector";
import {PAGBannerPhoto} from "./pag-banner-photo";
import {ProfilePhoto} from "./profile-photo";

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
    headerImage: z.string().optional(),
})

export default function EditPAGProfileDialog({organization}: { organization: Organization }) {
    const router = useRouter()
    const [searchInput, setSearchInput] = useState("");
    const [selectedFileProfile, setSelectedFileProfile] = useState<FileWithPreview | null>(null);
    const [selectedFileHeader, setSelectedFileHeader] = useState<FileWithPreview | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<z.infer<typeof editOrgFormSchema> | undefined>(undefined);
    const [defaultFinancesValues, setDefaultFinancesValues] = useState<z.infer<typeof financesFormSchema> | undefined>(undefined);
    const [defaultResearchValues, setDefaultResearchValues] = useState<z.infer<typeof researchFormSchema> | undefined>(undefined);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: defaultOrganizationValues
    })

    const [debouncedNickname] = useDebounce(editOrgForm.watch("subdomain"), 500); // Extract just the debounced value

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

    async function onProfileFormSubmit(values: z.infer<typeof editOrgFormSchema>) {
        if (!organization.id) {
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

        // Map the form values to match the Condition schema
        const data = {
            therapeuticsInDevelopment: values.therapeuticsInDevelopment?.map((therapeutic) => therapeutic.label).join(",") || "",
            therapeuticsOfInterest: values.therapeuticsOfInterest?.map((therapeutic) => therapeutic.label).join(",") || "",
            metadata: JSON.stringify({
                ...(organization?.metadata ? JSON.parse(JSON.stringify(organization.metadata)) : undefined),
                otherTherapeuticsInDevelopment: values.otherTherapeuticsInDevelopment,
                otherTherapeuticsOfInterest: values.otherTherapeuticsOfInterest
            })
        }
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value)
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
            await updateOrganization(organization.id, formData);
            toast.success("Organization profile updated successfully!");
            setOpen(false)
            router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    useEffect(() => {
        async function fetchOrganizationData() {
            try {
                const fetchedValues = {
                    id: organization.id || "",
                    description: organization.description || "",
                    orgName: organization.name || "", // Map `name` to `orgName`
                    founded: organization.yearFounded ? organization.yearFounded.toString() : "",
                    subdomain: organization.subdomain || "",
                    website: organization.website || "",
                    address1: organization.address1 || "",
                    address2: organization.address2 || "",
                    formattedAddress: organization.formattedAddress || "",
                    city: organization.city || "",
                    region: organization.region || "",
                    postalCode: organization.postalCode || "",
                    country: organization.country || "",
                    lat: parseFloat(organization.lat || "0"),
                    lng: parseFloat(organization.lng || "0"),
                    image: organization.image || "",
                    headerImage: organization.headerImage || "",
                    name: organization.name || "",
                    logo: organization.logo || "",
                    font: organization.font || "",
                    imageBlurhash: organization.imageBlurhash || "",
                    statedGoal: organization.statedGoal || null,
                    incorporationStatus: organization.incorporationStatus || undefined,
                    therapeuticsInDevelopment: organization.therapeuticsInDevelopment?.map((ther) => ({
                        label: ther,
                        value: ther
                    })) || [],
                    otherTherapeuticsInDevelopment: typeof organization.metadata == 'object' ? (organization?.metadata as {
                        [key: string]: any
                    })?.otherTherapeuticsInDevelopment : undefined,
                    therapeuticsOfInterest: organization.therapeuticsOfInterest?.map((ther) => ({
                        label: ther,
                        value: ther
                    })) || [],
                    otherTherapeuticsOfInterest: typeof organization.metadata == 'object' ? (organization?.metadata as {
                        [key: string]: any
                    })?.otherTherapeuticsOfInterest : undefined,
                };

                if (organization.image) {
                    try {
                        const orgPhoto: File = await getPublicFile(organization.image)
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

                if (organization.headerImage) {
                    try {
                        const orgHeader: File = await getPublicFile(organization.headerImage)
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

                setDefaultOrganizationValues(fetchedValues);
                editOrgForm.reset(fetchedValues); // Reset form with fetched data
            } catch (error) {
                console.error("Failed to fetch finances data:", error);
                toast.error("An error occurred while fetching finances data.");
            }
        }

        fetchOrganizationData();
    }, [organization.id, editOrgForm]);

    const editFinancesForm = useForm<z.infer<typeof financesFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(financesFormSchema)
    })

    useEffect(() => {
        async function fetchFinancesData() {
            try {
                const fetchedValues = {
                    raised: organization.moneyRaised || 0,
                    budget: organization.researchBudget || 0,
                    deployed: organization.moneyDeployed || 0,
                };

                // Populate form with fetched data
                setDefaultFinancesValues(fetchedValues);
                editFinancesForm.reset(fetchedValues);
            } catch (error) {
                console.error("Failed to fetch finances data:", error);
                toast.error("An error occurred while fetching finances data.");
            }
        }

        fetchFinancesData();
    }, [organization.id, editFinancesForm]);

    async function onFinancesFormSubmit(values: z.infer<typeof financesFormSchema>) {
        if (!organization.id) {
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
            await updateOrganization(organization.id, formData);
            toast.success("Organization updated successfully!");
            setOpen(false)
            router.refresh(); // Refresh the page to reflect changes
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
            if (!organization.id) {
                toast.error("You must be signed into an organization.");
                return;
            }

            try {
                // Fetch conditions for the given organization ID
                const response = await getConditionsFromOrganizationId(organization.id, {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    diseaseCategories: true,
                    prevalenceNumerator: true,
                    prevalenceDenominator: true,
                    numberOfPatientsEngaged: true,
                    nationalEstimatedPopulation: true,
                    globalEstimatedPopulation: true,
                    relevantDiseaseMechanisms: true,
                    causalGenes: true,
                    associatedGenes: true,
                    associatedSystems: true,
                    associatedSignsAndSymptoms: true,
                    existingDatabasesAndStudies: true,
                    toolsUnderDevelopment: true,
                    createdAt: true,
                    updatedAt: true,
                    gardURL: true,
                    nordURL: true,
                    summary: true,
                    prevalenceRatio: true,
                    organizations: true,
                    metadata: true,
                });

                if (response.success) {
                    const conditions = response.data;

                    if (conditions && conditions.length > 0) {
                        const fetchedValues = conditions.map((condition: any) => ({
                            disorder: condition.name || "",
                            summary: condition.summary || "",
                            categories: condition.diseaseCategories?.map((cat: any) => ({
                                label: cat,
                                value: cat
                            })) || [],
                            modalities: condition.interestedModalities?.map((mod: any) => ({
                                label: mod,
                                value: mod
                            })) || [],
                            genes: condition.associatedGenes?.map((gene: any) => ({label: gene, value: gene})) || [],
                            systems: condition.associatedSystems?.map((system: any) => ({
                                label: system,
                                value: system
                            })) || [],
                            prevalenceNumerator: condition.prevalenceNumerator?.toString() || "",
                            prevalenceDenominator: condition.prevalenceDenominator?.toString() || "",
                            engaged: condition.numberOfPatientsEngaged?.toString() || "",
                            national: condition.nationalEstimatedPopulation?.toString() || "",
                            global: condition.globalEstimatedPopulation?.toString() || "",
                            otherCategories: typeof condition.metadata == 'object'? (condition.metadata as { [key: string]: any })?.otherCategories : undefined,
                            otherMechanisms: typeof condition.metadata == 'object'? (condition.metadata as { [key: string]: any })?.otherMechanisms : undefined,
                            otherSystems: typeof condition.metadata == 'object'? (condition.metadata as { [key: string]: any })?.otherSystems : undefined,
                        }));

                        // Assuming you're working with one condition at a time (e.g., the first condition)
                        const defaultValues = fetchedValues[0] || {};
                        console.log("hello", defaultValues)

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
    }, [organization.id, editResearchForm]);

    async function onResearchFormSubmit(values: z.infer<typeof researchFormSchema>) {
        if (!organization.id) {
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
                diseaseCategories: values.categories?.map((item) => item.label) || [],
                prevalenceNumerator: values.prevalenceNumerator ? values.prevalenceNumerator : null,
                prevalenceDenominator: values.prevalenceDenominator ? values.prevalenceDenominator : null,
                numberOfPatientsEngaged: values.engaged ? parseInt(values.engaged, 10) : null,
                nationalEstimatedPopulation: values.national ? parseInt(values.national, 10) || null : null,
                globalEstimatedPopulation: values.global ? parseInt(values.global, 10) || null : null,
                relevantDiseaseMechanisms: values.mechanisms || [],
                causalGenes: values.causal?.map((item) => item.label) || [],
                associatedGenes: values.genes?.map((item) => item.label) || [],
                associatedSystems: values.systems?.map((item) => item.label) || [],
                associatedSignsAndSymptoms: values.symptoms?.map((item) => item.label) || [],
                existingDatabasesAndStudies: values.studies?.map((item) => item.label) || [],
                toolsUnderDevelopment: values.tools?.map((item) => item.label) || [],
                metadata: JSON.stringify({
                    otherCategories: values.otherCategories,
                    otherMechanisms: values.otherMechanisms,
                    otherSystems: values.otherSystems
                })
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
            const response = await updateCondition(organization.id, formData);

            if (response.success) {
                toast.success("Condition updated successfully!");

                setOpen(false)
                router.refresh(); // Refresh the page to reflect changes
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
                        className="gap-x-2 organization-profile-tour-step3"
                    >
                        <Pen/>
                        Edit profile
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                                                                {`Yes, I have a 501c3`}
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
                                                                {`No, I don't have a 501c3`}
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <ProfilePhoto
                                        img={organization.image}
                                        name={organization.name}
                                        className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                        textSize="large"
                                        editable={true}
                                    />

                                    <PAGBannerPhoto
                                        img={organization.headerImage}
                                        name={organization.headerImage}
                                        className="rounded-full ring-4 ring-white w-full"
                                        editable={true}
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

                                    <FormField
                                        control={editOrgForm.control}
                                        name="therapeuticsInDevelopment"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Therapeutics under development
                                                </FormLabel>
                                                <FormDescription>
                                                    Select all that apply.
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
                                                        showHoverCard={false}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {editOrgForm.watch("therapeuticsInDevelopment")?.some((item) => item.value === "Other" || item.value === "OTHER") && (
                                        <FormField
                                            control={editOrgForm.control}
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
                                        control={editOrgForm.control}
                                        name="therapeuticsOfInterest"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Therapeutics of interest
                                                </FormLabel>
                                                <FormDescription className="flex items-center">
                                                    {`The treatment modalities of interest of your organization. Select all that apply.`}
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <MessageCircleQuestion
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
                                            </FormItem>
                                        )}
                                    />

                                    {editOrgForm.watch("therapeuticsOfInterest")?.some((item) => item.value === "Other" || item.value === "OTHER") && (
                                        <FormField
                                            control={editOrgForm.control}
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

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
                                        Save
                                    </Button>
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
                                                <FormDescription>
                                                    Select all that apply.
                                                </FormDescription>
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
                                                <FormDescription>
                                                    Select all that apply.
                                                </FormDescription>
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
                                                    {`What types of genetic effects are you investigating? Select all that apply.`}
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
                                            </FormItem>
                                        )}
                                    />

                                    {editResearchForm.watch("categories")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                        <FormField
                                            control={editResearchForm.control}
                                            name="otherCategories"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormDescription className="flex items-center">
                                                        {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            id="categories-other"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={editResearchForm.control}
                                        name="systems"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Associated systems</FormLabel>
                                                <FormDescription>{`The systems affected by your condition. Select all that apply.`}</FormDescription>
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
                                            </FormItem>
                                        )}
                                    />

                                    {editResearchForm.watch("systems")?.some((item) => item.value === "OTHER" || item.value === "Other") && (
                                        <FormField
                                            control={editResearchForm.control}
                                            name="otherSystems"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormDescription className="flex items-center">
                                                        {`(Optional) Other details. This won't be saved to your condition's profile, but will be used to improve the platform.`}
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            id="systems-other"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    )}

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
                                                <FormLabel>{`Number of patients engaged`}</FormLabel>
                                                <FormDescription>{`The number of patients your organization has been in touch with.`}</FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        id="engaged"
                                                        {...field}
                                                        min={0}
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
                                                <FormLabel>{`Estimated number of patients in the US`}</FormLabel>
                                                {/*<FormDescription>{`The estimated number of patients in the US.`}</FormDescription>*/}
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        id="national"
                                                        {...field}
                                                        min={0}
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
                                                <FormLabel>{`Estimated number of patients in the world`}</FormLabel>
                                                {/*<FormDescription>{`The estimated number of patients in the world.`}</FormDescription>*/}
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        id="global"
                                                        {...field}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
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

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
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

