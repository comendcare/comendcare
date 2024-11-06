"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {editUser} from "@/lib/actions";
import {Separator} from "@/components/ui/separator";
import {Checkbox} from "@/components/ui/checkbox";
import {AutocompleteComponent} from "@/components/autocomplete";
import {AddressType} from "@/lib/types";
import {useEffect, useState} from "react";

const invitationFormSchema = z.object({
    name: z.string().min(2, { message: "Your name must be at least 2 characters." }),
    title: z.string().min(2, { message: "Your role must be at least 2 characters." }),
    notificationSettings: z.boolean().default(false),
    address1: z.string().optional(),
    address2: z.string().optional(),
    formattedAddress: z.string(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

export default function UserOnboardingForm() {
    const {data: session, update} = useSession();
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

    const router = useRouter();

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
        defaultValues: {
            notificationSettings: true,
        },
    });

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

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        // For each form field, call editUser to update the user profile
        for (const [key, value] of Object.entries(values)) {
            await editUser(formData, session?.user.id, key).then(
                (res: any) => {
                    if (res.error) {
                        toast.error(res.error);
                        return; // Exit early if there's an error
                    } else {
                        // If all fields are successfully updated, proceed
                        toast.success("Successfully updated user profile!");
                        router.refresh();
                        router.push("/onboarding/organization");
                    }
                }
            )
        }
    }

    return (
        <div className="space-y-4 w-1/2">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">
                    Profile onboarding
                </h1>
                <p>
                    {`Welcome to onboarding! We have a few questions to better understand how we can help you.
                    All questions in this form are optional unless marked as (required).
                    `}
                </p>
                <p className="font-semibold">
                    {`Nothing that you share here will be shared with others, and you have complete control of what info is made public on your organization profile and research plan.`}
                </p>
            </div>

            <Separator/>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your name (required)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
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
                                <FormDescription>
                                    Your role or title at your patient organization.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
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
                                    Your address.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notificationSettings"
                        render={({field}) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Allow us to contact you regarding platform changes and notifications.
                                    </FormLabel>
                                    <FormDescription>
                                        You can manage your mobile notifications in your user settings page.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Next</Button>
                </form>
            </Form>
        </div>
    );
}
