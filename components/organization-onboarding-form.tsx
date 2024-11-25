"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {checkSubdomainAvailability, createOrganization, getAllOrganizations} from "@/lib/actions";
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


const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const joinOrgFormSchema = z.object({
    org: z.array(optionSchema).min(0).optional(),
})

const newOrgFormSchema = z.object({
    orgName: z.string().min(2, {
        message: "Your organization's name must be at least 2 characters."
    }).max(32, {
        message: "Your organization's name must be a maximum of 32 characters."
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
    "501c3": z.enum(["yes", "no-but", "no"], {
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
            await getAllOrganizations().then((res) => {
                const options: Option[] = res.map((org, index) => ({
                    value: org.id || index.toString(),
                    label: org.name || "",
                    description: org.description || "",
                }))

                setOrganizations(options)
            })
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
            subdomain: ""
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
        console.log(debouncedNickname)
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

    async function joinOrgOnSubmit(values: z.infer<typeof joinOrgFormSchema>) {
        const formData = new FormData()
        Object.entries(newOrgForm.getValues()).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
            }
        });
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
        <div className="space-y-4 w-1/2">

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
                    value="existing"
                    aria-label="Join an existing organization"
                    className={isNewOrganization ? "" : "bg-gray-200"}
                >
                    Join an existing organization
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="new"
                    aria-label="Create a new organization"
                    className={isNewOrganization ? "bg-gray-200" : ""}
                >
                    Create a new organization
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

                        <FormField
                            control={newOrgForm.control}
                            name="founded"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{`Year founded (required)`}</FormLabel>
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
                            name="501c3"
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
                                                        setSelectedFile(file);
                                                        field.onChange(file?.preview); // Update form field value
                                                    }}
                                                />
                                            ) : (
                                                <Avatar
                                                    {...getRootProps()}
                                                    className="size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200"
                                                >
                                                    <input {...getInputProps()} />
                                                    <AvatarFallback className="text-center">
                                                        Drag and drop or click!
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
                                <Button type="submit" className="">Join Organization</Button>
                                <Button variant="ghost" onClick={() => router.push("/app/profile")}>Skip</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            )}
        </div>
    );
}
