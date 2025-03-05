"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {updateOrganization} from "@/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Member, Organization, User} from "@prisma/client";
import {useEffect, useState} from "react";
import {FaPen} from "react-icons/fa6";
import {useDebounce} from "use-debounce";
import {checkSubdomainAvailability, getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {getPublicFile} from "@/lib/utils";

const editSubdomainFormSchema = z.object({
    subdomain: z.string().min(2, {
        message: "Your organization's nickname must be at least 2 characters."
    }).max(60, {
        message: "Your organization's nickname must be a maximum of 50 characters."
    }),
});

export default function EditPagProfileSubdomainDialog({organization}: { organization: Organization & { members: (Member & { user: User })[] }}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<z.infer<typeof editSubdomainFormSchema> | undefined>(undefined);

    const editOrgForm = useForm<z.infer<typeof editSubdomainFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editSubdomainFormSchema),
        defaultValues: defaultOrganizationValues
    });

    const [debouncedNickname] = useDebounce(editOrgForm.watch("subdomain"), 500); // Extract just the debounced value

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
                        subdomain: organizationData.subdomain || "",
                    };

                    setDefaultOrganizationValues(fetchedValues);
                    // setAddress(fetchedValues); // Set address state as well
                    editOrgForm.reset(fetchedValues); // Reset form with fetched data
                }
            }
        }

        fetchOrganizationData();
    }, [session, editOrgForm]);

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
        editOrgForm.reset({
            subdomain: organization?.subdomain || ""
        });
    }, [organization, editOrgForm]);

    async function onProfileFormSubmit(values: z.infer<typeof editSubdomainFormSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        try {
            await updateOrganization(formData, session.user.organizationId);
            toast.success("Organization profile updated successfully!");
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                >
                    <FaPen/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Organization Abbreviation (required)</DialogTitle>
                    <DialogDescription>
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
                    </DialogDescription>
                </DialogHeader>
                <Form {...editOrgForm}>
                    <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">

                        <FormField
                            control={editOrgForm.control}
                            name="subdomain"
                            render={({field}) => (
                                <FormItem>
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

                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
