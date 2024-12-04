"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useDebounce} from "use-debounce";
import {useCallback, useEffect, useState} from "react";
import {
    createOrganization
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
import { uploadPublicImg } from "@/lib/g-cloud";

export async function handleImageUpload(file: File, data: string | undefined): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onloadend = async () => {
            if (data == undefined) {
                reject('No image data')
                return
            }

            const base64data = data.replace(/^data:image\/\w+;base64,/, "")

            const imageUrl = await uploadPublicImg({
                name: file.name,
                type: file.type,
                data: base64data || ""
            })

            resolve(imageUrl)
        }

        reader.onerror = error => {
            reject(error)
        }
    })
}

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

export default function EditPAGProfileDialog() {
    const {data: session, update} = useSession()
    const router = useRouter()
    const [searchInput, setSearchInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
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
    const [defaultValues, setDefaultValues] = useState<z.infer<typeof editOrgFormSchema> | undefined>(undefined);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: defaultValues
    })

    const [debouncedNickname] = useDebounce(editOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    async function updateSession(organizationId: string) {
        await update({
            ...session,
            organizationId: organizationId,
        })
    }

    useEffect(() => {
        // Trigger validation whenever the debounced nickname changes
        if (debouncedNickname) {
            checkSubdomainAvailability(debouncedNickname).then((isAvailable) => {
                if (!isAvailable) {
                    editOrgForm.setError("subdomain", {
                        type: "manual",
                        message: "This nickname is already taken. Please choose another.",
                    });
                    console.log("Not available")
                } else {
                    editOrgForm.clearErrors("subdomain");
                    console.log("Available")
                }
            });
        }
    }, [debouncedNickname, checkSubdomainAvailability, editOrgForm])

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

    async function editOrgOnSubmit(values: z.infer<typeof editOrgFormSchema>) {
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
            const imgUrl = await handleImageUpload(selectedFile as File, values.image)
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
                    const incorporationStatusMap: Record<string, "yes" | "no" | "no-but" | undefined> = {
                        YES: "yes",
                        NO: "no",
                        INPROGRESS: "no-but",
                    };

                    const fetchedValues = {
                        id: organizationData.id || "",
                        description: organizationData.description || "",
                        orgName: organizationData.name || "", // Map `name` to `orgName`
                        founded: organizationData.dateFounded ? organizationData.dateFounded.toISOString() : "",
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
                        dateFounded: organizationData.dateFounded || null,
                        incorporationStatus: organizationData.incorporationStatus
                            ? incorporationStatusMap[organizationData.incorporationStatus.toUpperCase()] // Map the value if it exists
                            : undefined
                    };
                    setDefaultValues(fetchedValues);
                    setAddress(fetchedValues); // Set address state as well
                    editOrgForm.reset(fetchedValues); // Reset form with fetched data
                }
            }
        }

        fetchUserData();
    }, [session, editOrgForm]);

    return (
        <Dialog>
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
                        Edit profile
                    </DialogTitle>
                    <DialogDescription>
                        {`Make changes to your profile here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>


                <Form {...editOrgForm}>
                    <form onSubmit={editOrgForm.handleSubmit(editOrgOnSubmit)} className="space-y-8">

                        <FormField
                            control={editOrgForm.control}
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
                            control={editOrgForm.control}
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
                                        editOrgForm.watch("subdomain") && !editOrgForm.formState.errors.subdomain &&
                                        <FormDescription>
                                            <p>
                                                {`Your organization's domain will be ${editOrgForm.watch("subdomain")}.comend.io`}
                                            </p>
                                        </FormDescription>
                                    }
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
                                    <FormLabel>{`Year founded (required)`}</FormLabel>
                                    <FormDescription>{`The year your organization was founded.`}</FormDescription>
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
            </DialogContent>
        </Dialog>
    )
}