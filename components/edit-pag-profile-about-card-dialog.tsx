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
import {FaPencil} from "react-icons/fa6";

const editOrgFormSchema = z.object({
    description: z.string().max(500, {
        message: "Your organization's description must be less than 500 characters long."
    }).optional(),
    website: z.string().url({
        message: "Enter a valid URL for your organization's website."
    }).optional()
});

export default function EditPagProfileAboutCardDialog({organization}: { organization: Organization & { members: (Member & { user: User })[] }}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: {
            description: organization.description || "",
            website: organization.website || ""
        }
    });

    useEffect(() => {
        editOrgForm.reset({
            description: organization.description || "",
            website: organization.website || ""
        });
    }, [organization, editOrgForm]);

    async function onProfileFormSubmit(values: z.infer<typeof editOrgFormSchema>) {
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
                    <FaPencil/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Organization Profile</DialogTitle>
                    <DialogDescription>
                        {`Update your organization's description and website.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...editOrgForm}>
                    <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                        <FormField
                            control={editOrgForm.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us about your organization" {...field} />
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
                                    <FormDescription>
                                        {`Your patient group's website URL (with the URL extension like http or https).`}
                                    </FormDescription>
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
                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
