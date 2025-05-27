"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOrganization } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Organization } from "@prisma/client";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

// Schema for validating the contact email
const editContactEmailSchema = z.object({
    contactEmail: z.string().email({ message: "Please enter a valid email address." }),
});

export default function EditPAGContactEmailDialog({ organization }: { organization: Organization }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Initialize form with react-hook-form
    const editEmailForm = useForm<z.infer<typeof editContactEmailSchema>>({
        mode: "onChange",
        resolver: zodResolver(editContactEmailSchema),
        defaultValues: { contactEmail: organization.contactEmail || "" }
    });

    // Update form values when organization data changes
    useEffect(() => {
        editEmailForm.reset({
            contactEmail: organization.contactEmail || ""
        });
    }, [organization, editEmailForm]);

    // Form submission handler
    async function onProfileFormSubmit(values: z.infer<typeof editContactEmailSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();
        formData.append("contactEmail", values.contactEmail);

        try {
            await updateOrganization(session.user.organizationId, formData);
            toast.success("Contact email updated successfully!");
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating contact email:", error);
            toast.error("Failed to update contact email.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <Pencil />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Contact Email</DialogTitle>
                    <DialogDescription>
                        Update the main email contact for your organization.
                    </DialogDescription>
                </DialogHeader>
                <Form {...editEmailForm}>
                    <form onSubmit={editEmailForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                        <FormField
                            control={editEmailForm.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
