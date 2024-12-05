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
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {useCallback, useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Separator} from "@/components/ui/separator";
import {useOnboardingStore} from "@/state/onboarding/onboardingStore";
import {AutocompleteComponent} from "@/components/autocomplete";
import {AddressType} from "@/lib/types";
import {useDebounce} from "use-debounce";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Bold, Italic} from "lucide-react";
import {FileWithPreview, ImageCropper} from "@/components/image-cropper";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FileWithPath, useDropzone} from "react-dropzone";
import {FaCalendar, FaCircleDollarToSlot, FaPeopleGroup, FaUpload} from "react-icons/fa6";
import {cn, createDicebearAvatar, formatMoney, handleImageUpload} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {checkSubdomainAvailability, getAllOrganizations} from "@/lib/fetchers";

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
    }).max(32, {
        message: "Your organization's name must be a maximum of 32 characters."
    }),
    subdomain: z.string().min(2, {
        message: "Your organization's nickname must be at least 2 characters."
    }),
    looking: z.array(optionSchema).min(0).optional(),
    founded: z.string().optional(),
    description: z.string().min(2, {
        message: "Your organization's description must be at least 2 characters long.",
    }).max(500, {
        message: "Your organization's description must less than 500 characters long.",
    }),
    website: z.string().min(2, {
        message: "Your organization's website.",
    }).optional(),
    incorporationStatus: z.enum(["yes", "no-but", "no"], {
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

const accept = {
    "image/*": [],
};

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

const years = Array.from({length: new Date().getFullYear() - 1970 + 1}, (_, i) => (1970 + i).toString());

export default function OrganizationOnboardingForm() {
    const {data: session, update} = useSession()
    const router = useRouter()
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
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);

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

    useEffect(() => {

        const fetchOrganizations = async () => {
            try {
                await getAllOrganizations().then((response) => {
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
        resolver: zodResolver(joinOrgFormSchema)
    })

    const newOrgForm = useForm<z.infer<typeof newOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(newOrgFormSchema),
        defaultValues: {
            subdomain: "",
        }
    })

    const [debouncedNickname] = useDebounce(newOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    useEffect(() => {
        // Trigger validation whenever the debounced nickname changes
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

    async function updateSession(organizationId: string) {
        await update({
            ...session,
            organizationId: organizationId,
        })
    }

    async function joinOrgOnSubmit() {
        const orgValue = joinOrgForm.watch("org")?.[0]?.value;
        if (typeof orgValue === "string") {
            await createMemberRequest(orgValue);
            toast.success(`A membership request has been sent to ${joinOrgForm.watch("org")?.[0]?.label}`)

            router.push("/app/profile")
        } else {
            console.error("Organization value is undefined or invalid.");
            toast.error("Organization value is undefined or invalid.")
        }
    }

    async function newOrgOnSubmit(values: z.infer<typeof newOrgFormSchema>) {
        // console.log(values)
        // const createOrg = await createOrGetSite({
        //         siteName: newOrgForm.getValues("orgName"),
        //         siteSlug: newOrgForm.getValues("subdomain")
        //     },
        //     session.data?.user.id,
        //     newOrgForm.getValues("description")
        // )
        //
        // console.log(createOrg)

        const formData = new FormData()

        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        if (selectedFile && values.image) {
            const imgUrl = await handleImageUpload(selectedFile as File, values.image, session?.user?.organizationId)
            if (imgUrl) formData.set('image', imgUrl)
        }

        createOrganization(formData).then((res: any) => {
            if (res.error) {
                toast.error(res.error)
            } else {
                va.track("Created Organization")
                // Update the session object with the newly created organizationId
                updateSession(res.id)
                router.refresh()
                router.push("/onboarding/finances")
                toast.success(`Successfully created organization!`)
            }
        })
    }

    return (
        <div className="grid grid-cols-2 gap-x-8">
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
                                        <FormLabel>{`Organization name (required)`}</FormLabel>
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
                                control={newOrgForm.control}
                                name="subdomain"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Nickname (required)`}</FormLabel>
                                        <FormDescription>{`The abbreviated, short form, or nickname for your organization.`}</FormDescription>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                id="name"
                                                autoComplete="name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                        {
                                            newOrgForm.watch("subdomain") && !newOrgForm.formState.errors.subdomain &&
                                            <FormDescription>
                                                <p>
                                                    {`Your organization's domain will be ${newOrgForm.watch("subdomain")}.comend.io`}
                                                </p>
                                            </FormDescription>
                                        }
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={newOrgForm.control}
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
                                name="founded"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
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
                                                    <SelectItem key={year}
                                                                value={year.toString()}> {/* Use the year as a string for the SelectItem value */}
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select the year your organization was founded.
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={newOrgForm.control}
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
                                control={newOrgForm.control}
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
                                                        <RadioGroupItem value="yes"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Yes I have a 501c3
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="no-but"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {`No, but I'm working on it`}
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="no"/>
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
                                control={newOrgForm.control}
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
                                control={newOrgForm.control}
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
                                control={newOrgForm.control}
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

                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row space-x-2">
                                    <Button onClick={() => router.push("/onboarding/user")}>Previous</Button>
                                    <Button type="submit">Next</Button>
                                </div>
                                <Button variant="ghost" onClick={() => router.push("/app/profile")}>Skip</Button>
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
                                                Organization name
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
                                    <Button variant="ghost" onClick={() => router.push("/app/profile")}>
                                        Skip
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
            {isNewOrganization &&
                <div className="col-span-1 space-y-4">
                    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4">
                        <h1 className="py-4 min-w-0 flex-1 truncate text-2xl font-bold text-gray-900">
                            Organization profile preview
                        </h1>

                        <div
                            className="h-10 w-full bg-white text-gray-800 text-left px-4 flex items-center border border-gray-300 rounded-md shadow-sm">
                            {newOrgForm.watch("subdomain")}
                        </div>

                        <div className="w-full flex flex-col space-y-8 my-8">
                            <div>
                                <div>
                                    <img className="h-24 w-full object-cover lg:h-36"
                                         src={'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}
                                         alt=""/>
                                </div>

                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                                        <div className="flex">
                                            <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18"
                                                 src={createDicebearAvatar(newOrgForm.watch("orgName")?.toLocaleString() ?? "", 50, 40, "identicon")}
                                                 alt=""/>
                                        </div>

                                        <div
                                            className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                                        >
                                            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                                <h1 className="mt-6 min-w-0 flex-1 truncate text-xl font-bold text-gray-900">
                                                    {newOrgForm.watch("orgName") || "Your organization's name"}
                                                </h1>
                                                <div
                                                    className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-xs">
                                                    {/*{newOrgForm.watch("numberOfIdentifiedPatients") &&*/}
                                                    {/*    <div className="mt-2 flex items-center text-gray-500">*/}
                                                    {/*        <FaPeopleGroup*/}
                                                    {/*            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"*/}
                                                    {/*            aria-hidden="true"/>*/}
                                                    {/*        {newOrgForm.watch("numberOfIdentifiedPatients")}+*/}
                                                    {/*        patients*/}
                                                    {/*    </div>*/}
                                                    {/*}*/}
                                                    {/*{newOrgForm.watch("moneyRaised") &&*/}
                                                    {/*    <div className="mt-2 flex items-center text-gray-500">*/}
                                                    {/*        <FaCircleDollarToSlot*/}
                                                    {/*            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"*/}
                                                    {/*            aria-hidden="true"*/}
                                                    {/*        />*/}
                                                    {/*        {formatMoney(newOrgForm.watch("moneyRaised"))} raised*/}
                                                    {/*    </div>*/}
                                                    {/*}*/}
                                                    {/*<div className="mt-2 flex items-center text-gray-500">*/}
                                                    {/*    <FaCalendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"*/}
                                                    {/*                aria-hidden="true"/>*/}
                                                    {/*    Founded*/}
                                                    {/*    in {new Date(newOrgForm.watch("createdAt") ?? "").getFullYear()}*/}
                                                    {/*</div>*/}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                        <h1 className="truncate text-2xl font-bold text-gray-900">{newOrgForm.watch("orgName")}</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-2 space-y-4">
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
                                                            <h3 className={cn("scroll-m-20 text-md tracking-tight font-semibold")}>
                                                                Description
                                                            </h3>
                                                            <p className="text-sm">
                                                                {newOrgForm.watch("description") || "Your organization's description."}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div
                                                                className="flex flex-row items-center justify-between w-full">
                                                                <h3 className={cn("scroll-m-20 text-md tracking-tight font-semibold")}>
                                                                    Relevant topics
                                                                </h3>
                                                            </div>
                                                            {/*<div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-1">*/}
                                                            {/*    {pag?.topics.map((item, index) =>*/}
                                                            {/*        <Badge key={index} className="flex text-sm">*/}
                                                            {/*            {item.charAt(0).toUpperCase() + item.slice(1)}*/}
                                                            {/*        </Badge>*/}
                                                            {/*    )}*/}
                                                            {/*</div>*/}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                    {/*<AssetsCard/>*/}
                                    {/*<OpenRFPsCard/>*/}
                                </div>

                                <div className="col-span-4 flex flex-col space-y-4">
                                    {/*<PAGProfileRoadmapCard/>*/}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                            <CardTitle className={cn("scroll-m-20 text-lg font-bold tracking-tight")}>
                                                Activity
                                            </CardTitle>
                                            <Skeleton className="w-full"/>
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
            }
        </div>
    )
}
