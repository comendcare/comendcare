"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useDebounce} from "use-debounce";
import {useCallback, useEffect, useState} from "react";
import {
    updateOrganization,
    updateOrganizationAttribute
} from "@/lib/actions";
import {AddressType} from "@/lib/types";
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
    checkSubdomainAvailability,
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
import {getPublicFile, years} from "@/lib/utils";
import {handleImageUpload} from "@/lib/upload";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Slider} from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {FaQuestionCircle} from "react-icons/fa";
import {financesFormSchema} from "@/components/finances-onboarding-form";

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
    "image/*": [],
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
    }),
    looking: z.array(optionSchema).min(0).optional(),
    founded: z.string().min(2, {
        message: "The year that your organization was founded.",
    }),
    description: z.string().min(2, {
        message: "Your organization's description.",
    }),
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
})

export default function EditPAGProfileDialog() {
    const {data: session, update} = useSession()
    const router = useRouter()
    const [searchInput, setSearchInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
    const [open, setOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
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

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: defaultOrganizationValues
    })

    const [debouncedNickname] = useDebounce(editOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    async function updateSession(organizationId: string) {
        await update({
            ...session,
            organizationId: organizationId,
        })
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

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            const file = acceptedFiles[0];
            if (!file) {
                toast.error("Selected image is too large!");
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
        accept,
    });

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
        });

        // Handle the selected image upload
        if (selectedFile && values.image) {
            try {
                const imgUrl = await handleImageUpload(selectedFile as File, values.image);
                if (imgUrl) {
                    formData.set("image", imgUrl); // Update the FormData with the uploaded image URL
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                toast.error("Image upload failed.");
                return;
            }
        }

        try {
            await updateOrganization(formData, session.user.organizationId);
            toast.success("Organization profile updated successfully!");
            router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    useEffect(() => {
        async function fetchUserData() {
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
                        founded: organizationData.yearFounded ? organizationData.yearFounded : "",
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
                    editOrgForm.reset(fetchedValues); // Reset form with fetched data
                }
            }
        }

        fetchUserData();
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
            router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            toast.error("Failed to update organization.");
        }
    }

    const onCloseForm = () => {
        setDefaultOrganizationValues(defaultOrganizationValues);
        editOrgForm.reset(defaultOrganizationValues); // Reset form with fetched data
    }

    console.log(editOrgForm.watch("founded"))

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
                        className="gap-x-2"
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
                                                <FormDescription>{`The name of your organization`}</FormDescription>
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
                                                    {`Enter your organization's abbreviated name, short form, or nickname.`}
                                                    <br/>
                                                    {editOrgForm.watch("subdomain") &&
                                                        !editOrgForm.formState.errors.subdomain && (
                                                            <>
                                                                {`Your organization's domain will be ${editOrgForm
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
                                                <FormDescription>{`Your patient group's website URL.`}</FormDescription>
                                                <FormControl>
                                                    <Input
                                                        type="url"
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
                                                <FormDescription>
                                                    Select the year your organization was founded.
                                                </FormDescription>
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
                                                <FormDescription>
                                                    This will be the public description of your organization.
                                                </FormDescription>
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
                                                <FormDescription>{`Whether you have incorporated your patient group as a non-profit yet.`}</FormDescription>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
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
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <AutocompleteComponent
                                                        address={address}
                                                        setAddress={setAddress}
                                                        searchInput={searchInput}
                                                        setSearchInput={setSearchInput}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {`Your organization's address.`}
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editOrgForm.control}
                                        name="image"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Organization Logo
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-col items-start space-y-4">
                                                        {selectedFile ? (
                                                            <ImageCropper
                                                                dialogOpen={isDialogOpen}
                                                                setDialogOpen={setDialogOpen}
                                                                selectedFile={selectedFile}
                                                                setSelectedFile={(file: any) => {
                                                                    if (file == null) setSelectedFile(null)
                                                                    field.onChange(file?.preview); // Update form field value
                                                                }}
                                                            />
                                                        ) : (
                                                            <Avatar
                                                                {...getRootProps()}
                                                                className="size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200"
                                                            >
                                                                <input {...getInputProps()} />
                                                                <AvatarFallback
                                                                    className="text-center flex flex-col justify-center gap-y-4">
                                                                    <FaUpload/>
                                                                    Click or drop!
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    {`This will be used as your organization profile's image.`}
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editOrgForm.control}
                                        name="looking"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Looking for`}</FormLabel>
                                                <FormDescription>{`What your organization is looking for and hoping to get from joining Comend.`}</FormDescription>
                                                <FormControl>
                                                    <MultipleSelector
                                                        {...field}
                                                        defaultOptions={OPTIONS}
                                                        placeholder="Select options that appeal to you..."
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

                                    <Button type="submit">Save</Button>
                                </form>
                            </Form>
                        </TabsContent>
                        <TabsContent value="finances">

                            <Form {...editFinancesForm}>
                                <form onSubmit={editFinancesForm.handleSubmit(onFinancesFormSubmit)}
                                      className="space-y-8">

                                    <FormField
                                        control={editFinancesForm.control}
                                        name="raising"
                                        render={({field}) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="flex items-center">
                                                    {`Are you currently raising money?`}
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <FaQuestionCircle
                                                                className="text-black h-4 inline-block align-baseline mx-1"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            className="max-w-[400px] break-words text-sm z-50">
                                                            <p>
                                                                {`If raising money for your organization is a priority, we'll match you with grants.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="yes"/>
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {`Yes I'm currently raising`}
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="no-but"/>
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {`No, but I'm planning to soon`}
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="no"/>
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {`No I'm not raising money`}
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

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

                                    <FormField
                                        control={editFinancesForm.control}
                                        name="raised"
                                        render={({field: {value, onChange}}) => (
                                            <FormItem>
                                                <FormLabel>Raised - {value}</FormLabel>
                                                <FormDescription className="flex items-center">
                                                    {`The total amount of funding raised to date by your patient group.`}
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <FaQuestionCircle
                                                                className="text-black h-4 inline-block align-baseline mx-1"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            align="end"
                                                            className="max-w-[300px] break-words text-sm z-50"
                                                        >
                                                            <p>
                                                                {`Just a ballpark estimate so that we know to recommend vendors within a reasonable price range.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormDescription>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={1000000}
                                                        step={50000}
                                                        defaultValue={value ? [value] : [0]}
                                                        onValueChange={(vals: number[]) => {
                                                            onChange(vals[0]);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    This is a description for the price.
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editFinancesForm.control}
                                        name="deployed"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Money deployed to research`}</FormLabel>
                                                <FormDescription className="flex items-center">
                                                    {`The total amount of money deployed to research to date.`}
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <FaQuestionCircle
                                                                className="text-black h-4 inline-block align-baseline mx-1"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            align="end"
                                                            className="max-w-[300px] break-words text-sm z-50"
                                                        >
                                                            <p>
                                                                Knowing how much you have deployed to research so far
                                                                helps us understand how much experience you have with
                                                                driving research.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        variant="currency"
                                                        type="number"
                                                        min={0}
                                                        id="deployed"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editFinancesForm.control}
                                        name="budget"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{`Annual research budget`}</FormLabel>
                                                <FormDescription className="flex items-center">
                                                    {`The amount of money allocated to advancing research.`}
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger>
                                                            <FaQuestionCircle
                                                                className="text-black h-4 inline-block align-baseline mx-1"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            align="end"
                                                            className="max-w-[300px] break-words text-sm z-50"
                                                        >
                                                            <p>
                                                                Knowing how much you have budgeted to research helps us
                                                                prioritize
                                                                based on what you prioritize.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        variant="currency"
                                                        type="number"
                                                        min={0}
                                                        id="budget"
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
                    </Tabs>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}