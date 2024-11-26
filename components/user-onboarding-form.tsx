"use client";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {editUser, getUser} from "@/lib/actions";
import {Checkbox} from "@/components/ui/checkbox";
import {AutocompleteComponent} from "@/components/autocomplete";
import {AddressType} from "@/lib/types";
import {useCallback, useEffect, useState} from "react";
import {FileWithPreview, ImageCropper} from "@/components/image-cropper";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {FileWithPath, useDropzone} from "react-dropzone";
import {cn, createDicebearAvatar} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

const userFormSchema = z.object({
    name: z.string().min(2, {message: "Your name must be at least 2 characters."}),
    title: z.string().min(2, {message: "Your role must be at least 2 characters."}),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
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
});

const accept = {
    "image/*": [],
};

export default function UserOnboardingForm() {
    const router = useRouter();
    const {data: session} = useSession();
    // const [searchInput, setSearchInput] = useState("");
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

    const [defaultValues, setDefaultValues] = useState<z.infer<typeof userFormSchema> | undefined>(undefined);

    const form = useForm<z.infer<typeof userFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(userFormSchema),
        defaultValues,
    });

    useEffect(() => {
        async function fetchUserData() {
            if (session?.user?.id) {
                const userData = await getUser(session.user.id);
                if (userData) {
                    const fetchedValues = {
                        name: userData.name || "",
                        title: userData.title || "",
                        notificationSettings: userData.notificationSettings ?? true,
                        consentSettings: userData.consentSettings ?? true,
                        address1: userData.address1 || "",
                        address2: userData.address2 || "",
                        formattedAddress: userData.formattedAddress || "",
                        city: userData.city || "",
                        region: userData.region || "",
                        postalCode: userData.postalCode || "",
                        country: userData.country || "",
                        lat: userData.lat || 0,
                        lng: userData.lng || 0,
                        image: userData.image || "",
                    };
                    setDefaultValues(fetchedValues);
                    setAddress(fetchedValues); // Set address state as well
                    form.reset(fetchedValues); // Reset form with fetched data
                }
            }
        }

        fetchUserData();
    }, [session, form]);

    useEffect(() => {
        form.setValue("address1", address.address1);
        form.setValue("address2", address.address2);
        form.setValue("formattedAddress", address.formattedAddress);
        form.setValue("city", address.city);
        form.setValue("region", address.region);
        form.setValue("postalCode", address.postalCode);
        form.setValue("country", address.country);
        form.setValue("lat", address.lat);
        form.setValue("lng", address.lng);
    }, [address, form]);

    async function onSubmit(values: z.infer<typeof userFormSchema>) {
        try {
            for (const [key, value] of Object.entries(values)) {
                const res: any = await editUser(session?.user?.id as string, {[key]: value});
                if (res?.error) {
                    toast.error(res.error);
                    return;
                }
            }

            toast.success("Successfully updated user profile!");
            router.refresh();
            router.push("/onboarding/organization");
        } catch (error) {
            toast.error("An error occurred while updating your profile.");
        }
    }

    return (
        <div className="grid grid-cols-2 gap-x-8">
            <div className="col-span-1">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(
                            onSubmit,
                            (errors) => {
                                console.log("Validation errors:", errors);
                                if (Object.keys(errors).length > 0) {
                                    toast.error("Please correct the highlighted errors.");
                                }
                            }
                        )}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Your name (required)</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormDescription>This is your public display name.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormDescription>Your role or title at your patient organization.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {/*<FormField*/}
                        {/*    control={form.control}*/}
                        {/*    name="formattedAddress"*/}
                        {/*    render={({field}) => (*/}
                        {/*        <FormItem>*/}
                        {/*            <FormLabel>Address</FormLabel>*/}
                        {/*            <FormControl>*/}
                        {/*                <AutocompleteComponent*/}
                        {/*                    address={address}*/}
                        {/*                    setAddress={setAddress}*/}
                        {/*                    searchInput={searchInput}*/}
                        {/*                    setSearchInput={setSearchInput}*/}
                        {/*                />*/}
                        {/*            </FormControl>*/}
                        {/*            <FormDescription>Your address.</FormDescription>*/}
                        {/*            <FormMessage/>*/}
                        {/*        </FormItem>*/}
                        {/*    )}*/}
                        {/*/>*/}

                        <FormField
                            control={form.control}
                            name="image"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Profile Image</FormLabel>
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
                                    <FormDescription>Your profile image.</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="notificationSettings"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {`Allow us to contact you regarding platform changes and notifications.`}
                                            </FormLabel>
                                            <FormDescription>
                                                {`You can manage your mobile notifications in your user settings page.`}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="consentSettings"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {`I consent for Comend to collect data to help improve the platform.`}
                                            </FormLabel>
                                            <FormDescription>
                                                {`You can change these settings in your user settings page.`}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit">Next</Button>
                    </form>
                </Form>
            </div>
            <div className="col-span-1 space-y-4">
                <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4">
                    <h1 className="py-4 min-w-0 flex-1 truncate text-2xl font-bold text-gray-900">
                        User profile preview
                    </h1>

                    <div className="w-full flex flex-col space-y-8 my-8">
                        <div>
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">

                                    <div className="flex">
                                        <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-18 sm:w-18"
                                             src={createDicebearAvatar(form.watch("name")?.toLocaleString() ?? "", 50, 40, "identicon")}
                                             alt=""/>
                                    </div>

                                    <div
                                        className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
                                    >
                                        <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
                                            <h1 className="mt-6 min-w-0 flex-1 truncate text-xl font-bold text-gray-900">
                                                {form.watch("name") || "Your organization's name"}
                                            </h1>
                                        </div>
                                    </div>

                                </div>
                                <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
                                    <h1 className="truncate text-2xl font-bold text-gray-900">{form.watch("name")}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
